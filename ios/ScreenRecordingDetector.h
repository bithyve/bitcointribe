//
//  ScreenRecordingDetector.h
//  HexaWallet
//
//  Created by developer on 17/09/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

extern NSString *kScreenRecordingDetectorRecordingStatusChangedNotification;

@interface ScreenRecordingDetector : NSObject

+(instancetype)sharedInstance;
+ (void)triggerDetectorTimer;
+ (void)stopDetectorTimer;
- (BOOL)isRecording;

@end
