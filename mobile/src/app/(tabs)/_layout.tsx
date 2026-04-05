import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../context/ThemeContext';
import { expiria } from '../../theme';

export default function TabLayout() {
    const colors = useThemeColors();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primaryInk,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.primarySurface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    paddingTop: expiria.spacing.sm,
                    paddingBottom: expiria.spacing.sm,
                },
                tabBarLabelStyle: {
                    fontSize: expiria.typography.sizes.small + 1,
                    fontWeight: expiria.typography.weights.medium,
                },
                headerStyle: {
                    backgroundColor: colors.primarySurface,
                },
                headerTitleStyle: {
                    color: colors.primaryInk,
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
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
