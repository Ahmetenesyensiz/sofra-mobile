import deviceService from '../services/deviceService';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

// Mock DeviceInfo
jest.mock('react-native-device-info', () => ({
    getBrand: jest.fn(),
    getModel: jest.fn(),
    getSystemName: jest.fn(),
    getSystemVersion: jest.fn(),
    getUniqueId: jest.fn(),
    getDeviceId: jest.fn(),
    getDeviceName: jest.fn(),
    getBuildNumber: jest.fn(),
    getVersion: jest.fn(),
    getApplicationName: jest.fn(),
    getBundleId: jest.fn(),
    getReadableVersion: jest.fn(),
    getDeviceType: jest.fn(),
    isTablet: jest.fn(),
    isEmulator: jest.fn(),
    getFontScale: jest.fn(),
    getTotalMemory: jest.fn(),
    getUsedMemory: jest.fn(),
    getTotalDiskCapacity: jest.fn(),
    getFreeDiskStorage: jest.fn(),
    getBatteryLevel: jest.fn(),
    isPowerSaveMode: jest.fn(),
    isLowPowerMode: jest.fn(),
    getCarrier: jest.fn(),
    getTimezone: jest.fn(),
    isAirplaneMode: jest.fn(),
    isPinOrFingerprintSet: jest.fn(),
    hasNotch: jest.fn(),
    getFirstInstallTime: jest.fn(),
    getLastUpdateTime: jest.fn(),
    getInstallReferrer: jest.fn(),
    getCameraPresets: jest.fn(),
    getAvailableLocationProviders: jest.fn()
}));

describe('DeviceService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getDeviceInfo', () => {
        it('successfully gets device info', async () => {
            const mockDeviceInfo = {
                brand: 'Apple',
                model: 'iPhone 13',
                systemName: 'iOS',
                systemVersion: '15.0',
                uniqueId: 'unique-device-id',
                deviceId: 'device-id',
                deviceName: 'iPhone',
                buildNumber: '1',
                version: '1.0.0',
                applicationName: 'Sofra',
                bundleId: 'com.sofra.app',
                readableVersion: '1.0.0 (1)',
                deviceType: 'Handset',
                isTablet: false,
                isEmulator: false
            };

            DeviceInfo.getBrand.mockResolvedValueOnce(mockDeviceInfo.brand);
            DeviceInfo.getModel.mockResolvedValueOnce(mockDeviceInfo.model);
            DeviceInfo.getSystemName.mockResolvedValueOnce(mockDeviceInfo.systemName);
            DeviceInfo.getSystemVersion.mockResolvedValueOnce(mockDeviceInfo.systemVersion);
            DeviceInfo.getUniqueId.mockResolvedValueOnce(mockDeviceInfo.uniqueId);
            DeviceInfo.getDeviceId.mockResolvedValueOnce(mockDeviceInfo.deviceId);
            DeviceInfo.getDeviceName.mockResolvedValueOnce(mockDeviceInfo.deviceName);
            DeviceInfo.getBuildNumber.mockResolvedValueOnce(mockDeviceInfo.buildNumber);
            DeviceInfo.getVersion.mockResolvedValueOnce(mockDeviceInfo.version);
            DeviceInfo.getApplicationName.mockResolvedValueOnce(mockDeviceInfo.applicationName);
            DeviceInfo.getBundleId.mockResolvedValueOnce(mockDeviceInfo.bundleId);
            DeviceInfo.getReadableVersion.mockResolvedValueOnce(mockDeviceInfo.readableVersion);
            DeviceInfo.getDeviceType.mockResolvedValueOnce(mockDeviceInfo.deviceType);
            DeviceInfo.isTablet.mockResolvedValueOnce(mockDeviceInfo.isTablet);
            DeviceInfo.isEmulator.mockResolvedValueOnce(mockDeviceInfo.isEmulator);

            const result = await deviceService.getDeviceInfo();

            expect(result).toEqual(mockDeviceInfo);
        });

        it('handles error when getting device info', async () => {
            const error = new Error('Failed to get device info');
            DeviceInfo.getBrand.mockRejectedValueOnce(error);

            await expect(deviceService.getDeviceInfo())
                .rejects.toThrow('Failed to get device info');
        });
    });

    describe('getDeviceMetrics', () => {
        it('successfully gets device metrics', async () => {
            const mockMetrics = {
                fontScale: 1.0,
                totalMemory: 4096,
                usedMemory: 2048,
                totalDiskCapacity: 128000,
                freeDiskStorage: 64000,
                batteryLevel: 0.75,
                isPowerSaveMode: false,
                isLowPowerMode: false
            };

            DeviceInfo.getFontScale.mockResolvedValueOnce(mockMetrics.fontScale);
            DeviceInfo.getTotalMemory.mockResolvedValueOnce(mockMetrics.totalMemory);
            DeviceInfo.getUsedMemory.mockResolvedValueOnce(mockMetrics.usedMemory);
            DeviceInfo.getTotalDiskCapacity.mockResolvedValueOnce(mockMetrics.totalDiskCapacity);
            DeviceInfo.getFreeDiskStorage.mockResolvedValueOnce(mockMetrics.freeDiskStorage);
            DeviceInfo.getBatteryLevel.mockResolvedValueOnce(mockMetrics.batteryLevel);
            DeviceInfo.isPowerSaveMode.mockResolvedValueOnce(mockMetrics.isPowerSaveMode);
            DeviceInfo.isLowPowerMode.mockResolvedValueOnce(mockMetrics.isLowPowerMode);

            const result = await deviceService.getDeviceMetrics();

            expect(result).toEqual(mockMetrics);
        });

        it('handles error when getting device metrics', async () => {
            const error = new Error('Failed to get device metrics');
            DeviceInfo.getFontScale.mockRejectedValueOnce(error);

            await expect(deviceService.getDeviceMetrics())
                .rejects.toThrow('Failed to get device metrics');
        });
    });

    describe('getDeviceSettings', () => {
        it('successfully gets device settings', async () => {
            const mockSettings = {
                carrier: 'Test Carrier',
                timezone: 'Europe/Istanbul',
                isAirplaneMode: false,
                isPinOrFingerprintSet: true,
                hasNotch: true
            };

            DeviceInfo.getCarrier.mockResolvedValueOnce(mockSettings.carrier);
            DeviceInfo.getTimezone.mockResolvedValueOnce(mockSettings.timezone);
            DeviceInfo.isAirplaneMode.mockResolvedValueOnce(mockSettings.isAirplaneMode);
            DeviceInfo.isPinOrFingerprintSet.mockResolvedValueOnce(mockSettings.isPinOrFingerprintSet);
            DeviceInfo.hasNotch.mockResolvedValueOnce(mockSettings.hasNotch);

            const result = await deviceService.getDeviceSettings();

            expect(result).toEqual(mockSettings);
        });

        it('handles error when getting device settings', async () => {
            const error = new Error('Failed to get device settings');
            DeviceInfo.getCarrier.mockRejectedValueOnce(error);

            await expect(deviceService.getDeviceSettings())
                .rejects.toThrow('Failed to get device settings');
        });
    });

    describe('getAppInfo', () => {
        it('successfully gets app info', async () => {
            const mockAppInfo = {
                firstInstallTime: '2024-01-01T00:00:00Z',
                lastUpdateTime: '2024-03-20T00:00:00Z',
                installReferrer: 'https://play.google.com/store/apps/details?id=com.sofra.app',
                cameraPresets: ['photo', 'video'],
                availableLocationProviders: ['gps', 'network']
            };

            DeviceInfo.getFirstInstallTime.mockResolvedValueOnce(mockAppInfo.firstInstallTime);
            DeviceInfo.getLastUpdateTime.mockResolvedValueOnce(mockAppInfo.lastUpdateTime);
            DeviceInfo.getInstallReferrer.mockResolvedValueOnce(mockAppInfo.installReferrer);
            DeviceInfo.getCameraPresets.mockResolvedValueOnce(mockAppInfo.cameraPresets);
            DeviceInfo.getAvailableLocationProviders.mockResolvedValueOnce(mockAppInfo.availableLocationProviders);

            const result = await deviceService.getAppInfo();

            expect(result).toEqual(mockAppInfo);
        });

        it('handles error when getting app info', async () => {
            const error = new Error('Failed to get app info');
            DeviceInfo.getFirstInstallTime.mockRejectedValueOnce(error);

            await expect(deviceService.getAppInfo())
                .rejects.toThrow('Failed to get app info');
        });
    });

    describe('isEmulator', () => {
        it('returns true for emulator', async () => {
            DeviceInfo.isEmulator.mockResolvedValueOnce(true);

            const result = await deviceService.isEmulator();

            expect(DeviceInfo.isEmulator).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('returns false for real device', async () => {
            DeviceInfo.isEmulator.mockResolvedValueOnce(false);

            const result = await deviceService.isEmulator();

            expect(DeviceInfo.isEmulator).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('handles error when checking emulator status', async () => {
            const error = new Error('Failed to check emulator status');
            DeviceInfo.isEmulator.mockRejectedValueOnce(error);

            await expect(deviceService.isEmulator())
                .rejects.toThrow('Failed to check emulator status');
        });
    });

    describe('isTablet', () => {
        it('returns true for tablet', async () => {
            DeviceInfo.isTablet.mockResolvedValueOnce(true);

            const result = await deviceService.isTablet();

            expect(DeviceInfo.isTablet).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('returns false for phone', async () => {
            DeviceInfo.isTablet.mockResolvedValueOnce(false);

            const result = await deviceService.isTablet();

            expect(DeviceInfo.isTablet).toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('handles error when checking tablet status', async () => {
            const error = new Error('Failed to check tablet status');
            DeviceInfo.isTablet.mockRejectedValueOnce(error);

            await expect(deviceService.isTablet())
                .rejects.toThrow('Failed to check tablet status');
        });
    });
}); 