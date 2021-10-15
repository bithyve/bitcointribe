import { ObjectSchema } from 'realm'

const UTXO = 'UTXO'
const UTXOStatus = 'UTXOStatus'
const Wallet = 'Wallet'
const WalletSecurity = 'WalletSecurity'
const Account = 'Account'
const ActiveAddresses = 'ActiveAddresses'
const ActiveAddress = 'ActiveAddress'
const ActiveAddressAssignee = 'ActiveAddressAssignee'
const Transaction = 'Transaction'
const Details2FA = 'Details2FA'
const Balances = 'Balances'
const Bip32 = 'Bip32'
const Network = 'Network'
const XPUB = 'XPUB'
const TxIdMap = 'TxIdMap'
const AccountId = 'AccountId'
const ContactDetails = 'ContactDetails'
const TrustedContact = 'TrustedContact'
const Streams = 'Streams'
const StreamsMetaData = 'StreamsMetaData'
const StreamsMetaDataFlags = 'StreamsMetaDataFlags'
const UnecryptedStreamData = 'UnecryptedStreamData'
const PrimaryStreamData = 'PrimaryStreamData'
const SecondaryStreamData = 'SecondaryStreamData'
const BackupStreamData = 'BackupStreamData'
const MetaShare = 'MetaShare'
const S3MetaShare = 'S3MetaShare'
const BHR = 'BHR'
const EncryptedShare = 'EncryptedShare'
const Meta = 'Meta'
const KeeperInfo = 'KeeperInfo'
const Receiver = 'Receiver'
const SenderInfo = 'SenderInfo'
const RecipientInfo = 'RecipientInfo'
const Recipient = 'Recipient'
const TransactionsNote = 'TransactionsNote'
const ContactImage = 'ContactImage'
const Gifts = 'Gifts'
const GiftSenderReceiver = 'GiftSenderReceiver'
const GiftDeepLinkConfig = 'GiftDeepLinkConfig'
const GiftTimeStamps = 'GiftTimeStamps'
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
    hasNewTxn: {
      type: 'bool', default: false
    },
    accountVisibility: {
      type: 'string', default: 'DEFAULT',
    },
    type: {
      type: 'string', optional: true
    },
    activeAddresses: {
      type: ActiveAddresses, optional: true
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
    xpriv: {
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
      type: 'list', objectType: TxIdMap, default: []
    },
    addressQueryList: {
      type: 'string?[]', optional: true
    },
    instanceNum: {
      type: 'int', optional: true
    },
    lastSynched: {
      type: 'int', optional: true
    },
    isUsable: {
      type: 'bool', default: true
    },
    transactionsNote: {
      type: 'list', objectType: TransactionsNote, default: []
    }
  },
}

export const TransactionsNoteSchema: ObjectSchema = {
  name: TransactionsNote,
  properties: {
    txId: {
      type: 'string', optional: true
    },
    note: {
      type: 'string', optional: true
    },
  },
}

export const SenderInfoSchema: ObjectSchema = {
  name: SenderInfo,
  properties: {
    name: {
      type: 'string', optional: true
    },
  },
}

export const RecipientSchema: ObjectSchema = {
  name: Recipient,
  properties: {
    name: {
      type: 'string', optional: true
    },
    amount: {
      type: 'int', optional: true
    },
  },
}

export const RecipientInfoSchema: ObjectSchema = {
  name: RecipientInfo,
  properties: {
    txid: {
      type: 'string', optional: true
    },
    recipient: {
      type: 'list', objectType: Recipient, default: []
    },
  },
}

export const ActiveAddressAssigneeSchema: ObjectSchema = {
  name: ActiveAddressAssignee,
  properties: {
    id: {
      type: 'string', optional: true
    },
    type: {
      type: 'string', optional: true
    },
    senderInfo: {
      type: SenderInfo, optional: true
    },
    recipientInfo: {
      type: 'list', objectType: RecipientInfo, default: []
    }
  },
}

export const ActiveAddressSchema: ObjectSchema = {
  name: ActiveAddress,
  properties: {
    address: {
      type: 'string', optional: true
    },
    index: {
      type: 'int', optional: true
    },
    assignee: {
      type: ActiveAddressAssignee, optional: true
    },
  },
}

export const ActiveAddressesSchema: ObjectSchema = {
  name: ActiveAddresses,
  properties: {
    external: {
      type: 'list', objectType: ActiveAddress, default: []
    },
    internal: {
      type: 'list', objectType: ActiveAddress, default: []
    },
  },
}

export const TxIdMapSchema: ObjectSchema = {
  name: TxIdMap,
  properties: {
    id: {
      type: 'string',
    },
    txIds: {
      type: 'string?[]', optional: true
    },
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

// export const AccountIdSchema: ObjectSchema = {
//   name: AccountId,
//   properties: {
//     derivationPath: 'string',
//     accountId: 'string',
//   },
// }

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

export const ReceiverSchema: ObjectSchema = {
  name: Receiver,
  properties: {
    name: {
      type: 'string', optional: true
    },
    amount: {
      type: 'int', optional: true
    },
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
    type: {
      type: 'string', optional: true
    },
    sender: {
      type: 'string', optional: true
    },
    receivers: {
      type: 'list', objectType: Receiver, default: []
    },
    isNew: {
      type: 'bool', default: false
    },
    notes: {
      type: 'string', optional: true
    },
    tags: {
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

export const WalletSecuritySchema: ObjectSchema = {
  name: WalletSecurity,
  properties: {
    questionId: {
      type: 'string', optional: true,
    },
    question: {
      type: 'string', optional: true,
    },
    answer: {
      type: 'string', optional: true,
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
    walletName: {
      type: 'string', optional: true,
    },
    userName: {
      type: 'string', optional: true,
    },
    primaryMnemonic: {
      type: 'string', optional: true,
    },
    primarySeed: {
      type: 'string', optional: true,
    },
    secondaryXpub: {
      type: 'string', optional: true,
    },
    smShare: {
      type: 'string', default: '',
    },
    details2FA: {
      type: Details2FA, optional: true
    },
    accountIds: {
      type: 'string?[]',
      optional: true
    },
    security: {
      type: WalletSecurity, optional: true
    },
    version: {
      type: 'string', optional: true
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
    twoFAKey: 'string',
  },
}

export const PrimaryStreamDataSchema: ObjectSchema = {
  name: PrimaryStreamData,
  primaryKey: 'walletID',
  properties: {
    walletID: {
      type: 'string', indexed: true
    },
    walletName: {
      type: 'string', optional: true
    },
    FCM : {
      type: 'string', optional: true
    },
    paymentAddresses: {
      type: 'string?[]', optional: true
    },
    contactDetails: {
      type: ContactDetails, optional: true
    },
  },
}


export const MetaSchema: ObjectSchema = {
  name: Meta,
  properties: {
    version: {
      type: 'string', optional: true
    },
    validator: {
      type: 'string', optional: true
    },
    index: {
      type: 'int', optional: true
    },
    walletId: {
      type: 'string', optional: true
    },
    timestamp: {
      type: 'string', optional: true
    },
    reshareVersion: {
      type: 'int', optional: true
    },
    questionId: {
      type: 'string', optional: true
    },
    question: {
      type: 'string', optional: true
    },
    guardian: {
      type: 'string', optional: true
    },
    encryptedKeeperInfo: {
      type: 'string', optional: true
    },
    scheme: {
      type: 'string', optional: true
    }
  },
}

export const EncryptedShareSchema: ObjectSchema = {
  name: EncryptedShare,
  properties: {
    pmShare: {
      type: 'string', optional: true
    },
    smShare: {
      type: 'string', optional: true
    },
    bhXpub: {
      type: 'string', optional: true
    },
  },
}

export const MetaShareSchema: ObjectSchema = {
  name: MetaShare,
  properties: {
    encryptedShare: {
      type: EncryptedShare, optional: true
    },
    shareId: {
      type: 'string', optional: true
    },
    meta: {
      type: Meta, optional: true
    }
  },
}

export const KeeperInfoSchema: ObjectSchema = {
  name: KeeperInfo,
  properties: {
    shareId: {
      type: 'string', optional: true
    },
    name: {
      type: 'string', optional: true
    },
    type: {
      type: 'string', optional: true
    },
    scheme: {
      type: 'string', optional: true
    },
    currentLevel: {
      type: 'int', optional: true
    },
    createdAt: {
      type: 'int', optional: true
    },
    sharePosition: {
      type: 'int', optional: true
    },
    // data: { TODO add type
    //   type: 'int', optional: true
    // },
    channelKey: {
      type: 'string', optional: true
    }
  },
}

export const BackupStreamDataSchema: ObjectSchema = {
  name: BackupStreamData,
  properties: {
    primaryMnemonicShard: {
      type: MetaShare, optional: true
    },
    keeperInfo: {
      type: 'list', objectType: KeeperInfo, default: []
    },
  },
}

export const SecondaryStreamDataSchema: ObjectSchema = {
  name: SecondaryStreamData,
  properties: {
    // secondaryMnemonicShard: { TODO add type
    //   type: 'string', optional: true
    // },
    bhXpub: {
      type: 'string', optional: true
    },
  },
}

export const UnecryptedStreamDataSchema: ObjectSchema = {
  name: UnecryptedStreamData,
  primaryKey: 'streamId',
  properties: {
    streamId: {
      type: 'string', indexed: true
    },
    primaryData: {
      type: PrimaryStreamData, optional: true
    }, secondaryData: {
      type: SecondaryStreamData, optional: true
    },
    backupData: {
      type: BackupStreamData, optional: true
    },
    metaData: {
      type: StreamsMetaData, optional: true
    }
  },
}

export const StreamsMetaDataFlagsSchema: ObjectSchema = {
  name: StreamsMetaDataFlags,
  properties: {
    active: {
      type: 'bool', optional: true
    },
    lastSeen: {
      type: 'int', optional: true
    },
    newData: {
      type: 'bool', optional: true
    }
  },
}

export const StreamsMetaDataSchema: ObjectSchema = {
  name: StreamsMetaData,
  properties: {
    flags: {
      type: StreamsMetaDataFlags, optional: true
    },
    version: {
      type: 'string', optional: true
    },
  },
}

export const StreamsSchema: ObjectSchema = {
  name: Streams,
  primaryKey: 'streamId',
  properties: {
    streamId: {
      type: 'string', indexed: true
    },
    primaryEncryptedData: {
      type: 'string', optional: true,
    },
    secondaryEncryptedData: {
      type: 'string', optional: true,
    },
    encryptedBackupData: {
      type: 'string', optional: true,
    },
    metaData: {
      type: StreamsMetaData, optional: true
    }
  },
}

export const ContactDetailsSchema: ObjectSchema = {
  name: ContactDetails,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string', indexed: true
    },
    contactName: {
      type: 'string', optional: true,
    },
    image: {
      type: ContactImage, optional: true,
    },
  },
}

export const ContactImageSchema: ObjectSchema = {
  name: ContactImage,
  properties: {
    uri: {
      type: 'string', optional: true
    },
  },
}

export const TrustedContactSchema: ObjectSchema = {
  name: TrustedContact,
  primaryKey: 'channelKey',
  properties: {
    channelKey: {
      type: 'string', indexed: true,
    },
    contactDetails: {
      type: ContactDetails, optional: true
    },
    relationType: {
      type: 'string', optional: true,
    },
    permanentChannelAddress: {
      type: 'string', optional: true,
    },
    secondaryChannelKey: {
      type: 'string', optional: true,
    },
    streamId: {
      type: 'string', optional: true,
    },
    walletID: {
      type: 'string', optional: true,
    },
    permanentChannel: {
      type: 'list', objectType: Streams, default: []
    },
    unencryptedPermanentChannel: {
      type: 'list', objectType: UnecryptedStreamData, default: []
    },
    contactsSecondaryChannelKey: {
      type: 'string', optional: true,
    },
    isActive: {
      type: 'bool', optional: true,
    },
    hasNewData: {
      type: 'bool', optional: true,
    },
  },
}

export const S3MetaShareSchema: ObjectSchema = {
  name: S3MetaShare,
  //primaryKey: 'shareId',
  properties: {
    shareId: {
      type: 'string', optional: true
    },
    encryptedShare: {
      type: EncryptedShare, optional: true
    },
    meta:{
      type: Meta, optional: true
    },
  },
}

export const BHRSchemaSchema: ObjectSchema = {
  name: BHR,
  properties: {
    encryptedSecretsKeeper: {
      type: 'string?[]', optional: true
    },
    metaSharesKeeper: {
      type: 'list', objectType: S3MetaShare, default: []
    },
    encryptedSMSecretsKeeper: {
      type: 'string?[]', optional: true
    },
    oldMetaSharesKeeper:{
      type: 'list', objectType: S3MetaShare, default: []
    },
  },
}

export const GiftSenderReceiverSchema: ObjectSchema = {
  name: GiftSenderReceiver,
  properties: {
    accountId: {
      type: 'string', optional: true
    },
    walletId: {
      type: 'string', optional: true
    },
    walletName: {
      type: 'string', optional: true
    },
  },
}

export const GiftDeepLinkConfigSchema : ObjectSchema = {
  name: GiftDeepLinkConfig,
  properties: {
    encryptionType: {
      type: 'string', optional: true
    },
    encryptionKey: {
      type: 'string', optional: true
    },
  },
}

export const GiftTimeStampsSchema : ObjectSchema = {
  name: GiftTimeStamps,
  properties: {
    created: {
      type: 'int', optional: true
    },
    sent: {
      type: 'int', optional: true
    },
    accepted: {
      type: 'int', optional: true
    },
    reclaimed: {
      type: 'int', optional: true
    },
  },
}

export const GiftsSchema: ObjectSchema = {
  name: Gifts,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'string', indexed: true
    },
    address: {
      type: 'string', optional: true
    },
    amount: {
      type: 'int', optional: true
    },
    createdAt: {
      type: 'int', optional: true
    },
    privateKey: {
      type: 'string', optional: true
    },
    status: {
      type: 'string', optional: true
    },
    type: {
      type: 'string', optional: true
    },
    sender: {
      type: GiftSenderReceiver, optional: true
    },
    receiver: {
      type: GiftSenderReceiver, optional: true
    },
    note: {
      type: 'string', optional: true
    },
    deepLinkConfig: {
      type: GiftDeepLinkConfig, optional: true
    },
    themeId: {
      type: 'string', optional: true
    },
    timestamps: {
      type: GiftTimeStamps, optional: true
    },
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
  ContactDetails,
  TrustedContact,
  Streams,
  StreamsMetaData,
  UnecryptedStreamData,
  PrimaryStreamData,
  SecondaryStreamData,
  BackupStreamData,
  MetaShare,
  EncryptedShare,
  Meta,
  KeeperInfo,
  WalletSecurity,
  BHR,
  S3MetaShare,
  Gifts,
}
