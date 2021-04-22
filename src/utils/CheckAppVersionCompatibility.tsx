import semver from 'semver'
import DeviceInfo from 'react-native-device-info'
import RelayServices from '../bitcoin/services/RelayService'
import { Alert } from 'react-native'

type Props = {
  relayCheckMethod: string;
  version: string;
};

export default async function checkAppVersionCompatibility( {
  relayCheckMethod,
  version
}: Props ) {
  if ( !semver.valid( version ) ) {
    // handling exceptions: off standard versioning
    if ( version === '0.9' ) version = '0.9.0'
    else if ( version === '1.0' ) version = '1.0.0'
  }

  if ( version && semver.gt( version, DeviceInfo.getVersion() ) ) {
    // checking compatibility via Relay
    const res = await RelayServices.checkCompatibility( relayCheckMethod, version )

    if ( res.status !== 200 ) {
      console.log( 'Failed to check compatibility' )
      return true
    }

    const { compatible, alternatives } = res.data

    if ( !compatible ) {
      if ( !alternatives ) {
        return false
      } else {
        if ( alternatives.update ) {
          Alert.alert( 'Update your app in order to process this link/QR' )
        } else if ( alternatives.message ) {
          Alert.alert( alternatives.message )
        } else {
          Alert.alert( 'Incompatible link/QR, updating your app might help' )
        }
      }
    }

    return compatible
  }

  return true
}
