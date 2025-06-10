import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../config';

// Global utility styles that can be reused across components
export const globalStyles = StyleSheet.create({
    // Container styles
    container: {
        flex: 1,
    },
    containerPadded: {
        flex: 1,
        padding: SPACING.lg || 16,
    },
    containerCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    // Flex utilities
    flexRow: {
        flexDirection: 'row',
    },
    flexColumn: {
        flexDirection: 'column',
    },
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    flexBetween: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    flexStart: {
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    flexEnd: {
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    
    // Spacing utilities
    marginXs: { margin: SPACING.xs || 4 },
    marginSm: { margin: SPACING.sm || 8 },
    marginMd: { margin: SPACING.md || 12 },
    marginLg: { margin: SPACING.lg || 16 },
    marginXl: { margin: SPACING.xl || 24 },
    
    paddingXs: { padding: SPACING.xs || 4 },
    paddingSm: { padding: SPACING.sm || 8 },
    paddingMd: { padding: SPACING.md || 12 },
    paddingLg: { padding: SPACING.lg || 16 },
    paddingXl: { padding: SPACING.xl || 24 },
    
    // Margin top/bottom
    marginTopXs: { marginTop: SPACING.xs || 4 },
    marginTopSm: { marginTop: SPACING.sm || 8 },
    marginTopMd: { marginTop: SPACING.md || 12 },
    marginTopLg: { marginTop: SPACING.lg || 16 },
    marginTopXl: { marginTop: SPACING.xl || 24 },
    
    marginBottomXs: { marginBottom: SPACING.xs || 4 },
    marginBottomSm: { marginBottom: SPACING.sm || 8 },
    marginBottomMd: { marginBottom: SPACING.md || 12 },
    marginBottomLg: { marginBottom: SPACING.lg || 16 },
    marginBottomXl: { marginBottom: SPACING.xl || 24 },
    
    // Border radius utilities
    roundedSm: { borderRadius: BORDER_RADIUS.sm || 4 },
    roundedMd: { borderRadius: BORDER_RADIUS.md || 8 },
    roundedLg: { borderRadius: BORDER_RADIUS.lg || 12 },
    roundedXl: { borderRadius: BORDER_RADIUS.xl || 16 },
    roundedFull: { borderRadius: BORDER_RADIUS.round || 9999 },
    
    // Shadow utilities
    shadowXs: SHADOWS.xs || {},
    shadowSm: SHADOWS.sm || {},
    shadowMd: SHADOWS.md || {},
    shadowLg: SHADOWS.lg || {},
    shadowXl: SHADOWS.xl || {},
    
    // Text alignment
    textCenter: { textAlign: 'center' },
    textLeft: { textAlign: 'left' },
    textRight: { textAlign: 'right' },
    
    // Common card style
    card: {
        backgroundColor: COLORS.white || '#ffffff',
        borderRadius: BORDER_RADIUS.lg || 12,
        padding: SPACING.lg || 16,
        ...SHADOWS.sm,
    },
    
    // Common list item style
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md || 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border?.light || '#e5e7eb',
    },
    
    // Common button styles
    buttonBase: {
        borderRadius: BORDER_RADIUS.lg || 12,
        paddingVertical: SPACING.md || 12,
        paddingHorizontal: SPACING.lg || 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.sm,
    },
    
    // Common input styles
    inputBase: {
        borderWidth: 1,
        borderColor: COLORS.border?.light || '#e5e7eb',
        borderRadius: BORDER_RADIUS.lg || 12,
        paddingHorizontal: SPACING.md || 12,
        paddingVertical: SPACING.md || 12,
        fontSize: TYPOGRAPHY.fontSize?.base || 16,
        backgroundColor: COLORS.white || '#ffffff',
    },
    
    // Divider
    divider: {
        height: 1,
        backgroundColor: COLORS.border?.light || '#e5e7eb',
        marginVertical: SPACING.md || 12,
    },
    
    // Loading overlay
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    
    // Error state
    errorContainer: {
        backgroundColor: (COLORS.danger || '#ff3b30') + '10',
        borderColor: (COLORS.danger || '#ff3b30') + '30',
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md || 8,
        padding: SPACING.md || 12,
        marginVertical: SPACING.sm || 8,
    },
    
    // Success state
    successContainer: {
        backgroundColor: (COLORS.success || '#34c759') + '10',
        borderColor: (COLORS.success || '#34c759') + '30',
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md || 8,
        padding: SPACING.md || 12,
        marginVertical: SPACING.sm || 8,
    },
    
    // Warning state
    warningContainer: {
        backgroundColor: (COLORS.warning || '#ff9500') + '10',
        borderColor: (COLORS.warning || '#ff9500') + '30',
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md || 8,
        padding: SPACING.md || 12,
        marginVertical: SPACING.sm || 8,
    },
});

// Helper function to create theme-aware styles
export const createThemedStyles = (styleFunction) => {
    return (isDarkMode) => styleFunction(isDarkMode);
};

// Common animations
export const animations = {
    fadeIn: {
        opacity: 1,
    },
    fadeOut: {
        opacity: 0,
    },
    slideInFromRight: {
        transform: [{ translateX: 0 }],
    },
    slideOutToRight: {
        transform: [{ translateX: 300 }],
    },
    scaleIn: {
        transform: [{ scale: 1 }],
    },
    scaleOut: {
        transform: [{ scale: 0.95 }],
    },
};
