#!/bin/bash
# chmod +x pkgchanges/setup.sh
# ./pkgchanges/setup.sh
# rm -rf node_modules
# yarn install

# for both changes ios & android
cp pkgchanges/source-map-support/source-map-support.js node_modules/source-map-support/source-map-support.js
cp pkgchanges/bunyan/bunyan.js node_modules/bunyan/lib/bunyan.js
cp -Rf pkgchanges/react-native-confirmation-code-input/ node_modules/react-native-confirmation-code-input/

# for only android side
#cp pkgchanges/react-native-device-info/RNDeviceModule.java node_modules/react-native-device-info/android/src/main/java/com/learnium/RNDeviceInfo/RNDeviceModule.java
rn-nodeify --install --hack
