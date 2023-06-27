//
//  RGBHelper.swift
//  HEXA
//
//  Created by Shashank Shinde on 26/06/23.
//

import Foundation
import RgbLib
import BitcoinDevKit

@objc class RGBHelper : NSObject {
  
  override init() {
    super.init()
  }
  
  func getRgbNetwork(network: String)->RgbLib.BitcoinNetwork{
    return network == "TESTNET" ? RgbLib.BitcoinNetwork.testnet : RgbLib.BitcoinNetwork.mainnet
    let walletData = WalletData(dataDir: "", bitcoinNetwork: RgbLib.BitcoinNetwork.testnet, databaseType: RgbLib.DatabaseType.sqlite, pubkey: "", mnemonic: "")
    do{
      let wallet = try Wallet(walletData: walletData)
      let address = wallet.getAddress()
    } catch{
      
    }
  }
  
  func setRgbWallet(dataDir: String, bitcoinNetwork: BitcoinNetwork, pubkey: String,mnemonic:String)->Bool{
    let walletData = WalletData(dataDir: dataDir, bitcoinNetwork: bitcoinNetwork, databaseType: RgbLib.DatabaseType.sqlite, pubkey: pubkey, mnemonic: mnemonic)
    do{
      let wallet = try Wallet(walletData: walletData)
      //RGBHelper.rgbWallet = wallet
      return true
    } catch{
      return false
    }
  }
  
  @objc func generateKeys(btcNetwotk: String, callback: @escaping ((String) -> Void)){
    let network = getRgbNetwork(network: btcNetwotk)
    let keys = RgbLib.generateKeys(bitcoinNetwork: network)
    if let documentDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
      let rgbURL = documentDirectory.appendingPathComponent(Constants.rgbDirName)
      let bdkURL = documentDirectory.appendingPathComponent(Constants.bdkDirName)
      let data: [String: Any] = [
        "mnemonic": keys.mnemonic,
        "xpub": keys.xpub,
        "xpubFingerprint": keys.xpubFingerprint,
        "rgbDir": rgbURL.absoluteString,
        "bdkDir":bdkURL.absoluteString
      ]
      let json = Utility.convertToJSONString(params: data)
      callback(json)
    }
  }
}
