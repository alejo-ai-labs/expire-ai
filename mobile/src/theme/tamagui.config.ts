import { createTamagui } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'
import { tokens } from './tokens'
import { lightTheme, darkTheme } from './themes'

const config = createTamagui({
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  fonts: {
    heading: createInterFont({ weight: { 6: '600', 7: '700' } }),
    body: createInterFont({ weight: { 4: '400', 5: '500' } }),
  },
  defaultTheme: 'light',
})

export type AppConfig = typeof config
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
export default config
