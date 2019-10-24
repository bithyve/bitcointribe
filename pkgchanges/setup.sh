# for both changes ios & android
cp pkgchanges/source-map-support/source-map-support.js node_modules/source-map-support/source-map-support.js
cp pkgchanges/bunyan/bunyan.js node_modules/bunyan/lib/bunyan.js
cp -Rf pkgchanges/react-native-confirmation-code-input/ node_modules/react-native-confirmation-code-input/

rn-nodeify --install --hack

# #for only ios side
# rm -rf ios/Pods
# rm -rf ios/build
# rm ios/Podfile.lock
# cd ios && pod install
# # for only android side
