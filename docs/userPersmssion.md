### IOS

```
<key>Fabric</key>
  <dict>
    <key>APIKey</key>
    <string>2d0b58f102661fcabd3be54e6516854e2b0983f6</string>
    <key>Kits</key>
    <array>
      <dict>
        <key>KitInfo</key>
        <dict/>
        <key>KitName</key>
        <string>Crashlytics</string>
      </dict>
    </array>  
  </dict>
  <key>LSApplicationQueriesSchemes</key>
  <array>
    <string>whatsapp</string>
    <string>mailto</string>
  </array>
  <key>NSCameraUsageDescription</key>
  <string>$(PRODUCT_NAME) would like to use your camera</string>
  <key>NSLocationWhenInUseUsageDescription</key>
  <string></string>
  <key>NSMicrophoneUsageDescription</key>
  <string>$(PRODUCT_NAME) would like to your microphone (for videos)</string>
  <key>NSPhotoLibraryAddUsageDescription</key>
  <string>$(PRODUCT_NAME) would like to save photos to your photo gallery</string>
  <key>NSPhotoLibraryUsageDescription</key>
  <string>$(PRODUCT_NAME) would like access to your photo gallery</string>
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
