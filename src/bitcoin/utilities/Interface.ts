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

export interface DerivativeAccount {
  series: number;
  [accounts: number]: {
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
  };
}

export interface DerivativeAccounts {
  [accountType: string]: DerivativeAccount;
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
export interface EphemeralDataElements {
  publicKey?: string;
  walletID?: string;
  FCM?: string;
  metaShare?: MetaShare;
}

export interface EphemeralDataPacket {
  [publicKey: string]: EphemeralDataElements; // pubKeys serves as the identifier as it can be public
}

export interface TrustedDataElements {}

export interface TrustedDataPacket {
  [publicKey: string]: TrustedDataElements;
}

export interface EncryptedTrustedDataPacket {
  [publicKey: string]: string; // encrypted TrustedDataElements
}

export interface Contacts {
  [contactName: string]: {
    privateKey: string;
    publicKey: string;
    symmetricKey?: string;
    contactsPubKey?: string;
    ephemeralChannel?: {
      address: string;
      data?: EphemeralDataElements;
    };
    trustedChannel?: {
      address: string;
      data?: TrustedDataPacket;
    };
  };
}
