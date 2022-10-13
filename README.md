### Android TV build instructions: 

1. Increase `versionCode` and `versionName` in `.android/app/build.gradle` file.
2. Change build variants to `release`.
3. Under the build tab in Android Studio select `Generate Signed Bundle` or `APK`.
4. Select `Android App Bundle`, click Next
5. Select `release` build variant and destination folder, click Finish.
6. Wait until build is done and drag and drop your generated `app-release.aab` file to the Google Play console.