import validationService from '../services/validationService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('ValidationService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('validateEmail', () => {
        it('successfully validates valid email', async () => {
            const email = 'test@example.com';
            api.post.mockResolvedValueOnce({ data: { isValid: true } });

            const result = await validationService.validateEmail(email);

            expect(api.post).toHaveBeenCalledWith('/validation/email', { email });
            expect(result).toEqual({ isValid: true });
        });

        it('successfully validates invalid email', async () => {
            const email = 'invalid-email';
            api.post.mockResolvedValueOnce({ 
                data: { 
                    isValid: false,
                    errors: ['Invalid email format']
                }
            });

            const result = await validationService.validateEmail(email);

            expect(api.post).toHaveBeenCalledWith('/validation/email', { email });
            expect(result).toEqual({ 
                isValid: false,
                errors: ['Invalid email format']
            });
        });

        it('handles error when validating email', async () => {
            const email = 'test@example.com';
            const error = new Error('Failed to validate email');
            api.post.mockRejectedValueOnce(error);

            await expect(validationService.validateEmail(email))
                .rejects.toThrow('Failed to validate email');
        });
    });

    describe('validatePhone', () => {
        it('successfully validates valid phone number', async () => {
            const phone = '+905551234567';
            api.post.mockResolvedValueOnce({ data: { isValid: true } });

            const result = await validationService.validatePhone(phone);

            expect(api.post).toHaveBeenCalledWith('/validation/phone', { phone });
            expect(result).toEqual({ isValid: true });
        });

        it('successfully validates invalid phone number', async () => {
            const phone = 'invalid-phone';
            api.post.mockResolvedValueOnce({ 
                data: { 
                    isValid: false,
                    errors: ['Invalid phone number format']
                }
            });

            const result = await validationService.validatePhone(phone);

            expect(api.post).toHaveBeenCalledWith('/validation/phone', { phone });
            expect(result).toEqual({ 
                isValid: false,
                errors: ['Invalid phone number format']
            });
        });

        it('handles error when validating phone', async () => {
            const phone = '+905551234567';
            const error = new Error('Failed to validate phone');
            api.post.mockRejectedValueOnce(error);

            await expect(validationService.validatePhone(phone))
                .rejects.toThrow('Failed to validate phone');
        });
    });

    describe('validateAddress', () => {
        const mockAddress = {
            street: 'Test Street',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country',
            postalCode: '12345'
        };

        it('successfully validates valid address', async () => {
            api.post.mockResolvedValueOnce({ data: { isValid: true } });

            const result = await validationService.validateAddress(mockAddress);

            expect(api.post).toHaveBeenCalledWith('/validation/address', mockAddress);
            expect(result).toEqual({ isValid: true });
        });

        it('successfully validates invalid address', async () => {
            api.post.mockResolvedValueOnce({ 
                data: { 
                    isValid: false,
                    errors: ['Invalid postal code']
                }
            });

            const result = await validationService.validateAddress(mockAddress);

            expect(api.post).toHaveBeenCalledWith('/validation/address', mockAddress);
            expect(result).toEqual({ 
                isValid: false,
                errors: ['Invalid postal code']
            });
        });

        it('handles error when validating address', async () => {
            const error = new Error('Failed to validate address');
            api.post.mockRejectedValueOnce(error);

            await expect(validationService.validateAddress(mockAddress))
                .rejects.toThrow('Failed to validate address');
        });
    });

    describe('validatePassword', () => {
        it('successfully validates valid password', async () => {
            const password = 'StrongP@ss123';
            api.post.mockResolvedValueOnce({ data: { isValid: true } });

            const result = await validationService.validatePassword(password);

            expect(api.post).toHaveBeenCalledWith('/validation/password', { password });
            expect(result).toEqual({ isValid: true });
        });

        it('successfully validates invalid password', async () => {
            const password = 'weak';
            api.post.mockResolvedValueOnce({ 
                data: { 
                    isValid: false,
                    errors: [
                        'Password must be at least 8 characters long',
                        'Password must contain at least one uppercase letter',
                        'Password must contain at least one number',
                        'Password must contain at least one special character'
                    ]
                }
            });

            const result = await validationService.validatePassword(password);

            expect(api.post).toHaveBeenCalledWith('/validation/password', { password });
            expect(result).toEqual({ 
                isValid: false,
                errors: [
                    'Password must be at least 8 characters long',
                    'Password must contain at least one uppercase letter',
                    'Password must contain at least one number',
                    'Password must contain at least one special character'
                ]
            });
        });

        it('handles error when validating password', async () => {
            const password = 'StrongP@ss123';
            const error = new Error('Failed to validate password');
            api.post.mockRejectedValueOnce(error);

            await expect(validationService.validatePassword(password))
                .rejects.toThrow('Failed to validate password');
        });
    });

    describe('validateCreditCard', () => {
        const mockCard = {
            number: '4111111111111111',
            expiryMonth: '12',
            expiryYear: '2025',
            cvv: '123'
        };

        it('successfully validates valid credit card', async () => {
            api.post.mockResolvedValueOnce({ data: { isValid: true } });

            const result = await validationService.validateCreditCard(mockCard);

            expect(api.post).toHaveBeenCalledWith('/validation/credit-card', mockCard);
            expect(result).toEqual({ isValid: true });
        });

        it('successfully validates invalid credit card', async () => {
            api.post.mockResolvedValueOnce({ 
                data: { 
                    isValid: false,
                    errors: ['Invalid card number']
                }
            });

            const result = await validationService.validateCreditCard(mockCard);

            expect(api.post).toHaveBeenCalledWith('/validation/credit-card', mockCard);
            expect(result).toEqual({ 
                isValid: false,
                errors: ['Invalid card number']
            });
        });

        it('handles error when validating credit card', async () => {
            const error = new Error('Failed to validate credit card');
            api.post.mockRejectedValueOnce(error);

            await expect(validationService.validateCreditCard(mockCard))
                .rejects.toThrow('Failed to validate credit card');
        });
    });

    describe('validatePromoCode', () => {
        it('successfully validates valid promo code', async () => {
            const code = 'SUMMER2024';
            api.post.mockResolvedValueOnce({ 
                data: { 
                    isValid: true,
                    discount: {
                        type: 'PERCENTAGE',
                        value: 20
                    }
                }
            });

            const result = await validationService.validatePromoCode(code);

            expect(api.post).toHaveBeenCalledWith('/validation/promo-code', { code });
            expect(result).toEqual({ 
                isValid: true,
                discount: {
                    type: 'PERCENTAGE',
                    value: 20
                }
            });
        });

        it('successfully validates invalid promo code', async () => {
            const code = 'INVALID';
            api.post.mockResolvedValueOnce({ 
                data: { 
                    isValid: false,
                    errors: ['Invalid or expired promo code']
                }
            });

            const result = await validationService.validatePromoCode(code);

            expect(api.post).toHaveBeenCalledWith('/validation/promo-code', { code });
            expect(result).toEqual({ 
                isValid: false,
                errors: ['Invalid or expired promo code']
            });
        });

        it('handles error when validating promo code', async () => {
            const code = 'SUMMER2024';
            const error = new Error('Failed to validate promo code');
            api.post.mockRejectedValueOnce(error);

            await expect(validationService.validatePromoCode(code))
                .rejects.toThrow('Failed to validate promo code');
        });
    });
}); 