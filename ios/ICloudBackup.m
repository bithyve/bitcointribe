//
//  ICloudBackup.m
//  HEXA
//
//  Created by cakesoft on 31/08/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "ICloudBackup.h"
#import "React/RCTBridgeModule.h"
#import "Hexa-Swift.h"

@implementation ICloudBackup

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(initBackup)
{
  Backup *bkp= [[Backup alloc]init];
  [bkp startBackup]
//   Backup *pdf= [[Backup alloc]init];
    
  printf("Pretending to create an event");
}

@end
