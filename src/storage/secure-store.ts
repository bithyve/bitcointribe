/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Platform } from 'react-native'
import * as SecureStore from 'react-native-encrypted-storage'
import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage'
import config from '../bitcoin/HexaConfig'

export const store = async ( hash, enc_key ) => {
  try {
    if ( Platform.OS === 'android' ) {
      if ( await RNSecureStorage.exists( config.ENC_KEY_STORAGE_IDENTIFIER ) ) {
        console.log( 'Old key identified, removing...' )
        await RNSecureStorage.remove( config.ENC_KEY_STORAGE_IDENTIFIER )
      }

      await RNSecureStorage.set(
        config.ENC_KEY_STORAGE_IDENTIFIER,
        JSON.stringify( {
          hash, enc_key
        } ),
        {
          accessible: ACCESSIBLE.WHEN_UNLOCKED
        },
      )
    } else {
      await SecureStore.default.setItem(
        config.ENC_KEY_STORAGE_IDENTIFIER,
        JSON.stringify( {
          hash, enc_key
        } )
      )
    }
  } catch ( err ) {
    console.log( err )
    return false
  }
  return true
}

export const fetch = async ( hash_current ) => {
  try {
    let hash: any, enc_key: any, value: any

    if ( Platform.OS === 'android' ) {
      if ( await RNSecureStorage.exists( config.ENC_KEY_STORAGE_IDENTIFIER ) ) {
        value = await RNSecureStorage.get( config.ENC_KEY_STORAGE_IDENTIFIER )
      }
    } else {
      value = await SecureStore.default.getItem(
        config.ENC_KEY_STORAGE_IDENTIFIER
      )
    }
    console.log( 'value: ', value, '\n hash_current: ', hash_current )
    if ( value ) {
      ( { hash, enc_key } = JSON.parse( value ) )

      if ( hash_current !== hash ) {
        throw new Error( 'Incorrect passcode' )
      } else
        return enc_key
    } else {
      throw new Error( 'Identifier missing' )
    }
  } catch ( err ) {
    console.log( 'Fetch err:', err )
    throw err
  }
}

export const remove = async ( key ) => {
  try {
    console.log( 'trying to remove' )
    if ( Platform.OS === 'android' ) {
      if ( await RNSecureStorage.exists( key ) ) {
        await RNSecureStorage.remove( key )
      }
    } else {
      await SecureStore.default.removeItem( key )
    }
  } catch ( err ) {
    console.log( err )
    return false
  }
  return true
}
