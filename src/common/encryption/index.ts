import cryptoJS from 'crypto-js'
import 'react-native-get-random-values'

export const encrypt = ( data, key ) => {
  const ciphertext = cryptoJS.AES.encrypt( JSON.stringify( data ), key )
  return ciphertext.toString()
}

export const decrypt = ( ciphertext, key ) => {
  try{
    console.log('skk decrypt inside')
    const bytes = cryptoJS.AES.decrypt( ciphertext.toString(), key )
    console.log('skk bytes', JSON.stringify(bytes))
    const decryptedData = JSON.parse( bytes.toString( cryptoJS.enc.Utf8 ) )
    console.log('skk decryptedData', JSON.stringify(decryptedData))
    return decryptedData
  } catch( e ){
    console.log('skk e', JSON.stringify(e))
    return null
  }

}

export const decrypt1 = ( ciphertext, key ) => {
  const info2 = cryptoJS.AES.decrypt( ciphertext, key ).toString( cryptoJS.enc.Utf8 )
  return info2
}
export const hash = data => cryptoJS.SHA512( data ).toString()
export const hash256 = data => cryptoJS.SHA256( data ).toString()

export function stringToArrayBuffer( byteString ) {
  const byteArray = new Uint8Array( byteString.length )
  for ( let i = 0; i < byteString.length; i++ ) {
    byteArray[ i ] = byteString.codePointAt( i )
  }
  return byteArray
}

export const generateKey = async () => {
  const randomBytes = await crypto.getRandomValues( new Uint8Array( 16 ) )
  return hash256( randomBytes.toString() )
}
