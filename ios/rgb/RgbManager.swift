//
//  RgbManager.swift
//
//  Created by Shashank Shinde
//

import Foundation
// import RgbLib

class RgbManager {
  
  static let shared = RgbManager()
  var rgbWallet: Wallet?
  var rgbNetwork: BitcoinNetwork?
  var online: Online?
  
  private init() {
    self.rgbWallet = nil
    self.online = nil
  }
  
  func initialize(bitcoinNetwork: String, pubkey: String, mnemonic: String)-> String{
    let network = getRgbNetwork(network: bitcoinNetwork)
    let walletData = WalletData(dataDir: Utility.getRgbDir()?.path ?? "", bitcoinNetwork: network, databaseType: DatabaseType.sqlite,maxAllocationsPerUtxo: 1, pubkey: pubkey, mnemonic: mnemonic,vanillaKeychain: 1)
    do{
      self.rgbWallet = try Wallet(walletData: walletData)
      self.online = try rgbWallet?.goOnline(skipConsistencyCheck: true, electrumUrl: Constants.testnetElectrumUrl)
      self.rgbNetwork = network
      return "true"
    }catch{
      //
      self.rgbWallet = nil
      return "false"
    }
  }
  
  func getRgbNetwork(network: String)->BitcoinNetwork{
    return network == "TESTNET" ? BitcoinNetwork.testnet : BitcoinNetwork.mainnet
  }
  
}
