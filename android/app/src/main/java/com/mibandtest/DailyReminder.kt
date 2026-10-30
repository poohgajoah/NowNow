package com.mibandtest

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONArray
import java.util.Calendar

/**
 * 하루 마무리 알림. 폰 시간 기준으로 매일 정해진 시각에 알림을 띄운다.
 * 서버 없이 폰의 AlarmManager로 예약하고, 알림이 뜰 때마다 다음 날을 다시 예약한다.
 * 알림을 누르면 nownow://chat 으로 앱의 채팅 탭을 연다.
 */
object DailyReminder {
    private const val PREFS = "daily_reminder"
    private const val CHANNEL_ID = "daily_reminder"
    private const val NOTIFICATION_ID = 2300
    private const val REQUEST_CODE = 2300
    private const val WINDOW_MS = 10 * 60 * 1000L

    fun save(context: Context, hour: Int, minute: Int, messages: List<String>) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putBoolean("enabled", true)
            .putInt("hour", hour)
            .putInt("minute", minute)
            .putString("messages", JSONArray(messages).toString())
            .apply()
    }

    fun disable(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putBoolean("enabled", false)
            .apply()
        alarmManager(context).cancel(alarmIntent(context))
    }

    fun isEnabled(context: Context): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean("enabled", false)

    /** 저장된 시각의 다음 회차를 예약한다. 꺼져 있으면 아무것도 하지 않는다. 반환: 예약 시각(ms) 또는 null */
    fun scheduleNext(context: Context): Long? {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        if (!prefs.getBoolean("enabled", false)) return null

        val next = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, prefs.getInt("hour", 23))
            set(Calendar.MINUTE, prefs.getInt("minute", 0))
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= System.currentTimeMillis()) add(Calendar.DAY_OF_YEAR, 1)
        }.timeInMillis

        val manager = alarmManager(context)
        val intent = alarmIntent(context)
        // 정확한 알람 권한이 있으면 정각에 울린다. 없으면(Android 14부터 기본 꺼짐) 정한 시각부터
        // 10분 안에 울리게 한다. 창을 정하지 않으면 다음 날 알람은 최대 1시간까지 늦어진다.
        if (canScheduleExact(context)) {
            manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, intent)
        } else {
            manager.setWindow(AlarmManager.RTC_WAKEUP, next, WINDOW_MS, intent)
        }
        return next
    }

    fun canScheduleExact(context: Context): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager(context).canScheduleExactAlarms()

    /** "알람 및 리마인더" 권한 설정 화면을 연다(정각 알림을 원할 때). */
    fun openExactAlarmSettings(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
        context.startActivity(
            Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:${context.packageName}"))
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
    }

    fun show(context: Context) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val messages = JSONArray(prefs.getString("messages", "[]"))
        val body = if (messages.length() > 0) {
            messages.getString((0 until messages.length()).random())
        } else {
            "오늘 하루는 어땠나요? 뿡뿡이에게 들려주세요."
        }

        createChannel(context)

        val open = PendingIntent.getActivity(
            context,
            REQUEST_CODE,
            Intent(Intent.ACTION_VIEW, Uri.parse("nownow://chat")).apply {
                setPackage(context.packageName)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("뿡뿡이")
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()

        // 알림 권한이 없으면 조용히 건너뛴다(Android 13+).
        if (NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
        }
    }

    private fun createChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val channel = NotificationChannel(
            CHANNEL_ID,
            "하루 마무리 알림",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply { description = "매일 정한 시각에 오늘 하루를 돌아보도록 알려 줍니다." }
        context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }

    private fun alarmManager(context: Context) =
        context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    private fun alarmIntent(context: Context): PendingIntent =
        PendingIntent.getBroadcast(
            context,
            REQUEST_CODE,
            Intent(context, DailyReminderReceiver::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
}

/** 예약한 시각이 되면 알림을 띄우고 다음 날을 예약한다. */
class DailyReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (!DailyReminder.isEnabled(context)) return
        DailyReminder.show(context)
        DailyReminder.scheduleNext(context)
    }
}

/** 재부팅, 앱 업데이트, 폰 시간·시간대 변경 뒤에는 예약이 지워지거나 어긋나므로 다시 예약한다. */
class DailyReminderRescheduleReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        DailyReminder.scheduleNext(context)
    }
}
