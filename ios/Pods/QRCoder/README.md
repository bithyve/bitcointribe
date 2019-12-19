# QRCoder

[![CI Status](http://img.shields.io/travis/sbhklr/QRCoder.svg?style=flat)](https://travis-ci.org/sbhklr/QRCoder)
[![Version](https://img.shields.io/cocoapods/v/QRCoder.svg?style=flat)](http://cocoapods.org/pods/QRCoder)
[![License](https://img.shields.io/cocoapods/l/QRCoder.svg?style=flat)](http://cocoapods.org/pods/QRCoder)
[![Platform](https://img.shields.io/cocoapods/p/QRCoder.svg?style=flat)](http://cocoapods.org/pods/QRCoder)

Since OSX 10.9 / iOS 7 apple offers a CI filter to generate QR codes.
However, scaling the QR code to the desired size without blurring the image doesn't work out of the box. The QRCoder library can help you with that. It also contains a handy view controller to scan QR codes (iOS only).

## Usage: Generator

Simply use an instance of QRCodeGenerator to create an image of type QRImage. This is a type alias for UIImage under iOS and NSImage under OS X.

<img src="https://raw.githubusercontent.com/sbhklr/QRCoder/master/screenshots/ios_code.png" width="250" />

```swift
let generator = QRCodeGenerator()
//Default correction level is M
generator.correctionLevel = .H
let image:QRImage = generator.createImage("Hello world!",size: CGSizeMake(200,200))
```

<img src="https://raw.githubusercontent.com/sbhklr/QRCoder/master/screenshots/osx_code.png" width="300" />

```swift
let generator = QRCodeGenerator()
let image:QRImage = generator.createImage("Hello world!",size: CGSizeMake(200,200))
```

You can set the correction level to one of the values [L,M,Q,H]. The meaning is as follows:

- Level L – up to 7% damage
- Level M – up to 15% damage
- Level Q – up to 25% damage
- Level H – up to 30% damage

Example usage:
```
let generator = QRCodeGenerator(correctionLevel: .H)
```

## Usage: Scanner (iOS)

<img src="https://raw.githubusercontent.com/sbhklr/QRCoder/master/screenshots/ios_scanner.png" width="250" />

```swift
class ScannerViewController : QRCodeScannerViewController {

    override func processQRCodeContent(qrCodeContent: String) -> Bool {
        println(qrCodeContent)
        dismissViewControllerAnimated(true, completion: nil)
        return true
    }

    override func didFailWithError(error: NSError) {
        let alert = UIAlertController(title: error.localizedDescription,
            message: error.localizedFailureReason, preferredStyle: .Alert)
        let okAction = UIAlertAction(title: "OK", style: .Default, handler: {
            _ in
            self.dismissViewControllerAnimated(true, completion: nil)
        })
        alert.addAction(okAction)
        presentViewController(alert, animated: true, completion: nil)
    }

}
```

To run the example project, clone the repo, and run `pod install` from the Example directory first.

## Requirements

Requires OS X 10.9 / iOS 8.

## Installation

QRCoder is available through [CocoaPods](http://cocoapods.org). To install
it, simply add the following line to your Podfile:

```ruby
pod "QRCoder"
```

## Version Compatibility

Current Swift compatibility breakdown:

| Swift Version | Framework Version |
| ------------- | ----------------- |
| 4.1	        | 1.x          		|
| 2.3	        | 0.x          		|

## Todo

* Add QR code scanner for OS X

## Contributing

* [Fork it](http://help.github.com/forking/)
* Create new branch to make your changes
* Commit all your changes to your branch
* Submit a [pull request](http://help.github.com/pull-requests/)

## Author

Sebastian Hunkeler, @sbhklr

## License

QRCoder is available under the MIT license. See the LICENSE file for more info.
