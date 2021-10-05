import semver from 'semver'
import DeviceInfo from 'react-native-device-info'
import { Alert } from 'react-native'
import Relay from '../bitcoin/utilities/Relay'

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
    const { compatible, alternatives }  = await Relay.checkCompatibility( relayCheckMethod, version )

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
