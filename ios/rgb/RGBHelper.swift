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
  
  func getRgbAssetMetaData(wallet: RgbLib.Wallet, assetId: String)->String{
    do{
      let online = try wallet.goOnline(skipConsistencyCheck: true, electrumUrl: Constants.testnetElectrumUrl)
      let metaData = try wallet.getAssetMetadata(online: online, assetId: assetId)
      var jsonObject = [String: Any]()
      jsonObject["assetId"] = assetId
      jsonObject["precision"] = metaData.precision
      jsonObject["name"] = metaData.name
      jsonObject["ticker"] = metaData.ticker
      jsonObject["description"] = metaData.description
      jsonObject["timestamp"] = metaData.timestamp
      jsonObject["assetType"] = "\(metaData.assetType)"
      jsonObject["parentId"] = metaData.parentId
      jsonObject["issuedSupply"] = metaData.issuedSupply

      let jsonData = try JSONSerialization.data(withJSONObject: jsonObject, options: .prettyPrinted)
      let jsonString = String(data: jsonData, encoding: .utf8)!
      return jsonString
    }catch{
      print(error)
      return "{}"
    }
  }
  
  func getRgbAssetTransfers(wallet: RgbLib.Wallet, assetId: String)->String{
    do{
      let online = try wallet.goOnline(skipConsistencyCheck: true, electrumUrl: Constants.testnetElectrumUrl)
      let refresh = try wallet.refresh(online: online, assetId: assetId, filter: [RgbLib.RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: true), RgbLib.RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: false)])
      let transfers = try wallet.listTransfers(assetId: assetId)
      var jsonArray = [[String: Any]]()
      for transfer in transfers {
        var jsonObject = [String: Any]()
        jsonObject["txid"] = transfer.txid
        jsonObject["amount"] = transfer.amount
        jsonObject["createdAt"] = transfer.createdAt
        jsonObject["updatedAt"] = transfer.updatedAt
        jsonObject["status"] = "\(transfer.status)"
        jsonObject["kind"] = "\(transfer.kind)"
        jsonObject["expiration"] = transfer.expiration
        jsonObject["blindingSecret"] = transfer.blindingSecret
        jsonObject["blindedUtxo"] = transfer.blindedUtxo
        jsonObject["changeUtxo"] = transfer.changeUtxo
        jsonObject["consignmentEndpoints"] =
          transfer.consignmentEndpoints.map{ endpoint in
            return [
              "endpoint": endpoint.endpoint,
              "used": endpoint.used,
              "protocol": "\(endpoint.protocol)"
              ]
          }
          
        var unblindedUtxo = [String: Any]()
        unblindedUtxo["txid"] = transfer.unblindedUtxo?.txid
        unblindedUtxo["vout"] = transfer.unblindedUtxo?.vout
        jsonObject["unblindedUtxo"] = unblindedUtxo
        
        var changeUtxo = [String: Any]()
        changeUtxo["txid"] = transfer.changeUtxo?.txid
        changeUtxo["vout"] = transfer.changeUtxo?.vout
        
        jsonObject["changeUtxo"] = changeUtxo

        jsonArray.append(jsonObject)
      }
      let jsonData = try JSONSerialization.data(withJSONObject: jsonArray, options: .prettyPrinted)
      let jsonString = String(data: jsonData, encoding: .utf8)!
      return jsonString
    }catch{
      print(error)
      return "{}"
    }
  }
  
  func getRgbAssets(wallet: RgbLib.Wallet, mnemonic: String, btcNetwotk: String)->String{
    do{
      let online = try wallet.goOnline(skipConsistencyCheck: true, electrumUrl: Constants.testnetElectrumUrl)
      let refresh = try wallet.refresh(online: online, assetId: nil, filter: [RgbLib.RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: true), RgbLib.RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: false)])
      
      let assets = try wallet.listAssets(filterAssetTypes: [])
      var jsonArray = [[String: Any]]()
      for asset in assets.rgb20! {
        var jsonObject = [String: Any]()
        jsonObject["assetId"] = asset.assetId
        jsonObject["futureBalance"] = asset.balance.future
        jsonObject["settledBalance"] = asset.balance.settled
        jsonObject["spendableBalance"] = asset.balance.spendable
        jsonObject["ticker"] = asset.ticker
        jsonObject["name"] = asset.name
        jsonObject["precision"] = asset.precision
        
        jsonArray.append(jsonObject)
      }
      let jsonData = try JSONSerialization.data(withJSONObject: jsonArray, options: .prettyPrinted)

      let data: [String: Any] = [
        "rgb20": jsonArray
      ]
      let json = Utility.convertToJSONString(params: data)
      return json
    }catch{
      return ""
    }
  }
  
  func genReceiveData(wallet: RgbLib.Wallet, mnemonic: String, btcNetwotk: String)->String{
    do{
      let online = try wallet.goOnline(skipConsistencyCheck: true, electrumUrl: Constants.testnetElectrumUrl)
      let refresh = try wallet.refresh(online: online, assetId: nil, filter: [RgbLib.RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: true), RgbLib.RefreshFilter(status: RefreshTransferStatus.waitingCounterparty, incoming: false)])

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
    let address = wallet.getAddress()
      let bdkWallet = BDKHelper.getWallet(mnemonic: mnemonic, network: btcNetwotk)
      BDKHelper.sync(wallet: bdkWallet!)
      do{
        let txid = BDKHelper.sendToAddress(address: address, amount: 9000, fee: 3.0, wallet: bdkWallet!)

        if(txid != "") {
          let online = try  wallet.goOnline(skipConsistencyCheck: true, electrumUrl: Constants.testnetElectrumUrl)
          var newUTXOs = UInt8(0)
          var attempts = 3
          while(newUTXOs == UInt8(0) && attempts > 0) {
            newUTXOs = try wallet.createUtxos(online: online, upTo: false, num: nil, size: nil, feeRate: 3.0)
            print("new utxo \(newUTXOs)")
            attempts-=1
          }
          if(newUTXOs != UInt8(0)) {
            return genReceiveData(wallet: wallet, mnemonic: mnemonic, btcNetwotk: btcNetwotk)
          }
          let data: [String: Any] = [
            "error": "Insufficient funds"
          ]
          let json = Utility.convertToJSONString(params: data)
          return json
        }
        let data: [String: Any] = [
          "error": "Insufficient funds"
        ]
        let json = Utility.convertToJSONString(params: data)
        return json

      }catch{
        print(error)
      }
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
  
  @objc func syncRgb(btcNetwotk: String, mnemonic: String,pubkey: String,callback: @escaping ((String) -> Void)){
    do {
      let wallet = (try getRgbWallet(bitcoinNetwork: btcNetwotk, pubkey: pubkey, mnemonic: mnemonic))!
      callback(getRgbAssets(wallet: wallet, mnemonic: mnemonic, btcNetwotk: btcNetwotk))
    }catch{
      callback("{}")
    }
  }
  
  @objc func getRgbAssetMetaData(btcNetwotk: String, mnemonic: String, pubkey: String, assetId:String, callback: @escaping ((String) -> Void)){
    do {
      let wallet = (try getRgbWallet(bitcoinNetwork: btcNetwotk, pubkey: pubkey, mnemonic: mnemonic))!
      callback(getRgbAssetMetaData(wallet: wallet, assetId: assetId))
    }catch{
      callback("{}")
    }
  }
  
  @objc func getRgbAssetTransactions(btcNetwotk: String, mnemonic: String, pubkey: String, assetId:String, callback: @escaping ((String) -> Void)){
    do {
      let wallet = (try getRgbWallet(bitcoinNetwork: btcNetwotk, pubkey: pubkey, mnemonic: mnemonic))!
      callback(getRgbAssetTransfers(wallet: wallet, assetId: assetId))
    }catch{
      print(error)
      callback("[]")
    }
  }
}
