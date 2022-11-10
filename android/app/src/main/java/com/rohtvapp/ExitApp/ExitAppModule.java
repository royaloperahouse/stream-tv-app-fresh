package com.rohtvapp.ExitApp;
import android.util.Log;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import androidx.annotation.NonNull;

public class ExitAppModule extends ReactContextBaseJavaModule {
    ExitAppModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return "ExitApp";
    }

    @ReactMethod
    public void exit() {
        Log.i("exit", "Close App");
        android.os.Process.killProcess(android.os.Process.myPid());
    }
}

