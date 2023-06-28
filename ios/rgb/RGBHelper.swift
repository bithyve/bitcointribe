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
      let address = try wallet.blind(assetId: nil, amount: nil, durationSeconds: 86400, consignmentEndpoints: [Constants.proxyConsignmentEndpoint])
    } catch{
      
    }
  }
  
  func getRgbWallet(bitcoinNetwork: String, pubkey: String, mnemonic: String)->RgbLib.Wallet?{
    let netwotk = getRgbNetwork(network: bitcoinNetwork)
    let walletData = WalletData(dataDir: Utility.getRgbDir()?.path ?? "", bitcoinNetwork: netwotk, databaseType: RgbLib.DatabaseType.sqlite, pubkey: pubkey, mnemonic: mnemonic)
    do{
      let wallet = try Wallet(walletData: walletData)
      return wallet
    }catch{
      return nil
    }
  }
  
  func genReceiveData(wallet: RgbLib.Wallet, mnemonic: String, btcNetwotk: String)->String{
    do{
      let online = try wallet.goOnline(skipConsistencyCheck: true, electrumUrl: Constants.testnetElectrumUrl)
      print("online: \(online)")
      let refresh = try wallet.refresh(online: online, assetId: nil, filter: [RgbLib.RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: true), RgbLib.RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: false)])
      let assets = try wallet.listAssets(filterAssetTypes: [])

      print("REFRESH: \(refresh)")
      print("assets: \(assets)")

      let bindData = try wallet.blind(assetId: nil, amount: nil, durationSeconds: 86400, consignmentEndpoints: [Constants.proxyConsignmentEndpoint])
      let data: [String: Any] = [
        "invoice": bindData.invoice,
        "blindedUtxo": bindData.blindedUtxo,
        "expirationTimestamp": String(bindData.expirationTimestamp ?? 0),
        "blindingSecret": String(bindData.blindingSecret),
      ]
      let json = Utility.convertToJSONString(params: data)
      return json
      
    }catch{
      print("Type of error")
      print(type(of: error))
      print("ERROR: \(error)")
    /* let address = wallet.getAddress()
      let bdkWallet = BDKHelper.getWallet(mnemonic: mnemonic, network: btcNetwotk)
      BDKHelper.sync(wallet: bdkWallet!)
      let txid = BDKHelper.sendToAddress(address: address, amount: 9000, fee: 3.0, wallet: bdkWallet!)
      do{
        let online = try  wallet.goOnline(skipConsistencyCheck: true, electrumUrl: Constants.testnetElectrumUrl)
        var newUTXOs = UInt8(0)
        var attempts = 3
        while(newUTXOs == UInt8(0) && attempts > 0) {
          newUTXOs = try wallet.createUtxos(online: online, upTo: false, num: nil, size: nil, feeRate: 3.0)
          print("new utxo \(newUTXOs)")
          attempts-=1
        }
        return txid
      }catch{
        print(error)
      }*/
      return "\(error)"

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
  
  @objc func getAddress(btcNetwotk: String, mnemonic: String, callback: @escaping ((String) -> Void)) {
    if let wallet = BDKHelper.getWallet(mnemonic: mnemonic, network: btcNetwotk) {
      let address = BDKHelper.getAddress(wallet: wallet)
      callback(address)
    } else {
      callback("")
    }
  }
  
  @objc func getBalance(btcNetwotk: String, mnemonic: String, callback: @escaping ((String) -> Void)) {
    if let wallet = BDKHelper.getWallet(mnemonic: mnemonic, network: btcNetwotk) {
      let balance = BDKHelper.getBalance(wallet: wallet)
      callback(balance)
    } else {
      callback("{}")
    }
  }
  
  @objc func getTransactions(btcNetwotk: String, mnemonic: String, callback: @escaping ((String) -> Void)) {
    if let wallet = BDKHelper.getWallet(mnemonic: mnemonic, network: btcNetwotk) {
      let txns = BDKHelper.getTransactions(wallet: wallet)
      callback(txns)
    } else {
      callback("")
    }
  }
  
  @objc func sync(btcNetwotk: String, mnemonic: String, callback: @escaping ((String) -> Void)) {
    if let wallet = BDKHelper.getWallet(mnemonic: mnemonic, network: btcNetwotk) {
      let synched = BDKHelper.sync(wallet: wallet)
      callback(String(synched))
    } else {
      callback(String(false))
    }
  }
  
  @objc func sendBtc(btcNetwotk: String, mnemonic: String, address: String, amount: String, callback: @escaping ((String) -> Void)) {
    do{
      let wallet = try BDKHelper.getWallet(mnemonic: mnemonic, network: btcNetwotk)
      print("WALLET GENERATED")
      let txid = BDKHelper.sendToAddress(address: address, amount: UInt64(amount)!, fee: 3.0, wallet: wallet!)
      callback("{txid: \(txid)")
    } catch {
      print(error)
      callback("{txid: null}")
    }
  }
  
  @objc func receiveAsset(btcNetwotk: String, mnemonic: String,pubkey: String,callback: @escaping ((String) -> Void)){
    do {
      let wallet = (try getRgbWallet(bitcoinNetwork: btcNetwotk, pubkey: pubkey, mnemonic: mnemonic))!
      callback(genReceiveData(wallet: wallet, mnemonic: mnemonic, btcNetwotk: btcNetwotk))
    }catch{
      callback("{}")
    }
  }
}
