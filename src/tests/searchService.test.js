import searchService from '../services/searchService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('SearchService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('searchRestaurants', () => {
        const mockQuery = 'pizza';
        const mockFilters = {
            cuisine: 'italian',
            priceRange: 'medium',
            rating: 4,
            isOpen: true
        };
        const mockSort = {
            field: 'rating',
            order: 'desc'
        };
        const mockPagination = {
            page: 1,
            limit: 10
        };
        const mockResults = {
            restaurants: [
                {
                    id: 1,
                    name: 'Pizza Palace',
                    cuisine: 'italian',
                    rating: 4.5,
                    priceRange: 'medium',
                    isOpen: true,
                    deliveryTime: '30-45',
                    minOrder: 50,
                    image: 'pizza-palace.jpg'
                },
                {
                    id: 2,
                    name: 'Pizza Express',
                    cuisine: 'italian',
                    rating: 4.2,
                    priceRange: 'medium',
                    isOpen: true,
                    deliveryTime: '25-40',
                    minOrder: 45,
                    image: 'pizza-express.jpg'
                }
            ],
            total: 2,
            page: 1,
            totalPages: 1
        };

        it('successfully searches restaurants', async () => {
            api.get.mockResolvedValueOnce({ data: mockResults });

            const result = await searchService.searchRestaurants(
                mockQuery,
                mockFilters,
                mockSort,
                mockPagination
            );

            expect(api.get).toHaveBeenCalledWith('/search/restaurants', {
                params: {
                    q: mockQuery,
                    ...mockFilters,
                    sortBy: mockSort.field,
                    sortOrder: mockSort.order,
                    page: mockPagination.page,
                    limit: mockPagination.limit
                }
            });
            expect(result).toEqual(mockResults);
        });

        it('handles error when searching restaurants', async () => {
            const error = new Error('Failed to search restaurants');
            api.get.mockRejectedValueOnce(error);

            await expect(searchService.searchRestaurants(
                mockQuery,
                mockFilters,
                mockSort,
                mockPagination
            )).rejects.toThrow('Failed to search restaurants');
        });
    });

    describe('searchMenuItems', () => {
        const mockQuery = 'margherita';
        const mockFilters = {
            category: 'pizza',
            priceRange: 'medium',
            isVegetarian: true
        };
        const mockSort = {
            field: 'price',
            order: 'asc'
        };
        const mockPagination = {
            page: 1,
            limit: 10
        };
        const mockResults = {
            items: [
                {
                    id: 1,
                    name: 'Margherita Pizza',
                    category: 'pizza',
                    price: 15.99,
                    isVegetarian: true,
                    description: 'Classic tomato and mozzarella pizza',
                    image: 'margherita.jpg'
                },
                {
                    id: 2,
                    name: 'Margherita Special',
                    category: 'pizza',
                    price: 17.99,
                    isVegetarian: true,
                    description: 'Margherita with extra cheese',
                    image: 'margherita-special.jpg'
                }
            ],
            total: 2,
            page: 1,
            totalPages: 1
        };

        it('successfully searches menu items', async () => {
            api.get.mockResolvedValueOnce({ data: mockResults });

            const result = await searchService.searchMenuItems(
                mockQuery,
                mockFilters,
                mockSort,
                mockPagination
            );

            expect(api.get).toHaveBeenCalledWith('/search/menu-items', {
                params: {
                    q: mockQuery,
                    ...mockFilters,
                    sortBy: mockSort.field,
                    sortOrder: mockSort.order,
                    page: mockPagination.page,
                    limit: mockPagination.limit
                }
            });
            expect(result).toEqual(mockResults);
        });

        it('handles error when searching menu items', async () => {
            const error = new Error('Failed to search menu items');
            api.get.mockRejectedValueOnce(error);

            await expect(searchService.searchMenuItems(
                mockQuery,
                mockFilters,
                mockSort,
                mockPagination
            )).rejects.toThrow('Failed to search menu items');
        });
    });

    describe('getSearchSuggestions', () => {
        const mockQuery = 'piz';
        const mockSuggestions = [
            'pizza',
            'pizza palace',
            'pizza express',
            'pizza hut'
        ];

        it('successfully gets search suggestions', async () => {
            api.get.mockResolvedValueOnce({ data: mockSuggestions });

            const result = await searchService.getSearchSuggestions(mockQuery);

            expect(api.get).toHaveBeenCalledWith('/search/suggestions', {
                params: { q: mockQuery }
            });
            expect(result).toEqual(mockSuggestions);
        });

        it('returns cached suggestions if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockSuggestions);

            const result = await searchService.getSearchSuggestions(mockQuery);

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockSuggestions);
        });

        it('handles error when getting search suggestions', async () => {
            const error = new Error('Failed to get search suggestions');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(searchService.getSearchSuggestions(mockQuery))
                .rejects.toThrow('Failed to get search suggestions');
        });
    });

    describe('getPopularSearches', () => {
        const mockPopularSearches = [
            'pizza',
            'burger',
            'sushi',
            'kebab',
            'pasta'
        ];

        it('successfully gets popular searches', async () => {
            api.get.mockResolvedValueOnce({ data: mockPopularSearches });

            const result = await searchService.getPopularSearches();

            expect(api.get).toHaveBeenCalledWith('/search/popular');
            expect(cacheService.set).toHaveBeenCalledWith(
                'popular_searches',
                mockPopularSearches
            );
            expect(result).toEqual(mockPopularSearches);
        });

        it('returns cached popular searches if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockPopularSearches);

            const result = await searchService.getPopularSearches();

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockPopularSearches);
        });

        it('handles error when getting popular searches', async () => {
            const error = new Error('Failed to get popular searches');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(searchService.getPopularSearches())
                .rejects.toThrow('Failed to get popular searches');
        });
    });

    describe('getRecentSearches', () => {
        const mockUserId = 1;
        const mockRecentSearches = [
            {
                id: 1,
                query: 'pizza',
                timestamp: '2024-03-20T10:00:00Z'
            },
            {
                id: 2,
                query: 'burger',
                timestamp: '2024-03-19T15:30:00Z'
            }
        ];

        it('successfully gets recent searches', async () => {
            api.get.mockResolvedValueOnce({ data: mockRecentSearches });

            const result = await searchService.getRecentSearches(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/recent-searches`);
            expect(result).toEqual(mockRecentSearches);
        });

        it('handles error when getting recent searches', async () => {
            const error = new Error('Failed to get recent searches');
            api.get.mockRejectedValueOnce(error);

            await expect(searchService.getRecentSearches(mockUserId))
                .rejects.toThrow('Failed to get recent searches');
        });
    });

    describe('clearRecentSearches', () => {
        const mockUserId = 1;
        const mockResponse = {
            message: 'Recent searches cleared successfully'
        };

        it('successfully clears recent searches', async () => {
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await searchService.clearRecentSearches(mockUserId);

            expect(api.delete).toHaveBeenCalledWith(`/users/${mockUserId}/recent-searches`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when clearing recent searches', async () => {
            const error = new Error('Failed to clear recent searches');
            api.delete.mockRejectedValueOnce(error);

            await expect(searchService.clearRecentSearches(mockUserId))
                .rejects.toThrow('Failed to clear recent searches');
        });
    });
}); 