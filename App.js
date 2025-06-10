import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
    console.log('App component rendering'); // Debug log
    return (
        <ThemeProvider>
            <AuthProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </AuthProvider>
        </ThemeProvider>
    );
}
