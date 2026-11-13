import type {MoodType, PreferenceKey} from '../types';

export const characterMessages: Record<MoodType, string> = {
  sad: '오늘 기분이 좋지 않아 보여...\n무슨 일 있어?',
  neutral: '오늘은 차분한 하루였나 봐.\n조금 더 들려줄래?',
  happy: '기분이 좋아 보여서 나도 좋아!\n오늘 좋은 일이 있었어?',
};

export const interactionActions: {
  key: PreferenceKey;
  label: string;
  emoji: string;
}[] = [
  {key: 'feed', label: '밥주기', emoji: '🍚'},
  {key: 'play', label: '놀이', emoji: '🎾'},
  {key: 'music', label: '음악', emoji: '🎧'},
  {key: 'hobby', label: '휴식', emoji: '🛁'},
];
