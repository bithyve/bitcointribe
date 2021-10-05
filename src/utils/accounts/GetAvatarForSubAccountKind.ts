import { ImageSourcePropType } from 'react-native'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import getAvatarForServiceAccountKind from './GetAvatarForServiceAccountKind'

export default function getAvatarForSubAccount(
  subAccount: SubAccountDescribing,
  active?: boolean,
  isHome?: boolean,
  isAccount?: boolean
): ImageSourcePropType {
  // switch ( subAccount.kind ) {
  //     case SubAccountKind.TEST_ACCOUNT:
  //       return require( '../../assets/images/icons/icon_test.png' )
  //     case SubAccountKind.REGULAR_ACCOUNT:
  //       return require( '../../assets/images/icons/icon_regular.png' )
  //     case SubAccountKind.SECURE_ACCOUNT:
  //       return require( '../../assets/images/icons/icon_secureaccount.png' )
  //     case SubAccountKind.TRUSTED_CONTACTS:
  //       return require( '../../assets/images/icons/icon_hexa.png' )
  //     case SubAccountKind.DONATION_ACCOUNT:
  //       return require( '../../assets/images/icons/icon_donation_hexa.png' )
  //     case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
  //       return require( '../../assets/images/icons/icon_import_watch_only_wallet.png' )
  //     case SubAccountKind.FULLY_IMPORTED_WALLET:
  //       return require( '../../assets/images/icons/icon_wallet.png' )
  //     case SubAccountKind.SERVICE:
  //       return getAvatarForServiceAccountKind( ( subAccount as ExternalServiceSubAccountInfo ).serviceAccountKind )
  //     default:
  //       return require( '../../assets/images/icons/icon_hexa.png' )
  // }
  switch ( subAccount.kind ) {
      case SubAccountKind.TEST_ACCOUNT:
        return isAccount ? require( '../../assets/images/accIcons/acc_icon_test.png' ) : isHome ? require( '../../assets/images/accIcons/icon_test.png' ) : active ? require( '../../assets/images/addaccount/test_white.png' ) : require( '../../assets/images/addaccount/test.png' )
      case SubAccountKind.REGULAR_ACCOUNT:
        return isAccount ? require( '../../assets/images/accIcons/acc_icon_checking.png' ) : isHome ? require( '../../assets/images/accIcons/icon_checking.png' ) : active ? require( '../../assets/images/addaccount/checking_white.png' ) : require( '../../assets/images/addaccount/checking.png' )
      case SubAccountKind.SECURE_ACCOUNT:
        return isAccount ? require( '../../assets/images/accIcons/icon_secureaccount.png' ) : isHome ? require( '../../assets/images/accIcons/icon_savings.png' ) : active ? require( '../../assets/images/addaccount/savings_active.png' ) : require( '../../assets/images/addaccount/savings.png' )
      case SubAccountKind.TRUSTED_CONTACTS:
        return isAccount ? require( '../../assets/images/accIcons/icon_test.png' ) : isHome ? require( '../../assets/images/accIcons/icon_checking.png' ) : active ? require( '../../assets/images/icons/icon_hexa.png' ) : require( '../../assets/images/icons/icon_hexa.png' )
      case SubAccountKind.DONATION_ACCOUNT:
        return isAccount ? require( '../../assets/images/accIcons/acc_icon_donation.png' ) : isHome ? require( '../../assets/images/accIcons/icon_donation.png' ) : active ? require( '../../assets/images/addaccount/icon_donation_active.png' ) : require( '../../assets/images/addaccount/icon_donation.png' )
      case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
        return isHome ? require( '../../assets/images/accIcons/icon_checking.png' ) : active ? require( '../../assets/images/addaccount/view.png' ) : require( '../../assets/images/addaccount/view.png' )
      case SubAccountKind.FULLY_IMPORTED_WALLET:
        return isHome ? require( '../../assets/images/accIcons/icon_checking.png' ) : active ? require( '../../assets/images/addaccount/icon_wallet.png' ) : require( '../../assets/images/addaccount/icon_wallet.png' )
      case SubAccountKind.SERVICE:
        return getAvatarForServiceAccountKind( ( subAccount as ExternalServiceSubAccountInfo ).serviceAccountKind, isHome, isAccount )
      default:
        return isHome ? require( '../../assets/images/icons/icon_hexa.png' ) : active ? require( '../../assets/images/icons/icon_hexa.png' ) : require( '../../assets/images/icons/icon_hexa.png' )
  }
}
