//
//  PdfPassword.m
//  HexaWallet
//
//  Created by developer on 02/07/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "PdfPassword.h"
#import <React/RCTLog.h>
#import <PDFKit/PDFKit.h>
#import <FileProvider/FileProvider.h>

@implementation PdfPassword

RCT_EXPORT_MODULE();
  

-(NSString*)applicationDocumentDirectory{
  //  return [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
  NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *documentsDirectory = [paths objectAtIndex:0];
  return documentsDirectory;
}

RCT_EXPORT_METHOD(addEvent:(NSString *)fileName location:(NSString *)password)
{  
 //  RCTLogInfo(@"Pretending to create an event %@ at %@", fileName, password);
  NSString * path = [[self applicationDocumentDirectory] stringByAppendingString:fileName];
  PDFDocument *doc = [[PDFDocument alloc]initWithURL:[NSURL fileURLWithPath:path]];
  [doc writeToFile:path withOptions:@{
                                      PDFDocumentUserPasswordOption:password,
                                      PDFDocumentOwnerPasswordOption:password
                                      }];
}   

@end
