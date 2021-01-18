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

export interface TransactionPrerequisite {
  [txnPriority: string]: {
    inputs?: InputUTXOs[];
    outputs: OutputUTXOs[];
    fee: number;
    estimatedBlocks: number;
  };
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
    guardian?: string;
  };
  encryptedStaticNonPMDD: string;
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
  encryptedDynamicNonPMDD: EncDynamicNonPMDD;
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
  balances?: {
    balance: number;
    unconfirmedBalance: number;
  };
  transactions?: Transactions;
  txIdMap?: {[txid: string]: boolean};
  lastBalTxSync?: number;
  newTransactions?: TransactionDetails[];
}

export enum DerivativeAccountTypes {
  SUB_PRIMARY_ACCOUNT = 'SUB_PRIMARY_ACCOUNT',
  FAST_BITCOINS = 'FAST_BITCOINS',
  TRUSTED_CONTACTS = 'TRUSTED_CONTACTS',
  DONATION_ACCOUNT = 'DONATION_ACCOUNT',
  WYRE = 'WYRE'
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

export interface DerivativeAccounts {
  [accountType: string]:
    | DerivativeAccount
    | TrustedContactDerivativeAccount
    | DonationDerivativeAccount
    | SubPrimaryDerivativeAccount;
}

export enum notificationType {
  contact = 'contact',
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

export interface Contacts {
  [contactName: string]: {
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
  };
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
