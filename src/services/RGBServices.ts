import { NativeModules } from 'react-native'
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

  static restoreKeys = async ( mnemonic: string ): Promise<RGBConfig> => {
    const keys = await RGB.restoreKeys(
      NETWORK,
      mnemonic
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

  static initiate = async ( mnemonic: string, pubKey: string ): Promise<string> => {
    try {
      const data = await RGB.initiate(
        NETWORK,
        mnemonic,
        pubKey,
      )
      return JSON.parse( data )
    } catch ( error ) {
      return `${error}`
    }
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
    const assets = await RGB.syncRgbAssets(
      mnemonic,
      pubKey,
      NETWORK
    )
    return JSON.parse( assets )
  }

  static sendBtc = async ( mnemonic: string, address: string, amount: string, feeRate: Number ): Promise<string> => {
    const txid = await RGB.sendBtc(
      mnemonic,
      NETWORK,
      address,
      amount,
      feeRate
    )
    return JSON.parse( txid )
  }

  static receiveAsset = async ( mnemonic: string ): Promise<string> => {
    try {
      const data = await RGB.receiveAsset(
        mnemonic,
        NETWORK
      )
      return JSON.parse( data )
    } catch ( error ) {
      return `${error}`
    }
  }

  static getRgbAssetMetaData = async ( assetId: string ): Promise<{}> => {
    const data = await RGB.getRgbAssetMetaData(
      assetId,
    )
    return JSON.parse( data )
  }

  static getRgbAssetTransactions = async ( assetId: string ): Promise<{}> => {
    const data = await RGB.getRgbAssetTransactions(
      assetId,
    )
    return JSON.parse( data )
  }

  static issueRgb20Asset = async ( ticker: string, name: string, supply: string ): Promise<{}> => {
    const data = await RGB.issueRgb20Asset(
      ticker, name, supply
    )
    return JSON.parse( data )
  }

  static issueRgb25Asset = async ( name: string, description: string, supply: string, filePath: string ): Promise<{}> => {
    const data = await RGB.issueRgb25Asset(
      description, name, supply, filePath
    )
    return JSON.parse( data )
  }

  static sendAsset = async ( assetId: string, blindedUTXO: string, amount: string, consignmentEndpoints: string ): Promise<{}> => {
    const data = await RGB.sendAsset(
      assetId, blindedUTXO, amount, consignmentEndpoints
    )
    return JSON.parse( data )
  }

  static getUnspents = async ( ): Promise<{}> => {
    const data = await RGB.getUnspents()
    return JSON.parse( data )
  }
  
  static backup = async ( path: string, password: string ): Promise<string> => {
    const data = await RGB.backup( path, password )
    return data
  }

  static isBackupRequired = async (): Promise<{}> => {
    const data = await RGB.isBackupRequired( )
    return data
  }

  static restore = async (mnemonic: string): Promise<{}> => {
    const data = await RGB.restore( mnemonic )
    return data
  }

  static isValidBlindedUtxo = async (invoiceData: string): Promise<{}> => {
    const data = await RGB.isValidBlindedUtxo( invoiceData )
    return data
  }
}
