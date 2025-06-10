import i18nService from '../services/i18nService';
import storageService from '../services/storageService';
import { I18nManager } from 'react-native';

// Mock dependencies
jest.mock('../services/storageService');
jest.mock('react-native', () => ({
    I18nManager: {
        isRTL: false,
        forceRTL: jest.fn(),
        allowRTL: jest.fn()
    }
}));

describe('I18nService', () => {
    const mockTranslations = {
        en: {
            common: {
                welcome: 'Welcome',
                login: 'Login',
                register: 'Register',
                logout: 'Logout'
            },
            errors: {
                required: 'This field is required',
                invalid: 'Invalid value',
                network: 'Network error'
            }
        },
        tr: {
            common: {
                welcome: 'Hoşgeldiniz',
                login: 'Giriş Yap',
                register: 'Kayıt Ol',
                logout: 'Çıkış Yap'
            },
            errors: {
                required: 'Bu alan zorunludur',
                invalid: 'Geçersiz değer',
                network: 'Ağ hatası'
            }
        }
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('init', () => {
        it('successfully initializes i18n service', async () => {
            storageService.getItem.mockResolvedValueOnce('en');

            await i18nService.init();

            expect(storageService.getItem).toHaveBeenCalledWith('language');
            expect(i18nService.getLanguage()).toBe('en');
        });

        it('uses default language when no language in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            await i18nService.init();

            expect(storageService.getItem).toHaveBeenCalledWith('language');
            expect(i18nService.getLanguage()).toBe('en');
        });

        it('handles error during initialization', async () => {
            const error = new Error('Failed to initialize');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(i18nService.init())
                .rejects.toThrow('Failed to initialize');
        });
    });

    describe('setLanguage', () => {
        it('successfully sets language', async () => {
            storageService.setItem.mockResolvedValueOnce();

            await i18nService.setLanguage('tr');

            expect(storageService.setItem).toHaveBeenCalledWith('language', 'tr');
            expect(i18nService.getLanguage()).toBe('tr');
        });

        it('handles error when setting language', async () => {
            const error = new Error('Failed to set language');
            storageService.setItem.mockRejectedValueOnce(error);

            await expect(i18nService.setLanguage('tr'))
                .rejects.toThrow('Failed to set language');
        });
    });

    describe('getLanguage', () => {
        it('returns current language', () => {
            i18nService.setLanguage('tr');
            expect(i18nService.getLanguage()).toBe('tr');
        });
    });

    describe('isRTL', () => {
        it('returns true for RTL languages', () => {
            i18nService.setLanguage('ar');
            expect(i18nService.isRTL()).toBe(true);
        });

        it('returns false for LTR languages', () => {
            i18nService.setLanguage('en');
            expect(i18nService.isRTL()).toBe(false);
        });
    });

    describe('t', () => {
        beforeEach(() => {
            i18nService.setTranslations(mockTranslations);
        });

        it('successfully translates text', () => {
            i18nService.setLanguage('en');
            expect(i18nService.t('common.welcome')).toBe('Welcome');

            i18nService.setLanguage('tr');
            expect(i18nService.t('common.welcome')).toBe('Hoşgeldiniz');
        });

        it('returns key when translation not found', () => {
            expect(i18nService.t('nonexistent.key')).toBe('nonexistent.key');
        });

        it('handles nested keys', () => {
            i18nService.setLanguage('en');
            expect(i18nService.t('errors.required')).toBe('This field is required');
        });
    });

    describe('setTranslations', () => {
        it('successfully sets translations', () => {
            i18nService.setTranslations(mockTranslations);
            i18nService.setLanguage('en');
            expect(i18nService.t('common.welcome')).toBe('Welcome');
        });
    });

    describe('getAvailableLanguages', () => {
        it('returns available languages', () => {
            i18nService.setTranslations(mockTranslations);
            expect(i18nService.getAvailableLanguages()).toEqual(['en', 'tr']);
        });
    });

    describe('formatNumber', () => {
        it('formats number according to language', () => {
            i18nService.setLanguage('en');
            expect(i18nService.formatNumber(1234.56)).toBe('1,234.56');

            i18nService.setLanguage('tr');
            expect(i18nService.formatNumber(1234.56)).toBe('1.234,56');
        });
    });

    describe('formatCurrency', () => {
        it('formats currency according to language', () => {
            i18nService.setLanguage('en');
            expect(i18nService.formatCurrency(1234.56, 'USD')).toBe('$1,234.56');

            i18nService.setLanguage('tr');
            expect(i18nService.formatCurrency(1234.56, 'TRY')).toBe('₺1.234,56');
        });
    });

    describe('formatDate', () => {
        it('formats date according to language', () => {
            const date = new Date('2024-03-15');
            i18nService.setLanguage('en');
            expect(i18nService.formatDate(date)).toBe('3/15/2024');

            i18nService.setLanguage('tr');
            expect(i18nService.formatDate(date)).toBe('15.03.2024');
        });
    });

    describe('formatTime', () => {
        it('formats time according to language', () => {
            const date = new Date('2024-03-15T14:30:00');
            i18nService.setLanguage('en');
            expect(i18nService.formatTime(date)).toBe('2:30 PM');

            i18nService.setLanguage('tr');
            expect(i18nService.formatTime(date)).toBe('14:30');
        });
    });

    describe('formatDateTime', () => {
        it('formats date and time according to language', () => {
            const date = new Date('2024-03-15T14:30:00');
            i18nService.setLanguage('en');
            expect(i18nService.formatDateTime(date)).toBe('3/15/2024, 2:30 PM');

            i18nService.setLanguage('tr');
            expect(i18nService.formatDateTime(date)).toBe('15.03.2024 14:30');
        });
    });

    describe('formatRelativeTime', () => {
        it('formats relative time according to language', () => {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 3600000);
            
            i18nService.setLanguage('en');
            expect(i18nService.formatRelativeTime(oneHourAgo)).toBe('1 hour ago');

            i18nService.setLanguage('tr');
            expect(i18nService.formatRelativeTime(oneHourAgo)).toBe('1 saat önce');
        });
    });
}); 