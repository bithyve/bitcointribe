import { ImageSourcePropType } from 'react-native'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import SubAccountKind from '../../common/data/enums/SubAccountKind'

export function iconForAccountKind( kind: SubAccountKind ): ImageSourcePropType {
  switch ( kind ) {
      case SubAccountKind.TEST_ACCOUNT:
        return require( '../../assets/images/icons/icon_test.png' )
      case SubAccountKind.REGULAR_ACCOUNT:
        return require( '../../assets/images/icons/icon_checking.png' )
      case SubAccountKind.SECURE_ACCOUNT:
        return require( '../../assets/images/icons/icon_savings.png' )
      case SubAccountKind.TRUSTED_CONTACTS:
        return require( '../../assets/images/icons/icon_wallet.png' )
      case SubAccountKind.DONATION_ACCOUNT:
        return require( '../../assets/images/icons/icon_donation_hexa.png' )
      case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
        return require( '../../assets/images/icons/icon_import_watch_only_wallet.png' )
      case SubAccountKind.FULLY_IMPORTED_WALLET:
        return require( '../../assets/images/icons/icon_wallet.png' )
      default:
        return require( '../../assets/images/icons/icon_wallet.png' )
  }
}

export function iconForServiceAccountKind(
  kind: ServiceAccountKind,
): ImageSourcePropType {
  switch ( kind ) {
      case ServiceAccountKind.WHIRLPOOL:
      // TODO: Figure out the right icon for this
        return require( '../../assets/images/icons/icon_wallet.png' )
      case ServiceAccountKind.COLLABORATIVE_CUSTODY:
      // TODO: Figure out the right icon for this
        return require( '../../assets/images/icons/icon_wallet.png' )
      case ServiceAccountKind.S3:
      // TODO: Figure out the right icon for this
        return require( '../../assets/images/icons/icon_cloud.png' )
      case ServiceAccountKind.SWAN:
        return require( '../../assets/images/icons/icon_swan.png' )
      default:
        return require( '../../assets/images/icons/icon_wallet.png' )
  }
}
