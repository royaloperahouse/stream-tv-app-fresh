import { Platform } from 'react-native';

export type MemoType = { [key: string]: any };
export type Getter<T> = () => T;
export type PlatformArray = typeof Platform.OS[];

export type DeviceType =
  | 'Handset'
  | 'Tablet'
  | 'Tv'
  | 'Desktop'
  | 'GamingConsole'
  | 'unknown';

export interface GetSupportedPlatformInfoSyncParams<T> {
  getter: Getter<T>;
  supportedPlatforms: PlatformArray;
  defaultValue: T;
  memoKey?: string;
}

export interface GetSupportedPlatformInfoAsyncParams<T>
  extends Omit<GetSupportedPlatformInfoSyncParams<T>, 'getter'> {
  getter: Getter<Promise<T>>;
}

export interface GetSupportedPlatformInfoFunctionsParams<T>
  extends GetSupportedPlatformInfoAsyncParams<T> {
  syncGetter: Getter<T>;
}

export interface NativeConstants {
  appName: string;
  appVersion: string;
  brand: string;
  buildNumber: string;
  bundleId: string;
  deviceId: string;
  deviceType: DeviceType;
  isTablet: boolean;
  model: string;
  systemName: string;
  systemVersion: string;
}

export interface HiddenNativeMethods {
  getSupported32BitAbis: () => Promise<string[]>;
  getSupported32BitAbisSync: () => string[];
  getSupported64BitAbis: () => Promise<string[]>;
  getSupported64BitAbisSync: () => string[];
  getSupportedAbis: () => Promise<string[]>;
  getSupportedAbisSync: () => string[];
  getSystemManufacturer: () => Promise<string>;
  getSystemManufacturerSync: () => string;
}

export interface ExposedNativeMethods {
  getAndroidId: () => Promise<string>;
  getAndroidIdSync: () => string;
  getApiLevel: () => Promise<number>;
  getApiLevelSync: () => number;
  getBaseOs: () => Promise<string>;
  getBaseOsSync: () => string;
  getBuildId: () => Promise<string>;
  getBuildIdSync: () => string;
  getCodename: () => Promise<string>;
  getCodenameSync: () => string;
  getDevice: () => Promise<string>;
  getDeviceName: () => Promise<string>;
  getDeviceNameSync: () => string;
  getDeviceSync: () => string;
  getDeviceToken: () => Promise<string>;
  getDisplay: () => Promise<string>;
  getDisplaySync: () => string;
  getFontScale: () => Promise<number>;
  getFontScaleSync: () => number;
  getFreeDiskStorage: () => Promise<number>;
  getFreeDiskStorageOld: () => Promise<number>;
  getFreeDiskStorageSync: () => number;
  getFreeDiskStorageOldSync: () => number;
  getHardware: () => Promise<string>;
  getHardwareSync: () => string;
  getHost: () => Promise<string>;
  getHostSync: () => string;
  getIncremental: () => Promise<string>;
  getIncrementalSync: () => string;
  getIpAddress: () => Promise<string>;
  getIpAddressSync: () => string;
  getLastUpdateTime: () => Promise<number>;
  getLastUpdateTimeSync: () => number;
  getMacAddress: () => Promise<string>;
  getMacAddressSync: () => string;
  getMaxMemory: () => Promise<number>;
  getMaxMemorySync: () => number;
  getPreviewSdkInt: () => Promise<number>;
  getPreviewSdkIntSync: () => number;
  getProduct: () => Promise<string>;
  getProductSync: () => string;
  getSecurityPatch: () => Promise<string>;
  getSecurityPatchSync: () => string;
  getSerialNumber: () => Promise<string>;
  getSerialNumberSync: () => string;
  getSystemAvailableFeatures: () => Promise<string[]>;
  getSystemAvailableFeaturesSync: () => string[];
  getTags: () => Promise<string>;
  getTagsSync: () => string;
  getTotalDiskCapacity: () => Promise<number>;
  getTotalDiskCapacityOld: () => Promise<number>;
  getTotalDiskCapacitySync: () => number;
  getTotalDiskCapacityOldSync: () => number;
  getTotalMemory: () => Promise<number>;
  getTotalMemorySync: () => number;
  getType: () => Promise<string>;
  getTypeSync: () => string;
  getUniqueId: () => Promise<string>;
  getUniqueIdSync: () => string;
  getUsedMemory: () => Promise<number>;
  getUsedMemorySync: () => number;
  getUserAgent: () => Promise<string>;
  getUserAgentSync: () => string;
  getBrightness: () => Promise<number>;
  getBrightnessSync: () => number;
  hasGms: () => Promise<boolean>;
  hasGmsSync: () => boolean;
  hasHms: () => Promise<boolean>;
  hasHmsSync: () => boolean;
  hasSystemFeature: (feature: string) => Promise<boolean>;
  hasSystemFeatureSync: (feature: string) => boolean;
  isAirplaneMode: () => Promise<boolean>;
  isAirplaneModeSync: () => boolean;
  isEmulator: () => Promise<boolean>;
  isEmulatorSync: () => boolean;
  isHeadphonesConnected: () => Promise<boolean>;
  isHeadphonesConnectedSync: () => boolean;
  isLocationEnabled: () => Promise<boolean>;
  isLocationEnabledSync: () => boolean;
  isPinOrFingerprintSet: () => Promise<boolean>;
  isPinOrFingerprintSetSync: () => boolean;
  isMouseConnected: () => Promise<boolean>;
  isMouseConnectedSync: () => boolean;
  isKeyboardConnected: () => Promise<boolean>;
  isKeyboardConnectedSync: () => boolean;
  isTabletMode: () => Promise<boolean>;
  syncUniqueId: () => Promise<string>;
}

export interface DeviceInfoNativeModule
  extends NativeConstants,
    HiddenNativeMethods,
    Pick<ExposedNativeMethods, 'getUniqueId' | 'getUniqueIdSync'> {}
