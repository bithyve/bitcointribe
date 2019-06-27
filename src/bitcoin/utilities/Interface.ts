export interface IMetaShare {
  encryptedShare: string;
  meta: {
    validator: string;
    walletId: string;
    tag: string;
    timeStamp: string;
    info: string;
  };
  encryptedStaticNonPMDD: string;
}

export interface IStaticNonPMDD {
  secondaryMnemonic: string;
  twoFASecret: string;
  bhXpub: string;
}
