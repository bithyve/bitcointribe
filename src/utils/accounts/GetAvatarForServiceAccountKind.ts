import { ImageSourcePropType } from 'react-native'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'

export default function getAvatarForServiceAccountKind(
  serviceAccountKind: ServiceAccountKind,
): ImageSourcePropType {
  switch ( serviceAccountKind ) {
      case ServiceAccountKind.FNF_ACCOUNT:
        return require( '../../assets/images/addaccount/f&f.png' )
      case ServiceAccountKind.FAST_BITCOINS:
        return require( '../../assets/images/icons/icon_fastbitcoins_hex_dark.png' )
      case ServiceAccountKind.SWAN:
        return require( '../../assets/images/icons/icon_swan.png' )
      case ServiceAccountKind.WYRE:
        return require( '../../assets/images/icons/icon_wyre.png' )
      case ServiceAccountKind.RAMP:
        return require( '../../assets/images/icons/icon_ramp.png' )
      case ServiceAccountKind.COMMUNITY_ACCOUNT:
        return require( '../../assets/images/addaccount/community.png' )
      default:
        return require( '../../assets/images/icons/icon_hexa.png' )
  }
}
