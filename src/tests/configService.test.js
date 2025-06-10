import configService from '../services/configService';
import storageService from '../services/storageService';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('../services/storageService');
jest.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: jest.fn(obj => obj.ios)
    }
}));

describe('ConfigService', () => {
    const mockConfig = {
        api: {
            baseUrl: 'https://api.example.com',
            timeout: 30000,
            retryAttempts: 3
        },
        app: {
            name: 'Sofra',
            version: '1.0.0',
            buildNumber: '1'
        },
        features: {
            darkMode: true,
            notifications: true,
            location: true
        },
        cache: {
            enabled: true,
            ttl: 3600
        }
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('init', () => {
        it('successfully initializes config service', async () => {
            storageService.getItem.mockResolvedValueOnce(mockConfig);

            await configService.init();

            expect(storageService.getItem).toHaveBeenCalledWith('config');
            expect(configService.getConfig()).toEqual(mockConfig);
        });

        it('uses default config when no config in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            await configService.init();

            expect(storageService.getItem).toHaveBeenCalledWith('config');
            expect(configService.getConfig()).toEqual(configService.defaultConfig);
        });

        it('handles error during initialization', async () => {
            const error = new Error('Failed to initialize');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(configService.init())
                .rejects.toThrow('Failed to initialize');
        });
    });

    describe('setConfig', () => {
        it('successfully sets config', async () => {
            storageService.setItem.mockResolvedValueOnce();

            await configService.setConfig(mockConfig);

            expect(storageService.setItem).toHaveBeenCalledWith('config', mockConfig);
            expect(configService.getConfig()).toEqual(mockConfig);
        });

        it('handles error when setting config', async () => {
            const error = new Error('Failed to set config');
            storageService.setItem.mockRejectedValueOnce(error);

            await expect(configService.setConfig(mockConfig))
                .rejects.toThrow('Failed to set config');
        });
    });

    describe('getConfig', () => {
        it('returns current config', () => {
            configService.setConfig(mockConfig);
            expect(configService.getConfig()).toEqual(mockConfig);
        });
    });

    describe('getApiConfig', () => {
        it('returns api config', () => {
            configService.setConfig(mockConfig);
            expect(configService.getApiConfig()).toEqual(mockConfig.api);
        });
    });

    describe('getAppConfig', () => {
        it('returns app config', () => {
            configService.setConfig(mockConfig);
            expect(configService.getAppConfig()).toEqual(mockConfig.app);
        });
    });

    describe('getFeatureConfig', () => {
        it('returns feature config', () => {
            configService.setConfig(mockConfig);
            expect(configService.getFeatureConfig()).toEqual(mockConfig.features);
        });
    });

    describe('getCacheConfig', () => {
        it('returns cache config', () => {
            configService.setConfig(mockConfig);
            expect(configService.getCacheConfig()).toEqual(mockConfig.cache);
        });
    });

    describe('isFeatureEnabled', () => {
        it('returns true for enabled features', () => {
            configService.setConfig(mockConfig);
            expect(configService.isFeatureEnabled('darkMode')).toBe(true);
            expect(configService.isFeatureEnabled('notifications')).toBe(true);
        });

        it('returns false for disabled features', () => {
            const disabledConfig = {
                ...mockConfig,
                features: {
                    ...mockConfig.features,
                    darkMode: false
                }
            };
            configService.setConfig(disabledConfig);
            expect(configService.isFeatureEnabled('darkMode')).toBe(false);
        });
    });

    describe('updateConfig', () => {
        it('successfully updates config', async () => {
            const updatedConfig = {
                ...mockConfig,
                api: {
                    ...mockConfig.api,
                    timeout: 60000
                }
            };
            storageService.setItem.mockResolvedValueOnce();

            await configService.updateConfig({ api: { timeout: 60000 } });

            expect(storageService.setItem).toHaveBeenCalledWith('config', updatedConfig);
            expect(configService.getConfig()).toEqual(updatedConfig);
        });

        it('handles error when updating config', async () => {
            const error = new Error('Failed to update config');
            storageService.setItem.mockRejectedValueOnce(error);

            await expect(configService.updateConfig({ api: { timeout: 60000 } }))
                .rejects.toThrow('Failed to update config');
        });
    });

    describe('resetConfig', () => {
        it('successfully resets config to default', async () => {
            storageService.setItem.mockResolvedValueOnce();

            await configService.resetConfig();

            expect(storageService.setItem).toHaveBeenCalledWith('config', configService.defaultConfig);
            expect(configService.getConfig()).toEqual(configService.defaultConfig);
        });

        it('handles error when resetting config', async () => {
            const error = new Error('Failed to reset config');
            storageService.setItem.mockRejectedValueOnce(error);

            await expect(configService.resetConfig())
                .rejects.toThrow('Failed to reset config');
        });
    });

    describe('validateConfig', () => {
        it('returns true for valid config', () => {
            expect(configService.validateConfig(mockConfig)).toBe(true);
        });

        it('returns false for invalid config', () => {
            const invalidConfig = {
                ...mockConfig,
                api: {
                    baseUrl: 'invalid-url'
                }
            };
            expect(configService.validateConfig(invalidConfig)).toBe(false);
        });
    });

    describe('getEnvironmentConfig', () => {
        it('returns development config in development', () => {
            process.env.NODE_ENV = 'development';
            expect(configService.getEnvironmentConfig()).toEqual(configService.developmentConfig);
        });

        it('returns production config in production', () => {
            process.env.NODE_ENV = 'production';
            expect(configService.getEnvironmentConfig()).toEqual(configService.productionConfig);
        });
    });
}); 