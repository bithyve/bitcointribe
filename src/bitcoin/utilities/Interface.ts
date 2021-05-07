import {
  DecentralizedBackup,
  ServicesJSON,
} from '../../common/interfaces/Interfaces'

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

export interface TransactionDetails {
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

export interface Balances {
  confirmed: number;
  unconfirmed: number;
}

export interface Transactions {
  totalTransactions: number;
  confirmedTransactions: number;
  unconfirmedTransactions: number;
  transactionDetails: Array<TransactionDetails>;
}

export interface MetaShare {
  encryptedSecret: string;
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
  };
  encryptedStaticNonPMDD?: string;
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
  transactions?: Transactions;
  txIdMap?: {[txid: string]: string[]};
  addressQueryList?: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} };
  lastBalTxSync?: number;
  newTransactions?: TransactionDetails[];
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
  contactName: string;
  contactDetails?: {
    xpub: string;
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
    displayTransactions: boolean;
    displayTxDetails: boolean;
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
  paymentDetails?: {
    trusted?: {
      address?: string;
      paymentURI?: string;
    };
    alternate?: {
      address?: string;
      paymentURI?: string;
    };
  };
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
  levelInfo: LevelInfo[];
}

export interface LevelInfo {
  shareType: string;
  updatedAt: number;
  status: string;
  shareId: string;
  reshareVersion?: number;
  name?: string;
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
