export interface Transactions {
  totalTransactions: number;
  confirmedTransactions: number;
  unconfirmedTransactions: number;
  transactionDetails: Array<{
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
  }>;
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
    usedAddresses?: string[];
    nextFreeAddressIndex?: number;
    receivingAddress?: string;
    balances?: {
      balance: number;
      unconfirmedBalance: number;
    };
    transactions?: Transactions;
  };
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

export interface Contacts {
  [contactName: string]: {
    keyPair: any;
    symmetricKey?: string;
    channelAddress?: string;
  };
}
