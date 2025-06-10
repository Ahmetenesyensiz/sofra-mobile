import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OwnerRegisterScreen from '../screens/auth/OwnerRegisterScreen';
import OwnerPaymentScreen from '../screens/auth/OwnerPaymentScreen';
import OwnerContractScreen from '../screens/auth/OwnerContractScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
    headerShown: false,
    animation: 'slide_from_right',
};

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={screenOptions}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OwnerRegister" component={OwnerRegisterScreen} />
            <Stack.Screen name="OwnerPayment" component={OwnerPaymentScreen} />
            <Stack.Screen name="OwnerContract" component={OwnerContractScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;
