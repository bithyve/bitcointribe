#import "PdfPasswordKeeper.h"
#import <React/RCTLog.h>
#import <PDFKit/PDFKit.h>
#import <FileProvider/FileProvider.h>
#import "Hexa-Swift.h"


@implementation PdfPasswordKeeper

RCT_EXPORT_MODULE();
  
     
//-(NSString*)applicationDocumentDirectory{
//  //  return [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
//  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
//  NSString *documentsDirectory = [paths objectAtIndex:0];
//  return documentsDirectory;
//}

RCT_EXPORT_METHOD(createPdfKeeper:(NSString *)pdfData
                  get:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSData *objectData = [pdfData dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary *json = [NSJSONSerialization JSONObjectWithData:objectData options:0 error:nil];
  NSLog(json);
  PdfGenerateKeeper *pdf= [[PdfGenerateKeeper alloc]init];
   NSLog(pdf);
  pdf.title = [json objectForKey:@"title"];
  pdf.pdfPath =[json objectForKey:@"fileName"];
  pdf.qrcode = [json objectForKey:@"qrcode"];
  pdf.qrCodeString =[json objectForKey:@"qrCodeString"];
  NSString *pdfPath =  [pdf generatePdf];
  NSLog(pdfPath);
  resolve(pdfPath);
  //return pdfPath;
}
  
@end



