import type {PreferenceKey, PreferenceOption} from '../types';

export const preferenceLabels: Record<PreferenceKey, string> = {
  feed: '먹이',
  play: '놀이',
  music: '음악',
  hobby: '휴식',
};

export const preferenceOptions: Record<PreferenceKey, PreferenceOption[]> = {
  feed: [
    {label: '매운 닭발', description: '강한 맛과 자극적인 음식'},
    {label: '달달한 초코 머핀', description: '달콤하고 포근한 디저트'},
    {label: '상큼한 과일', description: '가볍고 산뜻한 음식'},
    {label: '따뜻한 우동', description: '든든하고 편안한 국물 음식'},
    {label: '바삭한 감자튀김', description: '짭짤하고 익숙한 간식'},
    {label: '고소한 크림 파스타', description: '부드럽고 진한 음식'},
  ],
  play: [
    {label: '노래 부르기', description: '표현이 많은 활동'},
    {label: '같이 수다 떨기', description: '대화를 나누는 정적인 활동'},
    {label: '넷플릭스 보기', description: '편하게 같이 보는 활동'},
    {label: '보드게임 하기', description: '생각하며 즐기는 놀이'},
    {label: '산책하기', description: '몸을 가볍게 움직이는 활동'},
    {label: '레고 조립하기', description: '손재주가 필요한 활동'},
  ],
  music: [
    {label: '잔잔한 어쿠스틱', description: '차분하고 따뜻한 음악'},
    {label: '신나는 케이팝', description: '에너지를 올리는 음악'},
    {label: '감성 발라드', description: '감정을 천천히 꺼내는 음악'},
    {label: '로파이 플레이리스트', description: '집중하기 좋은 음악'},
    {label: '재즈', description: '느긋하고 분위기 있는 음악'},
    {label: '락 밴드 음악', description: '강한 에너지가 있는 음악'},
  ],
  hobby: [
    {label: '침대에서 뒹굴기', description: '아무것도 안 하는 휴식'},
    {label: '영화 보기', description: '몰입하며 쉬는 시간'},
    {label: '그림 그리기', description: '손으로 감정을 풀어내는 휴식'},
    {label: '반신욕 하기', description: '몸의 긴장을 푸는 휴식'},
    {label: '일기 쓰기', description: '생각을 정리하는 휴식'},
    {label: '조용히 낮잠 자기', description: '회복에 집중하는 휴식'},
  ],
};

export const pickRandomOptions = (
  action: PreferenceKey,
  count = 3,
): PreferenceOption[] => {
  const shuffled = [...preferenceOptions[action]];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, count);
};
