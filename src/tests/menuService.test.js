import menuService from '../services/menuService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('MenuService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getRestaurantMenu', () => {
        const mockRestaurantId = 1;
        const mockMenu = {
            categories: [
                {
                    id: 1,
                    name: 'Pizzas',
                    description: 'Our delicious pizzas',
                    items: [
                        {
                            id: 1,
                            name: 'Margherita',
                            description: 'Classic tomato and mozzarella',
                            price: 15.99,
                            image: 'https://example.com/margherita.jpg',
                            isAvailable: true,
                            isSpicy: false,
                            isVegetarian: true,
                            allergens: ['milk', 'gluten'],
                            nutritionalInfo: {
                                calories: 800,
                                protein: 20,
                                carbs: 90,
                                fat: 30
                            }
                        },
                        {
                            id: 2,
                            name: 'Pepperoni',
                            description: 'Classic pepperoni pizza',
                            price: 17.99,
                            image: 'https://example.com/pepperoni.jpg',
                            isAvailable: true,
                            isSpicy: true,
                            isVegetarian: false,
                            allergens: ['milk', 'gluten', 'pork'],
                            nutritionalInfo: {
                                calories: 900,
                                protein: 25,
                                carbs: 95,
                                fat: 35
                            }
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Pasta',
                    description: 'Fresh pasta dishes',
                    items: [
                        {
                            id: 3,
                            name: 'Spaghetti Carbonara',
                            description: 'Creamy pasta with bacon',
                            price: 14.99,
                            image: 'https://example.com/carbonara.jpg',
                            isAvailable: true,
                            isSpicy: false,
                            isVegetarian: false,
                            allergens: ['milk', 'gluten', 'egg', 'pork'],
                            nutritionalInfo: {
                                calories: 850,
                                protein: 22,
                                carbs: 85,
                                fat: 32
                            }
                        }
                    ]
                }
            ]
        };

        it('successfully fetches restaurant menu', async () => {
            api.get.mockResolvedValueOnce({ data: mockMenu });

            const result = await menuService.getRestaurantMenu(mockRestaurantId);

            expect(api.get).toHaveBeenCalledWith(`/restaurants/${mockRestaurantId}/menu`);
            expect(cacheService.set).toHaveBeenCalledWith(
                `restaurant_${mockRestaurantId}_menu`,
                mockMenu
            );
            expect(result).toEqual(mockMenu);
        });

        it('returns cached menu if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockMenu);

            const result = await menuService.getRestaurantMenu(mockRestaurantId);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockMenu);
        });

        it('handles error when fetching menu', async () => {
            const error = new Error('Failed to fetch menu');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(menuService.getRestaurantMenu(mockRestaurantId))
                .rejects.toThrow('Failed to fetch menu');
        });
    });

    describe('getMenuItemDetails', () => {
        const mockRestaurantId = 1;
        const mockItemId = 1;
        const mockItemDetails = {
            id: 1,
            name: 'Margherita',
            description: 'Classic tomato and mozzarella',
            price: 15.99,
            image: 'https://example.com/margherita.jpg',
            isAvailable: true,
            isSpicy: false,
            isVegetarian: true,
            allergens: ['milk', 'gluten'],
            nutritionalInfo: {
                calories: 800,
                protein: 20,
                carbs: 90,
                fat: 30
            },
            customizationOptions: [
                {
                    id: 1,
                    name: 'Size',
                    required: true,
                    options: [
                        { id: 1, name: 'Small', price: 0 },
                        { id: 2, name: 'Medium', price: 2 },
                        { id: 3, name: 'Large', price: 4 }
                    ]
                },
                {
                    id: 2,
                    name: 'Extra Toppings',
                    required: false,
                    options: [
                        { id: 1, name: 'Extra Cheese', price: 1.5 },
                        { id: 2, name: 'Mushrooms', price: 1 },
                        { id: 3, name: 'Olives', price: 1 }
                    ]
                }
            ],
            reviews: {
                averageRating: 4.5,
                totalReviews: 120,
                recentReviews: [
                    {
                        id: 1,
                        userId: 1,
                        userName: 'John Doe',
                        rating: 5,
                        comment: 'Best pizza ever!',
                        date: '2024-03-20T10:00:00Z'
                    }
                ]
            }
        };

        it('successfully fetches menu item details', async () => {
            api.get.mockResolvedValueOnce({ data: mockItemDetails });

            const result = await menuService.getMenuItemDetails(mockRestaurantId, mockItemId);

            expect(api.get).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/menu/items/${mockItemId}`
            );
            expect(result).toEqual(mockItemDetails);
        });

        it('handles error when fetching menu item details', async () => {
            const error = new Error('Failed to fetch menu item details');
            api.get.mockRejectedValueOnce(error);

            await expect(menuService.getMenuItemDetails(mockRestaurantId, mockItemId))
                .rejects.toThrow('Failed to fetch menu item details');
        });
    });

    describe('getMenuCategories', () => {
        const mockRestaurantId = 1;
        const mockCategories = {
            items: [
                {
                    id: 1,
                    name: 'Pizzas',
                    description: 'Our delicious pizzas',
                    image: 'https://example.com/pizzas.jpg',
                    totalItems: 12
                },
                {
                    id: 2,
                    name: 'Pasta',
                    description: 'Fresh pasta dishes',
                    image: 'https://example.com/pasta.jpg',
                    totalItems: 8
                }
            ],
            total: 2
        };

        it('successfully fetches menu categories', async () => {
            api.get.mockResolvedValueOnce({ data: mockCategories });

            const result = await menuService.getMenuCategories(mockRestaurantId);

            expect(api.get).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/menu/categories`
            );
            expect(cacheService.set).toHaveBeenCalledWith(
                `restaurant_${mockRestaurantId}_categories`,
                mockCategories
            );
            expect(result).toEqual(mockCategories);
        });

        it('returns cached categories if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockCategories);

            const result = await menuService.getMenuCategories(mockRestaurantId);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockCategories);
        });

        it('handles error when fetching menu categories', async () => {
            const error = new Error('Failed to fetch menu categories');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(menuService.getMenuCategories(mockRestaurantId))
                .rejects.toThrow('Failed to fetch menu categories');
        });
    });

    describe('getCategoryItems', () => {
        const mockRestaurantId = 1;
        const mockCategoryId = 1;
        const mockParams = {
            page: 1,
            limit: 10,
            sortBy: 'price',
            sortOrder: 'asc'
        };
        const mockItems = {
            items: [
                {
                    id: 1,
                    name: 'Margherita',
                    description: 'Classic tomato and mozzarella',
                    price: 15.99,
                    image: 'https://example.com/margherita.jpg',
                    isAvailable: true,
                    isSpicy: false,
                    isVegetarian: true
                },
                {
                    id: 2,
                    name: 'Pepperoni',
                    description: 'Classic pepperoni pizza',
                    price: 17.99,
                    image: 'https://example.com/pepperoni.jpg',
                    isAvailable: true,
                    isSpicy: true,
                    isVegetarian: false
                }
            ],
            total: 2,
            page: 1,
            limit: 10
        };

        it('successfully fetches category items', async () => {
            api.get.mockResolvedValueOnce({ data: mockItems });

            const result = await menuService.getCategoryItems(
                mockRestaurantId,
                mockCategoryId,
                mockParams
            );

            expect(api.get).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/menu/categories/${mockCategoryId}/items`,
                { params: mockParams }
            );
            expect(result).toEqual(mockItems);
        });

        it('handles error when fetching category items', async () => {
            const error = new Error('Failed to fetch category items');
            api.get.mockRejectedValueOnce(error);

            await expect(menuService.getCategoryItems(
                mockRestaurantId,
                mockCategoryId,
                mockParams
            )).rejects.toThrow('Failed to fetch category items');
        });
    });

    describe('getPopularItems', () => {
        const mockRestaurantId = 1;
        const mockPopularItems = {
            items: [
                {
                    id: 1,
                    name: 'Margherita',
                    description: 'Classic tomato and mozzarella',
                    price: 15.99,
                    image: 'https://example.com/margherita.jpg',
                    isAvailable: true,
                    orderCount: 150,
                    rating: 4.8
                },
                {
                    id: 2,
                    name: 'Pepperoni',
                    description: 'Classic pepperoni pizza',
                    price: 17.99,
                    image: 'https://example.com/pepperoni.jpg',
                    isAvailable: true,
                    orderCount: 120,
                    rating: 4.6
                }
            ],
            total: 2
        };

        it('successfully fetches popular items', async () => {
            api.get.mockResolvedValueOnce({ data: mockPopularItems });

            const result = await menuService.getPopularItems(mockRestaurantId);

            expect(api.get).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/menu/popular`
            );
            expect(result).toEqual(mockPopularItems);
        });

        it('handles error when fetching popular items', async () => {
            const error = new Error('Failed to fetch popular items');
            api.get.mockRejectedValueOnce(error);

            await expect(menuService.getPopularItems(mockRestaurantId))
                .rejects.toThrow('Failed to fetch popular items');
        });
    });

    describe('getSpecialOffers', () => {
        const mockRestaurantId = 1;
        const mockSpecialOffers = {
            items: [
                {
                    id: 1,
                    name: '2 for 1 Pizza',
                    description: 'Buy one pizza, get one free',
                    validUntil: '2024-04-20T23:59:59Z',
                    conditions: 'Valid only on weekdays',
                    image: 'https://example.com/offer1.jpg'
                },
                {
                    id: 2,
                    name: '20% Off Pasta',
                    description: '20% off all pasta dishes',
                    validUntil: '2024-04-15T23:59:59Z',
                    conditions: 'Valid for orders above $30',
                    image: 'https://example.com/offer2.jpg'
                }
            ],
            total: 2
        };

        it('successfully fetches special offers', async () => {
            api.get.mockResolvedValueOnce({ data: mockSpecialOffers });

            const result = await menuService.getSpecialOffers(mockRestaurantId);

            expect(api.get).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/menu/offers`
            );
            expect(result).toEqual(mockSpecialOffers);
        });

        it('handles error when fetching special offers', async () => {
            const error = new Error('Failed to fetch special offers');
            api.get.mockRejectedValueOnce(error);

            await expect(menuService.getSpecialOffers(mockRestaurantId))
                .rejects.toThrow('Failed to fetch special offers');
        });
    });

    describe('getItemReviews', () => {
        const mockRestaurantId = 1;
        const mockItemId = 1;
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
                    comment: 'Best pizza ever!',
                    date: '2024-03-20T10:00:00Z',
                    images: ['https://example.com/review1.jpg']
                },
                {
                    id: 2,
                    userId: 2,
                    userName: 'Jane Smith',
                    rating: 4,
                    comment: 'Great taste',
                    date: '2024-03-19T15:30:00Z'
                }
            ],
            total: 2,
            page: 1,
            limit: 10
        };

        it('successfully fetches item reviews', async () => {
            api.get.mockResolvedValueOnce({ data: mockReviews });

            const result = await menuService.getItemReviews(
                mockRestaurantId,
                mockItemId,
                mockParams
            );

            expect(api.get).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/menu/items/${mockItemId}/reviews`,
                { params: mockParams }
            );
            expect(result).toEqual(mockReviews);
        });

        it('handles error when fetching item reviews', async () => {
            const error = new Error('Failed to fetch item reviews');
            api.get.mockRejectedValueOnce(error);

            await expect(menuService.getItemReviews(
                mockRestaurantId,
                mockItemId,
                mockParams
            )).rejects.toThrow('Failed to fetch item reviews');
        });
    });
}); 