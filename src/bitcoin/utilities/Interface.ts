import { ImageSourcePropType } from 'react-native'
import {
  DecentralizedBackup,
  ServicesJSON,
} from '../../common/interfaces/Interfaces'
import { networks } from 'bitcoinjs-lib'
import { InitTrustedContactFlowKind } from '../../store/actions/trustedContacts'

export interface InputUTXOs {
  txId: string;
  vout: number;
  value: number;
  address: string;
}

export interface OutputUTXOs {
  value: number;
  address: string;
}

export interface TransactionPrerequisiteElements {
  inputs?: InputUTXOs[];
  outputs?: OutputUTXOs[];
  fee?: number;
  estimatedBlocks?: number;
}

export interface TransactionPrerequisite {
  [txnPriority: string]: TransactionPrerequisiteElements
}

export interface Transaction {
  txid: string;
  status: string;
  confirmations: number;

  /**
   * Sats per byte
   */
  fee: string;

  /**
   * UTC string
   */
  date: string;

  /**
   * Inbound(Received)/Outbound(Sent) transaction
   */
  transactionType: string;

  /**
   * Amount in Satoshis.
   */
  amount: number;

  /**
   * Account(sub) to which the transaction belongs
   */
  accountType: string;

  /**
   * Account(primary-sub) to which the transaction belongs
   */
  primaryAccType?: string;

   /**
   * Name of the account(custom) to which the transaction belongs
   */
  accountName?: string;

  /**
   * Name of the contact in case of an inbound transaction from trusted-contact
   */
  contactName?: string;

  /**
   * Outbound transaction's destination
   */
  recipientAddresses?: string[];

  /**
   * Inbound transaction's source
   */
  senderAddresses?: string[];

  blockTime?: number;

  /**
   * Note/message attached w/ the transaction(Donation acc specific)
   */
  message?: string;

   /**
   * Address corresponding to which this tx has been fetched
   */
  address?: string
}

export type TransactionDetails = Transaction

export interface Balances {
  confirmed: number;
  unconfirmed: number;
}

export enum TxPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CUSTOM = 'custom'
}

export interface Transactions {
  totalTransactions: number;
  confirmedTransactions: number;
  unconfirmedTransactions: number;
  transactionDetails: Array<Transaction>;
}

export interface MetaShare {
  encryptedSecret?: string;
  encryptedShare?: {
    pmShare: string;
    smShare: string;
    bhXpub: string;
  };
  shareId: string;
  meta: {
    version: string;
    validator: string;
    index: number;
    walletId: string;
    tag: string;
    timestamp: string;
    reshareVersion: number;
    questionId: string;
    question?: string;
    guardian?: string;
    encryptedKeeperInfo?: string;
    scheme?: string,
  };
}

export interface EncDynamicNonPMDD {
  updatedAt: number;
  encryptedDynamicNonPMDD: string;
}

export interface SocialStaticNonPMDD {
  secondaryXpub: string;
  bhXpub: string;
  shareIDs: string[];
}

export interface BuddyStaticNonPMDD {
  secondaryMnemonic: string;
  twoFASecret: string;
  secondaryXpub: string;
  bhXpub: string;
  shareIDs: string[];
}

export interface ShareUploadables {
  encryptedMetaShare: string;
  messageId: string;
  encryptedDynamicNonPMDD?: EncDynamicNonPMDD;
}

export interface DerivativeAccountElements {
  xpub: string;
  xpubId: string;
  xpriv: string;
  usedAddresses?: string[];
  nextFreeAddressIndex?: number;
  nextFreeChangeAddressIndex?: number;
  receivingAddress?: string;
  confirmedUTXOs?: {
    txId: string;
    vout: number;
    value: number;
    address: string;
    status?: any;
  }[];
  unconfirmedUTXOs?: {
    txId: string;
    vout: number;
    value: number;
    address: string;
    status?: any;
  }[];
  balances?: {
    balance: number;
    unconfirmedBalance: number;
  };
  transactions?: Transaction[];
  txIdMap?: {[txid: string]: string[]};
  addressQueryList?: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} };
  lastBalTxSync?: number;
  newTransactions?: Transaction[];
  blindGeneration?: boolean // temporarily generated during blind refresh
}

export enum DerivativeAccountTypes {
  SUB_PRIMARY_ACCOUNT = 'SUB_PRIMARY_ACCOUNT',
  FAST_BITCOINS = 'FAST_BITCOINS',
  TRUSTED_CONTACTS = 'TRUSTED_CONTACTS',
  DONATION_ACCOUNT = 'DONATION_ACCOUNT',
  WYRE = 'WYRE',
  RAMP = 'RAMP',
  SWAN = 'SWAN'
}

// Base Dervative Account
export interface DerivativeAccount {
  series: number;
  instance: {
    max: number;

    // TODO: Is this a count of some sort?
    using: number;
  };
  [accounts: number]: DerivativeAccountElements;
}

export interface TrustedContactDerivativeAccountElements
  extends DerivativeAccountElements {
  channelKey: string;
  contactDetails: ContactDetails,
  xpubDetails: {
    xpub?: string;
    tpub?: string;
    receivingAddress?: string;
    usedAddresses?: string[];
    nextFreeAddressIndex?: number;
  };
}

// Trusted Contact Dervative Account (extension of Base Derivative Account)
export interface TrustedContactDerivativeAccount {
  series: number;
  instance: {
    max: number;
    using: number;
  };
  [accounts: number]: TrustedContactDerivativeAccountElements;
}

export interface DonationDerivativeAccountElements
  extends DerivativeAccountElements {
  donee: string;
  id: string;
  subject: string;
  description: string;
  configuration: {
    displayBalance: boolean;
  };
  disableAccount: boolean;
}

export interface DonationDerivativeAccount {
  series: number;
  instance: {
    max: number;
    using: number;
  };
  [accounts: number]: DonationDerivativeAccountElements;
}

export interface SubPrimaryDerivativeAccountElements
  extends DerivativeAccountElements {
  accountName: string;
  accountDescription: string;
}

export interface SubPrimaryDerivativeAccount {
  series: number;
  instance: {
    max: number;
    using: number;
  };
  [accounts: number]: SubPrimaryDerivativeAccountElements;
}

export interface WyreDerivativeAccountElements
  extends DerivativeAccountElements {
  accountName: string;
  accountDescription: string;
}

export interface WyreDerivativeAccount {
  series: number;
  instance: {
    max: number;
    using: number;
  };
  [accounts: number]: WyreDerivativeAccountElements;
}

export interface RampDerivativeAccountElements
  extends DerivativeAccountElements {
  accountName: string;
  accountDescription: string;
}

export interface RampDerivativeAccount {
  series: number;
  instance: {
    max: number;
    using: number;
  };
  [accounts: number]: RampDerivativeAccountElements;
}

export interface SwanDerivativeAccountElements
  extends DerivativeAccountElements {
  accountName: string;
  accountDescription: string;
}

export interface SwanDerivativeAccount {
  series: number;
  instance: {
    max: number;
    using: number;
  };
  [accounts: number]: SwanDerivativeAccountElements;
}

export interface DerivativeAccounts {
  [accountType: string]:
    | DerivativeAccount
    | TrustedContactDerivativeAccount
    | DonationDerivativeAccount
    | SubPrimaryDerivativeAccount;
}

export enum notificationType {
  contact = 'contact',
  approveKeeper = 'approveKeeper',
  uploadSecondaryShare = 'uploadSecondaryShare',
  reShare = 'reShare',
  reShareResponse = 'reShareResponse',
  smUploadedForPK = 'smUploadedForPK',
  newFCM = 'newFCM',
  newKeeperInfo = 'newKeeperInfo',
  FNF_REQUEST = 'FNF_REQUEST',
  FNF_TRANSACTION = 'FNF_TRANSACTION',
  RELEASE = 'RELEASE',
  FNF_REQUEST_ACCEPTED='FNF_REQUEST_ACCEPTED',
  FNF_REQUEST_REJECTED='FNF_REQUEST_REJECTED',
  FNF_KEEPER_REQUEST='FNF_KEEPER_REQUEST',
  FNF_KEEPER_REQUEST_ACCEPTED='FNF_KEEPER_REQUEST_ACCEPTED',
  FNF_KEEPER_REQUEST_REJECTED='FNF_KEEPER_REQUEST_REJECTED',
}
export enum notificationTag {
  IMP = 'IMP',
  notIMP = 'not-IMP',
  mandatory = 'mandatory',
  notMandatory = 'not-mandatory',
} // IMP/notIMP for directed notifications & mandatory/notMandatory for release notifications
export interface INotification {
  notificationType: notificationType;
  title: string;
  body: string;
  data: any;
  tag: notificationTag;
  status?: string;
  date?: Date;
} // corresponds to the notification schema

// TRUSTED CONTACTS
export interface EphemeralDataElements {
  publicKey?: string;
  walletID?: string;
  FCM?: string;
  DHInfo?: {
    publicKey: string;
    address?: string;
  };
  shareTransferDetails?: {
    otp: string;
    encryptedKey: string;
  };
  // paymentDetails?: {
  //   trusted?: {
  //     address?: string;
  //     paymentURI?: string;
  //   };
  //   alternate?: {
  //     address?: string;
  //     paymentURI?: string;
  //   };
  // };
  trustedAddress?: string;
  trustedTestAddress?: string;
  restoreOf?: string;
}

export interface EphemeralData {
  publicKey: string;
  data: EphemeralDataElements;
}

export interface EncryptedEphemeralData {
  publicKey: string;
  encryptedData: string; // encrypted EphemeralData
  // add ons for optimisation
  walletID?: string;
  DHInfo?: {
    publicKey: string;
    address?: string;
  };
}

export enum trustedChannelActions {
  downloadShare = 'downloadShare',
}

export interface TrustedDataElements {
  xpub?: string;
  tpub?: string;
  walletID?: string;
  FCM?: string;
  walletName?: string;
  shareTransferDetails?: {
    otp: string;
    encryptedKey: string;
  };
  removeGuardian?: boolean;
  remove?: boolean;
  version?: string;
  isPrimary?: boolean;
  featuresList?: any;
  xPub?: any;
  securityQuestion?: any;
  metaShare? : MetaShare;
  pdfShare? : MetaShare;
  secondaryMnemonics?: string;
  twoFASetup?: {
      qrData: string;
      secret: string;
  };
  secondaryShare?: MetaShare;
  keeperInfo?: string;
}
export interface TrustedData {
  publicKey: string;
  data: TrustedDataElements;
  lastSeen?: number;
  encDataHash?: string;
}

export interface EncryptedTrustedData {
  publicKey: string;
  encryptedData: string; // encrypted TrustedData
  lastSeen?: number;
  dataHash?: string; // hash of the encrypted TrustedData (TrustedData's encDataHash = dataHash)
}

export interface ContactElements {
  privateKey: string;
  publicKey: string;
  encKey: string;
  otp?: string;
  symmetricKey?: string;
  secondaryKey?: string;
  contactsPubKey?: string;
  contactsWalletName?: string;
  isWard?: boolean;
  isGuardian?: boolean;
  walletID?: string;
  FCMs?: string[];
  ephemeralChannel?: {
    address: string;
    initiatedAt?: number;
    data?: EphemeralDataElements[];
  };
  trustedChannel?: {
    address: string;
    data?: TrustedData[];
  };
  lastSeen?: number;
  trustedAddress?: string;
  trustedTestAddress?: string;
}
export interface Contacts {
  [contactName: string]: ContactElements
}

export interface ContactDetails {
  id: string,
  contactName?: string,
  image?: ImageSourcePropType | null,
}

export interface ChannelAssets {
  shareId?: string,
  primaryMnemonicShard?: any,
  keeperInfo?: any,
  secondaryMnemonicShard?: any,
  bhXpub?: string
}

export interface ContactInfo  {
  contactDetails?: ContactDetails,
  isKeeper?: boolean,
  channelKey?: string,
  secondaryChannelKey?: string
  contactsSecondaryChannelKey?: string,
  channelAssets?: {
    primaryMnemonicShard?: any,
    keeperInfo?: any,
    secondaryMnemonicShard?: any,
    bhXpub?: string
  },
  flowKind?: InitTrustedContactFlowKind
}
export interface PrimaryStreamData {
  walletID?: string,
  walletName?: string,
  relationType?: TrustedContactRelationTypes,
  FCM?: string,
  paymentAddresses?: {
    [accountType: string]: string
  },
  contactDetails: ContactDetails
}

export interface SecondaryStreamData {
  secondaryMnemonicShard?: any,
  bhXpub?: string,
}

export interface BackupStreamData {
  primaryMnemonicShard?: MetaShare,
  keeperInfo?: KeeperInfoInterface[],
}

export interface UnecryptedStreamData {
  streamId: string,
  primaryData?: PrimaryStreamData,
  secondaryData?: SecondaryStreamData,     // in/out-stream secondaryData = null
  backupData?: BackupStreamData | null, // in/out-stream backupData = null
  metaData?: {
    flags?: {
      active: boolean,
      lastSeen: number,
      newData: boolean,
    },
    version?: string
  }
}

export type UnecryptedStreams = {
  [streamId: string]: UnecryptedStreamData
}
export interface StreamData {
  streamId: string,
  primaryEncryptedData?: string // CH encrypted: encrypted via primary channel key
  secondaryEncryptedData?: string // CH2 encrypted: encrypted via secondary channel key & is not stored in the app
  encryptedBackupData?: string, // not stored in the app
  metaData?: {
    flags?: {
      active: boolean,
      lastSeen: number,
      newData: boolean,
    },
    version?: string
  }
}

export type Streams = {
  [streamId: string]: StreamData
}

export enum TrustedContactRelationTypes {
  CONTACT = 'CONTACT',
  KEEPER  = 'KEEPER',
  WARD = 'WARD',
  KEEPER_WARD = 'KEEPER_WARD'
}

export interface TrustedContact {
  contactDetails: ContactDetails,
  relationType: TrustedContactRelationTypes,
  permanentChannelAddress: string,
  isActive: boolean, // is the channel active
  hasNewData: boolean, // instream has new data
  permanentChannel?: Streams, // encrypted and uploaded to Relay
  unencryptedPermanentChannel?: UnecryptedStreams, // unecrypted retained copy
  secondaryChannelKey?: string | null, // temporary secondaryKey(removed post successful contact setup)
  streamId?: string, // contact's streamId
  walletID?: string, // contact's walletId
  contactsSecondaryChannelKey?: string, // contacts secondaryKey(stored locally)
}
export interface Trusted_Contacts {
  [channelKey: string]: TrustedContact
}

export interface WalletImage {
  DECENTRALIZED_BACKUP?: DecentralizedBackup;
  SERVICES?: ServicesJSON;
  ASYNC_DATA?: {
    [identifier: string]: string;
  };
  STATE_DATA?: {
    [identifier: string]: string;
  };
}

export interface EncryptedImage {
  // Encrypted Wallet Image
  DECENTRALIZED_BACKUP?: string;
  SERVICES?: string;
  ASYNC_DATA?: string;
  STATE_DATA?: string;
}

export interface Keepers {
  [shareId: string]: {
    shareType?: string;
    privateKey?: string;
    publicKey?: string;
    shareTransferDetails?: {
      otp?: string;
      encryptedKey?: string;
    };
    symmetricKey?: string;
    secondaryKey?: string;
    keeperPubKey?: string;
    walletName?: string;
    walletID?: string;
    FCMs?: string[];
    ephemeralChannel?: {
      address: string;
      initiatedAt?: number;
      data?: EphemeralDataElements[];
    };
    trustedChannel?: {
      address: string;
      data?: TrustedData[];
    };
    keeperUUID?: string;
    keeperFeatureList?: any[],
    isPrimary?: Boolean
  }
}

// TRUSTED Keeper
export interface EphemeralDataElementsForKeeper {
  publicKey?: string;
  walletID?: string;
  hexaID?: string;
  FCM?: string;
  DHInfo?: {
    publicKey: string;
    address?: string;
  };
  shareTransferDetails?: {
    otp: string;
    encryptedKey: string;
  };
  xPub? : any;
  securityQuestion?: any;
  featuresList?: any;
  isPrimary?: boolean;
}

export interface EphemeralDataForKeeper {
  publicKey: string;
  data: EphemeralDataElementsForKeeper;
}

export interface LevelHealthInterface {
  level?: number;
  levelInfo: LevelInfo[];
}

export interface LevelInfo {
  shareType: string;
  updatedAt: number;
  status: string;
  shareId: string;
  reshareVersion?: number;
  name?: string;
  data?: any;
  channelKey?: string
}

export interface KeeperInfoInterface {
  shareId: string;
  name: string;
  type: string;
  scheme: string;
  currentLevel: number;
  createdAt: number;
  sharePosition: number;
  data?: any;
  channelKey?: string;
}
//VersionHistory
export interface VersionHistory {
  id: string;
  version: string;
  buildNumber: string;
  versionName: string;
  title: string;
  date: Date;
}

export enum ScannedAddressKind {
  ADDRESS = 'address',
  PAYMENT_URI = 'paymentURI',
}

export interface AverageTxFees {
  [priority: string]: {
    averageTxFee: number,
    feePerByte: number,
    estimatedBlocks: number,
  },
}

export interface LevelDataObj {
  shareType: string
  updatedAt: number
  status: string
  shareId: string
  reshareVersion: number
  name: string
  data: any;
  uuid: string
}

export interface LevelData {
  levelName: string
  status: string
  keeper1ButtonText: string
  keeper2ButtonText: string
  keeper1: LevelDataObj,
  keeper2: LevelDataObj,
  note:string
  info:string
  id: number
}

export enum QRCodeTypes {
  CONTACT_REQUEST = 'CONTACT_REQUEST',
  KEEPER_REQUEST = 'KEEPER_REQUEST',
  RECOVERY_REQUEST = 'RECOVERY_REQUEST'
}

export interface UTXO {
  txId: string;
  vout: number;
  value: number;
  address: string;
  status?: any;
}

export enum NetworkType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET'
}

export interface Wallet {
  walletId: string,
  walletName: string,
  primaryMnemonic: string,
  secondaryMemonic?: string,
  details2FA? : {
    secondaryXpub: string,
    bithyveXpub: string,
    twoFAKey: string,
  }
  accounts: {
    [accountType: string]: string[] // array of accountIds
  }
}

export interface Account {
  id: string,                           // account identifier(derived from xpub)
  walletId: string,                     // wallet's id
  type: AccountType,                    // type of account
  instanceNum: number,                  // instance number of the aforementioned type
  networkType: NetworkType,                 // testnet/mainnet
  derivationPath: string,               // derivation path of the extended keys belonging to this account
  xpub: string | null,                  // account's xpub (null for multi-sig accounts)
  xpriv: string | null,                 // account's xpriv (null for multi-sig accounts)
  accountName: string,                  // name of the account
  accountDescription: string,           // description of the account
  activeAddresses: string[],            // addresses used(to be synched during soft refresh)
  receivingAddress: string,             // current external address
  nextFreeAddressIndex: number;         // external-chain free address marker
  nextFreeChangeAddressIndex: number;   // internal-chain free address marker
  confirmedUTXOs: UTXO[];               // utxo set available for use
  unconfirmedUTXOs: UTXO[];             // utxos to arrive
  balances: Balances;                   // confirmed/unconfirmed balances
  transactions: Transaction[];          // transactions belonging to this account
  lastSynched: number;                  // account's last sync timestamp
  newTransactions?: Transaction[];      // new transactions arrived during the current sync
  txIdMap?: {[txid: string]: string[]}; // tx-mapping; tx insertion checker
  addressQueryList?: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} }; // addresses to be synched in addition to the soft refresh range
}

export interface MultiSigAccount extends Account {
  is2FA: boolean,                       // is2FA enabled
  xpubs: {                              // xpub set for multi-sig
    primary: string,
    secondary: string,
    bithyve: string,
  }
  xprivs: {                             // xpirv set for multi-sig
    primary: string,
    secondary?: string,
  }
}

export interface DonationAccount extends Account {
  donee: string;
  configuration: {
    displayBalance: boolean;
  };
  disableAccount: boolean;
  is2FA: boolean,                       // is2FA enabled
  xpubs?: {                              // xpub set for multi-sig
    primary: string,
    secondary: string,
    bithyve: string,
  }
  xprivs?: {                             // xpirv set for multi-sig
    primary: string,
    secondary?: string,
  }
}

export enum AccountType {
  TEST_ACCOUNT = 'TEST_ACCOUNT',
  CHECKING_ACCOUNT = 'CHECKING_ACCOUNT',
  SAVINGS_ACCOUNT = 'SAVINGS_ACCOUNT',
  DONATION_ACCOUNT = 'DONATION_ACCOUNT',
  RAMP_ACCOUNT = 'RAMP_ACCOUNT',
  SWAN_ACCOUNT = 'SWAN_ACCOUNT',
  WYRE_ACCOUNT = 'WYRE_ACCOUNT'
}

export interface Accounts {
    [accountId: string]: Account | MultiSigAccount | DonationAccount
}
