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
  static let proxyConsignmentEndpoint = rgbHttpJsonRpcProtocol + proxyURL
}
