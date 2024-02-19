//
//  BDKHelper.swift
//  HEXA
//
//  Created by Shashank Shinde on 27/06/23.
//

import Foundation
import BitcoinDevKit

struct BDKHelper{
  
  static let dbConfig : BitcoinDevKit.DatabaseConfig = BitcoinDevKit.DatabaseConfig.sqlite(config:  SqliteDbConfiguration(path: Utility.getBdkDbPath()));
  
  static func getWallet(mnemonic: String, network: String)->BitcoinDevKit.Wallet?{
    let network = getNetwork(network: network)
    do{
      let descriptorSecretKey = try BitcoinDevKit.DescriptorSecretKey(network: network, mnemonic: BitcoinDevKit.Mnemonic.fromString(mnemonic: mnemonic ), password: nil)
      let descriptor = try Descriptor(descriptor: calculateDescriptor(keys: descriptorSecretKey, network: network, change: false), network: network)
      let changeDescriptor = try Descriptor(descriptor: calculateDescriptor(keys: descriptorSecretKey, network: network, change: true), network: network)
      let wallet = try BitcoinDevKit.Wallet(descriptor: descriptor, changeDescriptor: changeDescriptor, network: network, databaseConfig: dbConfig)
      return wallet
    }catch{
      return nil
    }
  }
  
  static func getAddress(wallet: BitcoinDevKit.Wallet)->String{
    if let address = try? wallet.getAddress(addressIndex: BitcoinDevKit.AddressIndex.lastUnused).address.asString() {
      return address
    } else {
      return ""
    }
  }
  
  static func getBalance(wallet: BitcoinDevKit.Wallet)->String{
    if let balance = try? wallet.getBalance() {
      let data: [String: Any] = [
        "confirmed": balance.confirmed,
        "spendable": balance.spendable,
        "total": balance.total,
        "immature": balance.immature,
        "trustedPending": balance.trustedPending,
        "untrustedPending": balance.untrustedPending
      ]
      let json = Utility.convertToJSONString(params: data)
      return json
    } else {
      return "{}"
    }
  }
  
  static func sync(wallet: BitcoinDevKit.Wallet)->Bool{
    do{
      let blockchain = try Blockchain(config: BlockchainConfig.electrum(config: ElectrumConfig(url: Constants.testnetElectrumUrl, socks5: nil, retry: 3, timeout: 30, stopGap: 10, validateDomain: false)))
      try wallet.sync(blockchain: blockchain, progress:SyncProgress())
      return true
    }catch{
      print("sync error: \(error)")
      return false
    }
  }
  
  
 static func getTransactions(wallet: BitcoinDevKit.Wallet)->String{
   do{
     let txns = try wallet.listTransactions(includeRaw: true)
     let jsonTxns = txns.map { tx -> [String: Any] in
       return [
           "txid": tx.txid,
           "sent": tx.sent,
           "received": tx.received,
           "fee": tx.fee,
           "confirmationTime": tx.confirmationTime != nil ? String(tx.confirmationTime!.timestamp) : "",
           "transaction": [
            "txid": tx.transaction?.txid(),
            "weight": tx.transaction?.weight(),
            "size": tx.transaction?.size(),
            "vsize": tx.transaction?.vsize(),
            //"serialize": tx.transaction?.serialize(),
            "isCoinBase": tx.transaction?.isCoinBase(),
            "isExplicitlyRbfv": tx.transaction?.isExplicitlyRbf(),
            "version": tx.transaction?.version(),
            "lockTime": tx.transaction?.lockTime(),
            "input": tx.transaction?.input().map{ input in
              return [
                "previousOutput": [
                  "txid": input.previousOutput.txid,
                  "vout": String(input.previousOutput.vout),
                  //"scriptSig": input.scriptSig,
                  "sequence": String(input.sequence),
                  "witness": ""
                ]
              ]
            },
            "output": tx.transaction?.output().map{ op in
              return[
                "value": String(op.value),
                //"scriptPubkey": op.scriptPubkey
              ]
            },
           ]
       ]
   }
     
     if let jsonString = Utility.convertToJSONString(jsonTxns) {
       return jsonString
     } else {
         print("Failed to convert the struct array to JSON.")
     }
     return ""
   }catch{
     return ""
   }
  }
  
  static func sendToAddress(address: String, amount: UInt64, fee: Float, wallet: BitcoinDevKit.Wallet) throws -> String{
    do{
      let psbt = try BitcoinDevKit.TxBuilder()
        .addRecipient(script: BitcoinDevKit.Address(address: address).scriptPubkey(), amount: amount)
        .feeRate(satPerVbyte: fee)
        .finish(wallet: wallet)
        .psbt
      let sign = try wallet.sign(psbt: psbt, signOptions: nil)
      try getBlockchain()?.broadcast(transaction: psbt.extractTx())
      return psbt.txid()
    }catch{
      print("sendToAddress err: \(error)")
      throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: error.localizedDescription])
    }
  }
  
  
  static func calculateDescriptor(keys: BitcoinDevKit.DescriptorSecretKey,network: BitcoinDevKit.Network, change: Bool)->String{
    let changeNum = change ? "1" : "0"
    do{
      let path = try BitcoinDevKit.DerivationPath(path: "m/84'/"+getBitcoinDerivationPathCoinType(network: network)+"/0'/"+changeNum)
      let extend = try keys.extend(path: path).asString()
      return "wpkh(\(extend))"
    }catch{
      return ""
    }
  }
  
  static func getBitcoinDerivationPathCoinType(network: BitcoinDevKit.Network)->String{
    return network == BitcoinDevKit.Network.testnet ? "1'" : "0'"
  }
  
  static func getNetwork(network: String)->BitcoinDevKit.Network{
    return network == "TESTNET" ? BitcoinDevKit.Network.testnet : BitcoinDevKit.Network.bitcoin
  }
  
  static func getBlockchain()->BitcoinDevKit.Blockchain?{
    do{
      let blockchain = try Blockchain(config: BlockchainConfig.electrum(config: ElectrumConfig(url: Constants.testnetElectrumUrl, socks5: nil, retry: 3, timeout: 30, stopGap: 10, validateDomain: false)))
      return blockchain
    }
    catch{
      return nil
    }
  }
  
}

class SyncProgress: BitcoinDevKit.Progress {
    func update(progress: Float, message: String?) {
      print("progress: \(progress)")

        print("SyncProgress")
        // Handle the progress update here
        print("Progress: \(progress * 100)%")
        if let message = message {
            print("Message: \(message)")
        }
    }
}
