import authService from '../services/authService';
import api from '../services/api';
import cacheService from '../services/cacheService';
import * as SecureStore from 'expo-secure-store';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');
jest.mock('expo-secure-store');

describe('AuthService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('login', () => {
        const mockCredentials = {
            email: 'test@example.com',
            password: 'password123'
        };
        const mockResponse = {
            data: {
                token: 'mock-jwt-token',
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com'
                }
            }
        };

        it('successfully logs in user', async () => {
            api.post.mockResolvedValueOnce(mockResponse);
            SecureStore.setItemAsync.mockResolvedValueOnce();

            const result = await authService.login(mockCredentials);

            expect(api.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                'auth_token',
                mockResponse.data.token
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('handles error when logging in', async () => {
            const error = new Error('Invalid credentials');
            api.post.mockRejectedValueOnce(error);

            await expect(authService.login(mockCredentials))
                .rejects.toThrow('Invalid credentials');
        });
    });

    describe('register', () => {
        const mockUserData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            phone: '+1234567890'
        };
        const mockResponse = {
            data: {
                token: 'mock-jwt-token',
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com'
                }
            }
        };

        it('successfully registers user', async () => {
            api.post.mockResolvedValueOnce(mockResponse);
            SecureStore.setItemAsync.mockResolvedValueOnce();

            const result = await authService.register(mockUserData);

            expect(api.post).toHaveBeenCalledWith('/auth/register', mockUserData);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                'auth_token',
                mockResponse.data.token
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('handles error when registering', async () => {
            const error = new Error('Email already exists');
            api.post.mockRejectedValueOnce(error);

            await expect(authService.register(mockUserData))
                .rejects.toThrow('Email already exists');
        });
    });

    describe('logout', () => {
        it('successfully logs out user', async () => {
            SecureStore.deleteItemAsync.mockResolvedValueOnce();
            cacheService.clearAll.mockResolvedValueOnce();

            await authService.logout();

            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
            expect(cacheService.clearAll).toHaveBeenCalled();
        });

        it('handles error when logging out', async () => {
            const error = new Error('Failed to logout');
            SecureStore.deleteItemAsync.mockRejectedValueOnce(error);

            await expect(authService.logout())
                .rejects.toThrow('Failed to logout');
        });
    });

    describe('forgotPassword', () => {
        const mockEmail = 'test@example.com';

        it('successfully sends password reset email', async () => {
            const mockResponse = {
                data: {
                    message: 'Password reset email sent'
                }
            };
            api.post.mockResolvedValueOnce(mockResponse);

            const result = await authService.forgotPassword(mockEmail);

            expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: mockEmail });
            expect(result).toEqual(mockResponse.data);
        });

        it('handles error when sending reset email', async () => {
            const error = new Error('Email not found');
            api.post.mockRejectedValueOnce(error);

            await expect(authService.forgotPassword(mockEmail))
                .rejects.toThrow('Email not found');
        });
    });

    describe('resetPassword', () => {
        const mockResetData = {
            token: 'reset-token',
            password: 'newPassword123'
        };

        it('successfully resets password', async () => {
            const mockResponse = {
                data: {
                    message: 'Password reset successful'
                }
            };
            api.post.mockResolvedValueOnce(mockResponse);

            const result = await authService.resetPassword(mockResetData);

            expect(api.post).toHaveBeenCalledWith('/auth/reset-password', mockResetData);
            expect(result).toEqual(mockResponse.data);
        });

        it('handles error when resetting password', async () => {
            const error = new Error('Invalid reset token');
            api.post.mockRejectedValueOnce(error);

            await expect(authService.resetPassword(mockResetData))
                .rejects.toThrow('Invalid reset token');
        });
    });

    describe('verifyEmail', () => {
        const mockToken = 'verification-token';

        it('successfully verifies email', async () => {
            const mockResponse = {
                data: {
                    message: 'Email verified successfully'
                }
            };
            api.post.mockResolvedValueOnce(mockResponse);

            const result = await authService.verifyEmail(mockToken);

            expect(api.post).toHaveBeenCalledWith('/auth/verify-email', { token: mockToken });
            expect(result).toEqual(mockResponse.data);
        });

        it('handles error when verifying email', async () => {
            const error = new Error('Invalid verification token');
            api.post.mockRejectedValueOnce(error);

            await expect(authService.verifyEmail(mockToken))
                .rejects.toThrow('Invalid verification token');
        });
    });

    describe('refreshToken', () => {
        const mockRefreshToken = 'refresh-token';
        const mockResponse = {
            data: {
                token: 'new-jwt-token',
                refreshToken: 'new-refresh-token'
            }
        };

        it('successfully refreshes token', async () => {
            api.post.mockResolvedValueOnce(mockResponse);
            SecureStore.setItemAsync.mockResolvedValueOnce();

            const result = await authService.refreshToken(mockRefreshToken);

            expect(api.post).toHaveBeenCalledWith('/auth/refresh-token', {
                refreshToken: mockRefreshToken
            });
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                'auth_token',
                mockResponse.data.token
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('handles error when refreshing token', async () => {
            const error = new Error('Invalid refresh token');
            api.post.mockRejectedValueOnce(error);

            await expect(authService.refreshToken(mockRefreshToken))
                .rejects.toThrow('Invalid refresh token');
        });
    });

    describe('getCurrentUser', () => {
        const mockToken = 'mock-jwt-token';
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com'
        };

        it('successfully gets current user', async () => {
            SecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
            api.get.mockResolvedValueOnce({ data: mockUser });

            const result = await authService.getCurrentUser();

            expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
            expect(api.get).toHaveBeenCalledWith('/auth/me');
            expect(result).toEqual(mockUser);
        });

        it('returns null when no token exists', async () => {
            SecureStore.getItemAsync.mockResolvedValueOnce(null);

            const result = await authService.getCurrentUser();

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('handles error when getting current user', async () => {
            SecureStore.getItemAsync.mockResolvedValueOnce(mockToken);
            const error = new Error('Failed to get user');
            api.get.mockRejectedValueOnce(error);

            await expect(authService.getCurrentUser())
                .rejects.toThrow('Failed to get user');
        });
    });

    describe('isAuthenticated', () => {
        it('returns true when token exists', async () => {
            SecureStore.getItemAsync.mockResolvedValueOnce('mock-jwt-token');

            const result = await authService.isAuthenticated();

            expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
            expect(result).toBe(true);
        });

        it('returns false when no token exists', async () => {
            SecureStore.getItemAsync.mockResolvedValueOnce(null);

            const result = await authService.isAuthenticated();

            expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
            expect(result).toBe(false);
        });
    });
}); 