import permissionService from '../services/permissionService';
import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
    check: jest.fn(),
    request: jest.fn(),
    PERMISSIONS: {
        ANDROID: {
            ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
            ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
            CAMERA: 'android.permission.CAMERA',
            READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
            WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE'
        },
        IOS: {
            LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
            LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS',
            CAMERA: 'ios.permission.CAMERA',
            PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY'
        }
    },
    RESULTS: {
        UNAVAILABLE: 'unavailable',
        DENIED: 'denied',
        LIMITED: 'limited',
        GRANTED: 'granted',
        BLOCKED: 'blocked'
    }
}));

// Mock PermissionsAndroid
jest.mock('react-native', () => ({
    PermissionsAndroid: {
        PERMISSIONS: {
            ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
            ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
            CAMERA: 'android.permission.CAMERA',
            READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
            WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE'
        },
        RESULTS: {
            GRANTED: 'granted',
            DENIED: 'denied',
            NEVER_ASK_AGAIN: 'never_ask_again'
        },
        check: jest.fn(),
        request: jest.fn(),
        requestMultiple: jest.fn()
    },
    Platform: {
        OS: 'android',
        select: jest.fn(obj => obj.android)
    }
}));

describe('PermissionService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('checkPermission', () => {
        it('successfully checks permission on Android', async () => {
            Platform.OS = 'android';
            const permission = 'ACCESS_FINE_LOCATION';
            PermissionsAndroid.check.mockResolvedValueOnce(true);

            const result = await permissionService.checkPermission(permission);

            expect(PermissionsAndroid.check).toHaveBeenCalledWith(
                PermissionsAndroid.PERMISSIONS[permission]
            );
            expect(result).toBe(true);
        });

        it('successfully checks permission on iOS', async () => {
            Platform.OS = 'ios';
            const permission = 'CAMERA';
            check.mockResolvedValueOnce(RESULTS.GRANTED);

            const result = await permissionService.checkPermission(permission);

            expect(check).toHaveBeenCalledWith(PERMISSIONS.IOS[permission]);
            expect(result).toBe(true);
        });

        it('handles error when checking permission', async () => {
            const permission = 'CAMERA';
            const error = new Error('Failed to check permission');
            check.mockRejectedValueOnce(error);

            await expect(permissionService.checkPermission(permission))
                .rejects.toThrow('Failed to check permission');
        });
    });

    describe('requestPermission', () => {
        it('successfully requests permission on Android', async () => {
            Platform.OS = 'android';
            const permission = 'CAMERA';
            PermissionsAndroid.request.mockResolvedValueOnce(PermissionsAndroid.RESULTS.GRANTED);

            const result = await permissionService.requestPermission(permission);

            expect(PermissionsAndroid.request).toHaveBeenCalledWith(
                PermissionsAndroid.PERMISSIONS[permission]
            );
            expect(result).toBe(true);
        });

        it('successfully requests permission on iOS', async () => {
            Platform.OS = 'ios';
            const permission = 'CAMERA';
            request.mockResolvedValueOnce(RESULTS.GRANTED);

            const result = await permissionService.requestPermission(permission);

            expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS[permission]);
            expect(result).toBe(true);
        });

        it('handles denied permission', async () => {
            Platform.OS = 'ios';
            const permission = 'CAMERA';
            request.mockResolvedValueOnce(RESULTS.DENIED);

            const result = await permissionService.requestPermission(permission);

            expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS[permission]);
            expect(result).toBe(false);
        });

        it('handles blocked permission', async () => {
            Platform.OS = 'ios';
            const permission = 'CAMERA';
            request.mockResolvedValueOnce(RESULTS.BLOCKED);

            const result = await permissionService.requestPermission(permission);

            expect(request).toHaveBeenCalledWith(PERMISSIONS.IOS[permission]);
            expect(result).toBe(false);
        });

        it('handles error when requesting permission', async () => {
            const permission = 'CAMERA';
            const error = new Error('Failed to request permission');
            request.mockRejectedValueOnce(error);

            await expect(permissionService.requestPermission(permission))
                .rejects.toThrow('Failed to request permission');
        });
    });

    describe('requestMultiplePermissions', () => {
        it('successfully requests multiple permissions on Android', async () => {
            Platform.OS = 'android';
            const permissions = ['CAMERA', 'ACCESS_FINE_LOCATION'];
            const results = {
                [PermissionsAndroid.PERMISSIONS.CAMERA]: PermissionsAndroid.RESULTS.GRANTED,
                [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]: PermissionsAndroid.RESULTS.GRANTED
            };
            PermissionsAndroid.requestMultiple.mockResolvedValueOnce(results);

            const result = await permissionService.requestMultiplePermissions(permissions);

            expect(PermissionsAndroid.requestMultiple).toHaveBeenCalledWith(
                permissions.map(p => PermissionsAndroid.PERMISSIONS[p])
            );
            expect(result).toEqual({
                CAMERA: true,
                ACCESS_FINE_LOCATION: true
            });
        });

        it('successfully requests multiple permissions on iOS', async () => {
            Platform.OS = 'ios';
            const permissions = ['CAMERA', 'LOCATION_WHEN_IN_USE'];
            const results = {
                [PERMISSIONS.IOS.CAMERA]: RESULTS.GRANTED,
                [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE]: RESULTS.GRANTED
            };

            request
                .mockResolvedValueOnce(RESULTS.GRANTED)
                .mockResolvedValueOnce(RESULTS.GRANTED);

            const result = await permissionService.requestMultiplePermissions(permissions);

            expect(request).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                CAMERA: true,
                LOCATION_WHEN_IN_USE: true
            });
        });

        it('handles mixed permission results', async () => {
            Platform.OS = 'ios';
            const permissions = ['CAMERA', 'LOCATION_WHEN_IN_USE'];
            request
                .mockResolvedValueOnce(RESULTS.GRANTED)
                .mockResolvedValueOnce(RESULTS.DENIED);

            const result = await permissionService.requestMultiplePermissions(permissions);

            expect(request).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                CAMERA: true,
                LOCATION_WHEN_IN_USE: false
            });
        });

        it('handles error when requesting multiple permissions', async () => {
            const permissions = ['CAMERA', 'LOCATION_WHEN_IN_USE'];
            const error = new Error('Failed to request permissions');
            request.mockRejectedValueOnce(error);

            await expect(permissionService.requestMultiplePermissions(permissions))
                .rejects.toThrow('Failed to request permissions');
        });
    });

    describe('checkMultiplePermissions', () => {
        it('successfully checks multiple permissions on Android', async () => {
            Platform.OS = 'android';
            const permissions = ['CAMERA', 'ACCESS_FINE_LOCATION'];
            const results = {
                [PermissionsAndroid.PERMISSIONS.CAMERA]: true,
                [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]: true
            };
            PermissionsAndroid.check
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true);

            const result = await permissionService.checkMultiplePermissions(permissions);

            expect(PermissionsAndroid.check).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                CAMERA: true,
                ACCESS_FINE_LOCATION: true
            });
        });

        it('successfully checks multiple permissions on iOS', async () => {
            Platform.OS = 'ios';
            const permissions = ['CAMERA', 'LOCATION_WHEN_IN_USE'];
            check
                .mockResolvedValueOnce(RESULTS.GRANTED)
                .mockResolvedValueOnce(RESULTS.GRANTED);

            const result = await permissionService.checkMultiplePermissions(permissions);

            expect(check).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                CAMERA: true,
                LOCATION_WHEN_IN_USE: true
            });
        });

        it('handles mixed permission results', async () => {
            Platform.OS = 'ios';
            const permissions = ['CAMERA', 'LOCATION_WHEN_IN_USE'];
            check
                .mockResolvedValueOnce(RESULTS.GRANTED)
                .mockResolvedValueOnce(RESULTS.DENIED);

            const result = await permissionService.checkMultiplePermissions(permissions);

            expect(check).toHaveBeenCalledTimes(2);
            expect(result).toEqual({
                CAMERA: true,
                LOCATION_WHEN_IN_USE: false
            });
        });

        it('handles error when checking multiple permissions', async () => {
            const permissions = ['CAMERA', 'LOCATION_WHEN_IN_USE'];
            const error = new Error('Failed to check permissions');
            check.mockRejectedValueOnce(error);

            await expect(permissionService.checkMultiplePermissions(permissions))
                .rejects.toThrow('Failed to check permissions');
        });
    });
}); 