import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../config';

const Card = ({ 
    children, 
    style, 
    padding = 'md',
    shadow = 'sm',
    borderRadius = 'lg',
    ...props 
}) => {
    const isDarkMode = useColorScheme() === 'dark';

    const getPadding = () => {
        switch (padding) {
            case 'none': return 0;
            case 'sm': return SPACING.sm;
            case 'md': return SPACING.md;
            case 'lg': return SPACING.lg;
            case 'xl': return SPACING.xl;
            default: return SPACING.md;
        }
    };

    const getBorderRadius = () => {
        switch (borderRadius) {
            case 'none': return 0;
            case 'sm': return BORDER_RADIUS.sm;
            case 'md': return BORDER_RADIUS.md;
            case 'lg': return BORDER_RADIUS.lg;
            case 'xl': return BORDER_RADIUS.xl;
            case 'round': return BORDER_RADIUS.round;
            default: return BORDER_RADIUS.lg;
        }
    };

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: isDarkMode ? COLORS.surface?.darkElevated || '#2c2c2e' : COLORS.surface?.light || '#ffffff',
                    padding: getPadding(),
                    borderRadius: getBorderRadius(),
                    ...SHADOWS[shadow],
                },
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: SPACING.xs,
    },
});

export default Card;
