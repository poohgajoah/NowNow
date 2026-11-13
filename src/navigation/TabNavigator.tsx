import React, {useEffect, useRef, useState} from 'react';
import {
  Activity,
  MessageCircle,
  Home,
  UserRound,
} from 'lucide-react-native';
import {
  Pressable,
  Animated,
  LayoutChangeEvent,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Text from '../components/AppText';

import {useKeyboardVisible} from '../hooks/useKeyboardVisible';
import ChatPage from '../screens/Chat/ChatPage';
import HomePage from '../screens/Home/HomePage';
import MyPage from '../screens/Profile/MyPage';
import ReportPage from '../screens/Report/ReportPage';
import {TAB_BAR} from '../theme/layout';
import {useAppTheme} from '../theme/ThemeProvider';

type TabKey = 'Home' | 'Chat' | 'Report' | 'Settings';

const tabs: {
  key: TabKey;
  label: string;
  Icon: typeof Home;
}[] = [
  {key: 'Home', label: '홈', Icon: Home},
  {key: 'Chat', label: '채팅', Icon: MessageCircle},
  {key: 'Report', label: '리포트', Icon: Activity},
  {key: 'Settings', label: '내 설정', Icon: UserRound},
];

const renderScreen = (activeTab: TabKey, setActiveTab: (tab: TabKey) => void, invite: 'play' | 'weather' | null) => {
  if (activeTab === 'Chat') {
    return (
      <ChatPage
        date={new Date().toISOString()}
        invite={invite}
        onBack={() => setActiveTab('Home')}
      />
    );
  }

  if (activeTab === 'Report') {
    return <ReportPage />;
  }

  if (activeTab === 'Settings') {
    return <MyPage />;
  }

  return <HomePage />;
};

export default function TabNavigator() {
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [invite, setInvite] = useState<'play' | 'weather' | null>(null);
  const [tabWidth, setTabWidth] = useState(0);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const {theme} = useAppTheme();
  const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
  // 키보드가 올라오면 탭바가 키보드 위로 떠서 입력창을 가리므로 그동안 숨긴다.
  const keyboardVisible = useKeyboardVisible();
  const insets = useSafeAreaInsets();

  // 하루 마무리 알림을 누르면 nownow://chat 으로 열린다 → 채팅 탭으로 이동.
  useEffect(() => {
    const openChatLink = (url: string | null) => {
      if (url === 'nownow://chat?invite=play' || url === 'nownow://chat?invite=weather' || url === 'nownow://chat') {
        setInvite(url.endsWith('=play') ? 'play' : url.endsWith('=weather') ? 'weather' : null);
        setActiveTab('Chat');
      }
    };

    Linking.getInitialURL().then(openChatLink);
    const subscription = Linking.addEventListener('url', ({url}) => openChatLink(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      damping: 14,
      mass: 0.8,
      stiffness: 150,
      toValue: activeIndex * tabWidth,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, indicatorAnim, tabWidth]);

  const handleTabBarLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setTabWidth((width - TAB_BAR.padding * 2) / tabs.length);
  };

  return (
    <View style={styles.container}>
      <View style={styles.screen}>{renderScreen(activeTab, tab => {
        setInvite(null);
        setActiveTab(tab);
      }, invite)}</View>

      {!keyboardVisible && (
      <View
        // 화면 폭을 꽉 채우고 폰 제스처 바 영역까지 탭바 색으로 채운다.
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.nav,
            borderTopColor: theme.border,
            paddingBottom: insets.bottom,
          },
        ]}
        onLayout={handleTabBarLayout}>
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicator,
              {
                backgroundColor: theme.navIndicator,
                left: TAB_BAR.padding + tabWidth / 2 - TAB_BAR.indicatorWidth / 2,
                transform: [{translateX: indicatorAnim}],
              },
            ]}
          />
        )}
        {tabs.map(({key, label, Icon}) => {
          const focused = activeTab === key;
          const iconColor = focused ? theme.text : theme.icon;

          return (
            <Pressable
              key={key}
              onPress={() => setActiveTab(key)}
              style={({pressed}) => [
                styles.tabItem,
                pressed && styles.pressedTabItem,
              ]}>
              <View style={styles.iconWrap}>
                <Icon color={iconColor} size={22} />
              </View>
              <Text
                style={[
                  styles.label,
                  {color: theme.icon},
                  focused && styles.activeLabel,
                  focused && {color: theme.text},
                ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  tabBar: {
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: TAB_BAR.padding,
    paddingTop: TAB_BAR.padding,
  },
  activeIndicator: {
    borderRadius: 24,
    height: TAB_BAR.height - TAB_BAR.padding * 2,
    position: 'absolute',
    top: TAB_BAR.padding,
    width: TAB_BAR.indicatorWidth,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    height: TAB_BAR.height - TAB_BAR.padding * 2,
    justifyContent: 'center',
    zIndex: 1,
  },
  pressedTabItem: {
    opacity: 0.7,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 20,
    height: 25,
    justifyContent: 'center',
    width: 42,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 0,
  },
  activeLabel: {
    fontWeight: '700',
  },
});
