import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

import DashboardScreen from '../screens/owner/DashboardScreen';
import MenuManagementScreen from '../screens/owner/MenuManagementScreen';
import TableManagementScreen from '../screens/owner/TableManagementScreen';
import OrderListScreen from '../screens/owner/OrderListScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import WaiterListScreen from '../screens/owner/WaiterListScreen';

const Tab = createBottomTabNavigator();

const iconMap = {
    Dashboard: 'home',
    Menu: 'restaurant',
    Tables: 'grid',
    Orders: 'list',
    Profile: 'person',
    Waiters: 'people',
};

const OwnerTabs = () => {
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
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Menu" component={MenuManagementScreen} />
            <Tab.Screen name="Tables" component={TableManagementScreen} />
            <Tab.Screen name="Orders" component={OrderListScreen} />
            <Tab.Screen name="Waiters" component={WaiterListScreen} options={{ tabBarLabel: 'Garsonlar' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default OwnerTabs;
