import { ObjectSchema } from 'realm'

const UTXO = 'UTXO'
const UTXOStatus = 'UTXOStatus'
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
  primaryKey: 'txid',
  properties: {
    txid: {
      type: 'string', indexed: true
    },
    status: {
      type: 'string', optional: true
    },
    confirmations: {
      type: 'int', optional: true
    },
    fee: {
      type: 'int', optional: true
    },
    date: {
      type: 'string', optional: true
    },
    transactionType: {
      type: 'string', optional: true
    },
    amount: {
      type: 'int', optional: true
    },
    accountType: {
      type: 'string', optional: true
    },
    // primaryAccType: 'string',
    accountName: {
      type: 'string', optional: true
    },
    contactName: {
      type: 'string', optional: true
    },
    recipientAddresses: {
      type: 'string?[]', default: []
    },
    senderAddresses: {
      type: 'string?[]', default: []
    },
    blockTime: {
      type: 'int', optional: true,
    },
    message: {
      type: 'string', optional: true
    },
    address: {
      type: 'string', optional: true
    },
    notes: {
      type: 'string?[]', default: []
    }
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
    status: UTXOStatus,
    tags: {
      type: 'string?[]', default: []
    }
  },
}

export const UTXOStatusSchema: ObjectSchema = {
  name: UTXOStatus,
  properties: {
    block_hash: {
      type: 'string', optional: true,
    },
    block_height: {
      type: 'int', optional: true,
    },
    block_time: {
      type: 'int', optional: true,
    },
    confirmed: {
      type: 'bool', optional: true,
    },
  },
}

export const WalletSchema: ObjectSchema = {
  name: Wallet,
  primaryKey: 'walletId',
  properties: {
    walletId: {
      type: 'string', indexed: true
    },
    primaryMnemonic: {
      type: 'string', optional: true,
    },
    secondaryMemonic: {
      type: 'string', optional: true,
    },
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
