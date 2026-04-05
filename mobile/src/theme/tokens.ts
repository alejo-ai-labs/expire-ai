import { createTokens } from 'tamagui'

export const tokens = createTokens({
  color: {
    // Pastel Earthy Palette
    primaryInk: '#2E4C38',
    primarySurface: '#A8BFA8',
    secondarySurface: '#FAF0E6',
    accent: '#C07850',
    canvas: '#FDFCFA',
    text: '#2E4C38',
    textMuted: '#7A8B7A',
    border: '#D4DDD4',

    // Traffic Light System (pastel-adapted)
    statusGreenBg: '#DFF0D8',
    statusGreenText: '#3B6E3B',
    statusYellowBg: '#FFF3CD',
    statusYellowText: '#7A6118',
    statusRedBg: '#F8D7DA',
    statusRedText: '#8B3A3A',

    // Dark Mode Palette
    darkCanvas: '#1A1E1B',
    darkPrimaryInk: '#C8D8C8',
    darkPrimarySurface: '#2A3A2E',
    darkSecondarySurface: '#2C2824',
    darkAccent: '#D4956E',
    darkText: '#C8D8C8',
    darkTextMuted: '#8A9B8A',
    darkBorder: '#3A4A3E',
    darkStatusGreenBg: '#1E3A1E',
    darkStatusGreenText: '#7BC67B',
    darkStatusYellowBg: '#3A3218',
    darkStatusYellowText: '#D4B44A',
    darkStatusRedBg: '#3A1E1E',
    darkStatusRedText: '#E08080',

    // Utility
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0,0,0,0.5)',
  },

  space: {
    true: 16,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  size: {
    true: 16,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    true: 16,
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },

  zIndex: {
    true: 0,
    base: 0,
    overlay: 1000,
  },
})
