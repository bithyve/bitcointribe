import { ImageSourcePropType } from 'react-native'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import getAvatarForServiceAccountKind from './GetAvatarForServiceAccountKind'

export default function getAvatarForSubAccount(
  subAccount: SubAccountDescribing,
  active?: boolean
): ImageSourcePropType {
  switch ( subAccount.kind ) {
      case SubAccountKind.TEST_ACCOUNT:
        return active ? require( '../../assets/images/addaccount/test_white.png' ) : require( '../../assets/images/addaccount/test.png' )
      case SubAccountKind.REGULAR_ACCOUNT:
        return active ? require( '../../assets/images/addaccount/checking_white.png' ) : require( '../../assets/images/addaccount/checking.png' )
      case SubAccountKind.SECURE_ACCOUNT:
        return require( '../../assets/images/addaccount/savings.png' )
      case SubAccountKind.TRUSTED_CONTACTS:
        return require( '../../assets/images/icons/icon_hexa.png' )
      case SubAccountKind.DONATION_ACCOUNT:
        return require( '../../assets/images/addaccount/icon_donation.png' )
      case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
        return require( '../../assets/images/addaccount/view.png' )
      case SubAccountKind.FULLY_IMPORTED_WALLET:
        return require( '../../assets/images/addaccount/icon_wallet.png' )
      case SubAccountKind.SERVICE:
        return getAvatarForServiceAccountKind( ( subAccount as ExternalServiceSubAccountInfo ).serviceAccountKind )
      default:
        return require( '../../assets/images/icons/icon_hexa.png' )
  }
}
