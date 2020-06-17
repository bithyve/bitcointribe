# error resolvers @rn-nodeify
cp mods/source-map-support/source-map-support.js node_modules/source-map-support/source-map-support.js
cp mods/bunyan/bunyan.js node_modules/bunyan/lib/bunyan.js

# enabling node core modules
rn-nodeify --install --hack --yarn

# ios dependency installation
cd ios && pod install

# android SDK location configuration
cd ../android
touch local.properties && echo "sdk.dir = /Users/$(whoami)/Library/Android/sdk" >local.properties

# Deleting UIWebView related files from node_modules. Which causes IPA rejection.
# echo "Deleting UIWebView related files from node_modules"
# cd ../
# rm -f node_modules/react-native/React/Views/RCTWebView.h
# rm -f node_modules/react-native/React/Views/RCTWebView.m
# rm -f node_modules/react-native/React/Views/RCTWebViewManager.h
# rm -f node_modules/react-native/React/Views/RCTWebViewManager.m