//
//  Constants.swift
//  HEXA
//
//  Created by Shashank Shinde on 27/06/23.
//

import Foundation

struct Constants{
  static let rgbDirName = ".rgb"
  static let bdkDirName = "bdk"

  static let testnetElectrumUrl = "ssl://electrum.iriswallet.com:50013"
  static let mainnetElectrumUrl = "electrum.acinq.co:50002"
  static let rgbHttpJsonRpcProtocol = "rgbhttpjsonrpc:"
  static let proxyURL = "https://proxy.iriswallet.com/json-rpc"
  static let proxyConsignmentEndpoint = "rpcs://proxy.iriswallet.com/0.2/json-rpc"
  static let satsForRgb = 9000
  static let defaultFeeRate = 2.0
  static let rgbBlindDuration = UInt32(86400)
  static let backupName = "%@.rgb_backup"

}
