import { networks } from 'bitcoinjs-lib'
import { Account, MultiSigAccount } from '../Interface'
import crypto from 'crypto'
import AccountUtilities from './AccountUtilities'

export function generateAccount(
  {
    walletId,
    accountName,
    accountDescription,
    mnemonic,
    derivationPath,
    network
  }: {
    walletId: string,
    accountName: string,
    accountDescription: string,
    mnemonic: string,
    derivationPath: string,
    network: networks.Network,
  }
): Account {

  const xpub = AccountUtilities.generateExtendedKey( mnemonic, false, network, derivationPath )
  const xpriv = AccountUtilities.generateExtendedKey( mnemonic, true, network, derivationPath )

  const id = crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
  const initialRecevingAddress = AccountUtilities.getAddressByIndex( xpub, false, 0, network )

  const account: Account = {
    id,
    walletId,
    network,
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
    accountName,
    accountDescription,
    derivationPath,
    xpubs,
    xprivs,
    network
  }: {
    accountName: string,
    accountDescription: string,
    walletId: string,
    derivationPath: string,
    xpubs: {
      primary: string,
      secondary: string,
      bithyve: string,
    },
    xprivs: {
      primary: string,
      secondary?: string,
    },
    network: networks.Network,
  }
): MultiSigAccount {

  const id = crypto.createHash( 'sha256' ).update( xpubs.secondary ).digest( 'hex' )
  const initialRecevingAddress = AccountUtilities.createMultiSig( [ xpubs.primary, xpubs.secondary, xpubs.bithyve ], 2, network, 0, false ).address

  const account: MultiSigAccount = {
    id,
    walletId,
    network,
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



