import { asyncPkceChallenge } from 'pkce-utils'



export const generatePKCEParameters = async () => {
  const challenge = await asyncPkceChallenge()
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



// Leaving this commented for modifying in future release



// const generateChallenge = ( verifier ) => {
//     .createHash( 'sha256' )
//     .update( verifier )
//     .digest( 'hex' ) )
//   return base64UrlEncode(
//     crypto
//       .createHash( 'sha256' )
//       .update( verifier )
//       .digest( 'hex' )
//   )
// }

// const  generateVerifier = async ()=> {
//   return base64UrlEncode( await generateRandomBytes( 96 ) )
// }


// const asyncPkceChallenge = () =>{
//   return new Promise( ( resolve ) => {
//     generateVerifier().then( ( verifier ) => {
//       const challenge = generateChallenge( verifier )
//       resolve( {
//         codeChallenge: challenge,
//         codeVerifier: verifier
//       } )
//     } )
//   } )
// }

