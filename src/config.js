// API URL yapılandırması
export const API_URL = __DEV__
    ? 'http://10.67.17.151:8080/api'
    : 'https://api.sofra.com/api';

// Cache süreleri (milisaniye)
export const CACHE_DURATIONS = {
    RESTAURANTS: 1000 * 60 * 5, // 5 dakika
    MENU_ITEMS: 1000 * 60 * 30, // 30 dakika
    USER_PROFILE: 1000 * 60 * 60, // 1 saat
    ORDERS: 1000 * 60 * 2, // 2 dakika
};

// Uygulama sabitleri
export const APP_CONSTANTS = {
    MAX_ORDER_ITEMS: 99,
    MIN_ORDER_AMOUNT: 50,
    DELIVERY_FEE: 15,
    TAX_RATE: 0.18, // %18 KDV
};

// Enhanced Color System
export const COLORS = {
    // Primary Brand Colors
    primary: '#007aff',
    primaryLight: '#4da3ff',
    primaryDark: '#0056cc',

    // Secondary Colors
    secondary: '#5856d6',
    secondaryLight: '#8b89e8',
    secondaryDark: '#3f3ea3',

    // Semantic Colors
    success: '#34c759',
    successLight: '#6dd482',
    successDark: '#248a3d',

    warning: '#ff9500',
    warningLight: '#ffb84d',
    warningDark: '#cc7700',

    danger: '#ff3b30',
    dangerLight: '#ff6b63',
    dangerDark: '#cc2e26',

    info: '#5ac8fa',
    infoLight: '#8bdbfb',
    infoDark: '#48a0c8',

    // Neutral Colors
    white: '#ffffff',
    black: '#000000',

    // Gray Scale
    gray50: '#fafafa',
    gray100: '#f5f5f5',
    gray200: '#eeeeee',
    gray300: '#e0e0e0',
    gray400: '#bdbdbd',
    gray500: '#9e9e9e',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',

    // Background Colors
    background: {
        light: '#ffffff',
        dark: '#000000',
        secondary: '#f8f9fa',
        darkSecondary: '#1c1c1e',
    },

    // Surface Colors
    surface: {
        light: '#ffffff',
        dark: '#1c1c1e',
        elevated: '#ffffff',
        darkElevated: '#2c2c2e',
    },

    // Text Colors
    text: {
        primary: '#000000',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
        inverse: '#ffffff',
        darkPrimary: '#ffffff',
        darkSecondary: '#d1d5db',
        darkTertiary: '#9ca3af',
    },

    // Border Colors
    border: {
        light: '#e5e7eb',
        medium: '#d1d5db',
        dark: '#374151',
        focus: '#007aff',
    },
};

// Typography System
export const TYPOGRAPHY = {
    // Font Families
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semiBold: 'System',
        bold: 'System',
    },

    // Font Sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },

    // Font Weights
    fontWeight: {
        normal: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
        extraBold: '800',
    },

    // Line Heights
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Letter Spacing
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1,
    },
};

// Boşluk değerleri
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Border radius değerleri
export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
};

// Enhanced Shadow System
export const SHADOWS = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    xs: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },
};

// Component Variants
export const VARIANTS = {
    button: {
        primary: {
            backgroundColor: COLORS.primary,
            color: COLORS.white,
        },
        secondary: {
            backgroundColor: COLORS.gray100,
            color: COLORS.text.primary,
        },
        outline: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: COLORS.primary,
            color: COLORS.primary,
        },
        ghost: {
            backgroundColor: 'transparent',
            color: COLORS.primary,
        },
        danger: {
            backgroundColor: COLORS.danger,
            color: COLORS.white,
        },
    },
    input: {
        default: {
            borderColor: COLORS.border.light,
            backgroundColor: COLORS.white,
        },
        focused: {
            borderColor: COLORS.border.focus,
            backgroundColor: COLORS.white,
        },
        error: {
            borderColor: COLORS.danger,
            backgroundColor: COLORS.white,
        },
    },
};