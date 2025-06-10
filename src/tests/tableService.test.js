import tableService from '../services/tableService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('TableService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getRestaurantTables', () => {
        const mockRestaurantId = 1;
        const mockTables = [
            {
                id: 1,
                number: 'T1',
                capacity: 4,
                status: 'AVAILABLE',
                location: 'indoor',
                qrCode: 'table1-qr.png'
            },
            {
                id: 2,
                number: 'T2',
                capacity: 6,
                status: 'OCCUPIED',
                location: 'outdoor',
                qrCode: 'table2-qr.png'
            }
        ];

        it('successfully fetches restaurant tables', async () => {
            api.get.mockResolvedValueOnce({ data: mockTables });

            const result = await tableService.getRestaurantTables(mockRestaurantId);

            expect(api.get).toHaveBeenCalledWith(`/restaurants/${mockRestaurantId}/tables`);
            expect(result).toEqual(mockTables);
        });

        it('handles error when fetching tables', async () => {
            const error = new Error('Failed to fetch tables');
            api.get.mockRejectedValueOnce(error);

            await expect(tableService.getRestaurantTables(mockRestaurantId))
                .rejects.toThrow('Failed to fetch tables');
        });
    });

    describe('getTableDetails', () => {
        const mockTableId = 1;
        const mockTableDetails = {
            id: 1,
            number: 'T1',
            capacity: 4,
            status: 'AVAILABLE',
            location: 'indoor',
            qrCode: 'table1-qr.png',
            currentOrder: null,
            reservations: []
        };

        it('successfully fetches table details', async () => {
            api.get.mockResolvedValueOnce({ data: mockTableDetails });

            const result = await tableService.getTableDetails(mockTableId);

            expect(api.get).toHaveBeenCalledWith(`/tables/${mockTableId}`);
            expect(result).toEqual(mockTableDetails);
        });

        it('handles error when fetching table details', async () => {
            const error = new Error('Failed to fetch table details');
            api.get.mockRejectedValueOnce(error);

            await expect(tableService.getTableDetails(mockTableId))
                .rejects.toThrow('Failed to fetch table details');
        });
    });

    describe('reserveTable', () => {
        const mockReservation = {
            tableId: 1,
            date: '2024-03-25',
            time: '19:00',
            partySize: 4,
            specialRequests: 'Window seat preferred'
        };

        const mockResponse = {
            id: 1,
            ...mockReservation,
            status: 'CONFIRMED',
            confirmationCode: 'RES123'
        };

        it('successfully reserves a table', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await tableService.reserveTable(mockReservation);

            expect(api.post).toHaveBeenCalledWith('/tables/reserve', mockReservation);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when reserving table', async () => {
            const error = new Error('Failed to reserve table');
            api.post.mockRejectedValueOnce(error);

            await expect(tableService.reserveTable(mockReservation))
                .rejects.toThrow('Failed to reserve table');
        });
    });

    describe('cancelReservation', () => {
        const mockReservationId = 1;

        it('successfully cancels a reservation', async () => {
            const mockResponse = { success: true };
            api.delete.mockResolvedValueOnce({ data: mockResponse });

            const result = await tableService.cancelReservation(mockReservationId);

            expect(api.delete).toHaveBeenCalledWith(`/tables/reservations/${mockReservationId}`);
            expect(result).toEqual(mockResponse);
        });

        it('handles error when canceling reservation', async () => {
            const error = new Error('Failed to cancel reservation');
            api.delete.mockRejectedValueOnce(error);

            await expect(tableService.cancelReservation(mockReservationId))
                .rejects.toThrow('Failed to cancel reservation');
        });
    });

    describe('getUserReservations', () => {
        const mockUserId = 101;
        const mockReservations = [
            {
                id: 1,
                tableId: 1,
                restaurantId: 1,
                restaurantName: 'Test Restaurant',
                date: '2024-03-25',
                time: '19:00',
                partySize: 4,
                status: 'CONFIRMED'
            },
            {
                id: 2,
                tableId: 2,
                restaurantId: 2,
                restaurantName: 'Another Restaurant',
                date: '2024-03-26',
                time: '20:00',
                partySize: 2,
                status: 'PENDING'
            }
        ];

        it('successfully fetches user reservations', async () => {
            api.get.mockResolvedValueOnce({ data: mockReservations });

            const result = await tableService.getUserReservations(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/reservations`);
            expect(result).toEqual(mockReservations);
        });

        it('handles error when fetching user reservations', async () => {
            const error = new Error('Failed to fetch reservations');
            api.get.mockRejectedValueOnce(error);

            await expect(tableService.getUserReservations(mockUserId))
                .rejects.toThrow('Failed to fetch reservations');
        });
    });

    describe('inviteToTable', () => {
        const mockTableId = 1;
        const mockInvitation = {
            userId: 102,
            message: 'Join us for dinner!'
        };

        it('successfully sends table invitation', async () => {
            const mockResponse = { success: true };
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await tableService.inviteToTable(mockTableId, mockInvitation);

            expect(api.post).toHaveBeenCalledWith(
                `/tables/${mockTableId}/invite`,
                mockInvitation
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles error when sending invitation', async () => {
            const error = new Error('Failed to send invitation');
            api.post.mockRejectedValueOnce(error);

            await expect(tableService.inviteToTable(mockTableId, mockInvitation))
                .rejects.toThrow('Failed to send invitation');
        });
    });

    describe('acceptTableInvitation', () => {
        const mockTableId = 1;
        const mockInvitationId = 1;

        it('successfully accepts table invitation', async () => {
            const mockResponse = { success: true };
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await tableService.acceptTableInvitation(mockTableId, mockInvitationId);

            expect(api.put).toHaveBeenCalledWith(
                `/tables/${mockTableId}/invitations/${mockInvitationId}/accept`
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles error when accepting invitation', async () => {
            const error = new Error('Failed to accept invitation');
            api.put.mockRejectedValueOnce(error);

            await expect(tableService.acceptTableInvitation(mockTableId, mockInvitationId))
                .rejects.toThrow('Failed to accept invitation');
        });
    });

    describe('rejectTableInvitation', () => {
        const mockTableId = 1;
        const mockInvitationId = 1;

        it('successfully rejects table invitation', async () => {
            const mockResponse = { success: true };
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await tableService.rejectTableInvitation(mockTableId, mockInvitationId);

            expect(api.put).toHaveBeenCalledWith(
                `/tables/${mockTableId}/invitations/${mockInvitationId}/reject`
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles error when rejecting invitation', async () => {
            const error = new Error('Failed to reject invitation');
            api.put.mockRejectedValueOnce(error);

            await expect(tableService.rejectTableInvitation(mockTableId, mockInvitationId))
                .rejects.toThrow('Failed to reject invitation');
        });
    });

    describe('getTableInvitations', () => {
        const mockUserId = 101;
        const mockInvitations = [
            {
                id: 1,
                tableId: 1,
                restaurantId: 1,
                restaurantName: 'Test Restaurant',
                inviterId: 102,
                inviterName: 'John Doe',
                message: 'Join us for dinner!',
                status: 'PENDING',
                createdAt: '2024-03-20T10:00:00Z'
            }
        ];

        it('successfully fetches table invitations', async () => {
            api.get.mockResolvedValueOnce({ data: mockInvitations });

            const result = await tableService.getTableInvitations(mockUserId);

            expect(api.get).toHaveBeenCalledWith(`/users/${mockUserId}/table-invitations`);
            expect(result).toEqual(mockInvitations);
        });

        it('handles error when fetching invitations', async () => {
            const error = new Error('Failed to fetch invitations');
            api.get.mockRejectedValueOnce(error);

            await expect(tableService.getTableInvitations(mockUserId))
                .rejects.toThrow('Failed to fetch invitations');
        });
    });
}); 