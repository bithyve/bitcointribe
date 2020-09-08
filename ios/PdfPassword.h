#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>
  
@class PdfGenerate;
@interface PdfPassword : NSObject <RCTBridgeModule>
@property (strong, nonatomic) NSString *title;
@property (strong, nonatomic) NSString *pdfPath;
@property (strong, nonatomic) NSString *password;
@property (strong, nonatomic) NSArray *qrcode;
@property (strong,nonatomic) NSArray *qrCodeString;
@property (strong,nonatomic) NSString *secondaryXpub;
@property (strong,nonatomic) NSString *twoFAQR;
@property (strong,nonatomic) NSString *twoFASecret;
@property (strong,nonatomic) NSString *secondaryMnemonic;
@property (strong,nonatomic) NSString *bhXpub;
- (void) generatePdf;
@end     
