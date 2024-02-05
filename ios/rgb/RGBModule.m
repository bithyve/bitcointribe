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
  
  [helper generate_keysWithBtcNetwotk:network callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(restoreKeys:(NSString*)network
                  mnemonic:(NSString *)mnemonic
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  
  [helper restore_keysWithBtcNetwotk:network mnemonic:mnemonic callback:^(NSString * _Nonnull response) {
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

RCT_EXPORT_METHOD(initiate:(NSString*)network
                  mnemonic:(NSString *)mnemonic
                  pubKey:(NSString *)pubKey
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [helper initiateWithBtcNetwotk:network mnemonic:mnemonic pubkey:pubKey callback:^(NSString * _Nonnull response) {
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

RCT_EXPORT_METHOD(syncRgbAssets:(NSString*)mnemonic
                  pubKey:(NSString *)pubKey
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper syncRgbWithCallback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(receiveAsset:(NSString*)mnemonic
                  network:(NSString *)network
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper receiveAssetWithBtcNetwotk:network mnemonic:mnemonic callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}


RCT_EXPORT_METHOD(getRgbAssetMetaData:(NSString*)assetId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper getRgbAssetMetaDataWithAssetId:assetId callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(getRgbAssetTransactions:(NSString*)assetId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [helper getRgbAssetTransactionsWithAssetId:assetId callback:^(NSString * _Nonnull response) {
    resolve(response);
  }
   ];
}

RCT_EXPORT_METHOD(sendBtc:(NSString*)mnemonic
                  network:(NSString *)network
                  address:(NSString *)address
                  amount:(NSString *)amount
                  feeRate:(float *)feeRate
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper sendBtcWithBtcNetwotk:network mnemonic:mnemonic address:address amount:amount feeRate:*feeRate callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(sendAsset:(NSString*)assetId
                  blindedUTXO:(NSString *)blindedUTXO
                  amount:(NSString *)amount
                  consignmentEndpoints:(NSString *)consignmentEndpoints
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper sendAssetWithAssetId:assetId blindedUTXO:blindedUTXO amount:amount consignmentEndpoints:consignmentEndpoints callback:^(NSString * _Nonnull response) {
      resolve(response);
    }
   ];
}

RCT_EXPORT_METHOD(issueRgb20Asset:(NSString*)ticker
                  name:(NSString *)name
                  supply:(NSString *)supply
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];

  [helper issueRgb20AssetWithTicker:ticker name:name supply:supply callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(issueRgb25Asset:(NSString*) name
                  description:(NSString *)description
                  supply:(NSString *)supply
                  filePath:(NSString *)filePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  
  [helper issueRgb121AssetWithName:name description:description supply:supply filePath:filePath callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(backup:(NSString*)path
                  password:(NSString *)password
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [helper backupWithPath:path password:password callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(restore:(NSString*)mnemonic
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [helper restoreWithMnemonic:mnemonic callback:^(NSString * _Nonnull response) {
    resolve(response);
  }];
}

RCT_EXPORT_METHOD(isBackupRequired:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)rejecter){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [helper
   isBackupRequiredWithCallback:^(BOOL response) {
    resolve(@(response));
  }];
}

RCT_EXPORT_METHOD(isValidBlindedUtxo:(NSString*)invoiceData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject){
  RGBHelper *helper = [[RGBHelper alloc]init];
  [
    helper isValidBlindedUtxoWithInvoiceData:invoiceData callback:^(BOOL response) {
      resolve(@(response));
    }
   ];
}

@end
