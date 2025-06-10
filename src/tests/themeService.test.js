import themeService from '../services/themeService';
import storageService from '../services/storageService';
import { Appearance } from 'react-native';

// Mock dependencies
jest.mock('../services/storageService');
jest.mock('react-native', () => ({
    Appearance: {
        getColorScheme: jest.fn(),
        addChangeListener: jest.fn()
    }
}));

describe('ThemeService', () => {
    const mockTheme = {
        colors: {
            primary: '#FF5733',
            secondary: '#33FF57',
            background: '#FFFFFF',
            text: '#000000',
            error: '#FF0000',
            success: '#00FF00',
            warning: '#FFFF00',
            info: '#0000FF'
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 24,
            xl: 32
        },
        typography: {
            fontFamily: {
                regular: 'System',
                medium: 'System-Medium',
                bold: 'System-Bold'
            },
            fontSize: {
                xs: 12,
                sm: 14,
                md: 16,
                lg: 18,
                xl: 20
            }
        },
        borderRadius: {
            sm: 4,
            md: 8,
            lg: 16,
            xl: 24
        },
        shadows: {
            sm: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.18,
                shadowRadius: 1.0,
                elevation: 1
            },
            md: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5
            },
            lg: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.30,
                shadowRadius: 4.65,
                elevation: 8
            }
        }
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getTheme', () => {
        it('successfully gets theme from storage', async () => {
            storageService.getItem.mockResolvedValueOnce(mockTheme);

            const result = await themeService.getTheme();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(mockTheme);
        });

        it('returns default theme when no theme in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            const result = await themeService.getTheme();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(themeService.defaultTheme);
        });

        it('handles error when getting theme', async () => {
            const error = new Error('Failed to get theme');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(themeService.getTheme())
                .rejects.toThrow('Failed to get theme');
        });
    });

    describe('setTheme', () => {
        it('successfully sets theme', async () => {
            storageService.setItem.mockResolvedValueOnce();

            await themeService.setTheme(mockTheme);

            expect(storageService.setItem).toHaveBeenCalledWith('theme', mockTheme);
        });

        it('handles error when setting theme', async () => {
            const error = new Error('Failed to set theme');
            storageService.setItem.mockRejectedValueOnce(error);

            await expect(themeService.setTheme(mockTheme))
                .rejects.toThrow('Failed to set theme');
        });
    });

    describe('getColorScheme', () => {
        it('successfully gets color scheme from storage', async () => {
            const colorScheme = 'dark';
            storageService.getItem.mockResolvedValueOnce(colorScheme);

            const result = await themeService.getColorScheme();

            expect(storageService.getItem).toHaveBeenCalledWith('colorScheme');
            expect(result).toBe(colorScheme);
        });

        it('returns system color scheme when no scheme in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);
            Appearance.getColorScheme.mockReturnValueOnce('light');

            const result = await themeService.getColorScheme();

            expect(storageService.getItem).toHaveBeenCalledWith('colorScheme');
            expect(result).toBe('light');
        });

        it('handles error when getting color scheme', async () => {
            const error = new Error('Failed to get color scheme');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(themeService.getColorScheme())
                .rejects.toThrow('Failed to get color scheme');
        });
    });

    describe('setColorScheme', () => {
        it('successfully sets color scheme', async () => {
            const colorScheme = 'dark';
            storageService.setItem.mockResolvedValueOnce();

            await themeService.setColorScheme(colorScheme);

            expect(storageService.setItem).toHaveBeenCalledWith('colorScheme', colorScheme);
        });

        it('handles error when setting color scheme', async () => {
            const colorScheme = 'dark';
            const error = new Error('Failed to set color scheme');
            storageService.setItem.mockRejectedValueOnce(error);

            await expect(themeService.setColorScheme(colorScheme))
                .rejects.toThrow('Failed to set color scheme');
        });
    });

    describe('getThemeColors', () => {
        it('successfully gets theme colors', async () => {
            storageService.getItem.mockResolvedValueOnce(mockTheme);

            const result = await themeService.getThemeColors();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(mockTheme.colors);
        });

        it('returns default theme colors when no theme in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            const result = await themeService.getThemeColors();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(themeService.defaultTheme.colors);
        });

        it('handles error when getting theme colors', async () => {
            const error = new Error('Failed to get theme colors');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(themeService.getThemeColors())
                .rejects.toThrow('Failed to get theme colors');
        });
    });

    describe('getThemeSpacing', () => {
        it('successfully gets theme spacing', async () => {
            storageService.getItem.mockResolvedValueOnce(mockTheme);

            const result = await themeService.getThemeSpacing();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(mockTheme.spacing);
        });

        it('returns default theme spacing when no theme in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            const result = await themeService.getThemeSpacing();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(themeService.defaultTheme.spacing);
        });

        it('handles error when getting theme spacing', async () => {
            const error = new Error('Failed to get theme spacing');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(themeService.getThemeSpacing())
                .rejects.toThrow('Failed to get theme spacing');
        });
    });

    describe('getThemeTypography', () => {
        it('successfully gets theme typography', async () => {
            storageService.getItem.mockResolvedValueOnce(mockTheme);

            const result = await themeService.getThemeTypography();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(mockTheme.typography);
        });

        it('returns default theme typography when no theme in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            const result = await themeService.getThemeTypography();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(themeService.defaultTheme.typography);
        });

        it('handles error when getting theme typography', async () => {
            const error = new Error('Failed to get theme typography');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(themeService.getThemeTypography())
                .rejects.toThrow('Failed to get theme typography');
        });
    });

    describe('getThemeBorderRadius', () => {
        it('successfully gets theme border radius', async () => {
            storageService.getItem.mockResolvedValueOnce(mockTheme);

            const result = await themeService.getThemeBorderRadius();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(mockTheme.borderRadius);
        });

        it('returns default theme border radius when no theme in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            const result = await themeService.getThemeBorderRadius();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(themeService.defaultTheme.borderRadius);
        });

        it('handles error when getting theme border radius', async () => {
            const error = new Error('Failed to get theme border radius');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(themeService.getThemeBorderRadius())
                .rejects.toThrow('Failed to get theme border radius');
        });
    });

    describe('getThemeShadows', () => {
        it('successfully gets theme shadows', async () => {
            storageService.getItem.mockResolvedValueOnce(mockTheme);

            const result = await themeService.getThemeShadows();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(mockTheme.shadows);
        });

        it('returns default theme shadows when no theme in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            const result = await themeService.getThemeShadows();

            expect(storageService.getItem).toHaveBeenCalledWith('theme');
            expect(result).toEqual(themeService.defaultTheme.shadows);
        });

        it('handles error when getting theme shadows', async () => {
            const error = new Error('Failed to get theme shadows');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(themeService.getThemeShadows())
                .rejects.toThrow('Failed to get theme shadows');
        });
    });
}); 