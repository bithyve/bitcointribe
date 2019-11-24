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
  };
  encryptedStaticNonPMDD: string;
}

export interface SocialStaticNonPMDD {
  secondaryXpub: string;
  bhXpub: string;
}

export interface BuddyStaticNonPMDD {
  secondaryMnemonic: string;
  twoFASecret: string;
  secondaryXpub: string;
  bhXpub: string;
}
