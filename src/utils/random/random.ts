import { randomBytes } from 'crypto'
import crypto from  'crypto'

export const generateRandomBytes = async ( size = 96 ) => {
  const buffer = await randomBytes( size )
  const bytes = buffer.toString( 'base64' )
  return bytes
}

export const base64UrlEncode = ( s ) => {
  {
    return s
      .replace( /\+/g, '-' )
      .replace( /\//g, '_' )
      .replace( /=/g, '' )
  }
}

export const generateChallenge = ( verifier ) => {
  return base64UrlEncode(
    crypto
      .createHash( 'sha256' )
      .update( verifier )
      .digest( 'hex' )
  )
}
