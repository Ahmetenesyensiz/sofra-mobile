import networkService from '../services/networkService';
import NetInfo from '@react-native-community/netinfo';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn(),
    fetch: jest.fn(),
    removeEventListener: jest.fn()
}));

describe('NetworkService', () => {
    let mockListener;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        mockListener = jest.fn();
    });

    describe('addNetworkListener', () => {
        it('successfully adds network listener', () => {
            const unsubscribe = jest.fn();
            NetInfo.addEventListener.mockReturnValueOnce(unsubscribe);

            const result = networkService.addNetworkListener(mockListener);

            expect(NetInfo.addEventListener).toHaveBeenCalledWith(mockListener);
            expect(result).toBe(unsubscribe);
        });

        it('handles error when adding network listener', () => {
            const error = new Error('Failed to add network listener');
            NetInfo.addEventListener.mockImplementationOnce(() => {
                throw error;
            });

            expect(() => networkService.addNetworkListener(mockListener))
                .toThrow('Failed to add network listener');
        });
    });

    describe('removeNetworkListener', () => {
        it('successfully removes network listener', () => {
            const unsubscribe = jest.fn();
            NetInfo.removeEventListener.mockReturnValueOnce(unsubscribe);

            networkService.removeNetworkListener(unsubscribe);

            expect(NetInfo.removeEventListener).toHaveBeenCalledWith(unsubscribe);
        });

        it('handles error when removing network listener', () => {
            const unsubscribe = jest.fn();
            const error = new Error('Failed to remove network listener');
            NetInfo.removeEventListener.mockImplementationOnce(() => {
                throw error;
            });

            expect(() => networkService.removeNetworkListener(unsubscribe))
                .toThrow('Failed to remove network listener');
        });
    });

    describe('checkConnectivity', () => {
        it('successfully checks connectivity when online', async () => {
            const mockState = {
                isConnected: true,
                isInternetReachable: true,
                type: 'wifi'
            };
            NetInfo.fetch.mockResolvedValueOnce(mockState);

            const result = await networkService.checkConnectivity();

            expect(NetInfo.fetch).toHaveBeenCalled();
            expect(result).toEqual({
                isConnected: true,
                isInternetReachable: true,
                type: 'wifi'
            });
        });

        it('successfully checks connectivity when offline', async () => {
            const mockState = {
                isConnected: false,
                isInternetReachable: false,
                type: 'none'
            };
            NetInfo.fetch.mockResolvedValueOnce(mockState);

            const result = await networkService.checkConnectivity();

            expect(NetInfo.fetch).toHaveBeenCalled();
            expect(result).toEqual({
                isConnected: false,
                isInternetReachable: false,
                type: 'none'
            });
        });

        it('handles error when checking connectivity', async () => {
            const error = new Error('Failed to check connectivity');
            NetInfo.fetch.mockRejectedValueOnce(error);

            await expect(networkService.checkConnectivity())
                .rejects.toThrow('Failed to check connectivity');
        });
    });

    describe('isConnected', () => {
        it('returns true when connected', async () => {
            const mockState = {
                isConnected: true,
                isInternetReachable: true
            };
            NetInfo.fetch.mockResolvedValueOnce(mockState);

            const result = await networkService.isConnected();

            expect(NetInfo.fetch).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('returns false when not connected', async () => {
            const mockState = {
                isConnected: false,
                isInternetReachable: false
            };
            NetInfo.fetch.mockResolvedValueOnce(mockState);

            const result = await networkService.isConnected();

            expect(NetInfo.fetch).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('handles error when checking connection status', async () => {
            const error = new Error('Failed to check connection status');
            NetInfo.fetch.mockRejectedValueOnce(error);

            await expect(networkService.isConnected())
                .rejects.toThrow('Failed to check connection status');
        });
    });

    describe('getConnectionType', () => {
        it('successfully gets connection type', async () => {
            const mockState = {
                type: 'wifi',
                isConnected: true
            };
            NetInfo.fetch.mockResolvedValueOnce(mockState);

            const result = await networkService.getConnectionType();

            expect(NetInfo.fetch).toHaveBeenCalled();
            expect(result).toBe('wifi');
        });

        it('returns none when not connected', async () => {
            const mockState = {
                type: 'none',
                isConnected: false
            };
            NetInfo.fetch.mockResolvedValueOnce(mockState);

            const result = await networkService.getConnectionType();

            expect(NetInfo.fetch).toHaveBeenCalled();
            expect(result).toBe('none');
        });

        it('handles error when getting connection type', async () => {
            const error = new Error('Failed to get connection type');
            NetInfo.fetch.mockRejectedValueOnce(error);

            await expect(networkService.getConnectionType())
                .rejects.toThrow('Failed to get connection type');
        });
    });

    describe('getConnectionDetails', () => {
        it('successfully gets connection details for wifi', async () => {
            const mockState = {
                type: 'wifi',
                isConnected: true,
                isInternetReachable: true,
                details: {
                    ssid: 'TestWifi',
                    bssid: '00:11:22:33:44:55',
                    strength: 80
                }
            };
            NetInfo.fetch.mockResolvedValueOnce(mockState);

            const result = await networkService.getConnectionDetails();

            expect(NetInfo.fetch).toHaveBeenCalled();
            expect(result).toEqual({
                type: 'wifi',
                isConnected: true,
                isInternetReachable: true,
                details: {
                    ssid: 'TestWifi',
                    bssid: '00:11:22:33:44:55',
                    strength: 80
                }
            });
        });

        it('successfully gets connection details for cellular', async () => {
            const mockState = {
                type: 'cellular',
                isConnected: true,
                isInternetReachable: true,
                details: {
                    cellularGeneration: '4g',
                    carrier: 'Test Carrier'
                }
            };
            NetInfo.fetch.mockResolvedValueOnce(mockState);

            const result = await networkService.getConnectionDetails();

            expect(NetInfo.fetch).toHaveBeenCalled();
            expect(result).toEqual({
                type: 'cellular',
                isConnected: true,
                isInternetReachable: true,
                details: {
                    cellularGeneration: '4g',
                    carrier: 'Test Carrier'
                }
            });
        });

        it('handles error when getting connection details', async () => {
            const error = new Error('Failed to get connection details');
            NetInfo.fetch.mockRejectedValueOnce(error);

            await expect(networkService.getConnectionDetails())
                .rejects.toThrow('Failed to get connection details');
        });
    });
}); 