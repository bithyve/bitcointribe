import Tor, { RequestMethod } from 'react-native-tor'
const tor = Tor()
const doTorRequest = async <T extends RequestMethod>(
  url: string,
  method: T,
  data?: string,
  headers?: any,
  trustSSL = true
) => {
  try {
    const port  = await tor.startIfNotStarted()
    console.log( 'PORT', port )
    console.log( 'url', url )
    console.log( 'data', data )

    switch ( method.toLowerCase() ) {
        case RequestMethod.GET:
          const getResult = await tor.get( url, headers, trustSSL )
          if ( getResult.json ) {
            return getResult.json
          }
        case RequestMethod.POST:
          const postResult = await tor.post(
            url,
            data,
            headers,
            trustSSL
          )
          console.log( {
            url,
            data,
            headers,
          } )

          console.log( 'postResult', postResult )
          if ( postResult.json ) {
            return postResult.json
          } else{
            return {
            }
          }
        case RequestMethod.DELETE:
          const deleteResult = await tor.delete( url, data, headers, trustSSL )
          if ( deleteResult.json ) {
            return deleteResult.json
          }
          break
    }
  } catch ( error ) {
    console.log( error )
    return {
    }
  }
}
export { doTorRequest, RequestMethod }
