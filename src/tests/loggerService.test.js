import loggerService from '../services/loggerService';
import storageService from '../services/storageService';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('../services/storageService');
jest.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: jest.fn(obj => obj.ios)
    }
}));

describe('LoggerService', () => {
    const mockLog = {
        level: 'info',
        message: 'Test message',
        timestamp: '2024-03-15T12:00:00Z',
        data: { key: 'value' }
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Reset console methods
        console.log = jest.fn();
        console.info = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();
    });

    describe('init', () => {
        it('successfully initializes logger service', async () => {
            storageService.getItem.mockResolvedValueOnce('debug');

            await loggerService.init();

            expect(storageService.getItem).toHaveBeenCalledWith('logLevel');
            expect(loggerService.getLogLevel()).toBe('debug');
        });

        it('uses default log level when no level in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            await loggerService.init();

            expect(storageService.getItem).toHaveBeenCalledWith('logLevel');
            expect(loggerService.getLogLevel()).toBe('info');
        });

        it('handles error during initialization', async () => {
            const error = new Error('Failed to initialize');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(loggerService.init())
                .rejects.toThrow('Failed to initialize');
        });
    });

    describe('setLogLevel', () => {
        it('successfully sets log level', async () => {
            storageService.setItem.mockResolvedValueOnce();

            await loggerService.setLogLevel('debug');

            expect(storageService.setItem).toHaveBeenCalledWith('logLevel', 'debug');
            expect(loggerService.getLogLevel()).toBe('debug');
        });

        it('handles error when setting log level', async () => {
            const error = new Error('Failed to set log level');
            storageService.setItem.mockRejectedValueOnce(error);

            await expect(loggerService.setLogLevel('debug'))
                .rejects.toThrow('Failed to set log level');
        });
    });

    describe('getLogLevel', () => {
        it('returns current log level', () => {
            loggerService.setLogLevel('debug');
            expect(loggerService.getLogLevel()).toBe('debug');
        });
    });

    describe('log', () => {
        it('logs message with info level', () => {
            loggerService.log('info', 'Test message', { key: 'value' });
            expect(console.info).toHaveBeenCalled();
        });

        it('logs message with warn level', () => {
            loggerService.log('warn', 'Test message', { key: 'value' });
            expect(console.warn).toHaveBeenCalled();
        });

        it('logs message with error level', () => {
            loggerService.log('error', 'Test message', { key: 'value' });
            expect(console.error).toHaveBeenCalled();
        });

        it('does not log when message level is below current log level', () => {
            loggerService.setLogLevel('warn');
            loggerService.log('info', 'Test message', { key: 'value' });
            expect(console.info).not.toHaveBeenCalled();
        });
    });

    describe('info', () => {
        it('logs info message', () => {
            loggerService.info('Test message', { key: 'value' });
            expect(console.info).toHaveBeenCalled();
        });
    });

    describe('warn', () => {
        it('logs warning message', () => {
            loggerService.warn('Test message', { key: 'value' });
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('error', () => {
        it('logs error message', () => {
            loggerService.error('Test message', { key: 'value' });
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('debug', () => {
        it('logs debug message', () => {
            loggerService.debug('Test message', { key: 'value' });
            expect(console.log).toHaveBeenCalled();
        });
    });

    describe('getLogs', () => {
        it('successfully gets logs', async () => {
            const mockLogs = [mockLog];
            storageService.getItem.mockResolvedValueOnce(mockLogs);

            const result = await loggerService.getLogs();

            expect(storageService.getItem).toHaveBeenCalledWith('logs');
            expect(result).toEqual(mockLogs);
        });

        it('returns empty array when no logs in storage', async () => {
            storageService.getItem.mockResolvedValueOnce(null);

            const result = await loggerService.getLogs();

            expect(storageService.getItem).toHaveBeenCalledWith('logs');
            expect(result).toEqual([]);
        });

        it('handles error when getting logs', async () => {
            const error = new Error('Failed to get logs');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(loggerService.getLogs())
                .rejects.toThrow('Failed to get logs');
        });
    });

    describe('clearLogs', () => {
        it('successfully clears logs', async () => {
            storageService.setItem.mockResolvedValueOnce();

            await loggerService.clearLogs();

            expect(storageService.setItem).toHaveBeenCalledWith('logs', []);
        });

        it('handles error when clearing logs', async () => {
            const error = new Error('Failed to clear logs');
            storageService.setItem.mockRejectedValueOnce(error);

            await expect(loggerService.clearLogs())
                .rejects.toThrow('Failed to clear logs');
        });
    });

    describe('exportLogs', () => {
        it('successfully exports logs', async () => {
            const mockLogs = [mockLog];
            storageService.getItem.mockResolvedValueOnce(mockLogs);

            const result = await loggerService.exportLogs();

            expect(storageService.getItem).toHaveBeenCalledWith('logs');
            expect(result).toBeDefined();
        });

        it('handles error when exporting logs', async () => {
            const error = new Error('Failed to export logs');
            storageService.getItem.mockRejectedValueOnce(error);

            await expect(loggerService.exportLogs())
                .rejects.toThrow('Failed to export logs');
        });
    });

    describe('formatLog', () => {
        it('formats log message correctly', () => {
            const formattedLog = loggerService.formatLog('info', 'Test message', { key: 'value' });
            expect(formattedLog).toHaveProperty('level', 'info');
            expect(formattedLog).toHaveProperty('message', 'Test message');
            expect(formattedLog).toHaveProperty('data', { key: 'value' });
            expect(formattedLog).toHaveProperty('timestamp');
        });
    });

    describe('isLogLevelEnabled', () => {
        it('returns true for enabled log levels', () => {
            loggerService.setLogLevel('debug');
            expect(loggerService.isLogLevelEnabled('info')).toBe(true);
            expect(loggerService.isLogLevelEnabled('warn')).toBe(true);
            expect(loggerService.isLogLevelEnabled('error')).toBe(true);
        });

        it('returns false for disabled log levels', () => {
            loggerService.setLogLevel('warn');
            expect(loggerService.isLogLevelEnabled('debug')).toBe(false);
            expect(loggerService.isLogLevelEnabled('info')).toBe(false);
        });
    });
}); 