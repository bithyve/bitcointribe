import React from 'react'
import { StyleSheet, Image, Text } from 'react-native'
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
import AccountSavingsHome from '../../assets/images/accIcons/icon_savings.svg'
import AccountDonation from '../../assets/images/accIcons/acc_donation.svg'
import AccountChecking from '../../assets/images/accIcons/acc_checking.svg'
import AccountCheckingHome from '../../assets/images/accIcons/icon_checking.svg'
import AccountSavings from '../../assets/images/accIcons/acc_savings.svg'
import Wallet from '../../assets/images/accIcons/icon_wallet.svg'
import Watch from '../../assets/images/accIcons/view.svg'
import TransactionDescribing from '../../common/data/models/Transactions/Interfaces'
import Gift from '../../assets/images/svgs/icon_gift.svg'
import TransactionKind from '../../common/data/enums/TransactionKind'
import useTrustedContacts from '../hooks/state-selectors/trusted-contacts/UseTrustedContacts'

const styles = StyleSheet.create( {
  image: {
    height: 25,
    width: 25
  },
  text: {
    fontSize: 18,
  }
} )

const getAvatarForSubAccount = (
  subAccount: SubAccountDescribing,
  active?: boolean,
  isHome?: boolean,
  isAccount?: boolean,
  transaction?: TransactionDescribing
) => {
  const trustedContacts = useTrustedContacts()

  if( transaction.transactionType === TransactionKind.RECEIVE ) {
    if( transaction.sender ) {
      return <Image style={styles.image} source={require( '../../assets/images/icons/user.png' )}/>
    } else {
      return <Text style={styles.text}>@</Text>
    }
  }
  else if( transaction.receivers ) {
    if( transaction.receivers.filter( t => t.name === 'Gift' ).length > 0 ) {
      return <Gift />
    } else {
      if( transaction.receivers.length > 1 ) {

        return <Image style={styles.image} source={
          trustedContacts[ transaction?.receivers[ 0 ].id ].contactDetails.image ?
            trustedContacts[ transaction?.receivers[ 0 ].id ].contactDetails.image :
            require( '../../assets/images/icons/user.png' )}/>
      } else {
        if( transaction.receivers[ 0 ] && transaction.receivers[ 0 ].name ) {
          return <Image style={styles.image} source={
            trustedContacts[ transaction?.receivers[ 0 ].id ].contactDetails.image ?
              trustedContacts[ transaction?.receivers[ 0 ].id ].contactDetails.image :
              require( '../../assets/images/icons/user.png' )}/>
        } else {
          return <Text style={styles.text}>@</Text>
        }
      }
    }
  } else {
  }

  switch ( subAccount.kind ) {
      case SubAccountKind.TEST_ACCOUNT:
        return isAccount ? <AccountTest /> : isHome ? <AccountTestHome /> : active ? <AccountTestActive /> : <AccountTestInactive />
      case SubAccountKind.REGULAR_ACCOUNT:
        return isAccount ? <AccountChecking /> : isHome ? <AccountCheckingHome /> : active ? <CheckingActive /> : <CheckingInactive />
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
      case SubAccountKind.SERVICE:
        return getAvatarForServiceAccountKind( ( subAccount as ExternalServiceSubAccountInfo ).serviceAccountKind, isHome, isAccount )
      default:
        return isHome ? <AccountSavingsHome /> : active ? <SavingsActive /> : <SavingsInactive />
  }
}

export default getAvatarForSubAccount
