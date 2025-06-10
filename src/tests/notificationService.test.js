import notificationService from '../services/notificationService';
import api from '../services/api';
import cacheService from '../services/cacheService';
import * as Notifications from 'expo-notifications';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');
jest.mock('expo-notifications');

describe('NotificationService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('registerForPushNotifications', () => {
        const mockToken = 'expo-push-token-123';

        it('successfully registers for push notifications', async () => {
            Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
            Notifications.getExpoPushTokenAsync.mockResolvedValueOnce({ data: mockToken });
            api.post.mockResolvedValueOnce({ data: { success: true } });

            const result = await notificationService.registerForPushNotifications();

            expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
            expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
            expect(api.post).toHaveBeenCalledWith('/notifications/register', { token: mockToken });
            expect(result).toBe(true);
        });

        it('requests permissions if not granted', async () => {
            Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'undetermined' });
            Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
            Notifications.getExpoPushTokenAsync.mockResolvedValueOnce({ data: mockToken });
            api.post.mockResolvedValueOnce({ data: { success: true } });

            const result = await notificationService.registerForPushNotifications();

            expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('handles permission denied', async () => {
            Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

            const result = await notificationService.registerForPushNotifications();

            expect(result).toBe(false);
        });

        it('handles error during registration', async () => {
            Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
            Notifications.getExpoPushTokenAsync.mockRejectedValueOnce(new Error('Failed to get token'));

            await expect(notificationService.registerForPushNotifications()).rejects.toThrow('Failed to get token');
        });
    });

    describe('getNotifications', () => {
        const mockUserId = 1;
        const mockNotifications = [
            {
                id: 1,
                type: 'order_status',
                title: 'Sipariş Durumu Güncellendi',
                message: 'Siparişiniz hazırlanıyor',
                data: {
                    orderId: 1,
                    status: 'preparing'
                },
                isRead: false,
                createdAt: '2024-03-20T10:00:00Z'
            },
            {
                id: 2,
                type: 'promo',
                title: 'Yeni Promosyon',
                message: 'Tüm siparişlerde %20 indirim',
                data: {
                    promoCode: 'SUMMER2024',
                    validUntil: '2024-04-20T23:59:59Z'
                },
                isRead: true,
                createdAt: '2024-03-19T15:30:00Z'
            }
        ];

        it('successfully fetches notifications', async () => {
            api.get.mockResolvedValueOnce({ data: mockNotifications });

            const result = await notificationService.getNotifications(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/notifications`);
            expect(cacheService.set).toHaveBeenCalledWith(
                `user_${mockUserId}_notifications`,
                mockNotifications
            );
            expect(result).toEqual(mockNotifications);
        });

        it('returns cached notifications if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockNotifications);

            const result = await notificationService.getNotifications(mockUserId);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockNotifications);
        });

        it('handles error when fetching notifications', async () => {
            const error = new Error('Failed to fetch notifications');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(notificationService.getNotifications(mockUserId))
                .rejects.toThrow('Failed to fetch notifications');
        });
    });

    describe('markAsRead', () => {
        const mockUserId = 1;
        const mockNotificationId = 1;
        const mockResponse = {
            id: 1,
            type: 'order_status',
            title: 'Sipariş Durumu Güncellendi',
            message: 'Siparişiniz hazırlanıyor',
            data: {
                orderId: 1,
                status: 'preparing'
            },
            isRead: true,
            createdAt: '2024-03-20T10:00:00Z'
        };

        it('successfully marks notification as read', async () => {
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await notificationService.markAsRead(mockUserId, mockNotificationId);

            expect(api.put).toHaveBeenCalledWith(
                `/users/${mockUserId}/notifications/${mockNotificationId}/read`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_notifications`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when marking notification as read', async () => {
            const error = new Error('Failed to mark notification as read');
            api.put.mockRejectedValueOnce(error);

            await expect(notificationService.markAsRead(mockUserId, mockNotificationId))
                .rejects.toThrow('Failed to mark notification as read');
        });
    });

    describe('markAllAsRead', () => {
        const mockUserId = 1;
        const mockResponse = {
            message: 'All notifications marked as read'
        };

        it('successfully marks all notifications as read', async () => {
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await notificationService.markAllAsRead(mockUserId);

            expect(api.put).toHaveBeenCalledWith(`/users/${mockUserId}/notifications/read-all`);
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_notifications`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when marking all notifications as read', async () => {
            const error = new Error('Failed to mark all notifications as read');
            api.put.mockRejectedValueOnce(error);

            await expect(notificationService.markAllAsRead(mockUserId))
                .rejects.toThrow('Failed to mark all notifications as read');
        });
    });

    describe('deleteNotification', () => {
        const mockUserId = 1;
        const mockNotificationId = 1;
        const mockResponse = {
            message: 'Notification deleted successfully'
        };

        it('successfully deletes notification', async () => {
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await notificationService.deleteNotification(mockUserId, mockNotificationId);

            expect(api.delete).toHaveBeenCalledWith(
                `/users/${mockUserId}/notifications/${mockNotificationId}`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_notifications`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when deleting notification', async () => {
            const error = new Error('Failed to delete notification');
            api.delete.mockRejectedValueOnce(error);

            await expect(notificationService.deleteNotification(mockUserId, mockNotificationId))
                .rejects.toThrow('Failed to delete notification');
        });
    });

    describe('deleteAllNotifications', () => {
        const mockUserId = 1;
        const mockResponse = {
            message: 'All notifications deleted successfully'
        };

        it('successfully deletes all notifications', async () => {
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await notificationService.deleteAllNotifications(mockUserId);

            expect(api.delete).toHaveBeenCalledWith(`/users/${mockUserId}/notifications`);
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_notifications`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when deleting all notifications', async () => {
            const error = new Error('Failed to delete all notifications');
            api.delete.mockRejectedValueOnce(error);

            await expect(notificationService.deleteAllNotifications(mockUserId))
                .rejects.toThrow('Failed to delete all notifications');
        });
    });

    describe('getUnreadCount', () => {
        const mockUserId = 1;
        const mockResponse = {
            count: 5
        };

        it('successfully gets unread notification count', async () => {
            api.get.mockResolvedValueOnce({ data: mockResponse });

            const result = await notificationService.getUnreadCount(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/notifications/unread-count`);
            expect(result).toEqual(mockResponse.count);
        });

        it('handles error when getting unread count', async () => {
            const error = new Error('Failed to get unread count');
            api.get.mockRejectedValueOnce(error);

            await expect(notificationService.getUnreadCount(mockUserId))
                .rejects.toThrow('Failed to get unread count');
        });
    });

    describe('updateNotificationPreferences', () => {
        const mockUserId = 1;
        const mockPreferences = {
            orderUpdates: true,
            promotions: false,
            news: true,
            sound: true,
            vibration: true
        };
        const mockResponse = {
            ...mockPreferences,
            updatedAt: '2024-03-20T10:00:00Z'
        };

        it('successfully updates notification preferences', async () => {
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await notificationService.updateNotificationPreferences(
                mockUserId,
                mockPreferences
            );

            expect(api.put).toHaveBeenCalledWith(
                `/users/${mockUserId}/notification-preferences`,
                mockPreferences
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles error when updating notification preferences', async () => {
            const error = new Error('Failed to update notification preferences');
            api.put.mockRejectedValueOnce(error);

            await expect(notificationService.updateNotificationPreferences(
                mockUserId,
                mockPreferences
            )).rejects.toThrow('Failed to update notification preferences');
        });
    });

    describe('getNotificationPreferences', () => {
        const mockUserId = 1;
        const mockPreferences = {
            orderUpdates: true,
            promotions: false,
            news: true,
            sound: true,
            vibration: true,
            updatedAt: '2024-03-20T10:00:00Z'
        };

        it('successfully gets notification preferences', async () => {
            api.get.mockResolvedValueOnce({ data: mockPreferences });

            const result = await notificationService.getNotificationPreferences(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/notification-preferences`);
            expect(result).toEqual(mockPreferences);
        });

        it('handles error when getting notification preferences', async () => {
            const error = new Error('Failed to get notification preferences');
            api.get.mockRejectedValueOnce(error);

            await expect(notificationService.getNotificationPreferences(mockUserId))
                .rejects.toThrow('Failed to get notification preferences');
        });
    });
}); 