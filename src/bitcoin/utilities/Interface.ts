import accounts from '../../store/reducers/accounts';

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
    balances?: {
      balance: number;
      unconfirmedBalance: number;
    };
    transactions?: Transactions;
  };
}
