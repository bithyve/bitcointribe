//
//  BDKManager.swift
//  HEXA
//
//  Created by C58 on 25/01/24.
//

import Foundation
import BitcoinDevKit

class BDKManager {
  
  static let shared = BDKManager()
  var bdkWallet: BitcoinDevKit.Wallet!
  var network: BitcoinDevKit.Network!

  private init() {
    self.bdkWallet = nil
    self.network = nil
  }

  func initialize(mnemonic: String, network: String)-> Bool{
    self.bdkWallet = BDKHelper.getWallet(mnemonic: mnemonic, network: network)
    self.network = BDKHelper.getNetwork(network: network)
    return true
  }
  
}
