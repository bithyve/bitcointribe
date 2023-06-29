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

RCT_EXPORT_METHOD(getAddress:(NSString*)mnemonic
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [helper getAddressWithBtcNetwotk:network mnemonic:mnemonic callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(sync:(NSString*)mnemonic
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [helper syncWithBtcNetwotk:network mnemonic:mnemonic callback:^(NSString * _Nonnull response) {
    resolve(response);
  }
   ];
}

RCT_EXPORT_METHOD(getBalance:(NSString*)mnemonic
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [helper getBalanceWithBtcNetwotk:network mnemonic:mnemonic callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(getTransactions:(NSString*)mnemonic
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [helper getTransactionsWithBtcNetwotk:network mnemonic:mnemonic callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(receiveAsset:(NSString*)mnemonic
                  pubKey:(NSString *)pubKey
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper receiveAssetWithBtcNetwotk:network mnemonic:mnemonic pubkey:pubKey callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(syncRgbAsset:(NSString*)mnemonic
                  pubKey:(NSString *)pubKey
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper syncRgbWithBtcNetwotk:network mnemonic:mnemonic pubkey:pubKey callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(getRgbAssetMetaData:(NSString*)mnemonic
                  pubKey:(NSString *)pubKey
                  assetId:(NSString *)assetId
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper getRgbAssetMetaDataWithBtcNetwotk:network mnemonic:mnemonic pubkey:pubKey assetId:assetId callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(getRgbAssetTransactions:(NSString*)mnemonic
                  pubKey:(NSString *)pubKey
                  assetId:(NSString *)assetId
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper getRgbAssetTransactionsWithBtcNetwotk:network mnemonic:mnemonic pubkey:pubKey assetId:assetId callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(sendBtc:(NSString*)mnemonic
                  network:(NSString *)network
                  address:(NSString *)address
                  amount:(NSString *)amount
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper sendBtcWithBtcNetwotk:network mnemonic:mnemonic address:address amount:amount callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}


@end
