# error resolvers @rn-nodeify
cp mods/source-map-support/source-map-support.js node_modules/source-map-support/source-map-support.js
cp mods/bunyan/bunyan.js node_modules/bunyan/lib/bunyan.js
# cp mods/react-native-mail/RNMailModule.java node_modules/react-native-mail/android/src/main/java/com/chirag/RNMail/RNMailModule.java
cp mods/react-native-safe-area-view/index.js node_modules/react-native-safe-area-view/index.js

# enabling node core modules
rn-nodeify --install --hack --yarn

echo "patch cocoapods"
cp ./rnPatchFiles/RNLocalize.podspec ./node_modules/react-native-localize/RNLocalize.podspec
cp ./rnPatchFiles/react-native-netinfo.podspec ./node_modules/@react-native-community/netinfo/react-native-netinfo.podspec

# ios dependency installation
cd ios && pod deintegrate && pod install

# android SDK location configuration
cd ../android && touch local.properties && echo "sdk.dir = /Users/$(whoami)/Library/Android/sdk" >local.properties

# Deleting UIWebView related files from node_modules. Which causes IPA rejection.
# echo "Deleting UIWebView related files from node_modules"
# cd ../
# test -f node_modules/react-native/React/Views/RCTWebView.h && rm -f node_modules/react-native/React/Views/RCTWebView.h
# test -f node_modules/react-native/React/Views/RCTWebView.m && rm -f node_modules/react-native/React/Views/RCTWebView.m
# test -f node_modules/react-native/React/Views/RCTWebViewManager.h && rm -f node_modules/react-native/React/Views/RCTWebViewManager.h
# test -f node_modules/react-native/React/Views/RCTWebViewManager.m && rm -f node_modules/react-native/React/Views/RCTWebViewManager.m
