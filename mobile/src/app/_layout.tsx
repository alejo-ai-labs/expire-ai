import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig, expiria } from '../theme'
import { useNotifications } from '../hooks/useNotifications'

export default function RootLayout() {
  useNotifications()

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: expiria.colors.primarySurface },
            headerTitleStyle: {
              color: expiria.colors.primaryInk,
              fontWeight: expiria.typography.weights.semibold,
              fontSize: expiria.typography.sizes.subheading,
            },
            headerTintColor: expiria.colors.primaryInk,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: expiria.colors.primarySurface },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="food/[id]" options={{ title: 'Food Details', headerBackTitle: 'Back' }} />
        </Stack>
      </SafeAreaProvider>
    </TamaguiProvider>
  )
}
