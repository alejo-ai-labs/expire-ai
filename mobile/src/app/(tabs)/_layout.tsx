import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { expiria } from '../../theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: expiria.colors.primaryInk,
                tabBarInactiveTintColor: expiria.colors.textMuted,
                tabBarStyle: {
                    backgroundColor: expiria.colors.primarySurface,
                    borderTopColor: expiria.colors.border,
                    borderTopWidth: 1,
                    paddingTop: expiria.spacing.sm,
                    paddingBottom: expiria.spacing.sm,
                },
                tabBarLabelStyle: {
                    fontSize: expiria.typography.sizes.small + 1,
                    fontWeight: expiria.typography.weights.medium,
                },
                headerStyle: {
                    backgroundColor: expiria.colors.primarySurface,
                },
                headerTitleStyle: {
                    color: expiria.colors.primaryInk,
                    fontWeight: expiria.typography.weights.semibold,
                    fontSize: expiria.typography.sizes.subheading - 2,
                },
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'My Food',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="basket-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="camera-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
