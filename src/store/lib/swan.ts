import crypto from 'crypto'
import base64url from 'base64url'

import { asyncPkceChallenge } from 'react-native-pkce-challenge'


export const generatePKCEParameters = async () => {
  const challenge = await asyncPkceChallenge()
  console.log( {
    challenge
  } )
  const code_challenge = challenge.codeChallenge
  const code_verifier = challenge.codeVerifier

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
