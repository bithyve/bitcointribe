export interface IMetaShare {
  encryptedShare: string;
  meta: {
    validator: string;
    index: number;
    walletId: string;
    tag: string;
    timeStamp: string;
  };
  encryptedStaticNonPMDD: string;
}

export interface ISocialStaticNonPMDD {
  secoundaryXpub: string;
  bhXpub: string;
  xIndex: number;
}

export interface IBuddyStaticNonPMDD {
  secondaryMnemonic: string;
  twoFASecret: string;
  secoundaryXpub: string;
  bhXpub: string;
  xIndex: number;
}