import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import getAvatarForServiceAccountKind from './GetAvatarForServiceAccountKind'
import AccountTestHome from '../../assets/images/accIcons/icon_test.svg'
import AccountTest from '../../assets/images/accIcons/acc_test.svg'
import AccountTestActive from '../../assets/images/accIcons/test_small_active.svg'
import AccountTestInactive from '../../assets/images/accIcons/test_small_inactive.svg'
import SavingsActive from '../../assets/images/accIcons/savings_small_active.svg'
import SavingsInactive from '../../assets/images/accIcons/savings_small_inactive.svg'
import DonationtActive from '../../assets/images/accIcons/donation_small_active.svg'
import DonationtInavtive from '../../assets/images/accIcons/donation_small_inactive.svg'
import CheckingActive from '../../assets/images/accIcons/checking_small_active.svg'
import CheckingInactive from '../../assets/images/accIcons/checking_small_inactive.svg'
import AccountSwan from '../../assets/images/accIcons/acc_swan.svg'
import BorderWalletIcon from '../../assets/images/accIcons/bw.svg'

import AccountSavingsHome from '../../assets/images/accIcons/icon_savings.svg'
import AccountDonation from '../../assets/images/accIcons/acc_donation.svg'
import AccountChecking from '../../assets/images/accIcons/acc_checking.svg'
import AccountCheckingHome from '../../assets/images/accIcons/icon_checking.svg'
import AccountSavings from '../../assets/images/accIcons/acc_savings.svg'
import Wallet from '../../assets/images/accIcons/icon_wallet.svg'
import Watch from '../../assets/images/accIcons/view.svg'
import Lightning from '../../assets/images/accIcons/lightning.svg'
import LightningHexa from '../../assets/images/accIcons/icon_ln.svg'
import Fonts from '../../common/Fonts'

const styles = StyleSheet.create( {
  container: {
    height: 37, width: 37, backgroundColor: '#ae76db', borderRadius: 30, justifyContent: 'center', alignItems: 'center'
  },
  text:{
    color: 'white',
    fontFamily: Fonts.Regular,
    fontSize: 11
  }
} )


function RgbAccountIcon() {
  return (
    <View style={styles.container}><Text style={styles.text}>RGB</Text></View>
  )
}

const getAvatarForSubAccount = (
  subAccount: SubAccountDescribing,
  active?: boolean,
  isHome?: boolean,
  isAccount?: boolean,
  isBorderWallet?: boolean
) => {
  // switch ( subAccount.kind ) {
  //     case SubAccountKind.TEST_ACCOUNT:
  //       return require( '../../assets/images/icons/icon_test.png' )
  //     case SubAccountKind.REGULAR_ACCOUNT:
  //       return require( '../../assets/images/icons/icon_regular.png' )
  //     case SubAccountKind.SECURE_ACCOUNT:
  //       return require( '../../assets/images/icons/icon_secureaccount.png' )
  //     case SubAccountKind.TRUSTED_CONTACTS:
  //       return require( '../../assets/images/icons/icon_qr_logo.png' )
  //     case SubAccountKind.DONATION_ACCOUNT:
  //       return require( '../../assets/images/icons/icon_donation_hexa.png' )
  //     case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
  //       return require( '../../assets/images/icons/icon_import_watch_only_wallet.png' )
  //     case SubAccountKind.FULLY_IMPORTED_WALLET:
  //       return require( '../../assets/images/icons/icon_wallet.png' )
  //     case SubAccountKind.SERVICE:
  //       return getAvatarForServiceAccountKind( ( subAccount as ExternalServiceSubAccountInfo ).serviceAccountKind )
  //     default:
  //       return require( '../../assets/images/icons/icon_qr_logo.png' )
  // }
  if( isBorderWallet ){
    return <BorderWalletIcon/>
  }
  switch ( subAccount.kind ) {
      case SubAccountKind.TEST_ACCOUNT:
        return isAccount ?  <AccountTest /> : isHome ? <AccountTestHome /> : active ? <AccountTestActive /> : <AccountTestInactive />
      case SubAccountKind.REGULAR_ACCOUNT:
        return isAccount ?  <AccountChecking /> : isHome ? <AccountCheckingHome /> : active ? <CheckingActive /> : <CheckingInactive />
      case SubAccountKind.SECURE_ACCOUNT:
        return isAccount ? <AccountSavings /> : isHome ? <AccountSavingsHome /> : active ? <SavingsActive /> : <SavingsInactive />
      case SubAccountKind.TRUSTED_CONTACTS:
        return isAccount ? <AccountSavings /> : isHome ? <AccountSavingsHome /> : active ? <SavingsActive /> : <SavingsInactive />
      case SubAccountKind.DONATION_ACCOUNT:
        return isAccount ? <AccountDonation /> : isHome ? <AccountDonation /> : active ? <DonationtActive /> : <DonationtInavtive />
      case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
        return <Watch />
      case SubAccountKind.FULLY_IMPORTED_WALLET:
        return <Wallet />
      case SubAccountKind.LIGHTNING_ACCOUNT:
        return isHome ? <LightningHexa/> : <Lightning />
      case SubAccountKind.BORDER_WALLET:
        return isHome ? <LightningHexa/> : <BorderWalletIcon />
      case SubAccountKind.SERVICE:
        return getAvatarForServiceAccountKind( ( subAccount as ExternalServiceSubAccountInfo ).serviceAccountKind, isHome, isAccount )
      default:
        return isHome ? <AccountSavingsHome /> : active ? <SavingsActive /> : <SavingsInactive />
  }
}

export default getAvatarForSubAccount
