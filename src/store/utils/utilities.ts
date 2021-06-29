import * as bip39 from 'bip39'
import * as bitcoinJS from 'bitcoinjs-lib'
import crypto from 'crypto'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount'
import S3Service from '../../bitcoin/services/sss/S3Service'
import TestAccount from '../../bitcoin/services/accounts/TestAccount'
import { take, fork, select } from 'redux-saga/effects'
import AsyncStorage from '@react-native-async-storage/async-storage'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import { Account, Accounts, AccountType, MetaShare, MultiSigAccount, NetworkType, Wallet } from '../../bitcoin/utilities/Interface'
import { generateAccount, generateMultiSigAccount } from '../../bitcoin/utilities/accounts/AccountFactory'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import config from '../../bitcoin/HexaConfig'
import { APP_STAGE } from '../../common/interfaces/Interfaces'

export const serviceGenerator = async (
  securityAns: string,
  mnemonic?: string,
  metaShares?: any,
): Promise<{
  regularAcc: RegularAccount;
  testAcc: TestAccount;
  secureAcc: SecureAccount;
  s3Service: S3Service;
  trustedContacts: TrustedContactsService;
}> => {
  // Regular account
  let primaryMnemonic = mnemonic ? mnemonic : undefined
  const regularAcc = new RegularAccount( primaryMnemonic )
  let res
  res = regularAcc.getMnemonic()
  if ( res.status !== 200 ) throw new Error( 'Regular account gen failed' )
  primaryMnemonic = res.data.mnemonic

  // walletID globalization (in-app)
  const wiRes = regularAcc.getWalletId()
  if ( wiRes.status !== 200 || !wiRes.data.walletId )
    throw new Error( 'Wallet Id gen failed' )
  AsyncStorage.setItem( 'walletID', wiRes.data.walletId )

  // Test account
  const testAcc = new TestAccount( primaryMnemonic )

  // Share generation/restoration
  const s3Service = new S3Service( primaryMnemonic )
  if ( metaShares ) {
    res = s3Service.restoreMetaShares( metaShares )
    if ( res.status !== 200 ) throw new Error( 'Share restoration failed' )
  } else {
    // res = s3Service.generateLevel1Shares(securityAns);
    res = s3Service.generateShares( securityAns )
    if ( res.status !== 200 ) throw new Error( 'Share generation failed' )
  }

  // share history initialization
  const createdAt = Date.now()
  const shareHistory = [
    {
      createdAt,
    },
    {
      createdAt,
    },
    {
      createdAt,
    },
    {
      createdAt,
    },
    {
      createdAt,
    },
  ]
  await AsyncStorage.setItem( 'shareHistory', JSON.stringify( shareHistory ) )

  let secondaryXpub = ''
  let bhXpub = ''
  if ( metaShares ) {
    res = s3Service.decryptStaticNonPMDD(
      metaShares[ Object.keys( metaShares )[ 0 ] ].encryptedStaticNonPMDD,
    )
    if ( res.status !== 200 ) throw new Error( 'Failed to decrypt StaticNPMDD' )
    secondaryXpub = res.data.decryptedStaticNonPMDD.secondaryXpub
    bhXpub = res.data.decryptedStaticNonPMDD.bhXpub
  }

  // Secure account setup
  const secureAcc = new SecureAccount( primaryMnemonic )
  if ( !metaShares ) {
    console.log( 'New setup: secure account' )
    res = await secureAcc.setupSecureAccount() // executed once (during initial wallet creation)
  } else {
    if ( !secondaryXpub )
      throw new Error( 'Failed to extract secondary Xpub from metaShare ' )
    console.log( 'Importing secure account' )
    res = await secureAcc.importSecureAccount( secondaryXpub, bhXpub )
  } // restoring
  if ( res.status !== 200 ) {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    console.log( {
      res
    } )
    throw new Error( 'Secure account setup/import failed' )
  }

  // Trusted Contacts Service
  const trustedContacts = new TrustedContactsService()

  return {
    regularAcc,
    testAcc,
    secureAcc,
    s3Service,
    trustedContacts,
  }
}


export const createWatcher = ( worker, type ) => {
  return function* () {
    while ( true ) {
      const action = yield take( type )
      yield fork( worker, action )
    }
  }
}

export const requestTimedout = () => {
  console.log(
    'Request Timeout!',
    'Unable to get a response from server. Please, try again shortly',
  )
}

export const serviceGeneratorForNewBHR = async (
  mnemonic?: string,
  metaShares?: MetaShare[],
  decryptedCloudDataJson? : any,
): Promise<{
  regularAcc: RegularAccount;
  testAcc: TestAccount;
  secureAcc: SecureAccount;
  s3Service: S3Service;
  trustedContacts: TrustedContactsService;
}> => {
  // Regular account
  let primaryMnemonic = mnemonic ? mnemonic : undefined
  const regularAcc = new RegularAccount( primaryMnemonic )
  let res
  res = regularAcc.getMnemonic()
  if ( res.status !== 200 ) throw new Error( 'Regular account gen failed' )
  primaryMnemonic = res.data.mnemonic

  // walletID globalization (in-app)
  const wiRes = regularAcc.getWalletId()
  if ( wiRes.status !== 200 || !wiRes.data.walletId )
    throw new Error( 'Wallet Id gen failed' )
  AsyncStorage.setItem( 'walletID', wiRes.data.walletId )

  // Test account
  const testAcc = new TestAccount( primaryMnemonic )

  // Share generation/restoration
  const s3Service = new S3Service( primaryMnemonic )

  if ( metaShares && metaShares.length ) {
    res = s3Service.restoreMetaSharesKeeper( metaShares )
    if ( res.status !== 200 ) throw new Error( 'Share restoration failed' )
  }
  // share history initialization
  const createdAt = Date.now()
  const shareHistory = [
    {
      createdAt,
    },
    {
      createdAt,
    },
    {
      createdAt,
    },
    {
      createdAt,
    },
    {
      createdAt,
    },
  ]

  AsyncStorage.setItem( 'shareHistory', JSON.stringify( shareHistory ) )

  let secondaryXpub = ''
  let bhXpub = ''
  if( decryptedCloudDataJson && decryptedCloudDataJson.walletImage.SERVICES.SECURE_ACCOUNT )
  {
    const secureAccountData = JSON.parse( decryptedCloudDataJson.walletImage.SERVICES.SECURE_ACCOUNT )
    secondaryXpub = secureAccountData.secureHDWallet.xpubs.secondary
    bhXpub = secureAccountData.secureHDWallet.xpubs.bh
  }

  // Secure account setup
  const secureAcc = new SecureAccount( primaryMnemonic )
  console.log( 'metaShares', metaShares, typeof metaShares )
  if ( !metaShares ) {
    console.log( 'New setup: secure account' )
    res = await secureAcc.setupSecureAccount() // executed once (during initial wallet creation)
  } else {
    if ( !secondaryXpub )
      throw new Error( 'Failed to extract secondary Xpub from metaShare ' )
    console.log( 'Importing secure account' )
    res = await secureAcc.importSecureAccount( secondaryXpub, bhXpub )
  } // restoring
  if ( res.status !== 200 ) {
    if ( res.err === 'ECONNABORTED' ) requestTimedout()
    console.log( {
      res
    } )
    throw new Error( 'Secure account setup/import failed' )
  }

  // Trusted Contacts Service
  const trustedContacts = new TrustedContactsService()

  return {
    regularAcc,
    testAcc,
    secureAcc,
    s3Service,
    trustedContacts,
  }
}

export const initializeWallet = async ( chosenAccounts, currentWalletId, currentPrimaryMnemonic ): Promise <{
  wallet: Wallet,
  accounts: Accounts,
  s3Service: S3Service,
  trustedContacts: TrustedContactsService
}> => {
  const { REGULAR_ACCOUNT, TEST_ACCOUNT, SECURE_ACCOUNT } = chosenAccounts
  const initInstanceNumber = 0
  const rootDerivationPath = 'm/49\'/0\'/0\''
  const testDerivationPath = 'm/49\'/1\'/0\''

  if( REGULAR_ACCOUNT ) {
    const primaryMnemonic = bip39.generateMnemonic( 256 )
    const primarySeed = bip39.mnemonicToSeedSync( primaryMnemonic )
    const walletId = crypto.createHash( 'sha256' ).update( primarySeed ).digest( 'hex' )

    const checkingDerivationPath = rootDerivationPath
    const checkingAccount: Account = generateAccount( {
      walletId,
      type: AccountType.CHECKING_ACCOUNT,
      instanceNum: initInstanceNumber,
      accountName: 'Checking Account',
      accountDescription: 'Fast and easy',
      mnemonic: primaryMnemonic,
      derivationPath: checkingDerivationPath,
      networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT? NetworkType.TESTNET: NetworkType.MAINNET,
    } )

    const wallet: Wallet = {
      walletId,
      secondaryMemonic: '',
      details2FA: {
      },
      primaryMnemonic,
      accounts: {
        [ checkingDerivationPath ]: checkingAccount.id,
      }
    }

    const accounts: Accounts = {
      [ checkingAccount.id ]: checkingAccount,
    }

    // Share generation
    const s3Service = new S3Service( primaryMnemonic )

    // Trusted Contacts Service
    const trustedContacts = new TrustedContactsService()
    return {
      wallet,
      accounts,
      s3Service,
      trustedContacts,
    }

  }

  if( SECURE_ACCOUNT ) {
    console.log( 'initialising Secure Account ' )
    const { secondaryXpub, bithyveXpub, twoFAKey, secondaryMemonic, savingsAccount, savingsDerivationPath } = await initializeSecondaryAccount( currentWalletId, initInstanceNumber, currentPrimaryMnemonic, rootDerivationPath )

    const wallet: Wallet = {
      accounts: {
      }
    }

    wallet.secondaryMemonic = secondaryMemonic
    wallet.details2FA = {
      secondaryXpub,
      bithyveXpub,
      twoFAKey
    }
    wallet.accounts = {
      ...wallet.accounts,
      [ savingsDerivationPath ]: savingsAccount.id
    }


    const accounts: Accounts = {
      [ savingsAccount.id ]: savingsAccount,
    }

    return {
      wallet,
      accounts
    }
  }

  if( TEST_ACCOUNT ) {
    const { testAccount } = await initializeTestAccount( currentWalletId, initInstanceNumber, currentPrimaryMnemonic, testDerivationPath )

    const wallet: Wallet = {
      accounts: {
      }
    }
    wallet.accounts = {
      [ testDerivationPath ]: testAccount.id,
    }
    const accounts: Accounts = {
      [ testAccount.id ]: testAccount,
    }

    return {
      wallet,
      accounts
    }
  }
}

const initializeSecondaryAccount = async ( walletId: string, initInstanceNumber: number, primaryMnemonic: string, rootDerivationPath: string  ): Promise <{
  secondaryMemonic: string,
  secondaryXpub: string,
  bithyveXpub: string,
  twoFAKey: string,
  savingsAccount: MultiSigAccount,
  savingsDerivationPath: string
}> => {
  const secondaryMemonic = bip39.generateMnemonic( 256 )
  const secondarySeed = bip39.mnemonicToSeedSync( secondaryMemonic )
  const secondaryWalletId = crypto.createHash( 'sha256' ).update( secondarySeed ).digest( 'hex' )

  const { setupData } = await AccountUtilities.registerTwoFA( walletId, secondaryWalletId )
  const secondaryXpub = AccountUtilities.generateExtendedKey( secondaryMemonic, false, bitcoinJS.networks.testnet, rootDerivationPath )
  const bithyveXpub = setupData.bhXpub
  const twoFAKey = setupData.secret

  const savingsDerivationPath = 'm/49\'/0\'/11\''
  const savingsAccount: MultiSigAccount = generateMultiSigAccount( {
    walletId,
    type: AccountType.SAVINGS_ACCOUNT,
    instanceNum: initInstanceNumber,
    accountName: 'Savings Account',
    accountDescription: 'Multi-factor security',
    mnemonic: primaryMnemonic,
    derivationPath: savingsDerivationPath,
    secondaryXpub,
    bithyveXpub,
    networkType: config.APP_STAGE === APP_STAGE.DEVELOPMENT? NetworkType.TESTNET: NetworkType.MAINNET,
  } )


  return {
    secondaryXpub, bithyveXpub, twoFAKey, secondaryMemonic, savingsAccount, savingsDerivationPath
  }
}



const initializeTestAccount = async ( walletId: string, initInstanceNumber: number, primaryMnemonic: string, testDerivationPath: string  ): Promise <{
  testAccount: Account,
  testDerivationPath: string,
}> => {

  const testAccount: Account = generateAccount( {
    walletId,
    type: AccountType.TEST_ACCOUNT,
    instanceNum: initInstanceNumber,
    accountName: 'Test Account',
    accountDescription: 'Learn Bitcoin',
    mnemonic: primaryMnemonic,
    derivationPath: testDerivationPath,
    networkType: NetworkType.TESTNET,
  } )

  return {
    testAccount, testDerivationPath
  }
}
