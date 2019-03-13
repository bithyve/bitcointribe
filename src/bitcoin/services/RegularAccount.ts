import bip39 from "bip39";
import HDSegwitWallet from "../utilities/HDSegwitWallet";

class RegularAccount {
  public hdWallet: HDSegwitWallet;
  constructor() {
    this.hdWallet = new HDSegwitWallet();
  }

  public createWallet = (passphrase?: string) =>
    this.hdWallet.generateHDWallet(this.hdWallet.mnemonic, passphrase)

  public importWallet = (mnemonic: string, passphrase?: string) => {
    if (bip39.validateMnemonic(mnemonic)) {
      return this.hdWallet.generateHDWallet(mnemonic, passphrase);
    } else {
      throw new Error("Invalid Mnemonic");
    }
  }

  public getBalance = async (address: string) =>
    await this.hdWallet.getBalance(address)

  public getTransactionDetails = async (txHash: string) =>
    await this.hdWallet.fetchTransactionDetails(txHash)

  public getTransactions = async (address: string) =>
    await this.hdWallet.fetchTransactions(address)

  public getPubKey = async (privKey: string) => {
    const keyPair = await this.hdWallet.getKeyPair(privKey);
    return keyPair.publicKey;
  }

  public transfer = async (
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    privateKey: string,
  ) => {
    if (this.hdWallet.isValidAddress(recipientAddress)) {
      // use decorators as they come out of experimental phase
      const { balanceData } = await this.hdWallet.getBalance(senderAddress);
      console.log({ balance: balanceData.final_balance });

      const { inputs, txb, fee } = await this.hdWallet.createTransaction(
        senderAddress,
        recipientAddress,
        amount,
      );
      console.log("---- Transaction Created ----");

      if (parseInt(balanceData.final_balance, 10) + fee < amount) {
        throw new Error(
          "Insufficient balance to compensate for transfer amount and the txn fee",
        );
      }

      const keyPair = this.hdWallet.getKeyPair(privateKey);
      const p2sh = this.hdWallet.getP2SH(keyPair);
      const signedTxb = this.hdWallet.signTransaction(
        inputs,
        txb,
        [keyPair],
        p2sh.redeem.output,
      );
      console.log("---- Transaction Signed ----");

      const txHex = signedTxb.build().toHex();
      const res = await this.hdWallet.broadcastTransaction(txHex);
      console.log("---- Transaction Broadcasted ----");
      return res;
    } else {
      return {
        statusCode: 400,
        errorMessage: "Supplied recipient address is wrong.",
      };
    }
  }
}

export default new RegularAccount();
