import apiService from '../services/apiService';
import configService from '../services/configService';
import storageService from '../services/storageService';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../services/configService');
jest.mock('../services/storageService');
jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn()
    }
}));

describe('ApiService', () => {
    const mockConfig = {
        api: {
            baseUrl: 'https://api.example.com',
            timeout: 30000,
            retryAttempts: 3
        }
    };

    const mockToken = 'mock-token';
    const mockResponse = { data: { message: 'Success' } };
    const mockError = new Error('Network error');

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Reset fetch mock
        global.fetch = jest.fn();
        // Set default config
        configService.getApiConfig.mockReturnValue(mockConfig.api);
    });

    describe('init', () => {
        it('successfully initializes api service', async () => {
            storageService.getItem.mockResolvedValueOnce(mockToken);

            await apiService.init();

            expect(storageService.getItem).toHaveBeenCalledWith('token');
            expect(apiService.getToken()).toBe(mockToken);
        });

        it('handles error during initialization', async () => {
            const error = new Error('Failed to initialize');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(apiService.init())
                .rejects.toThrow('Failed to initialize');
        });
    });

    describe('setToken', () => {
        it('successfully sets token', async () => {
            storageService.setItem.mockResolvedValueOnce();

            await apiService.setToken(mockToken);

            expect(storageService.setItem).toHaveBeenCalledWith('token', mockToken);
            expect(apiService.getToken()).toBe(mockToken);
        });

        it('handles error when setting token', async () => {
            const error = new Error('Failed to set token');
            storageService.setItem.mockRejectedValueOnce(error);

            await expect(apiService.setToken(mockToken))
                .rejects.toThrow('Failed to set token');
        });
    });

    describe('getToken', () => {
        it('returns current token', () => {
            apiService.setToken(mockToken);
            expect(apiService.getToken()).toBe(mockToken);
        });
    });

    describe('removeToken', () => {
        it('successfully removes token', async () => {
            storageService.removeItem.mockResolvedValueOnce();

            await apiService.removeToken();

            expect(storageService.removeItem).toHaveBeenCalledWith('token');
            expect(apiService.getToken()).toBeNull();
        });

        it('handles error when removing token', async () => {
            const error = new Error('Failed to remove token');
            storageService.removeItem.mockRejectedValueOnce(error);

            await expect(apiService.removeToken())
                .rejects.toThrow('Failed to remove token');
        });
    });

    describe('request', () => {
        it('successfully makes request with token', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });
            apiService.setToken(mockToken);

            const result = await apiService.request('/endpoint', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.example.com/endpoint',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`
                    })
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('successfully makes request without token', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await apiService.request('/endpoint', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.example.com/endpoint',
                expect.objectContaining({
                    headers: expect.not.objectContaining({
                        'Authorization': expect.any(String)
                    })
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles network error', async () => {
            global.fetch.mockRejectedValueOnce(mockError);

            await expect(apiService.request('/endpoint'))
                .rejects.toThrow('Network error');
        });

        it('handles non-ok response', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: () => Promise.resolve({ message: 'Bad Request' })
            });

            await expect(apiService.request('/endpoint'))
                .rejects.toThrow('Bad Request');
        });
    });

    describe('get', () => {
        it('successfully makes GET request', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await apiService.get('/endpoint', { param: 'value' });

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.example.com/endpoint?param=value',
                expect.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('post', () => {
        it('successfully makes POST request', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await apiService.post('/endpoint', { data: 'value' });

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.example.com/endpoint',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ data: 'value' })
                })
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('put', () => {
        it('successfully makes PUT request', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await apiService.put('/endpoint', { data: 'value' });

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.example.com/endpoint',
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ data: 'value' })
                })
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('delete', () => {
        it('successfully makes DELETE request', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await apiService.delete('/endpoint');

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.example.com/endpoint',
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('upload', () => {
        it('successfully uploads file', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
            const result = await apiService.upload('/upload', file);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.example.com/upload',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData)
                })
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('download', () => {
        it('successfully downloads file', async () => {
            const mockBlob = new Blob([''], { type: 'application/pdf' });
            global.fetch.mockResolvedValueOnce({
                ok: true,
                blob: () => Promise.resolve(mockBlob)
            });

            const result = await apiService.download('/download');

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.example.com/download',
                expect.objectContaining({
                    method: 'GET'
                })
            );
            expect(result).toEqual(mockBlob);
        });
    });

    describe('handleError', () => {
        it('shows alert for network error', () => {
            apiService.handleError(mockError);
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'Network error',
                expect.any(Array)
            );
        });

        it('shows alert for api error', () => {
            const apiError = new Error('API error');
            apiError.response = { status: 400, data: { message: 'Bad Request' } };
            apiService.handleError(apiError);
            expect(Alert.alert).toHaveBeenCalledWith(
                'Error',
                'Bad Request',
                expect.any(Array)
            );
        });
    });
}); 