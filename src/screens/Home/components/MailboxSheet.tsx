import React, {useEffect, useRef, useState} from 'react';
import {Animated, BackHandler, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {format} from 'date-fns';
import {ChevronRight, Mail, MailOpen, PenLine, X} from 'lucide-react-native';

import Text from '../../../components/AppText';
import {usePersonalize} from '../../../context/CharacterNameProvider';
import {SCREEN_BOTTOM_INSET, SCREEN_HORIZONTAL_PADDING} from '../../../theme/layout';
import {useAppTheme} from '../../../theme/ThemeProvider';
import MonthlyReportDetail from '../../Report/components/MonthlyReportDetail';
import type {Letter} from '../hooks/useMailbox';

interface MailboxSheetProps {
  visible: boolean;
  onClose: () => void;
  letters: Letter[];
  draft: Letter;
  nextDelivery: Date;
  loaded: boolean;
  onRead: (key: string) => void;
}

type View_ = {kind: 'list'} | {kind: 'opening'; letter: Letter} | {kind: 'letter'; letter: Letter};

// 봉투가 열리는 데 걸리는 시간. 화면을 누르면 바로 넘어간다.
const OPENING_DURATION = 1500;

// 새 편지를 열 때: 봉투가 커지며 흔들리다 열리고, 편지(리포트)로 넘어간다.
function LetterOpening({letter, onDone}: {letter: Letter; onDone: () => void}) {
  const {theme} = useAppTheme();
  const p = usePersonalize();
  const pop = useRef(new Animated.Value(0)).current;
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    Animated.spring(pop, {friction: 5, tension: 70, toValue: 1, useNativeDriver: true}).start();
    const openTimer = setTimeout(() => setOpened(true), OPENING_DURATION * 0.5);
    const doneTimer = setTimeout(onDone, OPENING_DURATION);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone, pop]);

  const Icon = opened ? MailOpen : Mail;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="편지 열기" onPress={onDone} style={styles.opening}>
      <Animated.View style={[styles.envelope, {
        backgroundColor: theme.accentMuted,
        transform: [
          {scale: pop.interpolate({inputRange: [0, 1], outputRange: [0.4, 1]})},
          {rotate: pop.interpolate({inputRange: [0, 0.5, 1], outputRange: ['-14deg', '8deg', '0deg']})},
        ],
      }]}>
        <Icon size={72} color={theme.accentStrong} strokeWidth={1.6} />
      </Animated.View>
      <Text style={[styles.openingTitle, {color: theme.text}]}>{p(`뿡뿡이가 보낸 ${letter.month}월 편지`)}</Text>
      <Text style={[styles.openingSub, {color: theme.textMuted}]}>
        {opened ? '편지를 펼치고 있어요…' : '편지가 도착했어요!'}
      </Text>
    </Pressable>
  );
}

function LetterRow({letter, subtitle, onPress, last}: {
  letter: Letter;
  subtitle: string;
  onPress: () => void;
  last: boolean;
}) {
  const {theme} = useAppTheme();
  const Icon = letter.inProgress ? PenLine : letter.unread ? Mail : MailOpen;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${letter.month}월 편지${letter.unread ? ', 안 읽음' : ''}`}
      onPress={onPress}
      style={({pressed}) => [styles.row, pressed && {backgroundColor: theme.pressed}]}>
      <View style={[styles.rowIcon, {backgroundColor: letter.unread ? theme.accentMuted : theme.surfaceMuted}]}>
        <Icon size={22} color={letter.unread ? theme.accentStrong : theme.icon} />
      </View>
      <View style={[styles.rowBody, !last && {borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth}]}>
        <View style={styles.rowTexts}>
          <View style={styles.rowTitleLine}>
            <Text style={[styles.rowTitle, {color: theme.text}]}>{letter.label} 편지</Text>
            {letter.unread && (
              <View style={[styles.newTag, {backgroundColor: theme.stressWorst}]}>
                <Text style={styles.newTagText}>NEW</Text>
              </View>
            )}
          </View>
          <Text style={[styles.rowSub, {color: theme.textMuted}]}>{subtitle}</Text>
        </View>
        <ChevronRight size={18} color={theme.placeholder} />
      </View>
    </Pressable>
  );
}

// 우체통: 쓰는 중인 이번 달 편지 + 도착한 지난 편지들. 편지를 누르면 월간 스트레스 리포트가 열린다.
// 홈 화면 자리에 그려서(Modal 아님) 아래 탭바가 그대로 보인다.
export default function MailboxSheet({visible, onClose, letters, draft, nextDelivery, loaded, onRead}: MailboxSheetProps) {
  const {theme} = useAppTheme();
  const p = usePersonalize();
  const [view, setView] = useState<View_>({kind: 'list'});

  // 닫으면 다음에 열 때 목록부터
  useEffect(() => {
    if (!visible) setView({kind: 'list'});
  }, [visible]);

  const open = (letter: Letter) => {
    if (letter.unread) {
      onRead(letter.key);
      setView({kind: 'opening', letter});
    } else {
      setView({kind: 'letter', letter});
    }
  };
  const back = () => (view.kind === 'list' ? onClose() : setView({kind: 'list'}));
  // 안드로이드 뒤로가기: 편지 → 목록 → 홈
  const backRef = React.useRef(back);
  backRef.current = back;
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      backRef.current();
      return true;
    });
    return () => subscription.remove();
  }, [visible]);

  if (!visible) return null;
  const deliveryText = `${format(nextDelivery, 'M월 d일')}에 도착해요`;
  const draftDays = draft.report?.dayCount ?? 0;

  return (
    <View style={[styles.screen, {backgroundColor: theme.background}]}>
        {view.kind === 'opening' ? (
          <LetterOpening letter={view.letter} onDone={() => setView({kind: 'letter', letter: view.letter})} />
        ) : view.kind === 'letter' ? (
          <ScrollView
            contentContainerStyle={[styles.content, {paddingBottom: SCREEN_BOTTOM_INSET}]}
            showsVerticalScrollIndicator={false}>
            <MonthlyReportDetail
              month={{key: view.letter.key, label: `${view.letter.month}월의 편지`}}
              initialReport={view.letter.report}
              backLabel="우체통"
              onBack={back}
              letter={{month: view.letter.month, inProgress: view.letter.inProgress}}
            />
            {view.letter.inProgress && (
              <Text style={[styles.note, {color: theme.textMuted}]}>
                {p(`아직 뿡뿡이가 쓰고 있는 편지예요. 완성본은 ${deliveryText}.`)}
              </Text>
            )}
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.content, {paddingBottom: SCREEN_BOTTOM_INSET}]}
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={[styles.title, {color: theme.text}]}>우체통</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="우체통 닫기" hitSlop={12} onPress={onClose}>
                <X size={26} color={theme.text} />
              </Pressable>
            </View>
            <Text style={[styles.intro, {color: theme.textMuted}]}>
              {p('한 달이 끝나면 뿡뿡이가 그달의 마음 날씨를 편지로 보내 줘요.')}
            </Text>

            <Text style={[styles.section, {color: theme.text}]}>쓰는 중인 편지</Text>
            <View style={[styles.list, {backgroundColor: theme.surface}]}>
              <LetterRow
                letter={draft}
                last
                subtitle={draftDays > 0 ? `${draftDays}일째 기록 중 · ${deliveryText}` : `아직 기록이 없어요 · ${deliveryText}`}
                onPress={() => open(draft)}
              />
            </View>

            <Text style={[styles.section, {color: theme.text}]}>도착한 편지</Text>
            {letters.length > 0 ? (
              <View style={[styles.list, {backgroundColor: theme.surface}]}>
                {letters.map((letter, index) => (
                  <LetterRow
                    key={letter.key}
                    letter={letter}
                    last={index === letters.length - 1}
                    subtitle={`${letter.report?.dayCount ?? 0}일의 기록 · ${letter.unread ? '새 편지' : '읽음'}`}
                    onPress={() => open(letter)}
                  />
                ))}
              </View>
            ) : (
              <View style={[styles.empty, {backgroundColor: theme.surface}]}>
                <Mail size={30} color={theme.placeholder} />
                <Text style={[styles.emptyText, {color: theme.textMuted}]}>
                  {loaded ? `아직 도착한 편지가 없어요.\n첫 편지는 ${deliveryText}.` : '편지를 확인하고 있어요…'}
                </Text>
              </View>
            )}
          </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, paddingTop: 12},
  content: {paddingHorizontal: SCREEN_HORIZONTAL_PADDING, rowGap: 14},
  header: {alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'},
  title: {fontSize: 32, fontWeight: '800', letterSpacing: -0.5},
  intro: {fontSize: 14, lineHeight: 20, marginTop: -6},
  section: {fontSize: 17, fontWeight: '800', marginBottom: -6, marginTop: 6},
  list: {borderRadius: 16, overflow: 'hidden'},
  row: {alignItems: 'center', flexDirection: 'row', paddingLeft: 14},
  rowIcon: {alignItems: 'center', borderRadius: 12, height: 42, justifyContent: 'center', width: 42},
  rowBody: {alignItems: 'center', flex: 1, flexDirection: 'row', marginLeft: 12, paddingRight: 14, paddingVertical: 14},
  rowTexts: {flex: 1, gap: 2},
  rowTitleLine: {alignItems: 'center', flexDirection: 'row', gap: 6},
  rowTitle: {fontSize: 16, fontWeight: '700'},
  rowSub: {fontSize: 13},
  newTag: {borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1},
  newTagText: {color: '#FFFFFF', fontSize: 10, fontWeight: '800'},
  empty: {alignItems: 'center', borderRadius: 16, gap: 10, paddingVertical: 28},
  emptyText: {fontSize: 14, lineHeight: 21, textAlign: 'center'},
  note: {fontSize: 12, textAlign: 'center'},
  opening: {alignItems: 'center', flex: 1, justifyContent: 'center', paddingBottom: 80},
  envelope: {alignItems: 'center', borderRadius: 40, height: 150, justifyContent: 'center', marginBottom: 24, width: 150},
  openingTitle: {fontSize: 22, fontWeight: '800'},
  openingSub: {fontSize: 14, marginTop: 6},
});
