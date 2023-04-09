## Setting up Bitcoin Tribe

### Prerequisites:

- [Node](https://nodejs.org/en/) v10 and above
- [Yarn](https://yarnpkg.com/lang/en/)
- [CocoaPods](https://cocoapods.org/)
- [Xcode](https://developer.apple.com/xcode/)
- [Android Studio](https://developer.android.com/studio)

Make sure you have `rn-nodeify` as a global dependency. If you don't, run `npm install -g rn-nodeify`.

```sh
git clone https://github.com/bithyve/bitcointribe.git
cd bitcointribe
yarn install
```

### Running Setup Script

#### MacOS or Linux

On MacOS and Linux there is no need to run `setup.sh` it will run autmatically after `yarn install` completes.

#### Windows

On Windows, if  `setup.bat` does not run on its own after `yarn install` then it can be executed manually. it doesn't really matter if its run twice.

Open `setup.bat` in a text editor and enter your user account name where prompted. If you changed the location of the android sdk during installation, enter the path to the sdk instead of the one already present.
Then, from the command prompt, run:

```sh
setup.bat
```

### Configuring Environment Variables

**Mainnet configuration**

Make sure you there are no `.env` files in the project root directory except `.env.example`

The project will use live configuration by default when no `.env` file is available.

**Testnet configuration**

Copy the contents on `.env.example` to a new `.env` file.

```sh
cp .env.example .env
```


## Building and Running Bitcoin Tribe

### Running on simulator

**IOS**

```
yarn ios
```

Alternately XCode can also be used to build and run in a simulator

**Android**

```
yarn android or yarn androidDevelopmentDebug
```

Alternately Android Studio can also be used to build and run in a simulator

### Running on device

**IOS**

Open `HEXA.xcworkspace` from `<Hexa Project Root>/iOS` in XCode and use the `product > build for > running` menu option to build and run Hexa Wallet on iPhone. This will work with a correct and updated XCode setup and only on trusted devices. Further support for running on iPhone is available on react native and xcode development sites and community forums.

**Android**

Ensure device is connected and recognised. Ensure no  Android emulators are running.

```
yarn android or yarn androidDevelopmentDebug
```

Alternately Android Studio can also be used to build and run on Android device.
This will work when Android development environment is setup correctly. Further support is available from react native and Android Studio guides. Please refer https://reactnative.dev/docs/running-on-device for further support.

## Common Issues

1. Build fails with one or more errors
   Makes sure `yarn install` was done after switching to a new branch.
   If that doesn't help please use `yarn deep-clean` this will remove node modules, flush node cache, fluch metro cache, reinstall node dependencies and re install pods.
2. Always make sure metro is running in a new terminal window. If its not it can be started by running `yarn start`in a new termimal from project root.
3. Notifications dont work in ios simulator and this will show up as an error in the console. Notifications will work when running in a iOS device.
4. If Apple id or google id is not setup in the simulator then cloud backup will not work and cloud errors will be seen in the console.
5. Scanner will not work in a simulator so a device will be required to test and debug scanner related features.
6. If `yarn install` fails use the comand `sudo npm install -g yarn` before yarn install.

## Verify Authenticity of Android APK

Please download and keep all these files in the same location: `Android APK file, SHA256SUM.asc, HEXA_DETACHED_SIGN.sign`. Make a copy of `Android APK file` and rename it as `Android APK clone`.

Get the public PGP key for `hexa@bithyve.com` (Hexa Team's PGP key) using

```
gpg --recv-key "389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62"
```

or

```
gpg --keyserver hkps://keys.openpgp.org --recv-key "389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62"
```

**Verify APK certificate**

Rename `Android APK clone.apk` to `Android APK clone.zip` and extract the following file: `/META-INF/HEXAWALL.RSA`. Verify the certificate using `keytool`:

```
keytool -printcert -file HEXAWALLET.RSA
Certificate fingerprints:
	 ...
	 MD5:  5E:92:30:9B:88:F4:A1:17:08:D1:DB:C3:2A:BF:4D:5A
	 SHA1: 38:55:07:26:F4:C6:C4:3E:A2:87:CF:16:11:7C:E6:A5:66:E1:CB:C1
	 SHA256: 77:82:54:70:5D:C4:DA:83:2C:F8:39:96:49:69:FE:AF:63:BD:79:EF:00:0A:34:43:86:0C:7C:AD:A2:55:1C:95
	 Signature algorithm name: SHA256withRSA
	 Version: 3
```

**Verify APK checksum**

Verify the checksum against the APK using:

```
shasum -a 256 --check SHA256SUM.asc
```

Output should contain the name of the APK file followed by **OK** as shown below:

```
Hexa_Wallet_Android_v1.1.1.apk: OK
```

**Verify that the signed checksum is from hexa@bithyve.com**

```
gpg --verify SHA256SUM.asc
```

Output should show Hexa's PGP key **389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62**:

```
using RSA key 389F4CADA0785AC0E28A0C181BEBDE261DC3CF62
issuer "hexa@bithyve.com"
Good signature from "Hexa Team (Hexa Bitcoin Wallet) <hexa@bithyve.com>"
```

**Alternate method for verifying PGP signature**

Verify the detached signature against the APK file:

```
gpg --verify HEXA_DETACHED_SIGN.sign Hexa_Wallet_Android_v1.1.1.apk
```

Output should show Hexa's PGP key **389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62**:

```
using RSA key 389F4CADA0785AC0E28A0C181BEBDE261DC3CF62
issuer "hexa@bithyve.com"
Good signature from "Hexa Team (Hexa Bitcoin Wallet) <hexa@bithyve.com>"
```

## Contributing

Please feel free to open pull requests, issues with bugfixes, and suggestions.

## License

[LICENSE](LICENSE)
