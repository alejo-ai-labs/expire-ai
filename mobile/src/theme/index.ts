export { default as tamaguiConfig } from './tamagui.config'
export { tokens } from './tokens'
export { lightTheme } from './themes'

// Re-export constants for non-Tamagui contexts (e.g., Expo Router header config)
export const expiria = {
  colors: {
    primaryInk: '#2E4C38',
    primarySurface: '#A8BFA8',
    secondarySurface: '#FAF0E6',
    accent: '#C07850',
    canvas: '#FDFCFA',
    text: '#2E4C38',
    textMuted: '#7A8B7A',
    border: '#D4DDD4',
    statusGreenBg: '#DFF0D8',
    statusGreenText: '#3B6E3B',
    statusYellowBg: '#FFF3CD',
    statusYellowText: '#7A6118',
    statusRedBg: '#F8D7DA',
    statusRedText: '#8B3A3A',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { sm: 8, md: 16, lg: 24, full: 9999 },
  strokes: { thin: 1, medium: 2, thick: 3 },
  shadows: {
    soft: {
      shadowColor: '#2E4C38',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    card: {
      shadowColor: '#2E4C38',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
  },
  typography: {
    fontFamily: 'Inter',
    brandCase: 'uppercase' as const,
    sizes: { heading: 28, subheading: 20, body: 16, caption: 13, small: 11 },
    weights: { bold: '700' as const, semibold: '600' as const, medium: '500' as const, regular: '400' as const },
  },
} as const
