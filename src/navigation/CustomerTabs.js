import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, ActivityIndicator } from 'react-native';
import { TYPOGRAPHY, SPACING, SHADOWS } from '../config';
import { useTheme } from '../contexts/ThemeContext';

import HomeScreen from '../screens/customer/HomeScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import FriendsScreen from '../screens/customer/FriendsScreen';

const Tab = createBottomTabNavigator();

const CustomerTabs = () => {
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
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: isDarkMode ? colors.surfaceElevated : colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 68,
                    paddingBottom: Platform.OS === 'ios' ? 28 : SPACING.sm,
                    paddingTop: SPACING.sm,
                    paddingHorizontal: SPACING.sm,
                    ...SHADOWS.sm,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: isDarkMode ? colors.gray500 : colors.gray400,
                tabBarLabelStyle: {
                    fontSize: TYPOGRAPHY.fontSize.xs,
                    fontWeight: TYPOGRAPHY.fontWeight.medium,
                    marginTop: 2,
                },
                tabBarItemStyle: {
                    paddingVertical: SPACING.xs,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Ana Sayfa',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={focused ? size + 2 : size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Orders"
                component={OrdersScreen}
                options={{
                    tabBarLabel: 'Siparişlerim',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'receipt' : 'receipt-outline'}
                            size={focused ? size + 2 : size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Friends"
                component={FriendsScreen}
                options={{
                    tabBarLabel: 'Arkadaşlar',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'people' : 'people-outline'}
                            size={focused ? size + 2 : size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profilim',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={focused ? size + 2 : size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default CustomerTabs;
