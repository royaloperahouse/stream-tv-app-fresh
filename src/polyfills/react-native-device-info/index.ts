import { NativeModules } from 'react-native';
import {
  getSupportedPlatformInfoFunctions,
  getSupportedPlatformInfoSync,
} from './internal';
import { DeviceInfoNativeModule } from './types';

let ROHDeviceInfo: DeviceInfoNativeModule | undefined =
  NativeModules.ROHDeviceInfo;

export const getVersion = () =>
  getSupportedPlatformInfoSync({
    memoKey: 'version',
    defaultValue: 'unknown',
    supportedPlatforms: ['android', 'ios', 'windows'],
    getter: () => ROHDeviceInfo?.appVersion,
  });

export const [getUniqueId, getUniqueIdSync] = getSupportedPlatformInfoFunctions(
  {
    memoKey: 'uniqueId',
    supportedPlatforms: ['android', 'ios', 'windows'],
    getter: async () => ROHDeviceInfo?.getUniqueId(),
    syncGetter: () => ROHDeviceInfo?.getUniqueIdSync(),
    defaultValue: 'unknown',
  },
);

export const getBuildNumber = () =>
  getSupportedPlatformInfoSync({
    memoKey: 'buildNumber',
    supportedPlatforms: ['android', 'ios', 'windows'],
    getter: () => ROHDeviceInfo?.buildNumber,
    defaultValue: 'unknown',
  });
