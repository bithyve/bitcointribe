import { networks } from 'bitcoinjs-lib'
import { Account } from '../Interface'
import crypto from 'crypto'
import AccountUtilities from './AccountUtilities'

export function generateAccount(
  {
    walletId,
    accountName,
    accountDescription,
    xpub,
    network
  }: {
    accountName: string,
    accountDescription: string,
    walletId: string,
    xpub: string,
    network: networks.Network,
  }
): Account {

  const id = crypto.createHash( 'sha256' ).update( xpub ).digest( 'hex' )
  const initialRecevingAddress = AccountUtilities.getAddressByIndex( xpub, false, 0, network )

  const account = {
    id,
    walletId,
    accountName,
    accountDescription,
    xpub,
    network,
    activeAddresses: [],
    receivingAddress: initialRecevingAddress,
    nextFreeAddressIndex: 0,
    nextFreeChangeAddressIndex: 0,
    confirmedUTXOs: [],
    unconfirmedUTXOs: [],
    balances: {
      balance: 0,
      unconfirmedBalance: 0,
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

