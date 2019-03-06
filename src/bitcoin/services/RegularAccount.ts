import Bitcoin from "../utilities/Bitcoin";

class RegularAccount {
  public bitcoin: Bitcoin;
  constructor() {
    this.bitcoin = new Bitcoin();
  }

  public createWallet = (passphrase?: string) =>
    this.bitcoin.createHDWallet(passphrase)

  public importWallet = (mnemonic: string, passphrase?: string) =>
    this.bitcoin.generateHDWallet(mnemonic, passphrase)

  public getBalance = async (address: string) =>
    await this.bitcoin.checkBalance(address)

  public getTransactionDetails = async (txHash: string) =>
    await this.bitcoin.fetchTransactionDetails(txHash)

  public getTransactions = async (address: string) =>
    await this.bitcoin.fetchTransactions(address)

  public getPubKey = async (privKey: string) => {
    const keyPair = await this.bitcoin.getKeyPair(privKey);
    return keyPair.publicKey;
  }

  public transfer = async (
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    privateKey: string,
  ) => {
    if (this.bitcoin.isValidAddress(recipientAddress)) {
      // use decorators as they come out of experimental phase
      const balance = await this.bitcoin.checkBalance(senderAddress);
      console.log({ balance: balance.final_balance });

      const { inputs, txb, fee } = await this.bitcoin.createTransaction(
        senderAddress,
        recipientAddress,
        amount,
      );
      console.log("---- Transaction Created ----");

      if (parseInt(balance.final_balance, 10) + fee < amount) {
        throw new Error(
          "Insufficient balance to compensate for transfer amount and the txn fee",
        );
      }

      const keyPair = this.bitcoin.getKeyPair(privateKey);
      const p2sh = this.bitcoin.getP2SH(keyPair);
      const signedTxb = this.bitcoin.signTransaction(
        inputs,
        txb,
        [keyPair],
        p2sh.redeem.output,
      );
      console.log("---- Transaction Signed ----");

      const txHex = signedTxb.build().toHex();
      const res = await this.bitcoin.broadcastTransaction(txHex);
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
