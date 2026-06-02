export const analyzeStory = (story: string[]) => {
  const fullStory = story.join(' ');
  const keywords: string[] = [];

  if (
    fullStory.includes('팀장') ||
    fullStory.includes('부장') ||
    fullStory.includes('상사')
  ) {
    keywords.push('#부장');
  }

  if (
    fullStory.includes('일') ||
    fullStory.includes('업무') ||
    fullStory.includes('마감')
  ) {
    keywords.push('#업무스트레스');
  }

  if (fullStory.includes('야근') || fullStory.includes('퇴근')) {
    keywords.push('#야근');
  }

  const safeKeywords = keywords.length > 0 ? keywords : ['#일상'];

  return {
    summary: `오늘 ${safeKeywords.join(
      ' ',
    )} 때문에 스트레스를 받으셨네요. 힘든 하루를 보내셨겠어요.`,
    keywords: safeKeywords,
    solutions: [
      '충분한 휴식을 취하세요. 잠시 일에서 벗어나 좋아하는 활동을 해보는 건 어떨까요?',
      '가벼운 산책이나 스트레칭으로 몸의 긴장을 풀어보세요.',
      '신뢰할 수 있는 사람과 이야기를 나누면 마음이 한결 가벼워질 거예요.',
    ],
  };
};

