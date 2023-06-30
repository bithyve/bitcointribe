import {  NativeModules } from 'react-native'
import { NetworkType, RGBConfig } from '../bitcoin/utilities/Interface'

const { RGB } = NativeModules
const NETWORK = NetworkType.TESTNET

export default class RGBServices{
  static generateKeys = async (): Promise<RGBConfig> => {
    const keys = await RGB.generateKeys(
      NETWORK
    )
    return JSON.parse( keys )
  }

  static getAddress = async ( mnemonic: string ): Promise<string> => {
    const address = await RGB.getAddress(
      mnemonic,
      NETWORK
    )
    return address
  }

  static getBalance = async ( mnemonic: string ): Promise<string> => {
    const balance = await RGB.getBalance(
      mnemonic,
      NETWORK
    )
    return JSON.parse( balance )
  }

  static getTransactions = async ( mnemonic: string ): Promise<[]> => {
    const txns = await RGB.getTransactions(
      mnemonic,
      NETWORK
    )
    return JSON.parse( txns )
  }

  static sync = async ( mnemonic: string ): Promise<string> => {
    const isSynched = await RGB.sync(
      mnemonic,
      NETWORK
    )
    return isSynched
  }

  static syncRgbAssets = async ( mnemonic: string, pubKey: string ): Promise<string> => {
    const assets = await RGB.syncRgbAsset(
      mnemonic,
      pubKey,
      NETWORK
    )
    return JSON.parse( assets )
  }

  static sendBtc = async ( mnemonic: string, address: string, amount: Number ): Promise<string> => {
    const txid = await RGB.sendBtc(
      mnemonic,
      NETWORK,
      address,
      `${amount}`
    )
    return txid
  }

  static receiveAsset = async ( mnemonic: string, pubKey: string ): Promise<string> => {
    try {
      const data = await RGB.receiveAsset(
        mnemonic,
        pubKey,
        NETWORK
      )
      return JSON.parse( data )
    } catch ( error ) {
      return `${error}`
    }
  }

  static getRgbAssetMetaData = async ( mnemonic: string, pubKey: string, assetId: string ): Promise<{}> => {
    const data = await RGB.getRgbAssetMetaData(
      mnemonic,
      pubKey,
      assetId,
      NETWORK
    )
    return JSON.parse( data )
  }

  static getRgbAssetTransactions = async ( mnemonic: string, pubKey: string, assetId: string ): Promise<{}> => {
    const data = await RGB.getRgbAssetTransactions(
      mnemonic,
      pubKey,
      assetId,
      NETWORK
    )
    return JSON.parse( data )
  }
}
