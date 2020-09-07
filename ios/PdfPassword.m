#import "PdfPassword.h"
#import <React/RCTLog.h>
#import <PDFKit/PDFKit.h>
#import <FileProvider/FileProvider.h>
#import "Hexa-Swift.h"

@implementation PdfPassword

RCT_EXPORT_MODULE();
  
     
//-(NSString*)applicationDocumentDirectory{
//  //  return [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
//  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
//  NSString *documentsDirectory = [paths objectAtIndex:0];
//  return documentsDirectory;
//}

RCT_EXPORT_METHOD(createPdf:(NSString *)pdfData
                  get:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSData *objectData = [pdfData dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary *json = [NSJSONSerialization JSONObjectWithData:objectData options:0 error:nil];
  PdfGenerate *pdf= [[PdfGenerate alloc]init];
  pdf.title = [json objectForKey:@"title"];
  pdf.pdfPath =[json objectForKey:@"fileName"];
  pdf.password =[json objectForKey:@"password"];
  pdf.qrcode = [json objectForKey:@"qrcode"];
  pdf.qrCodeString =[json objectForKey:@"qrCodeString"];
  pdf.secondaryXpub = [json objectForKey:@"secondaryXpub"];
  pdf.twoFAQR = [json objectForKey:@"twoFAQR"];
  pdf.twoFASecret = [json objectForKey:@"twoFASecret"];
  pdf.secondaryMnemonic = [json objectForKey:@"secondaryMnemonic"];
  pdf.bhXpub = [json objectForKey:@"bhXpub"];
  NSString *pdfPath =  [pdf generatePdf];
  NSLog(pdfPath);
  resolve(pdfPath);
  //return pdfPath;
}



  
@end



