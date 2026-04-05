import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig, expiria } from '../theme'
import { useNotifications } from '../hooks/useNotifications'
import { ThemeProvider, useThemeMode, useThemeColors } from '../context/ThemeContext'

function RootLayoutInner() {
  useNotifications()

  const { mode } = useThemeMode()
  const colors = useThemeColors()

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={mode}>
      <SafeAreaProvider>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.primarySurface },
            headerTitleStyle: {
              color: colors.primaryInk,
              fontWeight: expiria.typography.weights.semibold,
              fontSize: expiria.typography.sizes.subheading,
            },
            headerTintColor: colors.primaryInk,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.primarySurface },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="food/[id]" options={{ title: 'Food Details', headerBackTitle: 'Back' }} />
        </Stack>
      </SafeAreaProvider>
    </TamaguiProvider>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  )
}
