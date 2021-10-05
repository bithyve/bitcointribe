import { ImageSourcePropType } from 'react-native'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'

export default function getAvatarForServiceAccountKind(
  serviceAccountKind: ServiceAccountKind,
  isHome?: boolean,
  isAccount?: boolean
): ImageSourcePropType {
  switch ( serviceAccountKind ) {
      case ServiceAccountKind.FNF_ACCOUNT:
        return require( '../../assets/images/addaccount/f&f.png' )
      case ServiceAccountKind.FAST_BITCOINS:
        return require( '../../assets/images/icons/icon_fastbitcoins_hex_dark.png' )
      case ServiceAccountKind.SWAN:
        return isAccount ? require( '../../assets/images/icons/icon_swan.png' ) : isHome ? require( '../../assets/images/accIcons/icon_swan.png' ) : require( '../../assets/images/icons/icon_swan.png' )
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
