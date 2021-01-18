import crypto from 'crypto'
import base64url from 'base64url'

export const generatePKCEParameters = () => {
  console.log( ' made it to generator' )
  const code_verifier = generateRandomString( 64 )

  const base64Digest = crypto
    .createHash( 'sha256' )
    .update( code_verifier )
    .digest( 'base64' )

  const code_challenge = base64url.fromBase64( base64Digest )

  const nonce = `${generateRandomNumber ( 11 )}-${generateRandomString( 3 )}`

  const state = `${generateRandomNumber ( 11 )}-${generateRandomString( 3 )}`

  return {
    code_challenge, code_verifier, nonce, state
  }
}

const generateRandomString = ( length: number ): string => {
  let randomString = ''
  const possibleChars = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  for ( let itr = 0; itr < length; itr++ ) {
    randomString += possibleChars.charAt(
      Math.floor( Math.random() * possibleChars.length ),
    )
  }
  return randomString
}

const generateRandomNumber = ( digits: number ): number => Math.floor( Math.random() * 10**digits )
