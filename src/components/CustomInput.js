import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../config';

const CustomInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    icon,
    error,
    disabled = false,
    multiline = false,
    numberOfLines = 1,
    style,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isDarkMode = useColorScheme() === 'dark';
    const animatedValue = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const getBorderColor = () => {
        if (error) return COLORS.danger;
        if (isFocused) return COLORS.primary;
        return isDarkMode ? COLORS.gray600 : COLORS.border.light;
    };

    const getBackgroundColor = () => {
        if (disabled) return isDarkMode ? COLORS.gray800 : COLORS.gray100;
        return isDarkMode ? COLORS.surface.darkElevated : COLORS.surface.light;
    };

    const getTextColor = () => {
        if (disabled) return isDarkMode ? COLORS.gray600 : COLORS.gray400;
        return isDarkMode ? COLORS.text.darkPrimary : COLORS.text.primary;
    };

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={[
                    styles.label,
                    { color: isDarkMode ? COLORS.text.darkSecondary : COLORS.text.secondary },
                    error && { color: COLORS.danger }
                ]}>
                    {label}
                </Text>
            )}

            <Animated.View style={[
                styles.inputContainer,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: getBorderColor(),
                    borderWidth: isFocused ? 2 : 1,
                    ...SHADOWS.sm,
                },
                multiline && { height: 'auto', minHeight: 56 },
                disabled && { opacity: 0.6 }
            ]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? COLORS.primary : (isDarkMode ? COLORS.gray500 : COLORS.gray400)}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={isDarkMode ? COLORS.gray500 : COLORS.gray400}
                    style={[
                        styles.input,
                        { color: getTextColor() },
                        multiline && { textAlignVertical: 'top' }
                    ]}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    editable={!disabled}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.rightIcon}
                        disabled={disabled}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={isDarkMode ? COLORS.gray500 : COLORS.gray400}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        marginBottom: SPACING.sm,
        letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        minHeight: 56,
        transition: 'all 0.2s ease',
    },
    input: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSize.base,
        fontWeight: TYPOGRAPHY.fontWeight.normal,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        lineHeight: TYPOGRAPHY.lineHeight.normal * TYPOGRAPHY.fontSize.base,
    },
    leftIcon: {
        marginRight: SPACING.sm,
    },
    rightIcon: {
        marginLeft: SPACING.sm,
        padding: SPACING.xs,
    },
    errorText: {
        fontSize: TYPOGRAPHY.fontSize.sm,
        color: COLORS.danger,
        marginTop: SPACING.xs,
        marginLeft: SPACING.xs,
    },
});

export default CustomInput;
