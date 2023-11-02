### Android TV build instructions: 

1. Increase `versionCode` and `versionName` in `.android/app/build.gradle` file.
2. Change build variants to `release`.
3. Under the build tab in Android Studio select `Generate Signed Bundle` or `APK`.
4. Select `Android App Bundle`, click Next
5. Select `release` build variant and destination folder, click Finish.
6. Wait until build is done and drag and drop your generated `app-release.aab` file to the Google Play console.

### XCode workaround
Inside of XCode project in RohTVApp-tvOS tab, inside `Build Phases` line `Run Script` contains script that put MinimumOSVersion inside Info.plist. This script is needed for Hermes framework, please update this script as you update target deployment version.

### Countdown component
It seems like library `react-native-countdown-component` is abandoned. It uses some deprecated functions, workaround is provided on GitHub [here](https://github.com/talalmajali/react-native-countdown-component/issues/123). Should be applied after each library installation!
