import paymentService from '../services/paymentService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('PaymentService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getPaymentMethods', () => {
        const mockUserId = 1;
        const mockPaymentMethods = {
            items: [
                {
                    id: 1,
                    type: 'credit_card',
                    last4: '1234',
                    brand: 'visa',
                    expiryMonth: 12,
                    expiryYear: 2025,
                    isDefault: true
                },
                {
                    id: 2,
                    type: 'credit_card',
                    last4: '5678',
                    brand: 'mastercard',
                    expiryMonth: 10,
                    expiryYear: 2024,
                    isDefault: false
                }
            ],
            total: 2
        };

        it('successfully fetches payment methods', async () => {
            api.get.mockResolvedValueOnce({ data: mockPaymentMethods });

            const result = await paymentService.getPaymentMethods(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/payment-methods`);
            expect(cacheService.set).toHaveBeenCalledWith(
                `user_${mockUserId}_payment_methods`,
                mockPaymentMethods
            );
            expect(result).toEqual(mockPaymentMethods);
        });

        it('returns cached payment methods if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockPaymentMethods);

            const result = await paymentService.getPaymentMethods(mockUserId);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockPaymentMethods);
        });

        it('handles error when fetching payment methods', async () => {
            const error = new Error('Failed to fetch payment methods');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(paymentService.getPaymentMethods(mockUserId))
                .rejects.toThrow('Failed to fetch payment methods');
        });
    });

    describe('addPaymentMethod', () => {
        const mockUserId = 1;
        const mockPaymentData = {
            type: 'credit_card',
            cardNumber: '4242424242424242',
            expiryMonth: 12,
            expiryYear: 2025,
            cvc: '123'
        };
        const mockResponse = {
            id: 1,
            type: 'credit_card',
            last4: '4242',
            brand: 'visa',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true
        };

        it('successfully adds payment method', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await paymentService.addPaymentMethod(mockUserId, mockPaymentData);

            expect(api.post).toHaveBeenCalledWith(
                `/users/${mockUserId}/payment-methods`,
                mockPaymentData
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_payment_methods`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when adding payment method', async () => {
            const error = new Error('Failed to add payment method');
            api.post.mockRejectedValueOnce(error);

            await expect(paymentService.addPaymentMethod(mockUserId, mockPaymentData))
                .rejects.toThrow('Failed to add payment method');
        });
    });

    describe('updatePaymentMethod', () => {
        const mockUserId = 1;
        const mockPaymentMethodId = 1;
        const mockUpdateData = {
            expiryMonth: 11,
            expiryYear: 2026
        };
        const mockResponse = {
            id: 1,
            type: 'credit_card',
            last4: '4242',
            brand: 'visa',
            expiryMonth: 11,
            expiryYear: 2026,
            isDefault: true
        };

        it('successfully updates payment method', async () => {
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await paymentService.updatePaymentMethod(
                mockUserId,
                mockPaymentMethodId,
                mockUpdateData
            );

            expect(api.put).toHaveBeenCalledWith(
                `/users/${mockUserId}/payment-methods/${mockPaymentMethodId}`,
                mockUpdateData
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_payment_methods`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when updating payment method', async () => {
            const error = new Error('Failed to update payment method');
            api.put.mockRejectedValueOnce(error);

            await expect(paymentService.updatePaymentMethod(
                mockUserId,
                mockPaymentMethodId,
                mockUpdateData
            )).rejects.toThrow('Failed to update payment method');
        });
    });

    describe('deletePaymentMethod', () => {
        const mockUserId = 1;
        const mockPaymentMethodId = 1;
        const mockResponse = { message: 'Payment method deleted successfully' };

        it('successfully deletes payment method', async () => {
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await paymentService.deletePaymentMethod(mockUserId, mockPaymentMethodId);

            expect(api.delete).toHaveBeenCalledWith(
                `/users/${mockUserId}/payment-methods/${mockPaymentMethodId}`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_payment_methods`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when deleting payment method', async () => {
            const error = new Error('Failed to delete payment method');
            api.delete.mockRejectedValueOnce(error);

            await expect(paymentService.deletePaymentMethod(mockUserId, mockPaymentMethodId))
                .rejects.toThrow('Failed to delete payment method');
        });
    });

    describe('setDefaultPaymentMethod', () => {
        const mockUserId = 1;
        const mockPaymentMethodId = 1;
        const mockResponse = {
            id: 1,
            type: 'credit_card',
            last4: '4242',
            brand: 'visa',
            isDefault: true
        };

        it('successfully sets default payment method', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await paymentService.setDefaultPaymentMethod(
                mockUserId,
                mockPaymentMethodId
            );

            expect(api.post).toHaveBeenCalledWith(
                `/users/${mockUserId}/payment-methods/${mockPaymentMethodId}/default`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`user_${mockUserId}_payment_methods`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when setting default payment method', async () => {
            const error = new Error('Failed to set default payment method');
            api.post.mockRejectedValueOnce(error);

            await expect(paymentService.setDefaultPaymentMethod(mockUserId, mockPaymentMethodId))
                .rejects.toThrow('Failed to set default payment method');
        });
    });

    describe('processPayment', () => {
        const mockUserId = 1;
        const mockOrderId = 1;
        const mockPaymentData = {
            paymentMethodId: 1,
            amount: 45.99,
            currency: 'TRY'
        };
        const mockResponse = {
            id: 'pi_123456789',
            status: 'succeeded',
            amount: 45.99,
            currency: 'TRY',
            paymentMethod: {
                id: 1,
                type: 'credit_card',
                last4: '4242'
            }
        };

        it('successfully processes payment', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await paymentService.processPayment(
                mockUserId,
                mockOrderId,
                mockPaymentData
            );

            expect(api.post).toHaveBeenCalledWith(
                `/users/${mockUserId}/orders/${mockOrderId}/payment`,
                mockPaymentData
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles error when processing payment', async () => {
            const error = new Error('Failed to process payment');
            api.post.mockRejectedValueOnce(error);

            await expect(paymentService.processPayment(
                mockUserId,
                mockOrderId,
                mockPaymentData
            )).rejects.toThrow('Failed to process payment');
        });
    });

    describe('getPaymentHistory', () => {
        const mockUserId = 1;
        const mockParams = {
            page: 1,
            limit: 10
        };
        const mockPaymentHistory = {
            items: [
                {
                    id: 'pi_123456789',
                    orderId: 1,
                    amount: 45.99,
                    currency: 'TRY',
                    status: 'succeeded',
                    createdAt: '2024-03-20T10:00:00Z',
                    paymentMethod: {
                        id: 1,
                        type: 'credit_card',
                        last4: '4242'
                    }
                }
            ],
            total: 1,
            page: 1,
            limit: 10
        };

        it('successfully fetches payment history', async () => {
            api.get.mockResolvedValueOnce({ data: mockPaymentHistory });

            const result = await paymentService.getPaymentHistory(mockUserId, mockParams);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/payments`, {
                params: mockParams
            });
            expect(result).toEqual(mockPaymentHistory);
        });

        it('handles error when fetching payment history', async () => {
            const error = new Error('Failed to fetch payment history');
            api.get.mockRejectedValueOnce(error);

            await expect(paymentService.getPaymentHistory(mockUserId, mockParams))
                .rejects.toThrow('Failed to fetch payment history');
        });
    });

    describe('getPaymentDetails', () => {
        const mockUserId = 1;
        const mockPaymentId = 'pi_123456789';
        const mockPaymentDetails = {
            id: 'pi_123456789',
            orderId: 1,
            amount: 45.99,
            currency: 'TRY',
            status: 'succeeded',
            createdAt: '2024-03-20T10:00:00Z',
            paymentMethod: {
                id: 1,
                type: 'credit_card',
                last4: '4242'
            },
            receipt: {
                url: 'https://example.com/receipt.pdf'
            }
        };

        it('successfully fetches payment details', async () => {
            api.get.mockResolvedValueOnce({ data: mockPaymentDetails });

            const result = await paymentService.getPaymentDetails(mockUserId, mockPaymentId);

            expect(api.get).toHaveBeenCalledWith(
                `/users/${mockUserId}/payments/${mockPaymentId}`
            );
            expect(result).toEqual(mockPaymentDetails);
        });

        it('handles error when fetching payment details', async () => {
            const error = new Error('Failed to fetch payment details');
            api.get.mockRejectedValueOnce(error);

            await expect(paymentService.getPaymentDetails(mockUserId, mockPaymentId))
                .rejects.toThrow('Failed to fetch payment details');
        });
    });
}); 