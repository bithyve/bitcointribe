@echo off

REM error resolvers @rn-nodeify
copy mods/source-map-support/source-map-support.js node_modules/source-map-support/source-map-support.js
copy mods/bunyan/bunyan.js node_modules/bunyan/lib/bunyan.js
copy mods/react-native-mail/RNMailModule.java node_modules/react-native-mail/android/src/main/java/com/chirag/RNMail/RNMailModule.java

REM enabling node core modules
rn-nodeify --install --hack --yarn

REM android sdk local configuration
cd android
echo sdk.dir = C:\\Users\\<USERNAME>\\AppData\\Local\\Android\\Sdk > local.properties


