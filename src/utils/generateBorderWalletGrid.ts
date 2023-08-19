import { GridType } from '../bitcoin/utilities/Interface'
import uheprng from './uheprng'
import * as bip39 from 'bip39'

const wordlists = bip39.wordlists.english


const rnd11Bit = ( limit = 2048 ) => {
  let small = limit
  while ( small >= limit ) {
    const big = crypto.getRandomValues( new Uint16Array( 1 ) )[ 0 ]
    const bigString = big.toString( 2 ).padStart( 16, '0' )
    const smallString = bigString.slice( 5 )
    small = parseInt( smallString, 2 )
  }
  return small
}

const shuffle = ( array, seed ) => {
  const prng = uheprng()
  let getRandom = rnd11Bit
  if ( seed ) {
    prng.initState()
    prng.hashString( seed )
    getRandom = prng
  }
  for ( let i = array.length - 1; i > 0; i-- ) {
    const j = getRandom( i + 1 );
    [ array[ i ], array[ j ] ] = [ array[ j ], array[ i ] ]
  }
  prng.done()
}

export const generateBorderWalletGrid = ( mnemonic: string, gridType ): string[] => {
  const words = [ ...wordlists ]
  shuffle( words, mnemonic )
  const cells = words.map( ( word ) => {
    switch ( gridType ) {
        case GridType.WORDS:
          return word.slice( 0, 4 )
        case GridType.HEXADECIMAL:
          return ' ' + ( wordlists.indexOf( word ) + 1 ).toString( 16 ).padStart( 3, '0' )
        case GridType.NUMBERS:
          return ( wordlists.indexOf( word ) + 1 ).toString().padStart( 4, '0' )
        default:
          return ' '
    }
  } )
  return cells
}
