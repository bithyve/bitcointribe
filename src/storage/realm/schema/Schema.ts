import { ObjectSchema } from 'realm'

export const UTXO = 'UTXO'
export const Wallet = 'Wallet'
export const Account = 'Account'
export const Transaction = 'Transaction'

export const AccountSchema: ObjectSchema = {
  name: Account,
  primaryKey: 'accountId',
  properties: {
    accountId: {
      type: 'string', indexed: true
    },
    walletId: 'string',
    network: 'string',
    xpub: 'string',
    accountName: 'string',
    accountDescription: 'string',
    activeAddresses: 'string?[]',
    receivingAddress: 'string',
    nextFreeAddressIndex: 'int',
    nextFreeChangeAddressIndex: 'int',
    confirmedUTXOs: {
      type: 'list', objectType: UTXO
    },
    unconfirmedUTXOs: {
      type: 'list', objectType: UTXO
    },
    balances: 'string',
    transactions: {
      type: 'list', objectType: Transaction
    },
    lastSynched: 'int',
    newTransactions: {
      type: 'list', objectType: Transaction
    },
    txIdMap: 'string?[]',
    addressQueryList: 'string?[]',
  },
}

export const TransactionSchema: ObjectSchema = {
  name: Transaction,
  primaryKey: 'txId',
  properties: {
    txId: {
      type: 'string', indexed: true
    },
    status: 'string',
    confirmations: 'int',
    fee: 'string',
    date: 'string',
    transactionType: 'string',
    amount: 'int',
    accountType: 'string',
    primaryAccType: 'string',
    accountName: 'string',
    contactName: 'string',
    recipientAddresses: 'string?[]',
    senderAddresses: 'string?[]',
    blockTime: 'int',
    message: 'string',
    address: 'string',
    notes: 'string?[]'
  },
}

export const UTXOSchema: ObjectSchema = {
  name: UTXO,
  primaryKey: 'txId',
  properties: {
    txId: {
      type: 'string', indexed: true
    },
    vout: 'int',
    value: 'int',
    address: 'string',
    status: 'string',
    tags: 'string?[]'
  },
}

export const WalletSchema: ObjectSchema = {
  name: Wallet,
  primaryKey: 'txId',
  properties: {
    txId: {
      type: 'string', indexed: true
    },
    vout: 'int',
    value: 'int',
    address: 'string',
    status: 'string',
    tags: 'string?[]'
  },
}
