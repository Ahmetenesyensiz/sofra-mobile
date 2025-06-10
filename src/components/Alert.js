import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BodyText } from './Typography';
import { COLORS, SPACING, BORDER_RADIUS } from '../config';

const Alert = ({ 
    type = 'info', 
    title, 
    message, 
    icon,
    style,
    onPress,
    ...props 
}) => {
    const isDarkMode = useColorScheme() === 'dark';

    const getAlertStyle = () => {
        const baseStyle = {
            ...styles.alert,
            backgroundColor: isDarkMode ? COLORS.gray800 || '#424242' : COLORS.white || '#ffffff',
        };

        switch (type) {
            case 'success':
                return {
                    ...baseStyle,
                    backgroundColor: (COLORS.success || '#34c759') + '15',
                    borderColor: (COLORS.success || '#34c759') + '40',
                };
            case 'warning':
                return {
                    ...baseStyle,
                    backgroundColor: (COLORS.warning || '#ff9500') + '15',
                    borderColor: (COLORS.warning || '#ff9500') + '40',
                };
            case 'error':
                return {
                    ...baseStyle,
                    backgroundColor: (COLORS.danger || '#ff3b30') + '15',
                    borderColor: (COLORS.danger || '#ff3b30') + '40',
                };
            case 'info':
            default:
                return {
                    ...baseStyle,
                    backgroundColor: (COLORS.info || '#5ac8fa') + '15',
                    borderColor: (COLORS.info || '#5ac8fa') + '40',
                };
        }
    };

    const getIconName = () => {
        if (icon) return icon;
        
        switch (type) {
            case 'success':
                return 'checkmark-circle-outline';
            case 'warning':
                return 'warning-outline';
            case 'error':
                return 'alert-circle-outline';
            case 'info':
            default:
                return 'information-circle-outline';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'success':
                return COLORS.success || '#34c759';
            case 'warning':
                return COLORS.warning || '#ff9500';
            case 'error':
                return COLORS.danger || '#ff3b30';
            case 'info':
            default:
                return COLORS.info || '#5ac8fa';
        }
    };

    return (
        <View style={[getAlertStyle(), style]} {...props}>
            <View style={styles.content}>
                <Ionicons 
                    name={getIconName()} 
                    size={24} 
                    color={getIconColor()} 
                    style={styles.icon}
                />
                <View style={styles.textContainer}>
                    {title && (
                        <BodyText 
                            weight="semiBold" 
                            style={[styles.title, { color: getIconColor() }]}
                        >
                            {title}
                        </BodyText>
                    )}
                    {message && (
                        <BodyText 
                            style={[
                                styles.message,
                                { color: isDarkMode ? COLORS.text?.darkSecondary || '#d1d5db' : COLORS.text?.secondary || '#6b7280' }
                            ]}
                        >
                            {message}
                        </BodyText>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    alert: {
        borderRadius: BORDER_RADIUS.lg || 12,
        borderWidth: 1,
        padding: SPACING.md || 12,
        marginVertical: SPACING.sm || 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    icon: {
        marginRight: SPACING.sm || 8,
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        marginBottom: SPACING.xs || 4,
    },
    message: {
        lineHeight: 20,
    },
});

export default Alert;
