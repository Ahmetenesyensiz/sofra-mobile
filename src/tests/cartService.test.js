import cartService from '../services/cartService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('CartService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getCart', () => {
        const mockUserId = 1;
        const mockCart = {
            id: 1,
            restaurantId: 1,
            restaurantName: 'Pizza Palace',
            items: [
                {
                    id: 1,
                    menuItemId: 1,
                    name: 'Margherita',
                    quantity: 2,
                    price: 15.99,
                    totalPrice: 31.98,
                    specialInstructions: 'No onions',
                    customizationOptions: [
                        {
                            id: 1,
                            name: 'Size',
                            selectedOption: {
                                id: 2,
                                name: 'Medium',
                                price: 2
                            }
                        },
                        {
                            id: 2,
                            name: 'Extra Toppings',
                            selectedOptions: [
                                {
                                    id: 1,
                                    name: 'Extra Cheese',
                                    price: 1.5
                                }
                            ]
                        }
                    ]
                }
            ],
            subtotal: 35.48,
            deliveryFee: 10,
            tax: 3.55,
            total: 49.03,
            createdAt: '2024-03-20T10:00:00Z',
            updatedAt: '2024-03-20T10:15:00Z'
        };

        it('successfully fetches cart', async () => {
            api.get.mockResolvedValueOnce({ data: mockCart });

            const result = await cartService.getCart(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/cart`);
            expect(cacheService.set).toHaveBeenCalledWith(
                `user_${mockUserId}_cart`,
                mockCart
            );
            expect(result).toEqual(mockCart);
        });

        it('returns cached cart if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockCart);

            const result = await cartService.getCart(mockUserId);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockCart);
        });

        it('handles error when fetching cart', async () => {
            const error = new Error('Failed to fetch cart');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(cartService.getCart(mockUserId))
                .rejects.toThrow('Failed to fetch cart');
        });
    });

    describe('addToCart', () => {
        const mockUserId = 1;
        const mockItemData = {
            menuItemId: 1,
            quantity: 2,
            specialInstructions: 'No onions',
            customizationOptions: [
                {
                    id: 1,
                    name: 'Size',
                    selectedOption: {
                        id: 2,
                        name: 'Medium',
                        price: 2
                    }
                },
                {
                    id: 2,
                    name: 'Extra Toppings',
                    selectedOptions: [
                        {
                            id: 1,
                            name: 'Extra Cheese',
                            price: 1.5
                        }
                    ]
                }
            ]
        };
        const mockResponse = {
            id: 1,
            restaurantId: 1,
            restaurantName: 'Pizza Palace',
            items: [
                {
                    id: 1,
                    menuItemId: 1,
                    name: 'Margherita',
                    quantity: 2,
                    price: 15.99,
                    totalPrice: 31.98,
                    specialInstructions: 'No onions',
                    customizationOptions: mockItemData.customizationOptions
                }
            ],
            subtotal: 35.48,
            deliveryFee: 10,
            tax: 3.55,
            total: 49.03
        };

        it('successfully adds item to cart', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await cartService.addToCart(mockUserId, mockItemData);

            expect(api.post).toHaveBeenCalledWith(
                `/users/${mockUserId}/cart/items`,
                mockItemData
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_cart`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when adding item to cart', async () => {
            const error = new Error('Failed to add item to cart');
            api.post.mockRejectedValueOnce(error);

            await expect(cartService.addToCart(mockUserId, mockItemData))
                .rejects.toThrow('Failed to add item to cart');
        });
    });

    describe('updateCartItem', () => {
        const mockUserId = 1;
        const mockItemId = 1;
        const mockUpdateData = {
            quantity: 3,
            specialInstructions: 'Extra cheese please'
        };
        const mockResponse = {
            id: 1,
            restaurantId: 1,
            restaurantName: 'Pizza Palace',
            items: [
                {
                    id: 1,
                    menuItemId: 1,
                    name: 'Margherita',
                    quantity: 3,
                    price: 15.99,
                    totalPrice: 47.97,
                    specialInstructions: 'Extra cheese please',
                    customizationOptions: [
                        {
                            id: 1,
                            name: 'Size',
                            selectedOption: {
                                id: 2,
                                name: 'Medium',
                                price: 2
                            }
                        }
                    ]
                }
            ],
            subtotal: 51.47,
            deliveryFee: 10,
            tax: 4.12,
            total: 65.59
        };

        it('successfully updates cart item', async () => {
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await cartService.updateCartItem(
                mockUserId,
                mockItemId,
                mockUpdateData
            );

            expect(api.put).toHaveBeenCalledWith(
                `/users/${mockUserId}/cart/items/${mockItemId}`,
                mockUpdateData
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_cart`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when updating cart item', async () => {
            const error = new Error('Failed to update cart item');
            api.put.mockRejectedValueOnce(error);

            await expect(cartService.updateCartItem(
                mockUserId,
                mockItemId,
                mockUpdateData
            )).rejects.toThrow('Failed to update cart item');
        });
    });

    describe('removeFromCart', () => {
        const mockUserId = 1;
        const mockItemId = 1;
        const mockResponse = {
            id: 1,
            restaurantId: 1,
            restaurantName: 'Pizza Palace',
            items: [],
            subtotal: 0,
            deliveryFee: 0,
            tax: 0,
            total: 0
        };

        it('successfully removes item from cart', async () => {
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await cartService.removeFromCart(mockUserId, mockItemId);

            expect(api.delete).toHaveBeenCalledWith(
                `/users/${mockUserId}/cart/items/${mockItemId}`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_cart`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when removing item from cart', async () => {
            const error = new Error('Failed to remove item from cart');
            api.delete.mockRejectedValueOnce(error);

            await expect(cartService.removeFromCart(mockUserId, mockItemId))
                .rejects.toThrow('Failed to remove item from cart');
        });
    });

    describe('clearCart', () => {
        const mockUserId = 1;
        const mockResponse = {
            id: 1,
            restaurantId: 1,
            restaurantName: 'Pizza Palace',
            items: [],
            subtotal: 0,
            deliveryFee: 0,
            tax: 0,
            total: 0
        };

        it('successfully clears cart', async () => {
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await cartService.clearCart(mockUserId);

            expect(api.delete).toHaveBeenCalledWith(`/users/${mockUserId}/cart`);
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_cart`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when clearing cart', async () => {
            const error = new Error('Failed to clear cart');
            api.delete.mockRejectedValueOnce(error);

            await expect(cartService.clearCart(mockUserId))
                .rejects.toThrow('Failed to clear cart');
        });
    });

    describe('updateDeliveryAddress', () => {
        const mockUserId = 1;
        const mockAddressId = 1;
        const mockResponse = {
            id: 1,
            restaurantId: 1,
            restaurantName: 'Pizza Palace',
            items: [
                {
                    id: 1,
                    menuItemId: 1,
                    name: 'Margherita',
                    quantity: 2,
                    price: 15.99,
                    totalPrice: 31.98
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
            subtotal: 31.98,
            deliveryFee: 10,
            tax: 3.20,
            total: 45.18
        };

        it('successfully updates delivery address', async () => {
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await cartService.updateDeliveryAddress(mockUserId, mockAddressId);

            expect(api.put).toHaveBeenCalledWith(
                `/users/${mockUserId}/cart/delivery-address`,
                { addressId: mockAddressId }
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_cart`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when updating delivery address', async () => {
            const error = new Error('Failed to update delivery address');
            api.put.mockRejectedValueOnce(error);

            await expect(cartService.updateDeliveryAddress(mockUserId, mockAddressId))
                .rejects.toThrow('Failed to update delivery address');
        });
    });

    describe('applyPromoCode', () => {
        const mockUserId = 1;
        const mockPromoCode = 'SUMMER2024';
        const mockResponse = {
            id: 1,
            restaurantId: 1,
            restaurantName: 'Pizza Palace',
            items: [
                {
                    id: 1,
                    menuItemId: 1,
                    name: 'Margherita',
                    quantity: 2,
                    price: 15.99,
                    totalPrice: 31.98
                }
            ],
            subtotal: 31.98,
            deliveryFee: 10,
            tax: 3.20,
            discount: 5,
            promoCode: 'SUMMER2024',
            total: 40.18
        };

        it('successfully applies promo code', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await cartService.applyPromoCode(mockUserId, mockPromoCode);

            expect(api.post).toHaveBeenCalledWith(
                `/users/${mockUserId}/cart/promo-code`,
                { code: mockPromoCode }
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_cart`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when applying promo code', async () => {
            const error = new Error('Failed to apply promo code');
            api.post.mockRejectedValueOnce(error);

            await expect(cartService.applyPromoCode(mockUserId, mockPromoCode))
                .rejects.toThrow('Failed to apply promo code');
        });
    });

    describe('removePromoCode', () => {
        const mockUserId = 1;
        const mockResponse = {
            id: 1,
            restaurantId: 1,
            restaurantName: 'Pizza Palace',
            items: [
                {
                    id: 1,
                    menuItemId: 1,
                    name: 'Margherita',
                    quantity: 2,
                    price: 15.99,
                    totalPrice: 31.98
                }
            ],
            subtotal: 31.98,
            deliveryFee: 10,
            tax: 3.20,
            total: 45.18
        };

        it('successfully removes promo code', async () => {
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await cartService.removePromoCode(mockUserId);

            expect(api.delete).toHaveBeenCalledWith(`/users/${mockUserId}/cart/promo-code`);
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_cart`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when removing promo code', async () => {
            const error = new Error('Failed to remove promo code');
            api.delete.mockRejectedValueOnce(error);

            await expect(cartService.removePromoCode(mockUserId))
                .rejects.toThrow('Failed to remove promo code');
        });
    });
}); 