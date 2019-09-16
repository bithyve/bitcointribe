package com.hexawallet;

import android.os.Environment;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;

import android.os.Bundle;
import android.view.WindowManager;

import android.app.Activity;

public class Utils extends ReactContextBaseJavaModule {

    final Activity activity = getCurrentActivity();

    public Utils(ReactApplicationContext reactContext) {
        super(reactContext); // required by React Native

    }

    @Override
    // getName is required to define the name of the module represented in
    // JavaScript
    public String getName() {
        return "Utils";
    }

    // TODO: Screen Short
    @ReactMethod
    public void disableScreenShort() {
        try {
            activity.getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE,
                    WindowManager.LayoutParams.FLAG_SECURE);
            System.out.println("disable screen");
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    @ReactMethod
    public void enableScreenShort() {
        try {
            activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}