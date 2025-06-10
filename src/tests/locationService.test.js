import locationService from '../services/locationService';
import api from '../services/api';
import cacheService from '../services/cacheService';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');
jest.mock('expo-location');
jest.mock('expo-permissions');

describe('LocationService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getCurrentLocation', () => {
        const mockLocation = {
            latitude: 41.0082,
            longitude: 28.9784,
            accuracy: 10,
            timestamp: '2024-03-20T10:00:00Z'
        };

        it('successfully gets current location', async () => {
            api.get.mockResolvedValueOnce({ data: mockLocation });

            const result = await locationService.getCurrentLocation();

            expect(api.get).toHaveBeenCalledWith('/location/current');
            expect(result).toEqual(mockLocation);
        });

        it('handles error when getting current location', async () => {
            const error = new Error('Failed to get current location');
            api.get.mockRejectedValueOnce(error);

            await expect(locationService.getCurrentLocation())
                .rejects.toThrow('Failed to get current location');
        });
    });

    describe('getAddressFromCoordinates', () => {
        const mockCoordinates = {
            latitude: 41.0082,
            longitude: 28.9784
        };
        const mockAddress = {
            street: 'Bağdat Caddesi',
            number: '123',
            neighborhood: 'Caddebostan',
            district: 'Kadıköy',
            city: 'İstanbul',
            country: 'Türkiye',
            postalCode: '34728',
            formattedAddress: 'Bağdat Caddesi No:123, Caddebostan, Kadıköy, İstanbul, Türkiye'
        };

        it('successfully gets address from coordinates', async () => {
            api.get.mockResolvedValueOnce({ data: mockAddress });

            const result = await locationService.getAddressFromCoordinates(mockCoordinates);

            expect(api.get).toHaveBeenCalledWith('/location/geocode', {
                params: mockCoordinates
            });
            expect(result).toEqual(mockAddress);
        });

        it('handles error when getting address from coordinates', async () => {
            const error = new Error('Failed to get address from coordinates');
            api.get.mockRejectedValueOnce(error);

            await expect(locationService.getAddressFromCoordinates(mockCoordinates))
                .rejects.toThrow('Failed to get address from coordinates');
        });
    });

    describe('getCoordinatesFromAddress', () => {
        const mockAddress = 'Bağdat Caddesi No:123, Caddebostan, Kadıköy, İstanbul';
        const mockCoordinates = {
            latitude: 41.0082,
            longitude: 28.9784,
            accuracy: 10
        };

        it('successfully gets coordinates from address', async () => {
            api.get.mockResolvedValueOnce({ data: mockCoordinates });

            const result = await locationService.getCoordinatesFromAddress(mockAddress);

            expect(api.get).toHaveBeenCalledWith('/location/geocode', {
                params: { address: mockAddress }
            });
            expect(result).toEqual(mockCoordinates);
        });

        it('handles error when getting coordinates from address', async () => {
            const error = new Error('Failed to get coordinates from address');
            api.get.mockRejectedValueOnce(error);

            await expect(locationService.getCoordinatesFromAddress(mockAddress))
                .rejects.toThrow('Failed to get coordinates from address');
        });
    });

    describe('getNearbyRestaurants', () => {
        const mockLocation = {
            latitude: 41.0082,
            longitude: 28.9784
        };
        const mockRadius = 5; // km
        const mockRestaurants = [
            {
                id: 1,
                name: 'Pizza Palace',
                distance: 0.5,
                rating: 4.5,
                cuisine: 'italian',
                isOpen: true
            },
            {
                id: 2,
                name: 'Burger House',
                distance: 1.2,
                rating: 4.2,
                cuisine: 'american',
                isOpen: true
            }
        ];

        it('successfully gets nearby restaurants', async () => {
            api.get.mockResolvedValueOnce({ data: mockRestaurants });

            const result = await locationService.getNearbyRestaurants(mockLocation, mockRadius);

            expect(api.get).toHaveBeenCalledWith('/location/nearby-restaurants', {
                params: {
                    ...mockLocation,
                    radius: mockRadius
                }
            });
            expect(result).toEqual(mockRestaurants);
        });

        it('handles error when getting nearby restaurants', async () => {
            const error = new Error('Failed to get nearby restaurants');
            api.get.mockRejectedValueOnce(error);

            await expect(locationService.getNearbyRestaurants(mockLocation, mockRadius))
                .rejects.toThrow('Failed to get nearby restaurants');
        });
    });

    describe('calculateDistance', () => {
        const mockOrigin = {
            latitude: 41.0082,
            longitude: 28.9784
        };
        const mockDestination = {
            latitude: 41.0123,
            longitude: 28.9856
        };
        const mockDistance = {
            distance: 2.5, // km
            duration: 15 // minutes
        };

        it('successfully calculates distance', async () => {
            api.get.mockResolvedValueOnce({ data: mockDistance });

            const result = await locationService.calculateDistance(mockOrigin, mockDestination);

            expect(api.get).toHaveBeenCalledWith('/location/distance', {
                params: {
                    origin: mockOrigin,
                    destination: mockDestination
                }
            });
            expect(result).toEqual(mockDistance);
        });

        it('handles error when calculating distance', async () => {
            const error = new Error('Failed to calculate distance');
            api.get.mockRejectedValueOnce(error);

            await expect(locationService.calculateDistance(mockOrigin, mockDestination))
                .rejects.toThrow('Failed to calculate distance');
        });
    });

    describe('getDeliveryAreas', () => {
        const mockRestaurantId = 1;
        const mockDeliveryAreas = [
            {
                id: 1,
                name: 'Kadıköy',
                coordinates: [
                    { latitude: 41.0082, longitude: 28.9784 },
                    { latitude: 41.0123, longitude: 28.9856 }
                ],
                deliveryFee: 10,
                minOrderAmount: 50
            },
            {
                id: 2,
                name: 'Üsküdar',
                coordinates: [
                    { latitude: 41.0234, longitude: 29.0123 },
                    { latitude: 41.0345, longitude: 29.0234 }
                ],
                deliveryFee: 15,
                minOrderAmount: 75
            }
        ];

        it('successfully gets delivery areas', async () => {
            api.get.mockResolvedValueOnce({ data: mockDeliveryAreas });

            const result = await locationService.getDeliveryAreas(mockRestaurantId);

            expect(api.get).toHaveBeenCalledWith(`/restaurants/${mockRestaurantId}/delivery-areas`);
            expect(cacheService.set).toHaveBeenCalledWith(
                `restaurant_${mockRestaurantId}_delivery_areas`,
                mockDeliveryAreas
            );
            expect(result).toEqual(mockDeliveryAreas);
        });

        it('returns cached delivery areas if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockDeliveryAreas);

            const result = await locationService.getDeliveryAreas(mockRestaurantId);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockDeliveryAreas);
        });

        it('handles error when getting delivery areas', async () => {
            const error = new Error('Failed to get delivery areas');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(locationService.getDeliveryAreas(mockRestaurantId))
                .rejects.toThrow('Failed to get delivery areas');
        });
    });

    describe('checkDeliveryAvailability', () => {
        const mockRestaurantId = 1;
        const mockLocation = {
            latitude: 41.0082,
            longitude: 28.9784
        };
        const mockResponse = {
            isAvailable: true,
            deliveryFee: 10,
            estimatedTime: '30-45',
            minOrderAmount: 50
        };

        it('successfully checks delivery availability', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await locationService.checkDeliveryAvailability(
                mockRestaurantId,
                mockLocation
            );

            expect(api.post).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/delivery-availability`,
                mockLocation
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles error when checking delivery availability', async () => {
            const error = new Error('Failed to check delivery availability');
            api.post.mockRejectedValueOnce(error);

            await expect(locationService.checkDeliveryAvailability(
                mockRestaurantId,
                mockLocation
            )).rejects.toThrow('Failed to check delivery availability');
        });
    });
}); 