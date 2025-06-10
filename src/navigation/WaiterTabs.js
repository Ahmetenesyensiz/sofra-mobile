import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

import ActiveCallsScreen from '../screens/waiter/ActiveCallsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator();

const iconMap = {
    Calls: 'call-outline',
    Profile: 'person-outline',
};

const WaiterTabs = () => {
    const themeContext = useTheme();

    if (!themeContext || typeof themeContext.isDarkMode === 'undefined') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }

    const { isDarkMode, colors } = themeContext;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    const iconName = iconMap[route.name] || 'ellipse';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: isDarkMode ? colors.gray500 : colors.gray400,
                tabBarStyle: {
                    backgroundColor: isDarkMode ? colors.surfaceElevated : colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 68,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
            })}
        >
            <Tab.Screen name="Calls" component={ActiveCallsScreen} options={{ title: 'Çağrılar' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
        </Tab.Navigator>
    );
};

export default WaiterTabs;
