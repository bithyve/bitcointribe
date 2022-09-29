import axios, { AxiosResponse } from 'axios'
import Tor, { RequestResponse } from 'react-native-tor'
import config from '../../bitcoin/HexaConfig'
import DeviceInfo from 'react-native-device-info'
import { Platform } from 'react-native'

const { HEXA_ID } = config
const tor = Tor( {
  stopDaemonOnBackground: true,
} )

enum TorStatus {
  OFF = 'OFF',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR',
  CONNECTED = 'CONNECTED',
}

class RestClient {
  public static useTor: boolean;
  public static headers: object;
  public static torStatus: TorStatus = TorStatus.OFF;
  public static torPort: number | null = null;

  subscribers = [];

  subToTorStatus( observer ) {
    this.subscribers.push( observer )
  }

  unsubscribe( observer ) {
    this.subscribers = this.subscribers.filter( ( ob ) => ob !== observer )
  }

  notify( status: TorStatus, message ) {
    this.subscribers.forEach( ( observer ) => observer( status, message ) )
  }

  constructor() {
    RestClient.headers = {
      'HEXA-ID': HEXA_ID,
      HEXA_ID: HEXA_ID,
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      os: Platform.OS,
    }
  }

  async setUseTor( useTor: boolean ) {
    RestClient.useTor = useTor
    if ( useTor ) {
      this.initTor()
    } else {
      await tor.stopIfRunning()
      this.updateTorStatus( TorStatus.OFF )
    }
  }

  private updateTorStatus( status: TorStatus, message = '' ) {
    RestClient.torStatus = status
    this.notify( status, message )
  }

  getCommonHeaders(): object {
    return RestClient.headers
  }

  getTorStatus(): TorStatus {
    return RestClient.torStatus
  }

  getTorPort(): number | null {
    return RestClient.torPort
  }

  private async initTor() {
    try {
      this.updateTorStatus( TorStatus.CONNECTING )
      const port = await tor.startIfNotStarted()
      if ( port ) {
        console.log( 'Tor started on PORT: ', port )
        RestClient.torPort = port
        this.updateTorStatus( TorStatus.CONNECTED, `Tor started on PORT: ${port}` )
      } else {
        this.updateTorStatus( TorStatus.ERROR, 'Failed to connect to tor daemon' )
      }
    } catch ( error ) {
      await tor.stopIfRunning()
      this.updateTorStatus( TorStatus.ERROR, error.message )
    }
  }

  getCircularReplacer() {
    const seen = new WeakSet()
    return ( key, value ) => {
      if ( typeof value === 'object' && value !== null ) {
        if ( seen.has( value ) ) {
          return
        }
        seen.add( value )
      }
      return value
    }
  }

  async post(
    path: string,
    body: object,
    headers?: object
  ): Promise<AxiosResponse | RequestResponse> {
    if ( RestClient.useTor && RestClient.torStatus === TorStatus.CONNECTED ) {
      // console.log(
      //   `using tor to connect  ${path}`,
      //   JSON.stringify(body, this.getCircularReplacer())
      // );
      return tor.post(
        path,
        JSON.stringify( body, this.getCircularReplacer() ),
        {
          ...RestClient.headers,
          ...headers,
        },
        true
      )
    } else {
      return axios.post( path, body, {
        headers: {
          ...RestClient.headers,
          ...headers,
        },
      } )
    }
  }

  async get( path: string, headers?: object ): Promise<AxiosResponse | RequestResponse> {
    if ( RestClient.useTor && RestClient.torStatus === TorStatus.CONNECTED ) {
      return tor.get(
        path,
        {
          ...RestClient.headers,
          ...headers,
        },
        true
      )
    } else {
      return axios.post( path, {
        headers: {
          ...RestClient.headers,
          ...headers,
        },
      } )
    }
  }
}

export default new RestClient()
export { TorStatus }
