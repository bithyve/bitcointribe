/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"HexaWallet"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}
  
     
  - (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
   restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
  {
    return [RCTLinkingManager application:application
                     continueUserActivity:userActivity
                       restorationHandler:restorationHandler];
  }
    
  
-(BOOL)application:(UIApplication *)application
           openURL:(NSURL *)url
           options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
  {
    return [RCTLinkingManager application:application openURL:url options:options];
  }
  
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
  {
    return [RCTLinkingManager application:application openURL:url
                        sourceApplication:sourceApplication annotation:annotation];
  }

//TODO: remove screen short
- (void)applicationWillResignActive:(UIApplication *)application {
  // fill screen with our own colour
  UIView *colourView = [[UIView alloc]initWithFrame:self.window.frame];
  colourView.backgroundColor = [UIColor whiteColor];
  colourView.tag = 1234;
  colourView.alpha = 0;
  [self.window addSubview:colourView];
  [self.window bringSubviewToFront:colourView];

  // fade in the view
  [UIView animateWithDuration:0.5 animations:^{
    colourView.alpha = 1;
  }];
}
   
- (void)applicationDidBecomeActive:(UIApplication *)application {
  // grab a reference to our coloured view
  UIView *colourView = [self.window viewWithTag:1234];
  // fade away colour view from main view
  [UIView animateWithDuration:0.5 animations:^{
    colourView.alpha = 0;
  } completion:^(BOOL finished) {
    // remove when finished fading
    [colourView removeFromSuperview];
  }];
}

@end
