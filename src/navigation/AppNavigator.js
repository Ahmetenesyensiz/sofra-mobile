import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerTabs from './CustomerTabs';
import OwnerTabs from './OwnerTabs';
import WaiterTabs from './WaiterTabs';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007aff" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                // Kullanıcı giriş yapmamışsa Auth stack'ini göster
                <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : (
                // Kullanıcı giriş yapmışsa role göre ilgili stack'i göster
                <>
                    {user.role === 'CUSTOMER' && (
                        <Stack.Screen name="Customer" component={CustomerTabs} />
                    )}
                    {user.role === 'OWNER' && (
                        <Stack.Screen name="Owner" component={OwnerTabs} />
                    )}
                    {user.role === 'WAITER' && (
                        <Stack.Screen name="Waiter" component={WaiterTabs} />
                    )}
                </>
            )}
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AppNavigator;
