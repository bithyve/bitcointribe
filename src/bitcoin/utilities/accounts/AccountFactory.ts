import { Account, AccountType, DonationAccount, MultiSigAccount, NetworkType } from '../Interface'
import crypto from 'crypto'
import AccountUtilities from './AccountUtilities'

export function generateAccount(
  {
    walletId,
    type,
    instanceNum,
    accountName,
    accountDescription,
    mnemonic,
    derivationPath,
    networkType
  }: {
    walletId: string,
    type: AccountType,
    instanceNum: number,
    accountName: string,
    accountDescription: string,
    mnemonic: string,
    derivationPath: string,
    networkType: NetworkType,
  }
): Account {

  const network = AccountUtilities.getNetworkByType( networkType )
  const xpub = AccountUtilities.generateExtendedKey( mnemonic, false, network, derivationPath )
  const xpriv = AccountUtilities.generateExtendedKey( mnemonic, true, network, derivationPath )

  const id = crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
  const initialRecevingAddress = AccountUtilities.getAddressByIndex( xpub, false, 0, network )

  const account: Account = {
    id,
    walletId,
    type,
    instanceNum,
    networkType,
    derivationPath,
    xpub,
    xpriv,
    accountName,
    accountDescription,
    activeAddresses: [],
    receivingAddress: initialRecevingAddress,
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      confirmed: 0,
      unconfirmed: 0,
    },
    transactions: [],
    lastSynched: 0,
    addressQueryList: {
      external: {
      },
      internal: {
      }
    }
  }

  return account
}

export function generateMultiSigAccount(
  {
    walletId,
    type,
    instanceNum,
    accountName,
    accountDescription,
    mnemonic,
    derivationPath,
    secondaryXpub,
    bithyveXpub,
    networkType
  }: {
    walletId: string,
    type: AccountType,
    instanceNum: number,
    accountName: string,
    accountDescription: string,
    mnemonic: string,
    derivationPath: string,
    secondaryXpub: string,
    bithyveXpub: string,
    networkType: NetworkType,
  }
): MultiSigAccount {
  // Note: only primary-xpubs differs b/w different multi-sig account instance(secondary and bh-xpubs stay constant)

  const network = AccountUtilities.getNetworkByType( networkType )
  const xpubs: {
    primary: string,
    secondary: string,
    bithyve: string,
  } = {
    primary: AccountUtilities.generateExtendedKey( mnemonic, false, network, derivationPath ),
    secondary: secondaryXpub,
    bithyve: bithyveXpub,
  }
  const xprivs: {
    primary: string,
    secondary?: string,
  } = {
    primary: AccountUtilities.generateExtendedKey( mnemonic, true, network, derivationPath )
  }

  const id = crypto.createHash( 'sha256' ).update( xpubs.primary + xpubs.secondary + xpubs.bithyve ).digest( 'hex' )
  const initialRecevingAddress = AccountUtilities.createMultiSig( xpubs, 2, network, 0, false ).address

  const account: MultiSigAccount = {
    id,
    walletId,
    type,
    instanceNum,
    networkType,
    derivationPath,
    is2FA: true,
    xpub: null,
    xpriv: null,
    xpubs,
    xprivs,
    accountName,
    accountDescription,
    activeAddresses: [],
    receivingAddress: initialRecevingAddress,
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      confirmed: 0,
      unconfirmed: 0,
    },
    transactions: [],
    lastSynched: 0,
    addressQueryList: {
      external: {
      },
      internal: {
      }
    }
  }

  return account
}

export function generateDonationAccount(
  {
    walletId,
    type,
    instanceNum,
    accountName,
    accountDescription,
    donee,
    mnemonic,
    derivationPath,
    is2FA,
    secondaryXpub,
    bithyveXpub,
    networkType,
  }: {
    walletId: string,
    type: AccountType,
    instanceNum: number,
    accountName: string,
    accountDescription: string,
    donee: string,
    mnemonic: string,
    derivationPath: string,
    is2FA?: boolean,
    secondaryXpub?: string,
    bithyveXpub?: string,
    networkType: NetworkType,
  }
): DonationAccount {

  let baseAccount: Account | MultiSigAccount
  if( is2FA ) baseAccount = generateMultiSigAccount( {
    walletId,
    type,
    instanceNum,
    accountName,
    accountDescription,
    mnemonic,
    derivationPath,
    secondaryXpub,
    bithyveXpub,
    networkType,
  } )
  else {
    baseAccount = {
      ...generateAccount( {
        walletId,
        type,
        instanceNum,
        accountName,
        accountDescription,
        mnemonic,
        derivationPath,
        networkType,
      } ),
    }
  }

  const donationAccount: DonationAccount = {
    ...baseAccount,
    donee,
    configuration: {
      displayBalance: true,
    },
    disableAccount: false,
    is2FA,
  }

  return donationAccount
}




