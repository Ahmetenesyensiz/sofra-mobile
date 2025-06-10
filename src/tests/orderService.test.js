import orderService from '../services/orderService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('OrderService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        const mockOrderData = {
            restaurantId: 1,
            items: [
                {
                    id: 1,
                    quantity: 2,
                    specialInstructions: 'No onions'
                },
                {
                    id: 2,
                    quantity: 1
                }
            ],
            deliveryAddress: {
                id: 1,
                type: 'home',
                address: '123 Main St',
                city: 'New York',
                country: 'USA',
                postalCode: '10001'
            },
            paymentMethod: {
                id: 1,
                type: 'credit_card',
                last4: '1234'
            }
        };
        const mockResponse = {
            id: 1,
            status: 'PENDING',
            totalAmount: 45.99,
            createdAt: '2024-03-20T10:00:00Z',
            ...mockOrderData
        };

        it('successfully creates order', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await orderService.createOrder(mockOrderData);

            expect(api.post).toHaveBeenCalledWith('/orders', mockOrderData);
            expect(cacheService.remove).toHaveBeenCalledWith('user_1_orders');
            expect(result).toEqual(mockResponse);
        });

        it('handles error when creating order', async () => {
            const error = new Error('Failed to create order');
            api.post.mockRejectedValueOnce(error);

            await expect(orderService.createOrder(mockOrderData))
                .rejects.toThrow('Failed to create order');
        });
    });

    describe('getOrders', () => {
        const mockUserId = 1;
        const mockParams = {
            page: 1,
            limit: 10,
            status: 'COMPLETED'
        };
        const mockOrders = {
            items: [
                {
                    id: 1,
                    restaurantId: 1,
                    status: 'COMPLETED',
                    totalAmount: 45.99,
                    createdAt: '2024-03-20T10:00:00Z',
                    items: [
                        {
                            id: 1,
                            name: 'Pizza',
                            quantity: 2,
                            price: 15.99
                        }
                    ]
                },
                {
                    id: 2,
                    restaurantId: 2,
                    status: 'COMPLETED',
                    totalAmount: 35.50,
                    createdAt: '2024-03-19T15:30:00Z',
                    items: [
                        {
                            id: 2,
                            name: 'Burger',
                            quantity: 1,
                            price: 35.50
                        }
                    ]
                }
            ],
            total: 2,
            page: 1,
            limit: 10
        };

        it('successfully fetches orders', async () => {
            api.get.mockResolvedValueOnce({ data: mockOrders });

            const result = await orderService.getOrders(mockUserId, mockParams);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/orders`, {
                params: mockParams
            });
            expect(cacheService.set).toHaveBeenCalledWith(
                `user_${mockUserId}_orders`,
                mockOrders
            );
            expect(result).toEqual(mockOrders);
        });

        it('returns cached orders if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockOrders);

            const result = await orderService.getOrders(mockUserId, mockParams);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockOrders);
        });

        it('handles error when fetching orders', async () => {
            const error = new Error('Failed to fetch orders');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(orderService.getOrders(mockUserId, mockParams))
                .rejects.toThrow('Failed to fetch orders');
        });
    });

    describe('getOrderById', () => {
        const mockUserId = 1;
        const mockOrderId = 1;
        const mockOrder = {
            id: 1,
            restaurantId: 1,
            status: 'COMPLETED',
            totalAmount: 45.99,
            createdAt: '2024-03-20T10:00:00Z',
            items: [
                {
                    id: 1,
                    name: 'Pizza',
                    quantity: 2,
                    price: 15.99,
                    specialInstructions: 'No onions'
                }
            ],
            deliveryAddress: {
                id: 1,
                type: 'home',
                address: '123 Main St',
                city: 'New York',
                country: 'USA',
                postalCode: '10001'
            },
            paymentMethod: {
                id: 1,
                type: 'credit_card',
                last4: '1234'
            }
        };

        it('successfully fetches order by id', async () => {
            api.get.mockResolvedValueOnce({ data: mockOrder });

            const result = await orderService.getOrderById(mockUserId, mockOrderId);

            expect(api.get).toHaveBeenCalledWith(
                `/users/${mockUserId}/orders/${mockOrderId}`
            );
            expect(cacheService.set).toHaveBeenCalledWith(
                `order_${mockOrderId}`,
                mockOrder
            );
            expect(result).toEqual(mockOrder);
        });

        it('returns cached order if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockOrder);

            const result = await orderService.getOrderById(mockUserId, mockOrderId);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockOrder);
        });

        it('handles error when fetching order', async () => {
            const error = new Error('Failed to fetch order');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(orderService.getOrderById(mockUserId, mockOrderId))
                .rejects.toThrow('Failed to fetch order');
        });
    });

    describe('cancelOrder', () => {
        const mockUserId = 1;
        const mockOrderId = 1;
        const mockResponse = {
            id: mockOrderId,
            status: 'CANCELLED',
            cancelledAt: '2024-03-20T10:30:00Z'
        };

        it('successfully cancels order', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await orderService.cancelOrder(mockUserId, mockOrderId);

            expect(api.post).toHaveBeenCalledWith(
                `/users/${mockUserId}/orders/${mockOrderId}/cancel`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`order_${mockOrderId}`);
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_orders`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when cancelling order', async () => {
            const error = new Error('Failed to cancel order');
            api.post.mockRejectedValueOnce(error);

            await expect(orderService.cancelOrder(mockUserId, mockOrderId))
                .rejects.toThrow('Failed to cancel order');
        });
    });

    describe('getActiveOrders', () => {
        const mockUserId = 1;
        const mockActiveOrders = {
            items: [
                {
                    id: 1,
                    restaurantId: 1,
                    status: 'PREPARING',
                    totalAmount: 45.99,
                    createdAt: '2024-03-20T10:00:00Z',
                    estimatedDeliveryTime: '2024-03-20T10:45:00Z'
                }
            ],
            total: 1
        };

        it('successfully fetches active orders', async () => {
            api.get.mockResolvedValueOnce({ data: mockActiveOrders });

            const result = await orderService.getActiveOrders(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/orders/active`);
            expect(result).toEqual(mockActiveOrders);
        });

        it('handles error when fetching active orders', async () => {
            const error = new Error('Failed to fetch active orders');
            api.get.mockRejectedValueOnce(error);

            await expect(orderService.getActiveOrders(mockUserId))
                .rejects.toThrow('Failed to fetch active orders');
        });
    });

    describe('getPastOrders', () => {
        const mockUserId = 1;
        const mockParams = {
            page: 1,
            limit: 10
        };
        const mockPastOrders = {
            items: [
                {
                    id: 1,
                    restaurantId: 1,
                    status: 'COMPLETED',
                    totalAmount: 45.99,
                    createdAt: '2024-03-19T10:00:00Z',
                    completedAt: '2024-03-19T10:45:00Z'
                }
            ],
            total: 1,
            page: 1,
            limit: 10
        };

        it('successfully fetches past orders', async () => {
            api.get.mockResolvedValueOnce({ data: mockPastOrders });

            const result = await orderService.getPastOrders(mockUserId, mockParams);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/orders/past`, {
                params: mockParams
            });
            expect(result).toEqual(mockPastOrders);
        });

        it('handles error when fetching past orders', async () => {
            const error = new Error('Failed to fetch past orders');
            api.get.mockRejectedValueOnce(error);

            await expect(orderService.getPastOrders(mockUserId, mockParams))
                .rejects.toThrow('Failed to fetch past orders');
        });
    });

    describe('reorder', () => {
        const mockUserId = 1;
        const mockOrderId = 1;
        const mockResponse = {
            id: 2,
            status: 'PENDING',
            totalAmount: 45.99,
            createdAt: '2024-03-20T11:00:00Z',
            items: [
                {
                    id: 1,
                    name: 'Pizza',
                    quantity: 2,
                    price: 15.99
                }
            ]
        };

        it('successfully reorders from past order', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await orderService.reorder(mockUserId, mockOrderId);

            expect(api.post).toHaveBeenCalledWith(
                `/users/${mockUserId}/orders/${mockOrderId}/reorder`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_orders`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when reordering', async () => {
            const error = new Error('Failed to reorder');
            api.post.mockRejectedValueOnce(error);

            await expect(orderService.reorder(mockUserId, mockOrderId))
                .rejects.toThrow('Failed to reorder');
        });
    });

    describe('splitBill', () => {
        const mockUserId = 1;
        const mockOrderId = 1;
        const mockSplitData = {
            users: [
                {
                    userId: 2,
                    items: [1, 2]
                },
                {
                    userId: 3,
                    items: [3]
                }
            ]
        };
        const mockResponse = {
            success: true,
            message: 'Bill split successfully',
            splits: [
                {
                    userId: 2,
                    amount: 35.50
                },
                {
                    userId: 3,
                    amount: 15.99
                }
            ]
        };

        it('successfully splits bill between users', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await orderService.splitBill(mockUserId, mockOrderId, mockSplitData);

            expect(api.post).toHaveBeenCalledWith(
                `/users/${mockUserId}/orders/${mockOrderId}/split`,
                mockSplitData
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles error when splitting bill', async () => {
            const error = new Error('Failed to split bill');
            api.post.mockRejectedValueOnce(error);

            await expect(orderService.splitBill(mockUserId, mockOrderId, mockSplitData))
                .rejects.toThrow('Failed to split bill');
        });
    });
}); 