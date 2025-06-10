import analyticsService from '../services/analyticsService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('AnalyticsService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('trackEvent', () => {
        const mockEvent = {
            name: 'view_restaurant',
            properties: {
                restaurantId: 1,
                restaurantName: 'Pizza Palace',
                category: 'italian',
                source: 'search'
            }
        };

        it('successfully tracks event', async () => {
            api.post.mockResolvedValueOnce({ data: { success: true } });

            const result = await analyticsService.trackEvent(mockEvent);

            expect(api.post).toHaveBeenCalledWith('/analytics/events', mockEvent);
            expect(result).toEqual({ success: true });
        });

        it('handles error when tracking event', async () => {
            const error = new Error('Failed to track event');
            api.post.mockRejectedValueOnce(error);

            await expect(analyticsService.trackEvent(mockEvent))
                .rejects.toThrow('Failed to track event');
        });
    });

    describe('trackScreenView', () => {
        const mockScreen = {
            name: 'RestaurantDetails',
            properties: {
                restaurantId: 1,
                restaurantName: 'Pizza Palace',
                previousScreen: 'RestaurantList'
            }
        };

        it('successfully tracks screen view', async () => {
            api.post.mockResolvedValueOnce({ data: { success: true } });

            const result = await analyticsService.trackScreenView(mockScreen);

            expect(api.post).toHaveBeenCalledWith('/analytics/screen-views', mockScreen);
            expect(result).toEqual({ success: true });
        });

        it('handles error when tracking screen view', async () => {
            const error = new Error('Failed to track screen view');
            api.post.mockRejectedValueOnce(error);

            await expect(analyticsService.trackScreenView(mockScreen))
                .rejects.toThrow('Failed to track screen view');
        });
    });

    describe('trackUserAction', () => {
        const mockAction = {
            type: 'add_to_cart',
            properties: {
                itemId: 1,
                itemName: 'Margherita Pizza',
                quantity: 2,
                price: 15.99,
                restaurantId: 1
            }
        };

        it('successfully tracks user action', async () => {
            api.post.mockResolvedValueOnce({ data: { success: true } });

            const result = await analyticsService.trackUserAction(mockAction);

            expect(api.post).toHaveBeenCalledWith('/analytics/user-actions', mockAction);
            expect(result).toEqual({ success: true });
        });

        it('handles error when tracking user action', async () => {
            const error = new Error('Failed to track user action');
            api.post.mockRejectedValueOnce(error);

            await expect(analyticsService.trackUserAction(mockAction))
                .rejects.toThrow('Failed to track user action');
        });
    });

    describe('getUserAnalytics', () => {
        const mockUserId = 1;
        const mockTimeRange = {
            start: '2024-03-01T00:00:00Z',
            end: '2024-03-20T23:59:59Z'
        };
        const mockAnalytics = {
            totalOrders: 15,
            totalSpent: 450.75,
            averageOrderValue: 30.05,
            favoriteCuisines: [
                { name: 'italian', count: 8 },
                { name: 'american', count: 5 },
                { name: 'turkish', count: 2 }
            ],
            orderFrequency: {
                daily: 0.75,
                weekly: 5.25,
                monthly: 22.5
            },
            peakOrderTimes: [
                { hour: 12, count: 5 },
                { hour: 18, count: 7 },
                { hour: 20, count: 3 }
            ]
        };

        it('successfully gets user analytics', async () => {
            api.get.mockResolvedValueOnce({ data: mockAnalytics });

            const result = await analyticsService.getUserAnalytics(mockUserId, mockTimeRange);

            expect(api.get).toHaveBeenCalledWith(`/analytics/users/${mockUserId}`, {
                params: mockTimeRange
            });
            expect(result).toEqual(mockAnalytics);
        });

        it('handles error when getting user analytics', async () => {
            const error = new Error('Failed to get user analytics');
            api.get.mockRejectedValueOnce(error);

            await expect(analyticsService.getUserAnalytics(mockUserId, mockTimeRange))
                .rejects.toThrow('Failed to get user analytics');
        });
    });

    describe('getRestaurantAnalytics', () => {
        const mockRestaurantId = 1;
        const mockTimeRange = {
            start: '2024-03-01T00:00:00Z',
            end: '2024-03-20T23:59:59Z'
        };
        const mockAnalytics = {
            totalOrders: 150,
            totalRevenue: 4500.75,
            averageOrderValue: 30.01,
            popularItems: [
                { id: 1, name: 'Margherita Pizza', quantity: 75 },
                { id: 2, name: 'Pepperoni Pizza', quantity: 45 },
                { id: 3, name: 'Caesar Salad', quantity: 30 }
            ],
            customerDemographics: {
                ageGroups: [
                    { range: '18-24', percentage: 35 },
                    { range: '25-34', percentage: 45 },
                    { range: '35-44', percentage: 20 }
                ],
                gender: [
                    { type: 'male', percentage: 55 },
                    { type: 'female', percentage: 45 }
                ]
            },
            peakHours: [
                { hour: 12, orders: 25 },
                { hour: 18, orders: 35 },
                { hour: 20, orders: 20 }
            ]
        };

        it('successfully gets restaurant analytics', async () => {
            api.get.mockResolvedValueOnce({ data: mockAnalytics });

            const result = await analyticsService.getRestaurantAnalytics(
                mockRestaurantId,
                mockTimeRange
            );

            expect(api.get).toHaveBeenCalledWith(
                `/analytics/restaurants/${mockRestaurantId}`,
                { params: mockTimeRange }
            );
            expect(result).toEqual(mockAnalytics);
        });

        it('handles error when getting restaurant analytics', async () => {
            const error = new Error('Failed to get restaurant analytics');
            api.get.mockRejectedValueOnce(error);

            await expect(analyticsService.getRestaurantAnalytics(
                mockRestaurantId,
                mockTimeRange
            )).rejects.toThrow('Failed to get restaurant analytics');
        });
    });

    describe('getAppAnalytics', () => {
        const mockTimeRange = {
            start: '2024-03-01T00:00:00Z',
            end: '2024-03-20T23:59:59Z'
        };
        const mockAnalytics = {
            totalUsers: 10000,
            activeUsers: {
                daily: 2500,
                weekly: 5000,
                monthly: 8000
            },
            totalOrders: 25000,
            totalRevenue: 750000.50,
            averageOrderValue: 30.00,
            popularCategories: [
                { name: 'pizza', orders: 8000 },
                { name: 'burger', orders: 6000 },
                { name: 'sushi', orders: 4000 }
            ],
            userRetention: {
                day1: 0.85,
                day7: 0.65,
                day30: 0.45
            },
            appPerformance: {
                averageLoadTime: 1.5,
                crashRate: 0.02,
                errorRate: 0.05
            }
        };

        it('successfully gets app analytics', async () => {
            api.get.mockResolvedValueOnce({ data: mockAnalytics });

            const result = await analyticsService.getAppAnalytics(mockTimeRange);

            expect(api.get).toHaveBeenCalledWith('/analytics/app', {
                params: mockTimeRange
            });
            expect(result).toEqual(mockAnalytics);
        });

        it('handles error when getting app analytics', async () => {
            const error = new Error('Failed to get app analytics');
            api.get.mockRejectedValueOnce(error);

            await expect(analyticsService.getAppAnalytics(mockTimeRange))
                .rejects.toThrow('Failed to get app analytics');
        });
    });

    describe('exportAnalytics', () => {
        const mockTimeRange = {
            start: '2024-03-01T00:00:00Z',
            end: '2024-03-20T23:59:59Z'
        };
        const mockExportData = {
            url: 'https://example.com/analytics-export.csv',
            expiresAt: '2024-03-21T23:59:59Z'
        };

        it('successfully exports analytics', async () => {
            api.post.mockResolvedValueOnce({ data: mockExportData });

            const result = await analyticsService.exportAnalytics(mockTimeRange);

            expect(api.post).toHaveBeenCalledWith('/analytics/export', mockTimeRange);
            expect(result).toEqual(mockExportData);
        });

        it('handles error when exporting analytics', async () => {
            const error = new Error('Failed to export analytics');
            api.post.mockRejectedValueOnce(error);

            await expect(analyticsService.exportAnalytics(mockTimeRange))
                .rejects.toThrow('Failed to export analytics');
        });
    });
}); 