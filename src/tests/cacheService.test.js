import cacheService from '../services/cacheService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
}));

describe('CacheService', () => {
    beforeEach(() => {
        // Clear all mocks and cache before each test
        jest.clearAllMocks();
        cacheService.cache.clear();
    });

    describe('set', () => {
        it('sets data in both memory cache and AsyncStorage', async () => {
            const key = 'test-key';
            const data = { test: 'data' };
            const expiry = 1000;

            await cacheService.set(key, data, expiry);

            // Check memory cache
            expect(cacheService.cache.get(key)).toBeTruthy();
            expect(cacheService.cache.get(key).data).toEqual(data);

            // Check AsyncStorage
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                key,
                expect.stringContaining(JSON.stringify(data))
            );
        });

        it('handles set error', async () => {
            const key = 'test-key';
            const data = { test: 'data' };
            AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

            await cacheService.set(key, data);

            expect(cacheService.cache.get(key)).toBeUndefined();
        });
    });

    describe('get', () => {
        it('returns data from memory cache if available and not expired', async () => {
            const key = 'test-key';
            const data = { test: 'data' };
            const item = {
                data,
                timestamp: Date.now(),
                expiry: 1000,
            };

            cacheService.cache.set(key, item);

            const result = await cacheService.get(key);
            expect(result).toEqual(data);
            expect(AsyncStorage.getItem).not.toHaveBeenCalled();
        });

        it('returns data from AsyncStorage if not in memory cache', async () => {
            const key = 'test-key';
            const data = { test: 'data' };
            const item = {
                data,
                timestamp: Date.now(),
                expiry: 1000,
            };

            AsyncStorage.getItem.mockResolvedValue(JSON.stringify(item));

            const result = await cacheService.get(key);
            expect(result).toEqual(data);
            expect(cacheService.cache.get(key)).toBeTruthy();
        });

        it('returns null if data is expired', async () => {
            const key = 'test-key';
            const data = { test: 'data' };
            const item = {
                data,
                timestamp: Date.now() - 2000, // 2 seconds ago
                expiry: 1000,
            };

            AsyncStorage.getItem.mockResolvedValue(JSON.stringify(item));

            const result = await cacheService.get(key);
            expect(result).toBeNull();
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
        });

        it('returns null if data does not exist', async () => {
            const key = 'test-key';
            AsyncStorage.getItem.mockResolvedValue(null);

            const result = await cacheService.get(key);
            expect(result).toBeNull();
        });

        it('handles get error', async () => {
            const key = 'test-key';
            AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

            const result = await cacheService.get(key);
            expect(result).toBeNull();
        });
    });

    describe('remove', () => {
        it('removes data from both memory cache and AsyncStorage', async () => {
            const key = 'test-key';
            const data = { test: 'data' };
            cacheService.cache.set(key, { data, timestamp: Date.now(), expiry: 1000 });

            await cacheService.remove(key);

            expect(cacheService.cache.get(key)).toBeUndefined();
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
        });

        it('handles remove error', async () => {
            const key = 'test-key';
            AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

            await cacheService.remove(key);
            // Should not throw error
        });
    });

    describe('clear', () => {
        it('clears both memory cache and AsyncStorage', async () => {
            const key = 'test-key';
            const data = { test: 'data' };
            cacheService.cache.set(key, { data, timestamp: Date.now(), expiry: 1000 });

            await cacheService.clear();

            expect(cacheService.cache.size).toBe(0);
            expect(AsyncStorage.clear).toHaveBeenCalled();
        });

        it('handles clear error', async () => {
            AsyncStorage.clear.mockRejectedValue(new Error('Storage error'));

            await cacheService.clear();
            // Should not throw error
        });
    });

    describe('clearByPattern', () => {
        it('removes items matching pattern from both memory cache and AsyncStorage', async () => {
            const keys = ['test-1', 'test-2', 'other-1'];
            AsyncStorage.getAllKeys.mockResolvedValue(keys);

            await cacheService.clearByPattern('test-');

            expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(2);
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-1');
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-2');
        });

        it('handles clearByPattern error', async () => {
            AsyncStorage.getAllKeys.mockRejectedValue(new Error('Storage error'));

            await cacheService.clearByPattern('test-');
            // Should not throw error
        });
    });
}); 