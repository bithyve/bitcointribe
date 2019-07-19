import { TransactionBuilder } from "bitcoinjs-lib";
import config from "../../Config";
import SecureHDWallet from "../../utilities/SecureHDWallet";

export default class SecureAccount {
  public static fromJSON = ( json: string ) => {
    const { secureHDWallet } = JSON.parse( json );
    const {
      primaryMnemonic,
      secondaryMnemonic,
      consumedAddresses,
      nextFreeChildIndex,
      multiSigCache,
      signingEssentialsCache,
      primaryXpriv,
      xpubs,
    }: {
      primaryMnemonic: string;
      secondaryMnemonic: string;
      consumedAddresses: string[];
      nextFreeChildIndex: number;
      multiSigCache: {};
      signingEssentialsCache: {};
      primaryXpriv: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
    } = secureHDWallet;

    return new SecureAccount( primaryMnemonic, {
      secondaryMnemonic,
      consumedAddresses,
      nextFreeChildIndex,
      multiSigCache,
      signingEssentialsCache,
      primaryXpriv,
      xpubs,
    } );
  }
  private secureHDWallet: SecureHDWallet;

  constructor (
    primaryMnemonic: string,
    stateVars?: {
      secondaryMnemonic: string;
      consumedAddresses: string[];
      nextFreeChildIndex: number;
      multiSigCache: {};
      signingEssentialsCache: {};
      primaryXpriv: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
    },
  ) {
    this.secureHDWallet = new SecureHDWallet( primaryMnemonic, stateVars );
  }

  public isActive = async () => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.isActive(),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getRecoveryMnemonic = ():
    | {
      status: number;
      data: {
        secondaryMnemonic: string;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.secureHDWallet.getSecondaryMnemonic(),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getSecondaryXpub = ():
    | {
      status: number;
      data: {
        secondaryXpub: string;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.secureHDWallet.getSecondaryXpub(),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getAccountId = ():
    | {
      status: number;
      data: {
        accountId: string;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.secureHDWallet.getAccountId(),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getAddress = async (): Promise<
    | {
      status: number;
      data: {
        address: string;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.getReceivingAddress(),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public getBalance = async (): Promise<
    | {
      status: number;
      data: {
        balance: number;
        unconfirmedBalance: number;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.fetchBalance(),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public setupSecureAccount = async (): Promise<
    | {
      status: number;
      data: {
        setupData: {
          qrData: string;
          secret: string;
          bhXpub: string;
          xIndex: number;
        };
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.setupSecureAccount(),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public validateSecureAccountSetup = async (
    token: number,
    secret: string,
    xIndex: number,
  ): Promise<
    | {
      status: number;
      data: {
        setupSuccessful: boolean;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.validateSecureAccountSetup(
          token,
          secret,
          xIndex,
        ),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public importSecureAccount = async (
    secondaryXpub: string,
    bhXpub?: string,
    token?: number,
  ): Promise<
    | {
      status: number;
      data: {
        imported: boolean;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    }
  > => {
    try {
      if ( !bhXpub ) {
        if ( !token ) {
          throw new Error( "Neither a bhXpub nor a token is provided" );
        }
        const res = await this.secureHDWallet.importBHXpub( token );
        bhXpub = res.bhXpub;
      }
      const { prepared } = this.secureHDWallet.prepareSecureAccount(
        bhXpub,
        secondaryXpub,
      );

      if ( !prepared ) {
        throw new Error( "Import failed: unable to prepare secure account." );
      }
      return { status: config.STATUS.SUCCESS, data: { imported: true } };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public decryptSecondaryXpub = (
    encryptedSecXpub: string,
  ):
    | {
      status: number;
      data: {
        secondaryXpub: string;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.secureHDWallet.decryptSecondaryXpub( encryptedSecXpub ),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public checkHealth = async (
    chunk: string,
    pos: number,
  ): Promise<
    | {
      status: number;
      data: {
        isValid: boolean;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.checkHealth( chunk, pos ),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public transferST1 = async (
    recipientAddress: string,
    amount: number,
    priority?: string,
  ): Promise<
    | {
      status: number;
      err: string;
      data: {
        fee: number;
        inputs?: undefined;
        txb?: undefined;
      };
    }
    | {
      status: number;
      data: {
        inputs: Array<{
          txId: string;
          vout: number;
          value: number;
          address: string;
        }>;
        txb: TransactionBuilder;
        fee: number;
      };
      err?: undefined;
    }
    | { status: number; err: string; data?: undefined }
  > => {
    try {
      if ( this.secureHDWallet.isValidAddress( recipientAddress ) ) {
        amount = Math.round( amount * 1e8 ); // converting into sats
        const {
          balance,
          unconfirmedBalance,
        } = await this.secureHDWallet.fetchBalance();

        console.log( "---- Creating Transaction ----" );
        const {
          inputs,
          txb,
          fee,
        } = await this.secureHDWallet.createSecureHDTransaction(
          recipientAddress,
          amount,
          priority.toLowerCase(),
        );

        if ( balance + unconfirmedBalance < amount + fee ) {
          return {
            status: config.STATUS.ERROR,
            err:
              "Insufficient balance to compensate for transfer amount and the txn fee",
            data: { fee: fee / 1e8 },
          };
        }
        if ( inputs && txb ) {
          console.log( "---- Transaction Created ----" );
          return {
            status: config.STATUS.SUCCESS,
            data: { inputs, txb, fee: fee / 1e8 },
          };
        } else {
          throw new Error( "Unable to create transaction" );
        }
      } else {
        throw new Error( "Recipient address is wrong" );
      }
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public transferST2 = async (
    inputs: Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
    }>,
    txb: TransactionBuilder,
  ): Promise<
    | {
      status: number;
      data: {
        txHex: string;
        childIndexArray: Array<{
          childIndex: number;
          inputIdentifier: {
            txId: string;
            vout: number;
          };
        }>;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    }
  > => {
    try {
      const {
        signedTxb,
        childIndexArray,
      } = await this.secureHDWallet.signHDTransaction( inputs, txb );

      const txHex = signedTxb.buildIncomplete().toHex();

      console.log(
        "---- Transaction signed by the user (1st sig for 2/3 MultiSig)----",
      );

      return {
        status: config.STATUS.SUCCESS,
        data: { txHex, childIndexArray },
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }

  public transferST3 = async (
    token: number,
    txHex: string,
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>,
  ): Promise<
    | {
      status: number;
      data: {
        txid: string;
      };
      err?: undefined;
    }
    | {
      status: number;
      err: string;
      data?: undefined;
    }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.serverSigningAndBroadcast(
          token,
          txHex,
          childIndexArray,
        ),
      };
    } catch ( err ) {
      return { status: config.STATUS.ERROR, err: err.message };
    }
  }
}
