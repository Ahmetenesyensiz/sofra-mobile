import profileService from '../services/profileService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('ProfileService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getUserProfile', () => {
        const mockUserId = 1;
        const mockProfile = {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            avatar: 'avatar.jpg',
            preferences: {
                language: 'en',
                notifications: true,
                theme: 'light'
            },
            addresses: [
                {
                    id: 1,
                    type: 'home',
                    address: '123 Main St',
                    city: 'New York',
                    country: 'USA',
                    isDefault: true
                }
            ],
            paymentMethods: [
                {
                    id: 1,
                    type: 'credit_card',
                    last4: '1234',
                    isDefault: true
                }
            ]
        };

        it('successfully fetches user profile', async () => {
            api.get.mockResolvedValueOnce({ data: mockProfile });

            const result = await profileService.getUserProfile(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/profile`);
            expect(cacheService.set).toHaveBeenCalledWith(
                `user_${mockUserId}_profile`,
                mockProfile
            );
            expect(result).toEqual(mockProfile);
        });

        it('returns cached profile if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockProfile);

            const result = await profileService.getUserProfile(mockUserId);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockProfile);
        });

        it('handles error when fetching profile', async () => {
            const error = new Error('Failed to fetch profile');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(profileService.getUserProfile(mockUserId))
                .rejects.toThrow('Failed to fetch profile');
        });
    });

    describe('updateUserProfile', () => {
        const mockUserId = 1;
        const mockUpdateData = {
            name: 'John Updated',
            phone: '+1987654321',
            preferences: {
                language: 'tr',
                notifications: false
            }
        };
        const mockUpdatedProfile = {
            id: 1,
            name: 'John Updated',
            email: 'john@example.com',
            phone: '+1987654321',
            avatar: 'avatar.jpg',
            preferences: {
                language: 'tr',
                notifications: false,
                theme: 'light'
            }
        };

        it('successfully updates user profile', async () => {
            api.put.mockResolvedValueOnce({ data: mockUpdatedProfile });

            const result = await profileService.updateUserProfile(mockUserId, mockUpdateData);

            expect(api.put).toHaveBeenCalledWith(
                `/users/${mockUserId}/profile`,
                mockUpdateData
            );
            expect(cacheService.set).toHaveBeenCalledWith(
                `user_${mockUserId}_profile`,
                mockUpdatedProfile
            );
            expect(result).toEqual(mockUpdatedProfile);
        });

        it('handles error when updating profile', async () => {
            const error = new Error('Failed to update profile');
            api.put.mockRejectedValueOnce(error);

            await expect(profileService.updateUserProfile(mockUserId, mockUpdateData))
                .rejects.toThrow('Failed to update profile');
        });
    });

    describe('updateUserAvatar', () => {
        const mockUserId = 1;
        const mockImageUri = 'file://path/to/image.jpg';
        const mockFormData = new FormData();
        mockFormData.append('avatar', {
            uri: mockImageUri,
            type: 'image/jpeg',
            name: 'avatar.jpg'
        });

        it('successfully updates user avatar', async () => {
            const mockResponse = {
                data: {
                    avatarUrl: 'https://example.com/avatars/new-avatar.jpg'
                }
            };
            api.post.mockResolvedValueOnce(mockResponse);

            const result = await profileService.updateUserAvatar(mockUserId, mockImageUri);

            expect(api.post).toHaveBeenCalledWith(
                `/users/${mockUserId}/avatar`,
                expect.any(FormData),
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('handles error when updating avatar', async () => {
            const error = new Error('Failed to update avatar');
            api.post.mockRejectedValueOnce(error);

            await expect(profileService.updateUserAvatar(mockUserId, mockImageUri))
                .rejects.toThrow('Failed to update avatar');
        });
    });

    describe('updateUserPreferences', () => {
        const mockUserId = 1;
        const mockPreferences = {
            language: 'tr',
            notifications: false,
            theme: 'dark'
        };

        it('successfully updates user preferences', async () => {
            const mockResponse = {
                data: {
                    preferences: mockPreferences
                }
            };
            api.put.mockResolvedValueOnce(mockResponse);

            const result = await profileService.updateUserPreferences(mockUserId, mockPreferences);

            expect(api.put).toHaveBeenCalledWith(
                `/users/${mockUserId}/preferences`,
                mockPreferences
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('handles error when updating preferences', async () => {
            const error = new Error('Failed to update preferences');
            api.put.mockRejectedValueOnce(error);

            await expect(profileService.updateUserPreferences(mockUserId, mockPreferences))
                .rejects.toThrow('Failed to update preferences');
        });
    });

    describe('deleteUserAccount', () => {
        const mockUserId = 1;
        const mockPassword = 'currentPassword123';

        it('successfully deletes user account', async () => {
            api.delete.mockResolvedValueOnce({ data: { success: true } });

            const result = await profileService.deleteUserAccount(mockUserId, mockPassword);

            expect(api.delete).toHaveBeenCalledWith(
                `/users/${mockUserId}`,
                { data: { password: mockPassword } }
            );
            expect(result).toEqual({ success: true });
        });

        it('handles error when deleting account', async () => {
            const error = new Error('Failed to delete account');
            api.delete.mockRejectedValueOnce(error);

            await expect(profileService.deleteUserAccount(mockUserId, mockPassword))
                .rejects.toThrow('Failed to delete account');
        });
    });

    describe('getUserActivity', () => {
        const mockUserId = 1;
        const mockActivity = [
            {
                id: 1,
                type: 'order',
                description: 'Order #123 placed',
                createdAt: '2024-03-20T10:00:00Z'
            },
            {
                id: 2,
                type: 'review',
                description: 'Review added for Restaurant A',
                createdAt: '2024-03-19T15:30:00Z'
            }
        ];

        it('successfully fetches user activity', async () => {
            api.get.mockResolvedValueOnce({ data: mockActivity });

            const result = await profileService.getUserActivity(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/activity`);
            expect(result).toEqual(mockActivity);
        });

        it('handles error when fetching activity', async () => {
            const error = new Error('Failed to fetch activity');
            api.get.mockRejectedValueOnce(error);

            await expect(profileService.getUserActivity(mockUserId))
                .rejects.toThrow('Failed to fetch activity');
        });
    });

    describe('getUserStats', () => {
        const mockUserId = 1;
        const mockStats = {
            totalOrders: 25,
            totalReviews: 15,
            averageRating: 4.5,
            favoriteCuisine: 'Italian',
            totalSpent: 1250.75
        };

        it('successfully fetches user stats', async () => {
            api.get.mockResolvedValueOnce({ data: mockStats });

            const result = await profileService.getUserStats(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/stats`);
            expect(result).toEqual(mockStats);
        });

        it('handles error when fetching stats', async () => {
            const error = new Error('Failed to fetch stats');
            api.get.mockRejectedValueOnce(error);

            await expect(profileService.getUserStats(mockUserId))
                .rejects.toThrow('Failed to fetch stats');
        });
    });
}); 