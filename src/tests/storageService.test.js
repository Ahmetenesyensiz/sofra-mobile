import storageService from '../services/storageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn()
}));

describe('StorageService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('setItem', () => {
        it('successfully stores string value', async () => {
            const key = 'testKey';
            const value = 'testValue';
            AsyncStorage.setItem.mockResolvedValueOnce();

            await storageService.setItem(key, value);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(key, value);
        });

        it('successfully stores object value', async () => {
            const key = 'testKey';
            const value = { test: 'value' };
            AsyncStorage.setItem.mockResolvedValueOnce();

            await storageService.setItem(key, value);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
                key,
                JSON.stringify(value)
            );
        });

        it('handles error when storing value', async () => {
            const key = 'testKey';
            const value = 'testValue';
            const error = new Error('Failed to store value');
            AsyncStorage.setItem.mockRejectedValueOnce(error);

            await expect(storageService.setItem(key, value))
                .rejects.toThrow('Failed to store value');
        });
    });

    describe('getItem', () => {
        it('successfully retrieves string value', async () => {
            const key = 'testKey';
            const value = 'testValue';
            AsyncStorage.getItem.mockResolvedValueOnce(value);

            const result = await storageService.getItem(key);

            expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
            expect(result).toBe(value);
        });

        it('successfully retrieves and parses JSON value', async () => {
            const key = 'testKey';
            const value = { test: 'value' };
            AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(value));

            const result = await storageService.getItem(key);

            expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
            expect(result).toEqual(value);
        });

        it('returns null for non-existent key', async () => {
            const key = 'nonExistentKey';
            AsyncStorage.getItem.mockResolvedValueOnce(null);

            const result = await storageService.getItem(key);

            expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
            expect(result).toBeNull();
        });

        it('handles error when retrieving value', async () => {
            const key = 'testKey';
            const error = new Error('Failed to retrieve value');
            AsyncStorage.getItem.mockRejectedValueOnce(error);

            await expect(storageService.getItem(key))
                .rejects.toThrow('Failed to retrieve value');
        });
    });

    describe('removeItem', () => {
        it('successfully removes item', async () => {
            const key = 'testKey';
            AsyncStorage.removeItem.mockResolvedValueOnce();

            await storageService.removeItem(key);

            expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
        });

        it('handles error when removing item', async () => {
            const key = 'testKey';
            const error = new Error('Failed to remove item');
            AsyncStorage.removeItem.mockRejectedValueOnce(error);

            await expect(storageService.removeItem(key))
                .rejects.toThrow('Failed to remove item');
        });
    });

    describe('clear', () => {
        it('successfully clears all items', async () => {
            AsyncStorage.clear.mockResolvedValueOnce();

            await storageService.clear();

            expect(AsyncStorage.clear).toHaveBeenCalled();
        });

        it('handles error when clearing items', async () => {
            const error = new Error('Failed to clear items');
            AsyncStorage.clear.mockRejectedValueOnce(error);

            await expect(storageService.clear())
                .rejects.toThrow('Failed to clear items');
        });
    });

    describe('getAllKeys', () => {
        it('successfully retrieves all keys', async () => {
            const keys = ['key1', 'key2', 'key3'];
            AsyncStorage.getAllKeys.mockResolvedValueOnce(keys);

            const result = await storageService.getAllKeys();

            expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
            expect(result).toEqual(keys);
        });

        it('handles error when retrieving keys', async () => {
            const error = new Error('Failed to retrieve keys');
            AsyncStorage.getAllKeys.mockRejectedValueOnce(error);

            await expect(storageService.getAllKeys())
                .rejects.toThrow('Failed to retrieve keys');
        });
    });

    describe('multiGet', () => {
        it('successfully retrieves multiple items', async () => {
            const keys = ['key1', 'key2'];
            const values = [
                ['key1', 'value1'],
                ['key2', 'value2']
            ];
            AsyncStorage.multiGet.mockResolvedValueOnce(values);

            const result = await storageService.multiGet(keys);

            expect(AsyncStorage.multiGet).toHaveBeenCalledWith(keys);
            expect(result).toEqual(values);
        });

        it('handles error when retrieving multiple items', async () => {
            const keys = ['key1', 'key2'];
            const error = new Error('Failed to retrieve items');
            AsyncStorage.multiGet.mockRejectedValueOnce(error);

            await expect(storageService.multiGet(keys))
                .rejects.toThrow('Failed to retrieve items');
        });
    });

    describe('multiSet', () => {
        it('successfully stores multiple items', async () => {
            const keyValuePairs = [
                ['key1', 'value1'],
                ['key2', 'value2']
            ];
            AsyncStorage.multiSet.mockResolvedValueOnce();

            await storageService.multiSet(keyValuePairs);

            expect(AsyncStorage.multiSet).toHaveBeenCalledWith(keyValuePairs);
        });

        it('handles error when storing multiple items', async () => {
            const keyValuePairs = [
                ['key1', 'value1'],
                ['key2', 'value2']
            ];
            const error = new Error('Failed to store items');
            AsyncStorage.multiSet.mockRejectedValueOnce(error);

            await expect(storageService.multiSet(keyValuePairs))
                .rejects.toThrow('Failed to store items');
        });
    });

    describe('multiRemove', () => {
        it('successfully removes multiple items', async () => {
            const keys = ['key1', 'key2'];
            AsyncStorage.multiRemove.mockResolvedValueOnce();

            await storageService.multiRemove(keys);

            expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(keys);
        });

        it('handles error when removing multiple items', async () => {
            const keys = ['key1', 'key2'];
            const error = new Error('Failed to remove items');
            AsyncStorage.multiRemove.mockRejectedValueOnce(error);

            await expect(storageService.multiRemove(keys))
                .rejects.toThrow('Failed to remove items');
        });
    });
}); 