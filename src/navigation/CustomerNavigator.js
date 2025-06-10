import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import CustomerTabs from './CustomerTabs';
import RestaurantDetailScreen from '../screens/customer/RestaurantDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrdersScreen from '../screens/customer/OrdersScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import OrderDetailScreen from '../screens/customer/OrderDetailScreen';
import QRScannerScreen from '../screens/customer/QRScannerScreen';
import QRShareScreen from '../screens/customer/QRShareScreen';
import FriendsScreen from '../screens/customer/FriendsScreen';
import FriendRequestsScreen from '../screens/customer/FriendRequestsScreen';
import TableDetailScreen from '../screens/customer/TableDetailScreen';

const Stack = createStackNavigator();

const CustomerNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
            <Stack.Screen
                name="RestaurantDetail"
                component={RestaurantDetailScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Sepetim',
                    headerTitleAlign: 'center',
                }}
            />
            <Stack.Screen
                name="Orders"
                component={OrdersScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Siparişlerim',
                    headerTitleAlign: 'center',
                }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Profilim',
                    headerTitleAlign: 'center',
                }}
            />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
            <Stack.Screen name="QRShare" component={QRShareScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen
                name="FriendRequests"
                component={FriendRequestsScreen}
            />
            <Stack.Screen name="TableDetail" component={TableDetailScreen} />
        </Stack.Navigator>
    );
};

export default CustomerNavigator; 