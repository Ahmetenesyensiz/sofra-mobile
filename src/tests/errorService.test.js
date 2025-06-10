import errorService from '../services/errorService';
import api from '../services/api';
import cacheService from '../services/cacheService';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/cacheService');

describe('ErrorService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('logError', () => {
        const mockError = {
            message: 'Failed to fetch data',
            stack: 'Error: Failed to fetch data\n    at fetchData (app.js:10:5)',
            type: 'API_ERROR',
            context: {
                endpoint: '/api/data',
                method: 'GET',
                params: { id: 1 }
            }
        };

        it('successfully logs error', async () => {
            api.post.mockResolvedValueOnce({ data: { success: true } });

            const result = await errorService.logError(mockError);

            expect(api.post).toHaveBeenCalledWith('/errors', mockError);
            expect(result).toEqual({ success: true });
        });

        it('handles error when logging error', async () => {
            const error = new Error('Failed to log error');
            api.post.mockRejectedValueOnce(error);

            await expect(errorService.logError(mockError))
                .rejects.toThrow('Failed to log error');
        });
    });

    describe('getErrorLogs', () => {
        const mockTimeRange = {
            start: '2024-03-01T00:00:00Z',
            end: '2024-03-20T23:59:59Z'
        };
        const mockFilters = {
            type: 'API_ERROR',
            severity: 'HIGH',
            status: 'UNRESOLVED'
        };
        const mockPagination = {
            page: 1,
            limit: 10
        };
        const mockErrorLogs = {
            errors: [
                {
                    id: 1,
                    message: 'Failed to fetch data',
                    type: 'API_ERROR',
                    severity: 'HIGH',
                    status: 'UNRESOLVED',
                    context: {
                        endpoint: '/api/data',
                        method: 'GET',
                        params: { id: 1 }
                    },
                    timestamp: '2024-03-20T10:00:00Z'
                },
                {
                    id: 2,
                    message: 'Invalid input data',
                    type: 'VALIDATION_ERROR',
                    severity: 'MEDIUM',
                    status: 'RESOLVED',
                    context: {
                        form: 'user-registration',
                        field: 'email'
                    },
                    timestamp: '2024-03-19T15:30:00Z'
                }
            ],
            total: 2,
            page: 1,
            totalPages: 1
        };

        it('successfully gets error logs', async () => {
            api.get.mockResolvedValueOnce({ data: mockErrorLogs });

            const result = await errorService.getErrorLogs(
                mockTimeRange,
                mockFilters,
                mockPagination
            );

            expect(api.get).toHaveBeenCalledWith('/errors', {
                params: {
                    ...mockTimeRange,
                    ...mockFilters,
                    page: mockPagination.page,
                    limit: mockPagination.limit
                }
            });
            expect(result).toEqual(mockErrorLogs);
        });

        it('handles error when getting error logs', async () => {
            const error = new Error('Failed to get error logs');
            api.get.mockRejectedValueOnce(error);

            await expect(errorService.getErrorLogs(
                mockTimeRange,
                mockFilters,
                mockPagination
            )).rejects.toThrow('Failed to get error logs');
        });
    });

    describe('updateErrorStatus', () => {
        const mockErrorId = 1;
        const mockStatus = 'RESOLVED';
        const mockResponse = {
            id: 1,
            message: 'Failed to fetch data',
            type: 'API_ERROR',
            severity: 'HIGH',
            status: 'RESOLVED',
            context: {
                endpoint: '/api/data',
                method: 'GET',
                params: { id: 1 }
            },
            timestamp: '2024-03-20T10:00:00Z',
            resolvedAt: '2024-03-20T10:15:00Z'
        };

        it('successfully updates error status', async () => {
            api.put.mockResolvedValueOnce({ data: mockResponse });

            const result = await errorService.updateErrorStatus(mockErrorId, mockStatus);

            expect(api.put).toHaveBeenCalledWith(`/errors/${mockErrorId}/status`, {
                status: mockStatus
            });
            expect(result).toEqual(mockResponse);
        });

        it('handles error when updating error status', async () => {
            const error = new Error('Failed to update error status');
            api.put.mockRejectedValueOnce(error);

            await expect(errorService.updateErrorStatus(mockErrorId, mockStatus))
                .rejects.toThrow('Failed to update error status');
        });
    });

    describe('getErrorStats', () => {
        const mockTimeRange = {
            start: '2024-03-01T00:00:00Z',
            end: '2024-03-20T23:59:59Z'
        };
        const mockStats = {
            totalErrors: 150,
            errorTypes: [
                { type: 'API_ERROR', count: 75 },
                { type: 'VALIDATION_ERROR', count: 45 },
                { type: 'NETWORK_ERROR', count: 30 }
            ],
            severityDistribution: [
                { severity: 'HIGH', count: 30 },
                { severity: 'MEDIUM', count: 75 },
                { severity: 'LOW', count: 45 }
            ],
            statusDistribution: [
                { status: 'UNRESOLVED', count: 45 },
                { status: 'IN_PROGRESS', count: 30 },
                { status: 'RESOLVED', count: 75 }
            ],
            errorTrend: [
                { date: '2024-03-01', count: 5 },
                { date: '2024-03-02', count: 8 },
                { date: '2024-03-03', count: 6 }
            ]
        };

        it('successfully gets error stats', async () => {
            api.get.mockResolvedValueOnce({ data: mockStats });

            const result = await errorService.getErrorStats(mockTimeRange);

            expect(api.get).toHaveBeenCalledWith('/errors/stats', {
                params: mockTimeRange
            });
            expect(result).toEqual(mockStats);
        });

        it('handles error when getting error stats', async () => {
            const error = new Error('Failed to get error stats');
            api.get.mockRejectedValueOnce(error);

            await expect(errorService.getErrorStats(mockTimeRange))
                .rejects.toThrow('Failed to get error stats');
        });
    });

    describe('getErrorDetails', () => {
        const mockErrorId = 1;
        const mockErrorDetails = {
            id: 1,
            message: 'Failed to fetch data',
            type: 'API_ERROR',
            severity: 'HIGH',
            status: 'UNRESOLVED',
            context: {
                endpoint: '/api/data',
                method: 'GET',
                params: { id: 1 }
            },
            stack: 'Error: Failed to fetch data\n    at fetchData (app.js:10:5)',
            timestamp: '2024-03-20T10:00:00Z',
            user: {
                id: 1,
                email: 'user@example.com'
            },
            device: {
                platform: 'ios',
                version: '15.0',
                model: 'iPhone 13'
            },
            app: {
                version: '1.0.0',
                build: '123'
            }
        };

        it('successfully gets error details', async () => {
            api.get.mockResolvedValueOnce({ data: mockErrorDetails });

            const result = await errorService.getErrorDetails(mockErrorId);

            expect(api.get).toHaveBeenCalledWith(`/errors/${mockErrorId}`);
            expect(result).toEqual(mockErrorDetails);
        });

        it('handles error when getting error details', async () => {
            const error = new Error('Failed to get error details');
            api.get.mockRejectedValueOnce(error);

            await expect(errorService.getErrorDetails(mockErrorId))
                .rejects.toThrow('Failed to get error details');
        });
    });

    describe('addErrorNote', () => {
        const mockErrorId = 1;
        const mockNote = {
            content: 'Fixed by updating API endpoint',
            type: 'RESOLUTION'
        };
        const mockResponse = {
            id: 1,
            errorId: 1,
            content: 'Fixed by updating API endpoint',
            type: 'RESOLUTION',
            createdAt: '2024-03-20T10:15:00Z',
            createdBy: {
                id: 1,
                name: 'John Doe'
            }
        };

        it('successfully adds error note', async () => {
            api.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await errorService.addErrorNote(mockErrorId, mockNote);

            expect(api.post).toHaveBeenCalledWith(
                `/errors/${mockErrorId}/notes`,
                mockNote
            );
            expect(result).toEqual(mockResponse);
        });

        it('handles error when adding error note', async () => {
            const error = new Error('Failed to add error note');
            api.post.mockRejectedValueOnce(error);

            await expect(errorService.addErrorNote(mockErrorId, mockNote))
                .rejects.toThrow('Failed to add error note');
        });
    });
}); 