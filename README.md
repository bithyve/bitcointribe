## Building HEXA

### Prerequisites:

- [Node](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/lang/en/)
- [CocoaPods](https://cocoapods.org/)
- [Xcode](https://developer.apple.com/xcode/)
- [Android Studio](https://developer.android.com/studio)

Make sure you have `rn-nodeify` as a global dependency. If you don't, run `npm install -g rn-nodeify`.

```
git clone https://github.com/bithyve/hexa.git
cd hexa
yarn install
```

If you're on windows, open setup.bat in a text editor and enter your user account name where prompted. If you changed the location of the android sdk during installation, enter the path to the sdk instead of the one already present.
Then, from the command prompt, run:

```
setup.bat
```

Make sure you have `.env` similar to `.env.example` in your project's root directory before running hexa. If this file is not present with the required values then the app will crash.

### Run on iOS

```
yarn ios
```

### Run on Android

```
yarn android
```

## Verify Authenticity of Android APK

Please download and keep all these files in the same location: `Android APK file, SHA256SUM.asc, HEXA_DETACHED_SIGN.sign`

Get the public PGP key for Hexa@Bithyve.Com using

```
gpg --recv-key "389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62"
```

or

```
gpg --keyserver hkps://keys.openpgp.org --recv-key "389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62"
```

**Verify the APK certificate**

Extract `/META-INF/HEXAWALL.RSA`  from APK and extract the Certificate Finger Print:

```
keytool -printcert -file HEXAWALLET.RSA
```

Verify that the Certificate fingerprints extracted matches:

```
Certificate fingerprints:
	 MD5:  5E:92:30:9B:88:F4:A1:17:08:D1:DB:C3:2A:BF:4D:5A
	 SHA1: 38:55:07:26:F4:C6:C4:3E:A2:87:CF:16:11:7C:E6:A5:66:E1:CB:C1
	 SHA256: 77:82:54:70:5D:C4:DA:83:2C:F8:39:96:49:69:FE:AF:63:BD:79:EF:00:0A:34:43:86:0C:7C:AD:A2:55:1C:95
	 Signature algorithm name: SHA256withRSA
	 Version: 3
```

**Verify the checksum for the APK file**

Verify the checksum against the APK using:

```
shasum -a 256 --check SHA256SUM.asc
```

Output should contain the name of the APK file followed by **OK** as shown below:

```
Hexa_Wallet_Android_v1.1.1.apk: OK
```

**Verify that the signed checksum is from Hexa@Bithyve.Com**

Verify the checksum against the APK using:

```
gpg --verify SHA256SUM.asc
```

Output should show the PGP key **389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62**:

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

Output should show the PGP key **389F 4CAD A078 5AC0 E28A 0C18 1BEB DE26 1DC3 CF62**:

```
using RSA key 389F4CADA0785AC0E28A0C181BEBDE261DC3CF62
issuer "hexa@bithyve.com"
Good signature from "Hexa Team (Hexa Bitcoin Wallet) <hexa@bithyve.com>"
```

## Contributing

Please feel free to open pull requests, issues with bugfixes, and suggestions.

## License

[LICENSE](LICENSE)