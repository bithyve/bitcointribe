import { Account, AccountType, DonationAccount, MultiSigAccount, NetworkType } from '../Interface'
import crypto from 'crypto'
import AccountUtilities from './AccountUtilities'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'

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
    isUsable: true,
    walletId,
    type,
    instanceNum,
    networkType,
    derivationPath,
    xpub,
    xpriv,
    accountName,
    accountDescription,
    accountVisibility: AccountVisibility.DEFAULT,
    activeAddresses: {
      external: {
      },
      internal: {
      },
    },
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
    txIdMap: {
    },
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
    secondaryXpub?: string,
    bithyveXpub?: string,
    networkType: NetworkType,
  }
): MultiSigAccount {
  // Note: only primary-xpubs differs b/w different multi-sig account instance(secondary and bh-xpubs stay constant)

  const network = AccountUtilities.getNetworkByType( networkType )
  const primaryXpub = AccountUtilities.generateExtendedKey( mnemonic, false, network, derivationPath )
  const primaryXpriv = AccountUtilities.generateExtendedKey( mnemonic, true, network, derivationPath )

  const xpubs: {
    secondary: string,
    bithyve: string,
  } = {
    secondary: secondaryXpub,
    bithyve: bithyveXpub,
  }
  const xprivs: {
    secondary?: string,
  } = {
  }

  let initialRecevingAddress = ''
  let id = ''
  let isUsable = false
  if( secondaryXpub ){
    id = crypto.createHash( 'sha256' ).update( primaryXpub + xpubs.secondary + xpubs.bithyve ).digest( 'hex' )
    initialRecevingAddress = AccountUtilities.createMultiSig( {
      primary: primaryXpub,
      ...xpubs,
    }, 2, network, 0, false ).address
    isUsable = true
  }

  const account: MultiSigAccount = {
    id,
    isUsable,
    walletId,
    type,
    instanceNum,
    networkType,
    derivationPath,
    is2FA: true,
    xpub: primaryXpub,
    xpriv: primaryXpriv,
    xpubs,
    xprivs,
    accountName,
    accountDescription,
    accountVisibility: AccountVisibility.DEFAULT,
    activeAddresses: {
      external: {
      },
      internal: {
      },
    },
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
    txIdMap: {
    },
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

export const upgradeAccountToMultiSig = ( {
  account,
  secondaryXpub,
  bithyveXpub,
}: {
  account: Account,
  secondaryXpub: string,
  bithyveXpub: string,
} ): MultiSigAccount => {
  account.id = crypto.createHash( 'sha256' ).update( account.xpub + secondaryXpub + bithyveXpub ).digest( 'hex' )
  account.isUsable = true;
  ( account as MultiSigAccount ).xpubs = {
    secondary: secondaryXpub,
    bithyve: bithyveXpub,
  };
  ( account as MultiSigAccount ).is2FA = true;
  ( account as MultiSigAccount ).xprivs = {
  }

  return ( account as MultiSigAccount )
}




