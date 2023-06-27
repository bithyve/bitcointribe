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
}
