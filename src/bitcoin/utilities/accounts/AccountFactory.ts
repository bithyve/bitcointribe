import crypto from 'crypto'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import { borderWalletAccountInfo } from '../../../store/sagas/accounts'
import { Account, AccountType, DerivationPurpose, DonationAccount, LNNode, MultiSigAccount, NetworkType } from '../Interface'
import AccountUtilities from './AccountUtilities'

export const getPurpose = ( derivationPath: string, accountType?: AccountType ): DerivationPurpose => {
  const purpose = parseInt( derivationPath.split( '/' )[ 1 ], 10 )
  if( accountType === AccountType.SWAN_ACCOUNT ) return DerivationPurpose.BIP84
  switch ( purpose ) {
      case DerivationPurpose.BIP84:
        return DerivationPurpose.BIP84

      case DerivationPurpose.BIP49:
        return DerivationPurpose.BIP49

      case DerivationPurpose.BIP44:
        return DerivationPurpose.BIP44

      default:
        throw new Error( `Unsupported derivation type, purpose: ${purpose}` )
  }
}

export function generateAccount(
  {
    walletId,
    type,
    instanceNum,
    accountName,
    accountDescription,
    primarySeed,
    derivationPath,
    networkType,
    node,
    borderWalletAccountInfo,
  }: {
    walletId: string,
    type: AccountType,
    instanceNum: number,
    accountName: string,
    accountDescription: string,
    primarySeed: string,
    derivationPath: string,
    networkType: NetworkType,
    node?: LNNode
    borderWalletAccountInfo?: borderWalletAccountInfo
  }
): Account {

  try {
    const network = AccountUtilities.getNetworkByType( networkType )
    const { xpriv, xpub } = AccountUtilities.generateExtendedKeyPairFromSeed( primarySeed, network, derivationPath )

    const id = crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
    const purpose = getPurpose( derivationPath )
    const initialRecevingAddress = AccountUtilities.getAddressByIndex( xpub, false, 0, network, purpose )
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
      transactionsNote: {
      },
      importedAddresses: {
      },
    }
    if( type === AccountType.LIGHTNING_ACCOUNT ) {
      account.node = node
    }
    if( type === AccountType.BORDER_WALLET ){
      account.borderWalletGridMnemonic = borderWalletAccountInfo.gridMnemonic
      account.borderWalletMnemonic = borderWalletAccountInfo.primaryMnemonic
      account.borderWalletGridType = borderWalletAccountInfo.gridType
    }
    return account

  } catch ( error ) {
    return null
  }
}

export function generateMultiSigAccount(
  {
    walletId,
    type,
    instanceNum,
    accountName,
    accountDescription,
    primarySeed,
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
    primarySeed: string,
    derivationPath: string,
    secondaryXpub?: string,
    bithyveXpub?: string,
    networkType: NetworkType,
  }
): MultiSigAccount {
  // Note: only primary-xpubs differs b/w different multi-sig account instance(secondary and bh-xpubs stay constant)

  const network = AccountUtilities.getNetworkByType( networkType )
  const { xpriv: primaryXpriv, xpub: primaryXpub } = AccountUtilities.generateExtendedKeyPairFromSeed( primarySeed, network, derivationPath )

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

  let id
  if( type === AccountType.SAVINGS_ACCOUNT && instanceNum === 0 ){
    const secondary = undefined
    const bithyve = undefined
    id = crypto.createHash( 'sha256' ).update( primaryXpub + secondary + bithyve ).digest( 'hex' ) // recreation consistency(id) for saving's account first instance
  }
  else id = crypto.createHash( 'sha256' ).update( primaryXpub + xpubs.secondary + xpubs.bithyve ).digest( 'hex' )

  let isUsable = false
  if( secondaryXpub ){
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
    transactionsNote: {
    },
    importedAddresses: {
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
    donationName,
    donationDescription,
    donee,
    primarySeed,
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
    donationName: string,
    donationDescription: string,
    donee: string,
    primarySeed: string,
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
    primarySeed,
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
        primarySeed,
        derivationPath,
        networkType,
      } ),
    }
  }

  const donationAccount: DonationAccount = {
    ...baseAccount,
    donationName,
    donationDescription,
    donee,
    configuration: {
      displayBalance: true,
      displayIncomingTxs: true,
      displayOutgoingTxs: true,
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
  account.isUsable = true;
  ( account as MultiSigAccount ).xpubs = {
    secondary: secondaryXpub,
    bithyve: bithyveXpub,
  };
  ( account as MultiSigAccount ).is2FA = true;
  ( account as MultiSigAccount ).xprivs = {
  }

  const network = AccountUtilities.getNetworkByType( account.networkType )
  account.receivingAddress = AccountUtilities.createMultiSig( {
    primary: account.xpub,
    secondary: secondaryXpub,
    bithyve: bithyveXpub,
  }, 2, network, 0, false ).address

  return ( account as MultiSigAccount )
}




