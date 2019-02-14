#### any time use:- yarn --reset-cache

//Android
1)base_map.fill(255)<br>
https://github.com/react-native-community/jsc-android-buildscripts<br>
2)MainActivity add sqlite <br>

import org.pgsqlite.SQLitePluginPackage;<br>
new SQLitePluginPackage()<br>

### System update

npm cache clean --force
then install all again npm xcode(cmd line) then run...

## 28/12/2018 Iusse (Buffer)

1.Buffer can't not find
/node_modules/bip32<br>
ref link <br>
https://github.com/parshap/node-libs-react-native#globals<br>
add top <br>
require('node-libs-react-native/globals');<br>

## Android relase file time (build/generated/res/react/release/drawable-xxxhdpi/node_modules_reactnavigationstack_src_views_assets_backicon.png: Error: Duplicate resources)

node_modules/react-native/react.gradle<br>
(after doFirst block)<br>
doLast {
def moveFunc = { resSuffix ->
File originalDir = file("${resourcesDir}/drawable-${resSuffix}")
if (originalDir.exists()) {
File destDir = file("${resourcesDir}/drawable-${resSuffix}-v4")
ant.move(file: originalDir, tofile: destDir)
}
}
moveFunc.curry("ldpi").call()
moveFunc.curry("mdpi").call()
moveFunc.curry("hdpi").call()
moveFunc.curry("xhdpi").call()
moveFunc.curry("xxhdpi").call()
moveFunc.curry("xxxhdpi").call()
}  
or
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

add build.grade  
inside android

aaptOptions
{  
 cruncherEnabled = false
}

## Issue .keystore not found or password issue

keytool -genkey -v -keystore test.keystore -alias test -keyalg RSA -keysize 2048 -validity 10000

gradle.properties

MYAPP_RELEASE_STORE_FILE=test.keystore
MYAPP_RELEASE_KEY_ALIAS=test  
MYAPP_RELEASE_STORE_PASSWORD=apps1234
MYAPP_RELEASE_KEY_PASSWORD=apps1234

build.gradel

    signingConfigs {
         release {
                    storeFile file("test.keystore")
                    storePassword "apps1234"
                    keyAlias "test"
                    keyPassword "apps1234"
         }
    }

      signingConfig signingConfigs.release

### (IOS) lottie.h file not found

react-native link lottie-react-native<br>
or<br>
react-native link lottie-ios<br>

### any file PropTypes issue show to add

import PropTypes from 'prop-types';

### reactDevTools not found check this file

(node_modules/react-native/Libraries/Core/Devtools/setupDevtools.js)
add this
yarn add --dev react-devtools-core@3.4.3

### Module `asyncstorage-down` does not exist in the Haste module map

yarn add asyncstorage-down

### Model not found function

npm run issuemodel

## Android icons not show

Open android/app/build.gradle and add the following:  
 apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
