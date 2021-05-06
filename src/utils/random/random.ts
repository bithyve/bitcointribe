import { randomBytes } from 'crypto'
import crypto from  'crypto'

export const generateRandomBytes= ( size = 96 ) => {
  randomBytes( size, ( err, buffer ) => {
    const bytes = buffer.toString( 'base64' )

    return ( bytes )
  } )
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
