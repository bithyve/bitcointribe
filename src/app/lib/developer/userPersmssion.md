### IOS

```
<key>CFBundleURLTypes</key>
<array>
<dict>
<key>CFBundleURLSchemes</key>
<array>
<string>bithyve</string>
</array>
</dict>
</array>

<key>NSPhotoLibraryUsageDescription</key>
<string>$(PRODUCT_NAME) would like access to your photo gallery</string>
  <key>NSCameraUsageDescription</key>
  <string>$(PRODUCT_NAME) would like to use your camera</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>$(PRODUCT_NAME) would like to save photos to your photo gallery</string>
  <key>NSMicrophoneUsageDescription</key>
  <string>$(PRODUCT_NAME) would like to your microphone (for videos)</string>
<key>LSApplicationQueriesSchemes</key>
<array>
<string>whatsapp</string>
<string>mailto</string>
</array>
```

## ANDROID

````
<uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
     <uses-permission android:name="android.permission.CAMERA" />
 <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WAKE_LOCK" />
<permission
        android:name="com.bithyve.hexa.permission.C2D_MESSAGE"
        android:protectionLevel="signature" />
    <uses-permission android:name="com.bithyve.hexa.permission.C2D_MESSAGE" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    ```
````
