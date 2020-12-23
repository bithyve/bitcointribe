#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>
     
@class PdfGenerateKeeper;
@interface PdfPasswordKeeper : NSObject <RCTBridgeModule>
@property (strong, nonatomic) NSString *title;
@property (strong, nonatomic) NSString *pdfPath;
@property (strong, nonatomic) NSArray *qrcode;
@property (strong,nonatomic) NSArray *qrCodeString;
- (void) generatePdf;
@end