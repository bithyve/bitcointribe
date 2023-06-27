//
//  RGBModule.m
//  HEXA
//
//  Created by Shashank Shinde on 26/06/23.
//


#import "RGBModule.h"
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "HEXA-Swift.h"

#import <Foundation/Foundation.h>


@implementation RGB

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(generateKeys:(NSString*)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  
  [helper generateKeysWithBtcNetwotk:network callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}


@end
