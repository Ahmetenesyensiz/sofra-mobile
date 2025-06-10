import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '../config';
console.log('COLORS imported successfully:', !!COLORS);

const ThemeContext = createContext();

export const useTheme = () => {
    console.log('useTheme hook called'); // Debug log
    const context = useContext(ThemeContext);
    console.log('useTheme context value:', context); // Debug log
    console.log('useTheme context keys:', context ? Object.keys(context) : 'null'); // Debug log

    if (!context) {
        console.error('useTheme hook called outside of ThemeProvider');
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
};

export const ThemeProvider = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

    console.log('ThemeProvider rendering, isDarkMode:', isDarkMode); // Debug log

    useEffect(() => {
        loadThemePreference();
    }, []);

    useEffect(() => {
        if (themeMode === 'system') {
            setIsDarkMode(systemColorScheme === 'dark');
        } else {
            setIsDarkMode(themeMode === 'dark');
        }
    }, [themeMode, systemColorScheme]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('themeMode');
            if (savedTheme) {
                setThemeMode(savedTheme);
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const saveThemePreference = async (mode) => {
        try {
            await AsyncStorage.setItem('themeMode', mode);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const setTheme = (mode) => {
        setThemeMode(mode);
        saveThemePreference(mode);
    };

    const theme = {
        isDarkMode,
        themeMode,
        setTheme,
        colors: {
            // Primary colors
            primary: COLORS.primary || '#007aff',
            primaryLight: COLORS.primaryLight || '#4da3ff',
            primaryDark: COLORS.primaryDark || '#0056cc',
            
            // Background colors
            background: isDarkMode ? COLORS.background?.dark || '#000000' : COLORS.background?.light || '#ffffff',
            backgroundSecondary: isDarkMode ? COLORS.background?.darkSecondary || '#1c1c1e' : COLORS.background?.secondary || '#f8f9fa',
            
            // Surface colors
            surface: isDarkMode ? COLORS.surface?.dark || '#1c1c1e' : COLORS.surface?.light || '#ffffff',
            surfaceElevated: isDarkMode ? COLORS.surface?.darkElevated || '#2c2c2e' : COLORS.surface?.elevated || '#ffffff',
            
            // Text colors
            textPrimary: isDarkMode ? COLORS.text?.darkPrimary || '#ffffff' : COLORS.text?.primary || '#000000',
            textSecondary: isDarkMode ? COLORS.text?.darkSecondary || '#d1d5db' : COLORS.text?.secondary || '#6b7280',
            textTertiary: isDarkMode ? COLORS.text?.darkTertiary || '#9ca3af' : COLORS.text?.tertiary || '#9ca3af',
            
            // Border colors
            border: isDarkMode ? COLORS.border?.dark || '#374151' : COLORS.border?.light || '#e5e7eb',
            borderMedium: isDarkMode ? COLORS.border?.dark || '#374151' : COLORS.border?.medium || '#d1d5db',
            
            // Semantic colors
            success: COLORS.success || '#34c759',
            warning: COLORS.warning || '#ff9500',
            danger: COLORS.danger || '#ff3b30',
            info: COLORS.info || '#5ac8fa',
            
            // Gray scale
            gray50: COLORS.gray50 || '#fafafa',
            gray100: COLORS.gray100 || '#f5f5f5',
            gray200: COLORS.gray200 || '#eeeeee',
            gray300: COLORS.gray300 || '#e0e0e0',
            gray400: COLORS.gray400 || '#bdbdbd',
            gray500: COLORS.gray500 || '#9e9e9e',
            gray600: COLORS.gray600 || '#757575',
            gray700: COLORS.gray700 || '#616161',
            gray800: COLORS.gray800 || '#424242',
            gray900: COLORS.gray900 || '#212121',
        },
    };

    return (
        <ThemeContext.Provider value={theme}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
            />
            {children}
        </ThemeContext.Provider>
    );
};
