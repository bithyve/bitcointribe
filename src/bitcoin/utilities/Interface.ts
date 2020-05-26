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
  fee: string;
  date: string;
  transactionType: string;
  amount: number;
  accountType: string;
  recipientAddresses?: string[];
  senderAddresses?: string[];
  blockTime?: number;
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
    version: number;
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

export interface DerivativeAccountElements {
  xpub: string;
  ypub?: string;
  usedAddresses?: string[];
  nextFreeAddressIndex?: number;
  receivingAddress?: string;
  balances?: {
    balance: number;
    unconfirmedBalance: number;
  };
  transactions?: Transactions;
  lastBalTxSync?: number;
  newTransactions?: TransactionDetails[];
}

// Base Dervative Account
export interface DerivativeAccount {
  series: number;
  instance: {
    max: number;
    using: number;
  };
  [accounts: number]: DerivativeAccountElements;
}

export interface TrustedContactDerivativeAccountElements {
  contactName: string;
  contactDetails?: {
    xpub: string;
    receivingAddress?: string;
    usedAddresses?: string[];
    nextFreeAddressIndex?: number;
  };
  xpub: string;
  ypub?: string;
  usedAddresses?: string[];
  nextFreeAddressIndex?: number;
  receivingAddress?: string;
  balances?: {
    balance: number;
    unconfirmedBalance: number;
  };
  transactions?: Transactions;
  lastBalTxSync?: number;
  newTransactions?: TransactionDetails[];
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

export interface DerivativeAccounts {
  [accountType: string]: DerivativeAccount | TrustedContactDerivativeAccount;
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
  data: Object;
  tag: notificationTag;
  status?: string;
  date?: Date;
} // corresponds to the notification schema

// TRUSTED CONTACTS
export interface EphemeralData {
  publicKey?: string; // pubKeys serves as the identifier as it can be public
  walletID?: string;
  FCM?: string;
  shareTransferDetails?: {
    otp: string;
    encryptedKey: string;
  };
}

export interface TrustedDataElements {
  xpub?: string;
}
export interface TrustedData {
  publicKey: string;
  data: TrustedDataElements;
}

export interface EncryptedTrustedData {
  publicKey: string;
  encryptedData: string; // encrypted TrustedData
}

export interface Contacts {
  [contactName: string]: {
    privateKey: string;
    publicKey: string;
    symmetricKey?: string;
    contactsPubKey?: string;
    contactsWalletName?: string;
    isWard?: Boolean;
    isGuardian?: Boolean;
    ephemeralChannel?: {
      address: string;
      data?: EphemeralData[];
    };
    trustedChannel?: {
      address: string;
      data?: TrustedData[];
    };
  };
}
