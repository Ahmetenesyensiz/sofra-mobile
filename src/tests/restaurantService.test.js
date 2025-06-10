import restaurantService from '../services/restaurantService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('RestaurantService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getRestaurants', () => {
        const mockParams = {
            page: 1,
            limit: 10,
            category: 'italian',
            cuisine: 'pizza',
            sortBy: 'rating',
            sortOrder: 'desc'
        };
        const mockRestaurants = {
            items: [
                {
                    id: 1,
                    name: 'Pizza Palace',
                    description: 'Best pizza in town',
                    rating: 4.5,
                    totalReviews: 150,
                    deliveryTime: '30-45',
                    minOrderAmount: 50,
                    deliveryFee: 10,
                    image: 'https://example.com/pizza.jpg',
                    categories: ['italian', 'pizza'],
                    cuisines: ['pizza', 'pasta'],
                    isOpen: true,
                    address: {
                        street: '123 Main St',
                        city: 'New York',
                        country: 'USA',
                        postalCode: '10001'
                    }
                },
                {
                    id: 2,
                    name: 'Pasta Paradise',
                    description: 'Authentic Italian pasta',
                    rating: 4.3,
                    totalReviews: 120,
                    deliveryTime: '25-40',
                    minOrderAmount: 40,
                    deliveryFee: 8,
                    image: 'https://example.com/pasta.jpg',
                    categories: ['italian', 'pasta'],
                    cuisines: ['pasta', 'seafood'],
                    isOpen: true,
                    address: {
                        street: '456 Oak St',
                        city: 'New York',
                        country: 'USA',
                        postalCode: '10002'
                    }
                }
            ],
            total: 2,
            page: 1,
            limit: 10
        };

        it('successfully fetches restaurants', async () => {
            api.get.mockResolvedValueOnce({ data: mockRestaurants });

            const result = await restaurantService.getRestaurants(mockParams);

            expect(api.get).toHaveBeenCalledWith('/restaurants', {
                params: mockParams
            });
            expect(cacheService.set).toHaveBeenCalledWith(
                'restaurants',
                mockRestaurants
            );
            expect(result).toEqual(mockRestaurants);
        });

        it('returns cached restaurants if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockRestaurants);

            const result = await restaurantService.getRestaurants(mockParams);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockRestaurants);
        });

        it('handles error when fetching restaurants', async () => {
            const error = new Error('Failed to fetch restaurants');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(restaurantService.getRestaurants(mockParams))
                .rejects.toThrow('Failed to fetch restaurants');
        });
    });

    describe('getRestaurantById', () => {
        const mockRestaurantId = 1;
        const mockRestaurant = {
            id: 1,
            name: 'Pizza Palace',
            description: 'Best pizza in town',
            rating: 4.5,
            totalReviews: 150,
            deliveryTime: '30-45',
            minOrderAmount: 50,
            deliveryFee: 10,
            image: 'https://example.com/pizza.jpg',
            categories: ['italian', 'pizza'],
            cuisines: ['pizza', 'pasta'],
            isOpen: true,
            address: {
                street: '123 Main St',
                city: 'New York',
                country: 'USA',
                postalCode: '10001'
            },
            openingHours: {
                monday: { open: '10:00', close: '22:00' },
                tuesday: { open: '10:00', close: '22:00' },
                wednesday: { open: '10:00', close: '22:00' },
                thursday: { open: '10:00', close: '22:00' },
                friday: { open: '10:00', close: '23:00' },
                saturday: { open: '11:00', close: '23:00' },
                sunday: { open: '11:00', close: '22:00' }
            },
            contact: {
                phone: '+1234567890',
                email: 'info@pizzapalace.com'
            }
        };

        it('successfully fetches restaurant by id', async () => {
            api.get.mockResolvedValueOnce({ data: mockRestaurant });

            const result = await restaurantService.getRestaurantById(mockRestaurantId);

            expect(api.get).toHaveBeenCalledWith(`/restaurants/${mockRestaurantId}`);
            expect(cacheService.set).toHaveBeenCalledWith(
                `restaurant_${mockRestaurantId}`,
                mockRestaurant
            );
            expect(result).toEqual(mockRestaurant);
        });

        it('returns cached restaurant if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockRestaurant);

            const result = await restaurantService.getRestaurantById(mockRestaurantId);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockRestaurant);
        });

        it('handles error when fetching restaurant', async () => {
            const error = new Error('Failed to fetch restaurant');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(restaurantService.getRestaurantById(mockRestaurantId))
                .rejects.toThrow('Failed to fetch restaurant');
        });
    });

    describe('searchRestaurants', () => {
        const mockQuery = 'pizza';
        const mockParams = {
            page: 1,
            limit: 10,
            sortBy: 'rating',
            sortOrder: 'desc'
        };
        const mockSearchResults = {
            items: [
                {
                    id: 1,
                    name: 'Pizza Palace',
                    description: 'Best pizza in town',
                    rating: 4.5,
                    totalReviews: 150,
                    deliveryTime: '30-45',
                    minOrderAmount: 50,
                    deliveryFee: 10,
                    image: 'https://example.com/pizza.jpg',
                    categories: ['italian', 'pizza'],
                    cuisines: ['pizza', 'pasta'],
                    isOpen: true
                }
            ],
            total: 1,
            page: 1,
            limit: 10
        };

        it('successfully searches restaurants', async () => {
            api.get.mockResolvedValueOnce({ data: mockSearchResults });

            const result = await restaurantService.searchRestaurants(mockQuery, mockParams);

            expect(api.get).toHaveBeenCalledWith('/restaurants/search', {
                params: {
                    query: mockQuery,
                    ...mockParams
                }
            });
            expect(result).toEqual(mockSearchResults);
        });

        it('handles error when searching restaurants', async () => {
            const error = new Error('Failed to search restaurants');
            api.get.mockRejectedValueOnce(error);

            await expect(restaurantService.searchRestaurants(mockQuery, mockParams))
                .rejects.toThrow('Failed to search restaurants');
        });
    });

    describe('getRestaurantReviews', () => {
        const mockRestaurantId = 1;
        const mockParams = {
            page: 1,
            limit: 10,
            sortBy: 'date',
            sortOrder: 'desc'
        };
        const mockReviews = {
            items: [
                {
                    id: 1,
                    userId: 1,
                    userName: 'John Doe',
                    rating: 5,
                    comment: 'Great pizza!',
                    date: '2024-03-20T10:00:00Z',
                    images: ['https://example.com/review1.jpg']
                },
                {
                    id: 2,
                    userId: 2,
                    userName: 'Jane Smith',
                    rating: 4,
                    comment: 'Good service',
                    date: '2024-03-19T15:30:00Z'
                }
            ],
            total: 2,
            page: 1,
            limit: 10
        };

        it('successfully fetches restaurant reviews', async () => {
            api.get.mockResolvedValueOnce({ data: mockReviews });

            const result = await restaurantService.getRestaurantReviews(
                mockRestaurantId,
                mockParams
            );

            expect(api.get).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/reviews`,
                { params: mockParams }
            );
            expect(result).toEqual(mockReviews);
        });

        it('handles error when fetching restaurant reviews', async () => {
            const error = new Error('Failed to fetch restaurant reviews');
            api.get.mockRejectedValueOnce(error);

            await expect(restaurantService.getRestaurantReviews(
                mockRestaurantId,
                mockParams
            )).rejects.toThrow('Failed to fetch restaurant reviews');
        });
    });

    describe('getRestaurantCategories', () => {
        const mockCategories = {
            items: [
                {
                    id: 1,
                    name: 'Italian',
                    slug: 'italian',
                    image: 'https://example.com/italian.jpg',
                    totalRestaurants: 50
                },
                {
                    id: 2,
                    name: 'Japanese',
                    slug: 'japanese',
                    image: 'https://example.com/japanese.jpg',
                    totalRestaurants: 30
                }
            ],
            total: 2
        };

        it('successfully fetches restaurant categories', async () => {
            api.get.mockResolvedValueOnce({ data: mockCategories });

            const result = await restaurantService.getRestaurantCategories();

            expect(api.get).toHaveBeenCalledWith('/restaurants/categories');
            expect(cacheService.set).toHaveBeenCalledWith(
                'restaurant_categories',
                mockCategories
            );
            expect(result).toEqual(mockCategories);
        });

        it('returns cached categories if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockCategories);

            const result = await restaurantService.getRestaurantCategories();

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockCategories);
        });

        it('handles error when fetching restaurant categories', async () => {
            const error = new Error('Failed to fetch restaurant categories');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(restaurantService.getRestaurantCategories())
                .rejects.toThrow('Failed to fetch restaurant categories');
        });
    });

    describe('getRestaurantCuisines', () => {
        const mockCuisines = {
            items: [
                {
                    id: 1,
                    name: 'Pizza',
                    slug: 'pizza',
                    image: 'https://example.com/pizza.jpg',
                    totalRestaurants: 40
                },
                {
                    id: 2,
                    name: 'Sushi',
                    slug: 'sushi',
                    image: 'https://example.com/sushi.jpg',
                    totalRestaurants: 25
                }
            ],
            total: 2
        };

        it('successfully fetches restaurant cuisines', async () => {
            api.get.mockResolvedValueOnce({ data: mockCuisines });

            const result = await restaurantService.getRestaurantCuisines();

            expect(api.get).toHaveBeenCalledWith('/restaurants/cuisines');
            expect(cacheService.set).toHaveBeenCalledWith(
                'restaurant_cuisines',
                mockCuisines
            );
            expect(result).toEqual(mockCuisines);
        });

        it('returns cached cuisines if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockCuisines);

            const result = await restaurantService.getRestaurantCuisines();

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockCuisines);
        });

        it('handles error when fetching restaurant cuisines', async () => {
            const error = new Error('Failed to fetch restaurant cuisines');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(restaurantService.getRestaurantCuisines())
                .rejects.toThrow('Failed to fetch restaurant cuisines');
        });
    });
}); 