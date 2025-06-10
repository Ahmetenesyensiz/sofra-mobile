import reviewService from '../services/reviewService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('ReviewService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getRestaurantReviews', () => {
        const mockRestaurantId = 1;
        const mockReviews = [
            {
                id: 1,
                userId: 101,
                userName: 'John Doe',
                rating: 4.5,
                comment: 'Great food and service!',
                images: ['review1.jpg', 'review2.jpg'],
                likes: 10,
                createdAt: '2024-03-20T10:00:00Z'
            },
            {
                id: 2,
                userId: 102,
                userName: 'Jane Smith',
                rating: 3.5,
                comment: 'Good experience overall',
                images: [],
                likes: 5,
                createdAt: '2024-03-19T15:30:00Z'
            }
        ];

        it('successfully fetches restaurant reviews', async () => {
            api.get.mockResolvedValueOnce({ data: mockReviews });

            const result = await reviewService.getRestaurantReviews(mockRestaurantId);

            expect(api.get).toHaveBeenCalledWith(`/restaurants/${mockRestaurantId}/reviews`);
            expect(result).toEqual(mockReviews);
        });

        it('handles error when fetching reviews', async () => {
            const error = new Error('Failed to fetch reviews');
            api.get.mockRejectedValueOnce(error);

            await expect(reviewService.getRestaurantReviews(mockRestaurantId))
                .rejects.toThrow('Failed to fetch reviews');
        });
    });

    describe('addRestaurantReview', () => {
        const mockRestaurantId = 1;
        const mockReview = {
            rating: 4.5,
            comment: 'Excellent experience!',
            images: ['review1.jpg', 'review2.jpg']
        };

        const mockResponse = {
            id: 1,
            userId: 101,
            userName: 'John Doe',
            ...mockReview,
            likes: 0,
            createdAt: '2024-03-20T10:00:00Z'
        };

        it('successfully adds restaurant review', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await reviewService.addRestaurantReview(mockRestaurantId, mockReview);

            expect(api.post).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/reviews`,
                mockReview
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`restaurant_${mockRestaurantId}_reviews`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when adding review', async () => {
            const error = new Error('Failed to add review');
            api.post.mockRejectedValueOnce(error);

            await expect(reviewService.addRestaurantReview(mockRestaurantId, mockReview))
                .rejects.toThrow('Failed to add review');
        });
    });

    describe('updateRestaurantReview', () => {
        const mockRestaurantId = 1;
        const mockReviewId = 1;
        const mockUpdate = {
            rating: 5,
            comment: 'Updated review comment',
            images: ['review1.jpg']
        };

        const mockResponse = {
            id: mockReviewId,
            userId: 101,
            userName: 'John Doe',
            ...mockUpdate,
            likes: 10,
            createdAt: '2024-03-20T10:00:00Z'
        };

        it('successfully updates restaurant review', async () => {
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await reviewService.updateRestaurantReview(
                mockRestaurantId,
                mockReviewId,
                mockUpdate
            );

            expect(api.put).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/reviews/${mockReviewId}`,
                mockUpdate
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`restaurant_${mockRestaurantId}_reviews`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when updating review', async () => {
            const error = new Error('Failed to update review');
            api.put.mockRejectedValueOnce(error);

            await expect(reviewService.updateRestaurantReview(
                mockRestaurantId,
                mockReviewId,
                mockUpdate
            )).rejects.toThrow('Failed to update review');
        });
    });

    describe('deleteRestaurantReview', () => {
        const mockRestaurantId = 1;
        const mockReviewId = 1;

        it('successfully deletes restaurant review', async () => {
            const mockResponse = { success: true };
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await reviewService.deleteRestaurantReview(mockRestaurantId, mockReviewId);

            expect(api.delete).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/reviews/${mockReviewId}`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`restaurant_${mockRestaurantId}_reviews`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when deleting review', async () => {
            const error = new Error('Failed to delete review');
            api.delete.mockRejectedValueOnce(error);

            await expect(reviewService.deleteRestaurantReview(mockRestaurantId, mockReviewId))
                .rejects.toThrow('Failed to delete review');
        });
    });

    describe('likeReview', () => {
        const mockRestaurantId = 1;
        const mockReviewId = 1;

        it('successfully likes a review', async () => {
            const mockResponse = { success: true, likes: 11 };
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await reviewService.likeReview(mockRestaurantId, mockReviewId);

            expect(api.post).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/reviews/${mockReviewId}/like`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`restaurant_${mockRestaurantId}_reviews`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when liking review', async () => {
            const error = new Error('Failed to like review');
            api.post.mockRejectedValueOnce(error);

            await expect(reviewService.likeReview(mockRestaurantId, mockReviewId))
                .rejects.toThrow('Failed to like review');
        });
    });

    describe('unlikeReview', () => {
        const mockRestaurantId = 1;
        const mockReviewId = 1;

        it('successfully unlikes a review', async () => {
            const mockResponse = { success: true, likes: 9 };
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await reviewService.unlikeReview(mockRestaurantId, mockReviewId);

            expect(api.delete).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/reviews/${mockReviewId}/like`
            );
            expect(cacheService.remove).toHaveBeenCalledWith(`restaurant_${mockRestaurantId}_reviews`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when unliking review', async () => {
            const error = new Error('Failed to unlike review');
            api.delete.mockRejectedValueOnce(error);

            await expect(reviewService.unlikeReview(mockRestaurantId, mockReviewId))
                .rejects.toThrow('Failed to unlike review');
        });
    });

    describe('reportReview', () => {
        const mockRestaurantId = 1;
        const mockReviewId = 1;
        const mockReport = {
            reason: 'inappropriate_content',
            description: 'This review contains offensive language'
        };

        it('successfully reports a review', async () => {
            const mockResponse = { success: true };
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await reviewService.reportReview(
                mockRestaurantId,
                mockReviewId,
                mockReport
            );

            expect(api.post).toHaveBeenCalledWith(
                `/restaurants/${mockRestaurantId}/reviews/${mockReviewId}/report`,
                mockReport
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles error when reporting review', async () => {
            const error = new Error('Failed to report review');
            api.post.mockRejectedValueOnce(error);

            await expect(reviewService.reportReview(
                mockRestaurantId,
                mockReviewId,
                mockReport
            )).rejects.toThrow('Failed to report review');
        });
    });

    describe('getUserReviews', () => {
        const mockUserId = 101;
        const mockReviews = [
            {
                id: 1,
                restaurantId: 1,
                restaurantName: 'Test Restaurant 1',
                rating: 4.5,
                comment: 'Great experience!',
                images: ['review1.jpg'],
                likes: 10,
                createdAt: '2024-03-20T10:00:00Z'
            },
            {
                id: 2,
                restaurantId: 2,
                restaurantName: 'Test Restaurant 2',
                rating: 3.5,
                comment: 'Good food',
                images: [],
                likes: 5,
                createdAt: '2024-03-19T15:30:00Z'
            }
        ];

        it('successfully fetches user reviews', async () => {
            api.get.mockResolvedValueOnce({ data: mockReviews });

            const result = await reviewService.getUserReviews(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/reviews`);
            expect(result).toEqual(mockReviews);
        });

        it('handles error when fetching user reviews', async () => {
            const error = new Error('Failed to fetch user reviews');
            api.get.mockRejectedValueOnce(error);

            await expect(reviewService.getUserReviews(mockUserId))
                .rejects.toThrow('Failed to fetch user reviews');
        });
    });
}); 