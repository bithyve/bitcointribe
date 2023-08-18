/* Adapted by SuperPhatArrow */
/* cspell: disable */
/*	============================================================================
                      Gibson Research Corporation
            UHEPRNG - Ultra High Entropy Pseudo-Random Number Generator
      ============================================================================
      LICENSE AND COPYRIGHT:  THIS CODE IS HEREBY RELEASED INTO THE PUBLIC DOMAIN
      Gibson Research Corporation releases and disclaims ALL RIGHTS AND TITLE IN
      THIS CODE OR ANY DERIVATIVES. Anyone may be freely use it for any purpose.
      ============================================================================
      This is GRC's cryptographically strong PRNG (pseudo-random number generator)
      for JavaScript. It is driven by 1536 bits of entropy, stored in an array of
      48, 32-bit JavaScript variables.  Since many applications of this generator,
      including ours with the "Off The Grid" Latin Square generator, may require
      the deteriministic re-generation of a sequence of PRNs, this PRNG's initial
      entropic state can be read and written as a static whole, and incrementally
      evolved by pouring new source entropy into the generator's internal state.
      ----------------------------------------------------------------------------
      ENDLESS THANKS are due Johannes Baagoe for his careful development of highly
      robust JavaScript implementations of JS PRNGs.  This work was based upon his
      JavaScript "Alea" PRNG which is based upon the extremely robust Multiply-
      With-Carry (MWC) PRNG invented by George Marsaglia. MWC Algorithm References:
      http://www.GRC.com/otg/Marsaglia_PRNGs.pdf
      http://www.GRC.com/otg/Marsaglia_MWC_Generators.pdf
      ----------------------------------------------------------------------------
      The quality of this algorithm's pseudo-random numbers have been verified by
      multiple independent researchers. It handily passes the fermilab.ch tests as
      well as the "diehard" and "dieharder" test suites.  For individuals wishing
      to further verify the quality of this algorithm's pseudo-random numbers, a
      256-megabyte file of this algorithm's output may be downloaded from GRC.com,
      and a Microsoft Windows scripting host (WSH) version of this algorithm may be
      downloaded and run from the Windows command prompt to generate unique files
      of any size:
      The Fermilab "ENT" tests: http://fourmilab.ch/random/
      The 256-megabyte sample PRN file at GRC: https://www.GRC.com/otg/uheprng.bin
      The Windows scripting host version: https://www.GRC.com/otg/wsh-uheprng.js
      ----------------------------------------------------------------------------
      Qualifying MWC multipliers are: 187884, 686118, 898134, 1104375, 1250205,
      1460910 and 1768863. (We use the largest one that's < 2^21)
      ============================================================================ */

/*	============================================================================
      This is based upon Johannes Baagoe's carefully designed and efficient hash
      function for use with JavaScript.  It has a proven "avalanche" effect such
      that every bit of the input affects every bit of the output 50% of the time,
      which is good.	See: http://baagoe.com/en/RandomMusings/hash/avalanche.xhtml
      ============================================================================
    */
function Mash() {
  let n = 0xefc8249d
  const mash = function ( data ) {
    if ( data ) {
      data = data.toString()
      for ( let i = 0; i < data.length; i++ ) {
        n += data.charCodeAt( i )
        let h = 0.02519603282416938 * n
        n = h >>> 0
        h -= n
        h *= n
        n = h >>> 0
        h -= n
        n += h * 0x100000000 // 2^32
      }
      return ( n >>> 0 ) * 2.3283064365386963e-10 // 2^-32
    } else n = 0xefc8249d
  }
  return mash
}

function uheprng() {
  return ( function () {
    const o = 48
    let c = 1
    let p = o
    const s = new Array( o )
    let mash = Mash()
    function rawprng() {
      if ( ++p >= o ) p = 0
      const t = 1768863 * s[ p ] + c * 2.3283064365386963e-10
      return ( s[ p ] = t - ( c = t | 0 ) )
    }
    const random = function ( range = 2 ) {
      return Math.floor(
        range *
                ( rawprng() + ( ( rawprng() * 0x200000 ) | 0 ) * 1.1102230246251565e-16 )
      )
    }
    random.cleanString = function ( inStr = '' ) {
      inStr = inStr.replace( /(^\s*)|(\s*$)/gi, '' )
      inStr = inStr.replace( /[\x00-\x1F]/gi, '' )
      inStr = inStr.replace( /\n /, '\n' )
      return inStr
    }
    random.hashString = function ( inStr = '' ) {
      inStr = random.cleanString( inStr )
      mash( inStr )
      for ( let i = 0; i < inStr.length; i++ ) {
        const k = inStr.charCodeAt( i )
        for ( let j = 0; j < o; j++ ) {
          s[ j ] -= mash( k )
          if ( s[ j ] < 0 ) s[ j ] += 1
        }
      }
    }
    random.initState = function () {
      mash()
      for ( let i = 0; i < o; i++ ) s[ i ] = mash( ' ' )
      c = 1
      p = o
    }
    random.done = function () {
      mash = null
    }
    random.initState()
    return random
  } )()
}

export default uheprng
/*cspell:enable*/
