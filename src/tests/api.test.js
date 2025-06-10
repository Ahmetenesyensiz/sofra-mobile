import api, { handleApiError } from '../services/api';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

describe('API Service', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('Request Interceptor', () => {
        it('adds authorization header when token exists', async () => {
            const mockToken = 'test-token';
            SecureStore.getItemAsync.mockResolvedValue(mockToken);

            const config = {
                url: '/test',
                headers: {},
            };

            const result = await api.interceptors.request.handlers[0].fulfilled(config);
            expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
        });

        it('does not add authorization header for auth endpoints', async () => {
            const mockToken = 'test-token';
            SecureStore.getItemAsync.mockResolvedValue(mockToken);

            const config = {
                url: '/auth/login',
                headers: {},
            };

            const result = await api.interceptors.request.handlers[0].fulfilled(config);
            expect(result.headers.Authorization).toBeUndefined();
        });

        it('handles token retrieval error', async () => {
            SecureStore.getItemAsync.mockRejectedValue(new Error('Token error'));

            const config = {
                url: '/test',
                headers: {},
            };

            await expect(
                api.interceptors.request.handlers[0].fulfilled(config)
            ).rejects.toThrow('Token error');
        });
    });

    describe('Response Interceptor', () => {
        it('handles network error', async () => {
            const error = {
                response: null,
                request: null,
            };

            const result = await api.interceptors.response.handlers[0].rejected(error);
            expect(result).toBe(error);
        });

        it('handles 401 unauthorized error', async () => {
            const error = {
                response: {
                    status: 401,
                },
                config: {
                    _retry: false,
                },
            };

            SecureStore.deleteItemAsync.mockResolvedValue();

            await api.interceptors.response.handlers[0].rejected(error);
            expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
        });

        it('handles other error responses', async () => {
            const error = {
                response: {
                    status: 500,
                    data: {
                        message: 'Server error',
                    },
                },
            };

            const result = await api.interceptors.response.handlers[0].rejected(error);
            expect(result).toBe(error);
        });
    });

    describe('handleApiError', () => {
        it('handles 400 error', () => {
            const error = {
                response: {
                    status: 400,
                    data: {
                        message: 'Bad request',
                    },
                },
            };

            expect(handleApiError(error)).toBe(
                'Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.'
            );
        });

        it('handles 401 error', () => {
            const error = {
                response: {
                    status: 401,
                },
            };

            expect(handleApiError(error)).toBe(
                'Oturum süreniz doldu. Lütfen tekrar giriş yapın.'
            );
        });

        it('handles 403 error', () => {
            const error = {
                response: {
                    status: 403,
                },
            };

            expect(handleApiError(error)).toBe(
                'Bu işlem için yetkiniz bulunmuyor.'
            );
        });

        it('handles 404 error', () => {
            const error = {
                response: {
                    status: 404,
                },
            };

            expect(handleApiError(error)).toBe(
                'İstenen kaynak bulunamadı.'
            );
        });

        it('handles 500 error', () => {
            const error = {
                response: {
                    status: 500,
                },
            };

            expect(handleApiError(error)).toBe(
                'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
            );
        });

        it('handles network error', () => {
            const error = {
                request: {},
            };

            expect(handleApiError(error)).toBe(
                'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.'
            );
        });

        it('handles unknown error', () => {
            const error = {};

            expect(handleApiError(error)).toBe(
                'Bir hata oluştu. Lütfen tekrar deneyin.'
            );
        });
    });
}); 