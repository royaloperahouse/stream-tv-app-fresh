package com.rohtvapp.ROHDeviceInfo;

import com.rohtvapp.ROHDeviceInfo.DeviceIdResolver;
import com.rohtvapp.ROHDeviceInfo.DeviceTypeResolver;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.FeatureInfo;
import android.location.LocationManager;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiInfo;
import android.os.Build;
import android.os.Environment;
import android.os.PowerManager;
import android.os.StatFs;
import android.os.Debug;
import android.os.Process;
import android.provider.Settings;
import android.webkit.WebSettings;
import android.text.TextUtils;
import android.app.ActivityManager;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.lang.reflect.Method;
import java.net.InetAddress;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.lang.Runtime;
import java.net.NetworkInterface;
import java.math.BigInteger;
import java.util.Locale;
import java.util.Map;

import javax.annotation.Nonnull;

import static android.provider.Settings.Secure.getString;

@ReactModule(name = ROHDeviceInfoModule.NAME)
public class ROHDeviceInfoModule extends ReactContextBaseJavaModule {
  public static final String NAME = "ROHDeviceInfo";
  private final DeviceTypeResolver deviceTypeResolver;
  private final DeviceIdResolver deviceIdResolver;

  public ROHDeviceInfoModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.deviceTypeResolver = new DeviceTypeResolver(reactContext);
    this.deviceIdResolver = new DeviceIdResolver(reactContext);
  }

  @Override
  public void initialize() {}

  @Override
  public void onCatalystInstanceDestroy() {}

  @Override
  @Nonnull
  public String getName() {
    return NAME;
  }

  @SuppressLint("MissingPermission")
  private WifiInfo getWifiInfo() {
    WifiManager manager = (WifiManager) getReactApplicationContext().getApplicationContext().getSystemService(Context.WIFI_SERVICE);
    if (manager != null) {
      return manager.getConnectionInfo();
    }
    return null;
  }

  @Override
  public Map<String, Object> getConstants() {
    String appVersion, buildNumber, appName;

    try {
      appVersion = getPackageInfo().versionName;
      buildNumber = Integer.toString(getPackageInfo().versionCode);
      appName = getReactApplicationContext().getApplicationInfo().loadLabel(getReactApplicationContext().getPackageManager()).toString();
    } catch (Exception e) {
      appVersion = "unknown";
      buildNumber = "unknown";
      appName = "unknown";
    }

    final Map<String, Object> constants = new HashMap<>();

    constants.put("deviceId", Build.BOARD);
    constants.put("bundleId", getReactApplicationContext().getPackageName());
    constants.put("systemName", "Android");
    constants.put("systemVersion", Build.VERSION.RELEASE);
    constants.put("appVersion", appVersion);
    constants.put("buildNumber", buildNumber);
    constants.put("isTablet", deviceTypeResolver.isTablet());
    constants.put("appName", appName);
    constants.put("brand", Build.BRAND);
    constants.put("model", Build.MODEL);
    constants.put("deviceType", deviceTypeResolver.getDeviceType().getValue());

    return constants;
  }

  @ReactMethod
  public void addListener(String eventName) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  public void removeListeners(Integer count) {
    // Keep: Required for RN built in Event Emitter Calls.
  }

  @ReactMethod
  public void isEmulator(Promise p) {
    p.resolve(isEmulatorSync());
  }

  @SuppressLint("HardwareIds")
  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean isEmulatorSync() {
    return Build.FINGERPRINT.startsWith("generic")
            || Build.FINGERPRINT.startsWith("unknown")
            || Build.MODEL.contains("google_sdk")
            || Build.MODEL.toLowerCase(Locale.ROOT).contains("droid4x")
            || Build.MODEL.contains("Emulator")
            || Build.MODEL.contains("Android SDK built for x86")
            || Build.MANUFACTURER.contains("Genymotion")
            || Build.HARDWARE.contains("goldfish")
            || Build.HARDWARE.contains("ranchu")
            || Build.HARDWARE.contains("vbox86")
            || Build.PRODUCT.contains("sdk")
            || Build.PRODUCT.contains("google_sdk")
            || Build.PRODUCT.contains("sdk_google")
            || Build.PRODUCT.contains("sdk_x86")
            || Build.PRODUCT.contains("vbox86p")
            || Build.PRODUCT.contains("emulator")
            || Build.PRODUCT.contains("simulator")
            || Build.BOARD.toLowerCase(Locale.ROOT).contains("nox")
            || Build.BOOTLOADER.toLowerCase(Locale.ROOT).contains("nox")
            || Build.HARDWARE.toLowerCase(Locale.ROOT).contains("nox")
            || Build.PRODUCT.toLowerCase(Locale.ROOT).contains("nox")
            || Build.SERIAL.toLowerCase(Locale.ROOT).contains("nox")
            || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"));
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public float getFontScaleSync() { return getReactApplicationContext().getResources().getConfiguration().fontScale; }
  @ReactMethod
  public void getFontScale(Promise p) { p.resolve(getFontScaleSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean isPinOrFingerprintSetSync() {
    KeyguardManager keyguardManager = (KeyguardManager) getReactApplicationContext().getSystemService(Context.KEYGUARD_SERVICE);
    if (keyguardManager != null) {
      return keyguardManager.isKeyguardSecure();
    }
    System.err.println("Unable to determine keyguard status. KeyguardManager was null");
    return false;
  }
  @ReactMethod
  public void isPinOrFingerprintSet(Promise p) { p.resolve(isPinOrFingerprintSetSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  @SuppressWarnings("ConstantConditions")
  public String getIpAddressSync() {
    try {
      return
              InetAddress.getByAddress(
                      ByteBuffer
                              .allocate(4)
                              .order(ByteOrder.LITTLE_ENDIAN)
                              .putInt(getWifiInfo().getIpAddress())
                              .array())
                      .getHostAddress();
    } catch (Exception e) {
      return "unknown";
    }
  }

  @ReactMethod
  public void getIpAddress(Promise p) { p.resolve(getIpAddressSync()); }

  @SuppressLint("HardwareIds")
  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getMacAddressSync() {
    WifiInfo wifiInfo = getWifiInfo();
    String macAddress = "";
    if (wifiInfo != null) {
      macAddress = wifiInfo.getMacAddress();
    }

    String permission = "android.permission.INTERNET";
    int res = getReactApplicationContext().checkCallingOrSelfPermission(permission);

    if (res == PackageManager.PERMISSION_GRANTED) {
      try {
        List<NetworkInterface> all = Collections.list(NetworkInterface.getNetworkInterfaces());
        for (NetworkInterface nif : all) {
          if (!nif.getName().equalsIgnoreCase("wlan0")) continue;

          byte[] macBytes = nif.getHardwareAddress();
          if (macBytes == null) {
            macAddress = "";
          } else {

            StringBuilder res1 = new StringBuilder();
            for (byte b : macBytes) {
              res1.append(String.format("%02X:",b));
            }

            if (res1.length() > 0) {
              res1.deleteCharAt(res1.length() - 1);
            }

            macAddress = res1.toString();
          }
        }
      } catch (Exception ex) {
        // do nothing
      }
    }

    return macAddress;
  }

  @ReactMethod
  public void getMacAddress(Promise p) { p.resolve(getMacAddressSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public double getTotalDiskCapacitySync() {
    try {
      StatFs rootDir = new StatFs(Environment.getRootDirectory().getAbsolutePath());
      StatFs dataDir = new StatFs(Environment.getDataDirectory().getAbsolutePath());

      BigInteger rootDirCapacity = getDirTotalCapacity(rootDir);
      BigInteger dataDirCapacity = getDirTotalCapacity(dataDir);

      return rootDirCapacity.add(dataDirCapacity).doubleValue();
    } catch (Exception e) {
      return -1;
    }
  }
  @ReactMethod
  public void getTotalDiskCapacity(Promise p) { p.resolve(getTotalDiskCapacitySync()); }

  private BigInteger getDirTotalCapacity(StatFs dir) {
    boolean intApiDeprecated = Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2;
    long blockCount = intApiDeprecated ? dir.getBlockCountLong() : dir.getBlockCount();
    long blockSize = intApiDeprecated ? dir.getBlockSizeLong() : dir.getBlockSize();
    return BigInteger.valueOf(blockCount).multiply(BigInteger.valueOf(blockSize));
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public double getFreeDiskStorageSync() {
    try {
      StatFs rootDir = new StatFs(Environment.getRootDirectory().getAbsolutePath());
      StatFs dataDir = new StatFs(Environment.getDataDirectory().getAbsolutePath());

      Boolean intApiDeprecated = Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2;
      long rootAvailableBlocks = getTotalAvailableBlocks(rootDir, intApiDeprecated);
      long rootBlockSize = getBlockSize(rootDir, intApiDeprecated);
      double rootFree = BigInteger.valueOf(rootAvailableBlocks).multiply(BigInteger.valueOf(rootBlockSize)).doubleValue();

      long dataAvailableBlocks = getTotalAvailableBlocks(dataDir, intApiDeprecated);
      long dataBlockSize = getBlockSize(dataDir, intApiDeprecated);
      double dataFree = BigInteger.valueOf(dataAvailableBlocks).multiply(BigInteger.valueOf(dataBlockSize)).doubleValue();

      return rootFree + dataFree;
    } catch (Exception e) {
      return -1;
    }
  }
  @ReactMethod
  public void getFreeDiskStorage(Promise p) { p.resolve(getFreeDiskStorageSync()); }

  private long getTotalAvailableBlocks(StatFs dir, Boolean intApiDeprecated) {
    return (intApiDeprecated ? dir.getAvailableBlocksLong() : dir.getAvailableBlocks());
  }

  private long getBlockSize(StatFs dir, Boolean intApiDeprecated) {
    return (intApiDeprecated ? dir.getBlockSizeLong() : dir.getBlockSize());
  }

  @Deprecated
  @ReactMethod(isBlockingSynchronousMethod = true)
  public double getTotalDiskCapacityOldSync() {
    try {
      StatFs root = new StatFs(Environment.getRootDirectory().getAbsolutePath());
      return BigInteger.valueOf(root.getBlockCount()).multiply(BigInteger.valueOf(root.getBlockSize())).doubleValue();
    } catch (Exception e) {
      return -1;
    }
  }
  @ReactMethod
  public void getTotalDiskCapacityOld(Promise p) { p.resolve(getTotalDiskCapacityOldSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public double getFreeDiskStorageOldSync() {
    try {
      StatFs external = new StatFs(Environment.getExternalStorageDirectory().getAbsolutePath());
      long availableBlocks;
      long blockSize;

      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN_MR2) {
        availableBlocks = external.getAvailableBlocks();
        blockSize = external.getBlockSize();
      } else {
        availableBlocks = external.getAvailableBlocksLong();
        blockSize = external.getBlockSizeLong();
      }

      return BigInteger.valueOf(availableBlocks).multiply(BigInteger.valueOf(blockSize)).doubleValue();
    } catch (Exception e) {
      return -1;
    }
  }
  @ReactMethod
  public void getFreeDiskStorageOld(Promise p) { p.resolve(getFreeDiskStorageOldSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public double getUsedMemorySync() {
    ActivityManager actMgr = (ActivityManager) getReactApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
    if (actMgr != null) {
      int pid = android.os.Process.myPid();
      android.os.Debug.MemoryInfo[] memInfos = actMgr.getProcessMemoryInfo(new int[]{pid});

      if(memInfos.length != 1) {
        System.err.println("Unable to getProcessMemoryInfo. getProcessMemoryInfo did not return any info for the PID");
        return -1;
      }

      android.os.Debug.MemoryInfo memInfo = memInfos[0];

      return memInfo.getTotalPss() * 1024D;
    } else {
      System.err.println("Unable to getProcessMemoryInfo. ActivityManager was null");
      return -1;
    }
  }

  @ReactMethod
  public void getUsedMemory(Promise p) { p.resolve(getUsedMemorySync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean isAirplaneModeSync() {
    boolean isAirplaneMode;
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN_MR1) {
      isAirplaneMode = Settings.System.getInt(getReactApplicationContext().getContentResolver(),Settings.System.AIRPLANE_MODE_ON, 0) != 0;
    } else {
      isAirplaneMode = Settings.Global.getInt(getReactApplicationContext().getContentResolver(),Settings.Global.AIRPLANE_MODE_ON, 0) != 0;
    }
    return isAirplaneMode;
  }
  @ReactMethod
  public void isAirplaneMode(Promise p) { p.resolve(isAirplaneModeSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean hasGmsSync() {
    try {
      Class<?> googleApiAvailability = Class.forName("com.google.android.gms.common.GoogleApiAvailability");
      Method getInstanceMethod = googleApiAvailability.getMethod("getInstance");
      Object gmsObject = getInstanceMethod.invoke(null);
      Method isGooglePlayServicesAvailableMethod = gmsObject.getClass().getMethod("isGooglePlayServicesAvailable", Context.class);
      int isGMS = (int) isGooglePlayServicesAvailableMethod.invoke(gmsObject, getReactApplicationContext());
      return isGMS == 0; // ConnectionResult.SUCCESS
    } catch (Exception e) {
      return false;
    }
  }
  @ReactMethod
  public void hasGms(Promise p) { p.resolve(hasGmsSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean hasHmsSync() {
    try {
      Class<?> huaweiApiAvailability = Class.forName("com.huawei.hms.api.HuaweiApiAvailability");
      Method getInstanceMethod = huaweiApiAvailability.getMethod("getInstance");
      Object hmsObject = getInstanceMethod.invoke(null);
      Method isHuaweiMobileServicesAvailableMethod = hmsObject.getClass().getMethod("isHuaweiMobileServicesAvailable", Context.class);
      int isHMS = (int) isHuaweiMobileServicesAvailableMethod.invoke(hmsObject, getReactApplicationContext());
      return isHMS == 0; // ConnectionResult.SUCCESS
    } catch (Exception e) {
      return false;
    }
  }
  @ReactMethod
  public void hasHms(Promise p) { p.resolve(hasHmsSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean hasSystemFeatureSync(String feature) {
    if (feature == null || feature.equals("")) {
      return false;
    }

    return getReactApplicationContext().getPackageManager().hasSystemFeature(feature);
  }
  @ReactMethod
  public void hasSystemFeature(String feature, Promise p) { p.resolve(hasSystemFeatureSync(feature)); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableArray getSystemAvailableFeaturesSync() {
    final FeatureInfo[] featureList = getReactApplicationContext().getPackageManager().getSystemAvailableFeatures();

    WritableArray promiseArray = Arguments.createArray();
    for (FeatureInfo f : featureList) {
      if (f.name != null) {
        promiseArray.pushString(f.name);
      }
    }

    return promiseArray;
  }
  @ReactMethod
  public void getSystemAvailableFeatures(Promise p) { p.resolve(getSystemAvailableFeaturesSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean isLocationEnabledSync() {
    boolean locationEnabled;

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      LocationManager mLocationManager = (LocationManager) getReactApplicationContext().getSystemService(Context.LOCATION_SERVICE);
      try {
        locationEnabled = mLocationManager.isLocationEnabled();
      } catch (Exception e) {
        System.err.println("Unable to determine if location enabled. LocationManager was null");
        return false;
      }
    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      int locationMode = Settings.Secure.getInt(getReactApplicationContext().getContentResolver(), Settings.Secure.LOCATION_MODE, Settings.Secure.LOCATION_MODE_OFF);
      locationEnabled = locationMode != Settings.Secure.LOCATION_MODE_OFF;
    } else {
      String locationProviders = getString(getReactApplicationContext().getContentResolver(), Settings.Secure.LOCATION_PROVIDERS_ALLOWED);
      locationEnabled = !TextUtils.isEmpty(locationProviders);
    }

    return locationEnabled;
  }
  @ReactMethod
  public void isLocationEnabled(Promise p) { p.resolve(isLocationEnabledSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableMap getAvailableLocationProvidersSync() {
    LocationManager mLocationManager = (LocationManager) getReactApplicationContext().getSystemService(Context.LOCATION_SERVICE);
    WritableMap providersAvailability = Arguments.createMap();
    try {
      List<String> providers = mLocationManager.getProviders(false);
      for (String provider : providers) {
        providersAvailability.putBoolean(provider, mLocationManager.isProviderEnabled(provider));
      }
    } catch (Exception e) {
      System.err.println("Unable to get location providers. LocationManager was null");
    }

    return providersAvailability;
  }
  @ReactMethod
  public void getAvailableLocationProviders(Promise p) { p.resolve(getAvailableLocationProvidersSync()); }

  private PackageInfo getPackageInfo() throws Exception {
    return getReactApplicationContext().getPackageManager().getPackageInfo(getReactApplicationContext().getPackageName(), 0);
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public double getLastUpdateTimeSync() {
    try {
      return (double)getPackageInfo().lastUpdateTime;
    } catch (Exception e) {
      return -1;
    }
  }
  @ReactMethod
  public void getLastUpdateTime(Promise p) { p.resolve(getLastUpdateTimeSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getDeviceNameSync() {
    try {
      String bluetoothName = Settings.Secure.getString(getReactApplicationContext().getContentResolver(), "bluetooth_name");
      if (bluetoothName != null) {
        return bluetoothName;
      }

      if (Build.VERSION.SDK_INT >= 25) {
        String deviceName = Settings.Global.getString(getReactApplicationContext().getContentResolver(), Settings.Global.DEVICE_NAME);
        if (deviceName != null) {
          return deviceName;
        }
      }
    } catch (Exception e) {
      // same as default unknown return
    }
    return "unknown";
  }
  @ReactMethod
  public void getDeviceName(Promise p) { p.resolve(getDeviceNameSync()); }

  @SuppressLint({"HardwareIds", "MissingPermission"})
  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getSerialNumberSync() {
    try {
      if (Build.VERSION.SDK_INT >= 26) {
        // There are a lot of conditions to access to getSerial api
        // For details, see https://developer.android.com/reference/android/os/Build#getSerial()
        // Rather than check each one, just try and rely on the catch below, for discussion on this approach, refer to
        // https://github.com/react-native-device-info/react-native-device-info/issues/1320
        return Build.getSerial();
      } else {
        return Build.SERIAL;
      }
    } catch (Exception e) {
      // This is almost always a PermissionException. We will log it but return unknown
      System.err.println("getSerialNumber failed, it probably should not be used: " + e.getMessage());
    }

    return "unknown";
  }
  @ReactMethod
  public void getSerialNumber(Promise p) { p.resolve(getSerialNumberSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getDeviceSync() {  return Build.DEVICE; }
  @ReactMethod
  public void getDevice(Promise p) { p.resolve(getDeviceSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getBuildIdSync() { return Build.ID; }
  @ReactMethod
  public void getBuildId(Promise p) { p.resolve(getBuildIdSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public int getApiLevelSync() { return Build.VERSION.SDK_INT; }
  @ReactMethod
  public void getApiLevel(Promise p) { p.resolve(getApiLevelSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getBootloaderSync() { return Build.BOOTLOADER; }
  @ReactMethod
  public void getBootloader(Promise p) { p.resolve(getBootloaderSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getDisplaySync() { return Build.DISPLAY; }
  @ReactMethod
  public void getDisplay(Promise p) { p.resolve(getDisplaySync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getFingerprintSync() { return Build.FINGERPRINT; }
  @ReactMethod
  public void getFingerprint(Promise p) { p.resolve(getFingerprintSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getHardwareSync() { return Build.HARDWARE; }
  @ReactMethod
  public void getHardware(Promise p) { p.resolve(getHardwareSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getHostSync() { return Build.HOST; }
  @ReactMethod
  public void getHost(Promise p) { p.resolve(getHostSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getProductSync() { return Build.PRODUCT; }
  @ReactMethod
  public void getProduct(Promise p) { p.resolve(getProductSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getTagsSync() { return Build.TAGS; }
  @ReactMethod
  public void getTags(Promise p) { p.resolve(getTagsSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getTypeSync() { return Build.TYPE; }
  @ReactMethod
  public void getType(Promise p) { p.resolve(getTypeSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getSystemManufacturerSync() { return Build.MANUFACTURER; }
  @ReactMethod
  public void getSystemManufacturer(Promise p) { p.resolve(getSystemManufacturerSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getCodenameSync() { return Build.VERSION.CODENAME; }
  @ReactMethod
  public void getCodename(Promise p) { p.resolve(getCodenameSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getIncrementalSync() { return Build.VERSION.INCREMENTAL; }
  @ReactMethod
  public void getIncremental(Promise p) { p.resolve(getIncrementalSync()); }

  @SuppressLint("HardwareIds")
  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getUniqueIdSync() { return getString(getReactApplicationContext().getContentResolver(), Settings.Secure.ANDROID_ID); }
  @ReactMethod
  public void getUniqueId(Promise p) {
    p.resolve(getUniqueIdSync());
  }

  @SuppressLint("HardwareIds")
  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getAndroidIdSync() { return getUniqueIdSync(); }
  @ReactMethod
  public void getAndroidId(Promise p) { p.resolve(getAndroidIdSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public double getMaxMemorySync() { return (double)Runtime.getRuntime().maxMemory(); }
  @ReactMethod
  public void getMaxMemory(Promise p) { p.resolve(getMaxMemorySync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public double getTotalMemorySync() {
    ActivityManager actMgr = (ActivityManager) getReactApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
    ActivityManager.MemoryInfo memInfo = new ActivityManager.MemoryInfo();
    if (actMgr != null) {
      actMgr.getMemoryInfo(memInfo);
    } else {
      System.err.println("Unable to getMemoryInfo. ActivityManager was null");
      return -1;
    }
    return (double)memInfo.totalMem;
  }
  @ReactMethod
  public void getTotalMemory(Promise p) { p.resolve(getTotalMemorySync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getBaseOsSync() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      return Build.VERSION.BASE_OS;
    }
    return "unknown";
  }
  @ReactMethod
  public void getBaseOs(Promise p) { p.resolve(getBaseOsSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getPreviewSdkIntSync() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      return Integer.toString(Build.VERSION.PREVIEW_SDK_INT);
    }
    return "unknown";
  }
  @ReactMethod
  public void getPreviewSdkInt(Promise p) { p.resolve(getPreviewSdkIntSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getSecurityPatchSync() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      return Build.VERSION.SECURITY_PATCH;
    }
    return "unknown";
  }
  @ReactMethod
  public void getSecurityPatch(Promise p) { p.resolve(getSecurityPatchSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public String getUserAgentSync() {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
        return WebSettings.getDefaultUserAgent(getReactApplicationContext());
      } else {
        return System.getProperty("http.agent");
      }
    } catch (RuntimeException e) {
      return System.getProperty("http.agent");
    }
  }
  @ReactMethod
  public void getUserAgent(Promise p) { p.resolve(getUserAgentSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableArray getSupportedAbisSync() {
    WritableArray array = new WritableNativeArray();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      for (String abi : Build.SUPPORTED_ABIS) {
        array.pushString(abi);
      }
    } else {
      array.pushString(Build.CPU_ABI);
    }
    return array;
  }
  @ReactMethod
  public void getSupportedAbis(Promise p) { p.resolve(getSupportedAbisSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableArray getSupported32BitAbisSync() {
    WritableArray array = new WritableNativeArray();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      for (String abi : Build.SUPPORTED_32_BIT_ABIS) {
        array.pushString(abi);
      }
    }
    return array;
  }
  @ReactMethod
  public void getSupported32BitAbis(Promise p) { p.resolve(getSupported32BitAbisSync()); }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public WritableArray getSupported64BitAbisSync() {
    WritableArray array = new WritableNativeArray();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      for (String abi : Build.SUPPORTED_64_BIT_ABIS) {
        array.pushString(abi);
      }
    }
    return array;
  }
  @ReactMethod
  public void getSupported64BitAbis(Promise p) { p.resolve(getSupported64BitAbisSync()); }

  private void sendEvent(ReactContext reactContext,
                         String eventName,
                         @Nullable Object data) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, data);
  }
}
