import {useAppTheme} from '../../../theme/ThemeProvider';

export const useThemePreference = () => {
  const {themeMode, toggleThemeMode} = useAppTheme();

  return {
    themeMode,
    themeLabel: themeMode === 'light' ? '다크 모드' : '라이트 모드',
    themeDescription:
      themeMode === 'light'
        ? '차분한 어두운 화면으로 전환'
        : '밝고 산뜻한 화면으로 전환',
    toggleThemeMode,
  };
};
