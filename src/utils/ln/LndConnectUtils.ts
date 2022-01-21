import RESTUtils from './RESTUtils'

class LndConnectUtils {
    processLndConnectUrl =async ( url: string ) => {
      return RESTUtils.processLndQR( url )
    }
}
export default new LndConnectUtils()

