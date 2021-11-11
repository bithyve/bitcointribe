import React from 'react'
import { ImageSourcePropType } from 'react-native'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import AccountFNFActive from '../../assets/images/accIcons/acc_f&f.svg'
import AccountFNFInactive from '../../assets/images/accIcons/icon_f&f.svg'
import AccountSwan from '../../assets/images/accIcons/acc_swan.svg'
import AccountSwanHome from '../../assets/images/accIcons/swan.svg'
import Wyre from '../../assets/images/svgs/wyre.svg'
import Ramp from '../../assets/images/svgs/ramp.svg'
import Community from '../../assets/images/accIcons/community.svg'
const getAvatarForServiceAccountKind = (
  serviceAccountKind: ServiceAccountKind,
  isHome?: boolean,
  isAccount?: boolean
) => {
  switch ( serviceAccountKind ) {
      case ServiceAccountKind.FNF_ACCOUNT:
        return isAccount ? <AccountFNFActive /> : <AccountFNFActive />
      // case ServiceAccountKind.FAST_BITCOINS:
      //   return require( '../../assets/images/icons/icon_fastbitcoins_hex_dark.png' )
      case ServiceAccountKind.SWAN:
        return isAccount ? <AccountSwan /> : isHome ? <AccountSwanHome /> : <AccountSwanHome />
      case ServiceAccountKind.WYRE:
        return <Wyre />
      case ServiceAccountKind.RAMP:
        return <Ramp />
      case ServiceAccountKind.COMMUNITY_ACCOUNT:
        return <Community />
      default:
        return <Community />
  }
}
export default getAvatarForServiceAccountKind
