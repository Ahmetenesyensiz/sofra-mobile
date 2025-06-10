import React from 'react';
import { View, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { BodyText } from './Typography';
import { COLORS, SPACING } from '../config';

const LoadingSpinner = ({ 
    size = 'large', 
    color, 
    text,
    overlay = false,
    style 
}) => {
    const isDarkMode = useColorScheme() === 'dark';
    
    const getColor = () => {
        if (color) return color;
        return COLORS.primary || '#007aff';
    };

    const content = (
        <View style={[styles.container, style]}>
            <ActivityIndicator 
                size={size} 
                color={getColor()} 
            />
            {text && (
                <BodyText 
                    style={[
                        styles.text,
                        { color: isDarkMode ? COLORS.text?.darkSecondary || '#d1d5db' : COLORS.text?.secondary || '#6b7280' }
                    ]}
                >
                    {text}
                </BodyText>
            )}
        </View>
    );

    if (overlay) {
        return (
            <View style={[
                styles.overlay,
                { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)' }
            ]}>
                {content}
            </View>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.lg || 16,
    },
    text: {
        marginTop: SPACING.md || 12,
        textAlign: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
});

export default LoadingSpinner;
