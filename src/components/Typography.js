import React from 'react';
import { Text, StyleSheet, useColorScheme } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../config';

// Heading Component
export const Heading = ({ 
    children, 
    level = 1, 
    color, 
    style, 
    ...props 
}) => {
    const isDarkMode = useColorScheme() === 'dark';
    
    const getHeadingStyle = () => {
        const baseColor = color || (isDarkMode ? COLORS.text?.darkPrimary || '#ffffff' : COLORS.text?.primary || '#000000');
        
        switch (level) {
            case 1:
                return {
                    fontSize: TYPOGRAPHY.fontSize['4xl'] || 36,
                    fontWeight: TYPOGRAPHY.fontWeight.bold || '700',
                    color: baseColor,
                    lineHeight: (TYPOGRAPHY.lineHeight?.tight || 1.25) * (TYPOGRAPHY.fontSize['4xl'] || 36),
                };
            case 2:
                return {
                    fontSize: TYPOGRAPHY.fontSize['3xl'] || 30,
                    fontWeight: TYPOGRAPHY.fontWeight.bold || '700',
                    color: baseColor,
                    lineHeight: (TYPOGRAPHY.lineHeight?.tight || 1.25) * (TYPOGRAPHY.fontSize['3xl'] || 30),
                };
            case 3:
                return {
                    fontSize: TYPOGRAPHY.fontSize['2xl'] || 24,
                    fontWeight: TYPOGRAPHY.fontWeight.semiBold || '600',
                    color: baseColor,
                    lineHeight: (TYPOGRAPHY.lineHeight?.normal || 1.5) * (TYPOGRAPHY.fontSize['2xl'] || 24),
                };
            case 4:
                return {
                    fontSize: TYPOGRAPHY.fontSize.xl || 20,
                    fontWeight: TYPOGRAPHY.fontWeight.semiBold || '600',
                    color: baseColor,
                    lineHeight: (TYPOGRAPHY.lineHeight?.normal || 1.5) * (TYPOGRAPHY.fontSize.xl || 20),
                };
            case 5:
                return {
                    fontSize: TYPOGRAPHY.fontSize.lg || 18,
                    fontWeight: TYPOGRAPHY.fontWeight.medium || '500',
                    color: baseColor,
                    lineHeight: (TYPOGRAPHY.lineHeight?.normal || 1.5) * (TYPOGRAPHY.fontSize.lg || 18),
                };
            default:
                return {
                    fontSize: TYPOGRAPHY.fontSize.base || 16,
                    fontWeight: TYPOGRAPHY.fontWeight.medium || '500',
                    color: baseColor,
                    lineHeight: (TYPOGRAPHY.lineHeight?.normal || 1.5) * (TYPOGRAPHY.fontSize.base || 16),
                };
        }
    };

    return (
        <Text style={[getHeadingStyle(), style]} {...props}>
            {children}
        </Text>
    );
};

// Body Text Component
export const BodyText = ({ 
    children, 
    size = 'base', 
    weight = 'normal',
    color,
    style, 
    ...props 
}) => {
    const isDarkMode = useColorScheme() === 'dark';
    
    const getTextColor = () => {
        if (color) return color;
        return isDarkMode ? COLORS.text?.darkPrimary || '#ffffff' : COLORS.text?.primary || '#000000';
    };

    return (
        <Text 
            style={[
                {
                    fontSize: TYPOGRAPHY.fontSize[size] || 16,
                    fontWeight: TYPOGRAPHY.fontWeight[weight] || '400',
                    color: getTextColor(),
                    lineHeight: (TYPOGRAPHY.lineHeight?.normal || 1.5) * (TYPOGRAPHY.fontSize[size] || 16),
                },
                style
            ]} 
            {...props}
        >
            {children}
        </Text>
    );
};

// Caption Text Component
export const Caption = ({ 
    children, 
    color,
    style, 
    ...props 
}) => {
    const isDarkMode = useColorScheme() === 'dark';
    
    const getTextColor = () => {
        if (color) return color;
        return isDarkMode ? COLORS.text?.darkSecondary || '#d1d5db' : COLORS.text?.secondary || '#6b7280';
    };

    return (
        <Text 
            style={[
                {
                    fontSize: TYPOGRAPHY.fontSize.sm || 14,
                    fontWeight: TYPOGRAPHY.fontWeight.normal || '400',
                    color: getTextColor(),
                    lineHeight: (TYPOGRAPHY.lineHeight?.normal || 1.5) * (TYPOGRAPHY.fontSize.sm || 14),
                },
                style
            ]} 
            {...props}
        >
            {children}
        </Text>
    );
};

// Label Component
export const Label = ({ 
    children, 
    color,
    style, 
    ...props 
}) => {
    const isDarkMode = useColorScheme() === 'dark';
    
    const getTextColor = () => {
        if (color) return color;
        return isDarkMode ? COLORS.text?.darkSecondary || '#d1d5db' : COLORS.text?.secondary || '#6b7280';
    };

    return (
        <Text 
            style={[
                {
                    fontSize: TYPOGRAPHY.fontSize.sm || 14,
                    fontWeight: TYPOGRAPHY.fontWeight.medium || '500',
                    color: getTextColor(),
                    letterSpacing: TYPOGRAPHY.letterSpacing?.wide || 0.5,
                    textTransform: 'uppercase',
                },
                style
            ]} 
            {...props}
        >
            {children}
        </Text>
    );
};
