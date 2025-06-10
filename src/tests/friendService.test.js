import friendService from '../services/friendService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('FriendService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getFriends', () => {
        const mockFriends = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                profileImage: 'profile1.jpg'
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                profileImage: 'profile2.jpg'
            }
        ];

        it('fetches friends from API and caches them', async () => {
            api.get.mockResolvedValueOnce({ data: mockFriends });

            const result = await friendService.getFriends();

            expect(api.get).toHaveBeenCalledWith('/friends');
            expect(cacheService.set).toHaveBeenCalledWith('friends', mockFriends);
            expect(result).toEqual(mockFriends);
        });

        it('returns cached friends if available', async () => {
            cacheService.get.mockResolvedValueOnce(mockFriends);

            const result = await friendService.getFriends();

            expect(api.get).not.toHaveBeenCalled();
            expect(result).toEqual(mockFriends);
        });

        it('handles error when fetching friends', async () => {
            const error = new Error('Failed to fetch friends');
            cacheService.get.mockResolvedValueOnce(null);
            api.get.mockRejectedValueOnce(error);

            await expect(friendService.getFriends()).rejects.toThrow('Failed to fetch friends');
        });
    });

    describe('searchUsers', () => {
        const mockUsers = [
            {
                id: 3,
                name: 'Alice Johnson',
                email: 'alice@example.com',
                profileImage: 'profile3.jpg'
            }
        ];

        it('searches users with query', async () => {
            const query = 'alice';
            api.get.mockResolvedValueOnce({ data: mockUsers });

            const result = await friendService.searchUsers(query);

            expect(api.get).toHaveBeenCalledWith('/users/search', {
                params: { query }
            });
            expect(result).toEqual(mockUsers);
        });

        it('handles error when searching users', async () => {
            const error = new Error('Search failed');
            api.get.mockRejectedValueOnce(error);

            await expect(friendService.searchUsers('alice')).rejects.toThrow('Search failed');
        });
    });

    describe('sendFriendRequest', () => {
        const mockRequest = {
            id: 1,
            senderId: 1,
            receiverId: 3,
            status: 'PENDING',
            createdAt: '2024-03-20T10:00:00Z'
        };

        it('successfully sends friend request', async () => {
            api.post.mockResolvedValueOnce({ data: mockRequest });

            const result = await friendService.sendFriendRequest(3);

            expect(api.post).toHaveBeenCalledWith('/friends/requests', { receiverId: 3 });
            expect(result).toEqual(mockRequest);
        });

        it('handles error when sending friend request', async () => {
            const error = new Error('Failed to send friend request');
            api.post.mockRejectedValueOnce(error);

            await expect(friendService.sendFriendRequest(3)).rejects.toThrow('Failed to send friend request');
        });
    });

    describe('getFriendRequests', () => {
        const mockRequests = [
            {
                id: 1,
                senderId: 3,
                senderName: 'Alice Johnson',
                senderImage: 'profile3.jpg',
                status: 'PENDING',
                createdAt: '2024-03-20T10:00:00Z'
            }
        ];

        it('fetches friend requests from API', async () => {
            api.get.mockResolvedValueOnce({ data: mockRequests });

            const result = await friendService.getFriendRequests();

            expect(api.get).toHaveBeenCalledWith('/friends/requests');
            expect(result).toEqual(mockRequests);
        });

        it('handles error when fetching friend requests', async () => {
            const error = new Error('Failed to fetch friend requests');
            api.get.mockRejectedValueOnce(error);

            await expect(friendService.getFriendRequests()).rejects.toThrow('Failed to fetch friend requests');
        });
    });

    describe('acceptFriendRequest', () => {
        const mockResponse = {
            id: 1,
            status: 'ACCEPTED',
            updatedAt: '2024-03-20T10:05:00Z'
        };

        it('successfully accepts friend request', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await friendService.acceptFriendRequest(1);

            expect(api.post).toHaveBeenCalledWith('/friends/requests/1/accept');
            expect(result).toEqual(mockResponse);
            expect(cacheService.remove).toHaveBeenCalledWith('friends');
        });

        it('handles error when accepting friend request', async () => {
            const error = new Error('Failed to accept friend request');
            api.post.mockRejectedValueOnce(error);

            await expect(friendService.acceptFriendRequest(1)).rejects.toThrow('Failed to accept friend request');
        });
    });

    describe('rejectFriendRequest', () => {
        const mockResponse = {
            id: 1,
            status: 'REJECTED',
            updatedAt: '2024-03-20T10:05:00Z'
        };

        it('successfully rejects friend request', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await friendService.rejectFriendRequest(1);

            expect(api.post).toHaveBeenCalledWith('/friends/requests/1/reject');
            expect(result).toEqual(mockResponse);
        });

        it('handles error when rejecting friend request', async () => {
            const error = new Error('Failed to reject friend request');
            api.post.mockRejectedValueOnce(error);

            await expect(friendService.rejectFriendRequest(1)).rejects.toThrow('Failed to reject friend request');
        });
    });

    describe('removeFriend', () => {
        it('successfully removes friend', async () => {
            const mockResponse = { message: 'Friend removed successfully' };
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await friendService.removeFriend(2);

            expect(api.delete).toHaveBeenCalledWith('/friends/2');
            expect(result).toEqual(mockResponse);
            expect(cacheService.remove).toHaveBeenCalledWith('friends');
        });

        it('handles error when removing friend', async () => {
            const error = new Error('Failed to remove friend');
            api.delete.mockRejectedValueOnce(error);

            await expect(friendService.removeFriend(2)).rejects.toThrow('Failed to remove friend');
        });
    });

    describe('getFriendSuggestions', () => {
        const mockSuggestions = [
            {
                id: 4,
                name: 'Bob Wilson',
                email: 'bob@example.com',
                profileImage: 'profile4.jpg',
                mutualFriends: 3
            }
        ];

        it('fetches friend suggestions from API', async () => {
            api.get.mockResolvedValueOnce({ data: mockSuggestions });

            const result = await friendService.getFriendSuggestions();

            expect(api.get).toHaveBeenCalledWith('/friends/suggestions');
            expect(result).toEqual(mockSuggestions);
        });

        it('handles error when fetching friend suggestions', async () => {
            const error = new Error('Failed to fetch friend suggestions');
            api.get.mockRejectedValueOnce(error);

            await expect(friendService.getFriendSuggestions()).rejects.toThrow('Failed to fetch friend suggestions');
        });
    });

    describe('getMutualFriends', () => {
        const mockMutualFriends = [
            {
                id: 5,
                name: 'Charlie Brown',
                email: 'charlie@example.com',
                profileImage: 'profile5.jpg'
            }
        ];

        it('fetches mutual friends from API', async () => {
            api.get.mockResolvedValueOnce({ data: mockMutualFriends });

            const result = await friendService.getMutualFriends(3);

            expect(api.get).toHaveBeenCalledWith('/friends/3/mutual');
            expect(result).toEqual(mockMutualFriends);
        });

        it('handles error when fetching mutual friends', async () => {
            const error = new Error('Failed to fetch mutual friends');
            api.get.mockRejectedValueOnce(error);

            await expect(friendService.getMutualFriends(3)).rejects.toThrow('Failed to fetch mutual friends');
        });
    });
}); 