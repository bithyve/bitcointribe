import RESTUtils from './RESTUtils'
import MacaroonUtils from './MacaroonUtils'

class LndConnectUtils {
    procesBtcPayConfig =async ( url: string ) => {
      return RESTUtils.processLndQR( url )
    }

    processLndConnectUrl = ( input: string ) => {
      let host, port, macaroonHex
      const lndconnect = input.split( 'lndconnect://' )[ 1 ]
      const params = input.split( '?' )[ 1 ]

      const result: any = {
      }
      if ( params ) {
        params.split( '&' ).forEach( function( part ) {
          const item = part.split( '=' )
          result[ item[ 0 ] ] = decodeURIComponent( item[ 1 ] )
        } )
      }

      // is IPv6
      if ( input.includes( '[' ) ) {
        host = lndconnect && lndconnect.split( ']:' )[ 0 ] + ']'
        port =
              lndconnect &&
              lndconnect.split( ']:' )[ 1 ] &&
              lndconnect.split( ']:' )[ 1 ].split( '?' )[ 0 ]
      } else {
        host = lndconnect && lndconnect.split( ':' )[ 0 ]
        port =
              lndconnect &&
              lndconnect.split( ':' )[ 1 ] &&
              lndconnect.split( ':' )[ 1 ].split( '?' )[ 0 ]
      }
      macaroonHex =
          result.macaroon && MacaroonUtils.base64UrlToHex( result.macaroon )

      // prepend https by default
      host = 'https://' + host

      const enableTor: boolean = host.includes( '.onion' )

      return {
        host, port, macaroonHex, enableTor
      }
    };
}
export default new LndConnectUtils()

