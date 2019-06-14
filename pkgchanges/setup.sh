rm -rf node_modules
yarn install
cp pkgchanges/runIOS/findMatchingSimulator.js node_modules/react-native/local-cli/runIOS/findMatchingSimulator.js
cp pkgchanges/source-map-support/source-map-support.js node_modules/source-map-support/source-map-support.js
cp pkgchanges/react-native-camera/index.js node_modules/ac-qrcode/node_modules/react-native-camera/index.js
cp pkgchanges/ac-qrcode/QRScanner.js node_modules/ac-qrcode/QRScanner.js
cp pkgchanges/bunyan/bunyan.js node_modules/bunyan/lib/bunyan.js
rn-nodeify --install --hack
react-native link
