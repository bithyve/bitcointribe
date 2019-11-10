# error resolvers @rn-nodeify
cp mods/source-map-support/source-map-support.js node_modules/source-map-support/source-map-support.js
cp mods/bunyan/bunyan.js node_modules/bunyan/lib/bunyan.js

# enabling node core modules
rn-nodeify --install --hack --yarn

# ios dependency installation
cd ios && pod install