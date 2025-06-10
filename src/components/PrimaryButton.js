import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    useColorScheme,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../config';

const PrimaryButton = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle,
    ...props
}) => {
    const isDarkMode = useColorScheme() === 'dark';

    const getButtonStyle = () => {
        const baseStyle = {
            ...styles.button,
            ...styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
        };

        if (fullWidth) {
            baseStyle.width = '100%';
        }

        // Variant styles
        switch (variant) {
            case 'secondary':
                return {
                    ...baseStyle,
                    backgroundColor: isDarkMode ? COLORS.gray700 : COLORS.gray100,
                    borderWidth: 1,
                    borderColor: isDarkMode ? COLORS.gray600 : COLORS.gray300,
                };
            case 'outline':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: COLORS.primary,
                };
            case 'ghost':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                    ...SHADOWS.none,
                };
            case 'danger':
                return {
                    ...baseStyle,
                    backgroundColor: COLORS.danger,
                };
            default: // primary
                return {
                    ...baseStyle,
                    backgroundColor: COLORS.primary,
                };
        }
    };

    const getTextStyle = () => {
        const baseTextStyle = {
            ...styles.buttonText,
            ...styles[`buttonText${size.charAt(0).toUpperCase() + size.slice(1)}`],
        };

        switch (variant) {
            case 'secondary':
                return {
                    ...baseTextStyle,
                    color: isDarkMode ? COLORS.text.darkPrimary : COLORS.text.primary,
                };
            case 'outline':
                return {
                    ...baseTextStyle,
                    color: COLORS.primary,
                };
            case 'ghost':
                return {
                    ...baseTextStyle,
                    color: COLORS.primary,
                };
            default:
                return {
                    ...baseTextStyle,
                    color: COLORS.white,
                };
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'secondary':
                return isDarkMode ? COLORS.text.darkPrimary : COLORS.text.primary;
            case 'outline':
            case 'ghost':
                return COLORS.primary;
            default:
                return COLORS.white;
        }
    };

    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            style={[
                getButtonStyle(),
                isDisabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
            {...props}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator
                        color={getIconColor()}
                        size={size === 'sm' ? 'small' : 'small'}
                    />
                ) : (
                    <>
                        {icon && iconPosition === 'left' && (
                            <Ionicons
                                name={icon}
                                size={size === 'sm' ? 16 : 20}
                                color={getIconColor()}
                                style={styles.iconLeft}
                            />
                        )}
                        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
                        {icon && iconPosition === 'right' && (
                            <Ionicons
                                name={icon}
                                size={size === 'sm' ? 16 : 20}
                                color={getIconColor()}
                                style={styles.iconRight}
                            />
                        )}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
        transition: 'all 0.2s ease',
    },
    buttonSm: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        minHeight: 40,
    },
    buttonMd: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        minHeight: 48,
    },
    buttonLg: {
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        minHeight: 56,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontWeight: TYPOGRAPHY.fontWeight.semiBold,
        letterSpacing: TYPOGRAPHY.letterSpacing.wide,
        textAlign: 'center',
    },
    buttonTextSm: {
        fontSize: TYPOGRAPHY.fontSize.sm,
    },
    buttonTextMd: {
        fontSize: TYPOGRAPHY.fontSize.base,
    },
    buttonTextLg: {
        fontSize: TYPOGRAPHY.fontSize.lg,
    },
    iconLeft: {
        marginRight: SPACING.sm,
    },
    iconRight: {
        marginLeft: SPACING.sm,
    },
    disabled: {
        opacity: 0.6,
        ...SHADOWS.none,
    },
});

export default PrimaryButton;
