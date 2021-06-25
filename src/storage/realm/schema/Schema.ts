import { ObjectSchema } from 'realm'

const UTXO = 'UTXO'
const Wallet = 'Wallet'
const Account = 'Account'
const Transaction = 'Transaction'
const Details2FA = 'Details2FA'
const Balances = 'Balances'
const Bip32 = 'Bip32'
const Network = 'Network'
const XPUB = 'XPUB'
const AccountId = 'AccountId'

export const AccountSchema: ObjectSchema = {
  name: Account,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string', indexed: true
    },
    accountName: 'string',
    accountDescription: {
      type: 'string', optional: true
    },
    type: {
      type: 'string', optional: true
    },
    activeAddresses: {
      type: 'string?[]', optional: true
    },
    receivingAddress: {
      type: 'string', optional: true
    },
    walletId: {
      type: 'string', optional: true
    },
    network: {
      type: Network, optional: true
    },
    networkType: {
      type: 'string', optional: true
    },
    xpub: {
      type: 'string', optional: true
    },
    xpubs: {
      type: XPUB, optional: true
    },
    xprivs: {
      type: XPUB, optional: true
    },
    nextFreeAddressIndex: {
      type: 'int', optional: true
    },
    nextFreeChangeAddressIndex: {
      type: 'int', optional: true
    },
    balances: {
      type: Balances, optional: true
    },
    confirmedUTXOs: {
      type: 'list', objectType: UTXO, default: []
    },
    unconfirmedUTXOs: {
      type: 'list', objectType: UTXO, default: []
    },
    transactions: {
      type: 'list', objectType: Transaction, default: []
    },
    newTransactions: {
      type: 'list', objectType: Transaction, default: []
    },
    txIdMap: {
      type: 'string?[]', optional: true
    },
    addressQueryList: {
      type: 'string?[]', optional: true
    },
    instanceNum: {
      type: 'int', optional: true
    },
    lastSynched: {
      type: 'int', optional: true
    }
  },
}

export const Bip32Schema: ObjectSchema = {
  name: Bip32,
  properties: {
    private: 'int',
    public: 'int'
  },
}

export const NetworkSchema: ObjectSchema = {
  name: Network,
  properties: {
    messagePrefix: 'string',
    pubKeyHash: 'int',
    scriptHash: 'int',
    wif: 'int',
    bech32: 'string',
    bip32: {
      type: Bip32
    }
  },
}

export const BalancesSchema: ObjectSchema = {
  name: Balances,
  properties: {
    confirmed: 'float',
    unconfirmed: 'float',
  },
}

export const AccountIdSchema: ObjectSchema = {
  name: AccountId,
  properties: {
    derivationPath: 'string',
    accountId: 'string',
  },
}

export const XPubSchema: ObjectSchema = {
  name: XPUB,
  properties: {
    bithyve: {
      type: 'string', optional: true
    },
    primary: {
      type: 'string', optional: true
    },
    secondary: {
      type: 'string', optional: true
    }
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
  primaryKey: 'walletId',
  properties: {
    walletId: {
      type: 'string', indexed: true
    },
    primaryMnemonic: 'string',
    secondaryMemonic: 'string',
    details2FA: {
      type: Details2FA
    },
    accountIds: {
      type: 'list', objectType: AccountId, default: []
    },
    tags: {
      type: 'string?[]',
      optional: true
    },
  },
}

export const Details2FASchema: ObjectSchema = {
  name: Details2FA,
  properties: {
    bithyveXpub: 'string',
    secondaryXpub: 'string',
    twoFAKey: 'string',
  },
}

export default {
  Wallet,
  UTXO,
  Account,
  Transaction,
  Details2FA,
  Balances,
  Bip32,
  Network,
  XPUB,
  AccountId,
}
