import SecureHDWallet from "../../utilities/SecureHDWallet";

export default class SecureAccount {
  public static fromJSON = ( json: string ) => {
    const { secureHDWallet } = JSON.parse( json );
    console.log( { secureHDWallet } );

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
    console.log( "Running secure constructor" );

    this.secureHDWallet = new SecureHDWallet( primaryMnemonic, stateVars );
  }


  public getRecoveryMnemonic = async () =>
    this.secureHDWallet.getSecondaryMnemonic()

  public getAccountId = () => this.secureHDWallet.getAccountId();

  public getAddress = async () =>
    await this.secureHDWallet.getReceivingAddress()

  public getBalance = async () => await this.secureHDWallet.fetchBalance();

  public setupSecureAccount = async () =>
    await this.secureHDWallet.setupSecureAccount()

  public checkHealth = async ( pos: string ) =>
    this.secureHDWallet.checkHealth( pos )

  public decryptSecondaryXpub = ( encryptedSecXpub: string ) =>
    this.secureHDWallet.decryptSecondaryXpub( encryptedSecXpub )

  public importSecureAccount = async ( token: number, secondaryXpub: string ) => {
    const { bhXpub } = await this.secureHDWallet.importBHXpub( token );
    const { prepared } = await this.secureHDWallet.prepareSecureAccount( bhXpub, secondaryXpub );
    if ( prepared ) {
      return { imported: true }
    } else {
      return { imported: false }
    }
  }

  public getPaymentURI = (
    address: string,
    options?: {
      amount: number;
      label?: string;
      message?: string;
    },
  ) => this.secureHDWallet.generatePaymentURI( address, options )

  public addressDiff = (
    scannedStr: string,
  ) =>
    this.secureHDWallet.addressDiff( scannedStr )

  public decodePaymentURI = (
    paymentURI: string,
  ) => this.secureHDWallet.decodePaymentURI( paymentURI )



  public validateSecureAccountSetup = async (
    token: number,
    secret: string,
    xIndex: number,
  ) =>
    await this.secureHDWallet.validateSecureAccountSetup( token, secret, xIndex )


  public transferST1 = async (
    recipientAddress: string,
    amount: number,
    priority?: string,
  ) => {
    try {
      if ( this.secureHDWallet.isValidAddress( recipientAddress ) ) {
        amount = amount * 1e8; // converting into sats
        const {
          data
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

        if ( data.balance + data.unconfirmedBalance < amount + fee ) {
          return {
            status: 400,
            err:
              "Insufficient balance to compensate for transfer amount and the txn fee",
            data: { fee: fee / 1e8 },
          };
        }
        if ( inputs && txb ) {
          console.log( "---- Transaction Created ----" );
          return {
            status: 200,
            data: { inputs, txb, fee: fee / 1e8 },
          };
        } else {
          throw new Error( "Unable to create transaction" );
        }
      } else {
        throw new Error( "Recipient address is wrong" );
      }
    } catch ( err ) {
      return { status: 400, err: err.message };
    }
  }

  public transferST2 = async (
    inputs: Array<{
      txId: string;
      vout: number;
      value: number;
      address: string;
    }>,
    txb,
  ) => {
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
        status: 200,
        data: { txHex, childIndexArray },
      };
    } catch ( err ) {
      return { status: 400, err: err.message };
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
  ) => {
    try {
      return {
        status: 200,
        data: await this.secureHDWallet.serverSigningAndBroadcast(
          token,
          txHex,
          childIndexArray,
        ),
      };
    } catch ( err ) {
      return { status: 400, err: err.message };
    }
  }
}  
