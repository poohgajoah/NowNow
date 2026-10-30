import React, { useEffect, useState } from "react";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import { supabase } from "../services/supabase";
import { ensureProfile } from "../services/api/profile";
import {
  cancelDailyReminder,
  syncDailyReminder,
} from "../services/notifications/dailyReminder";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAppTheme } from "../theme/ThemeProvider";

export default function RootNavigator() {
  const { theme } = useAppTheme();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 가입 직후·첫 로그인·세션 복원 어느 경우든 프로필 행이 있게 한다.
  const user = session?.user;
  useEffect(() => {
    if (user) {
      ensureProfile(user);
    }
  }, [user]);

  // 로그인하면 설정대로 하루 마무리 알림을 폰에 예약하고, 로그아웃하면 끈다.
  const userId = user?.id;
  useEffect(() => {
    if (loading) return;
    if (userId) {
      syncDailyReminder(userId).catch(error =>
        console.log('[dailyReminder] 예약 실패:', error?.message),
      );
    } else {
      cancelDailyReminder().catch(() => {});
    }
  }, [loading, userId]);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return session ? <TabNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
