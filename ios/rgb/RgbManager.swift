//
//  RgbManager.swift
//
//  Created by Shashank Shinde
//

import Foundation
import RgbLib

class RgbManager {
  
  static let shared = RgbManager()
  var rgbWallet: RgbLib.Wallet?
  var online: Online?
  
  private init() {
    self.rgbWallet = nil
    self.online = nil
  }
  
  func initialize(bitcoinNetwork: String, pubkey: String, mnemonic: String)-> String{
    let netwotk = getRgbNetwork(network: bitcoinNetwork)
    let walletData = WalletData(dataDir: Utility.getRgbDir()?.path ?? "", bitcoinNetwork: netwotk, databaseType: RgbLib.DatabaseType.sqlite, pubkey: pubkey, mnemonic: mnemonic)
    do{
      self.rgbWallet = try Wallet(walletData: walletData)
      self.online = try rgbWallet?.goOnline(skipConsistencyCheck: true, electrumUrl: Constants.testnetElectrumUrl)
      return "true"
    }catch{
      //
      self.rgbWallet = nil
      return "false"
    }
  }
  
  func getRgbNetwork(network: String)->RgbLib.BitcoinNetwork{
    return network == "TESTNET" ? RgbLib.BitcoinNetwork.testnet : RgbLib.BitcoinNetwork.mainnet
  }
  
}
