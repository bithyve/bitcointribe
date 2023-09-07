/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as SecureStore from 'react-native-encrypted-storage'
import config from '../bitcoin/HexaConfig'

export const store = async ( hash, enc_key ) => {
  try {
    await SecureStore.default.setItem(
      config.ENC_KEY_STORAGE_IDENTIFIER,
      JSON.stringify( {
        hash, enc_key
      } )
    )
  } catch ( err ) {
    console.log( err )
    return false
  }
  return true
}

export const fetch = async ( hash_current ) => {
  try {
    let hash: any, enc_key: any

    const value = await SecureStore.default.getItem(
      config.ENC_KEY_STORAGE_IDENTIFIER
    )
    console.log( 'value: ', value, '\n hash_current: ', hash_current )
    if ( value ) {
      ( { hash, enc_key } = JSON.parse( value ) )
      console.log( 'hash_current: ', hash_current, '\n hash: ', hash )
      if ( hash_current !== hash ) {
        throw new Error( 'Incorrect passcode' )
      } else
        return enc_key
    }
  } catch ( err ) {
    console.log( 'Fetch err:', err )
    throw err
  }
}

export const remove = async ( key ) => {
  try {
    console.log( 'trying to remove' )
    await SecureStore.default.removeItem( key )
  } catch ( err ) {
    console.log( err )
    return false
  }
  return true
}
