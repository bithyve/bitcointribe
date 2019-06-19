import bip39 from "bip39";
import HDSegwitWallet from "../../utilities/HDSegwitWallet";

export default class RegularAccount {
  public hdWallet: HDSegwitWallet;

  constructor ( mnemonic?: string ) {
    if ( mnemonic ) {
      if ( bip39.validateMnemonic( mnemonic ) ) {
        this.hdWallet = new HDSegwitWallet( mnemonic );
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

      if ( balance + unconfirmedBalance + fee < amount ) {
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
