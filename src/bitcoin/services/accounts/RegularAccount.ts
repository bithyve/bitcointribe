import bip39 from "bip39";
import HDSegwitWallet from "../../utilities/HDSegwitWallet";

export default class RegularAccount {
  public static fromJSON = ( json: string ) => {
    const { hdWallet } = JSON.parse( json );
    const {
      mnemonic,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      internalAddresssesCache,
      externalAddressesCache,
      addressToWIFCache,
    }: {
      mnemonic: string;
      passphrase: string;
      purpose: number;
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      internalAddresssesCache: {};
      externalAddressesCache: {};
      addressToWIFCache: {};
    } = hdWallet;

    return new RegularAccount( mnemonic, {
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      internalAddresssesCache,
      externalAddressesCache,
      addressToWIFCache,
    } );
  }
  private hdWallet: HDSegwitWallet;

  constructor (
    mnemonic?: string,
    stateVars?: {
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      internalAddresssesCache: {};
      externalAddressesCache: {};
      addressToWIFCache: {};
    },
  ) {
    if ( mnemonic ) {
      if ( bip39.validateMnemonic( mnemonic ) ) {
        this.hdWallet = new HDSegwitWallet(
          mnemonic,
          stateVars,
        );
      } else {
        throw new Error( "Invalid Mnemonic" );
      }
    } else {
      this.hdWallet = new HDSegwitWallet();
    }
  }

  public getMnemonic = () => this.hdWallet.getMnemonic();

  public getWalletId = () => this.hdWallet.getWalletId();

  public getAccountId = () => this.hdWallet.getAccountId();

  public getAddress = async () => await this.hdWallet.getReceivingAddress();

  public getBalance = async () => await this.hdWallet.fetchBalance();

  public getTransactionDetails = async ( txHash: string ) =>
    await this.hdWallet.fetchTransactionDetails( txHash )

  public getTransactions = async () => await this.hdWallet.fetchTransactions();

  public getPubKey = async ( privKey: string ) => {
    const keyPair = await this.hdWallet.getKeyPair( privKey );
    return keyPair.publicKey;
  }

  public getPaymentURI = (
    address: string,
    options?: {
      amount: number;
      label?: string;
      message?: string;
    },
  ) => this.hdWallet.generatePaymentURI( address, options )

  public addressDiff = (
    scannedStr: string,
  ) =>
    this.hdWallet.addressDiff( scannedStr )

  public decodePaymentURI = (
    paymentURI: string,
  ) => this.hdWallet.decodePaymentURI( paymentURI )

  public transferST1 = async (
    recipientAddress: string,
    amount: number,
    priority?: string,
  ) => {

    if ( this.hdWallet.isValidAddress( recipientAddress ) ) {
      amount = amount * 1e8 //converting into sats
      console.log( { transferAmount: amount } );

      const {
        data
      } = await this.hdWallet.fetchBalance();
      console.log( data );

      const { inputs, txb, fee } = await this.hdWallet.createHDTransaction(
        recipientAddress,
        amount,
        priority.toLowerCase(),
      );
      console.log( "---- Transaction Created ----" );
      console.log( data.balance + fee, amount );


      if ( data.balance + data.unconfirmedBalance < amount + fee ) {
        return {
          status: 400,
          err:
            "Insufficient balance to compensate for transfer amount and the txn fee",
          data: { fee: fee / 1e8 },
        };
      }

      if ( inputs && txb ) {
        return { status: 200, data: { inputs, txb, fee: fee / 1e8 } }

      } else {
        throw new Error( "Unable to create txn" )
      }
    } else {
      throw new Error( "Recipient address is wrong" );
    }
  }

  public transferST2 = async (
    inputs,
    txb,
  ) => {
    try {
      const signedTxb = this.hdWallet.signHDTransaction( inputs, txb );
      console.log( "---- Transaction Signed ----" );

      const txHex = signedTxb.build().toHex();
      const { data } = await this.hdWallet.broadcastTransaction( txHex );
      console.log( "---- Transaction Broadcasted ----" );
      return { status: 200, data: { txid: data.txid } }
    } catch ( err ) {
      return { status: 400, err: `Transfer failed: ${ err.message }` }
    }
  }



  public transfer = async ( recipientAddress: string, amount: number ) => {
    if ( this.hdWallet.isValidAddress( recipientAddress ) ) {
      // use decorators as they come out of experimental phase
      const { data } = await this.hdWallet.fetchBalance();

      const { balance, unconfirmedBalance } = data;

      const { inputs, txb, fee } = await this.hdWallet.createHDTransaction(
        recipientAddress,
        amount,
      );
      console.log( "---- Transaction Created ----" );

      if ( balance + unconfirmedBalance < amount + fee ) {
        throw new Error(
          "Insufficient balance to compensate for transfer amount and the txn fee",
        );
      }

      const signedTxb = this.hdWallet.signHDTransaction( inputs, txb );
      console.log( "---- Transaction Signed ----" );

      const txHex = signedTxb.build().toHex();
      const res = await this.hdWallet.broadcastTransaction( txHex );
      console.log( "---- Transaction Broadcasted ----" );
      return res;
    } else {
      return {
        status: 400,
        errorMessage: "Supplied recipient address is wrong.",
      };
    }
  }
}
