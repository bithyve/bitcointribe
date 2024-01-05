import { AccountType } from '../../../bitcoin/utilities/Interface'
import { DONATION_ACCOUNT, RAMP, REGULAR_ACCOUNT, SECURE_ACCOUNT, SWAN, TEST_ACCOUNT, WYRE } from '../../../common/constants/wallet-service-types'
import AccountShell from '../../../common/data/models/AccountShell'

export const getAccountIcon = ( accountKind, derivativeAccountDetails? ) => {
  // determines account icon
  let accountImageSource
  if( derivativeAccountDetails ){
    switch( derivativeAccountDetails.type ){
        case DONATION_ACCOUNT:
          accountImageSource = require( '../../../assets/images/icons/icon_donation_hexa.png' )
          break
        case RAMP:
          accountImageSource = require( '../../../assets/images/icons/icon_ramp.png' )
          break
        case WYRE:
          accountImageSource = require( '../../../assets/images/icons/icon_wyre.png' )
          break
        case SWAN:
          accountImageSource = require( '../../../assets/images/icons/icon_swan.png' )
          break
    }
  }
  if( !accountImageSource ){
    switch( accountKind ){
        case TEST_ACCOUNT:
          accountImageSource = require( '../../../assets/images/icons/icon_test.png' )
          break

        case REGULAR_ACCOUNT:
          accountImageSource = require( '../../../assets/images/icons/icon_regular.png' )
          break

        case SECURE_ACCOUNT:
          accountImageSource = require( '../../../assets/images/icons/icon_secureaccount.png' )
          break
    }
  }

  return accountImageSource
}


export const getAccountTitle = ( accountKind, derivativeAccountDetails ) => {
// determines account title
  let accountTitle
  if( derivativeAccountDetails ){
    switch( derivativeAccountDetails.type ){
        case DONATION_ACCOUNT:
          accountTitle = 'Donation Account'
          break
        case RAMP:
          accountTitle = 'Ramp'
          break
        case WYRE:
          accountTitle = 'Wyre'
          break
        case SWAN:
          accountTitle = 'Swan'
          break
    }
  }

  if( !accountTitle ){
    switch( accountKind ){
        case TEST_ACCOUNT:
          accountTitle = 'Test Account'
          break

        case REGULAR_ACCOUNT:
          accountTitle = 'Checking Account'
          break

        case SECURE_ACCOUNT:
          accountTitle = 'Savings Account'
          break
    }
  }

  return accountTitle
}


export const getAccountIconByShell = ( accountShell: AccountShell ) => {
  // determines account icon
  let accountImageSource
  switch( accountShell.primarySubAccount.type ){
      case AccountType.TEST_ACCOUNT:
        accountImageSource = require( '../../../assets/images/icons/icon_test.png' )
        break

      case AccountType.CHECKING_ACCOUNT:
        accountImageSource = require( '../../../assets/images/icons/icon_regular.png' )
        break

      case AccountType.SAVINGS_ACCOUNT:
        accountImageSource = require( '../../../assets/images/icons/icon_secureaccount.png' )
        break
      case AccountType.DONATION_ACCOUNT:
        accountImageSource = require( '../../../assets/images/icons/icon_donation_hexa.png' )
        break
      case AccountType.RAMP_ACCOUNT:
        accountImageSource = require( '../../../assets/images/icons/icon_ramp.png' )
        break
      case AccountType.WYRE_ACCOUNT:
        accountImageSource = require( '../../../assets/images/icons/icon_wyre.png' )
        break
      case AccountType.SWAN_ACCOUNT:
        accountImageSource = require( '../../../assets/images/icons/icon_swan.png' )
        break
      case AccountType.BORDER_WALLET:
        accountImageSource = require( '../../../assets/images/icons/icon_bw.png' )
        break
  }

  return accountImageSource
}


export const getAccountTitleByShell = ( accountShell: AccountShell ) => {
// determines account title
  let accountTitle
  switch( accountShell.primarySubAccount.type ){
      case AccountType.TEST_ACCOUNT:
        accountTitle = 'Test Account'
        break
      case AccountType.CHECKING_ACCOUNT:
        accountTitle = 'Checking Account'
        break
      case AccountType.SAVINGS_ACCOUNT:
        accountTitle = 'Savings Account'
        break
      case AccountType.DONATION_ACCOUNT:
        accountTitle = 'Donation Account'
        break
      case AccountType.RAMP_ACCOUNT:
        accountTitle = 'Ramp'
        break
      case AccountType.WYRE_ACCOUNT:
        accountTitle = 'Wyre'
        break
      case AccountType.SWAN_ACCOUNT:
        accountTitle = 'Swan'
        break
      case AccountType.BORDER_WALLET:
        accountTitle = 'Border Wallet'
        break
  }

  return accountTitle
}

