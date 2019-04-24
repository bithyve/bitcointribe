import bitcoinJS, { Transaction, TransactionBuilder } from "bitcoinjs-lib";
import Bitcoin from "../../utilities/Bitcoin";

export default class JointAccount {
  public bitcoin: Bitcoin;
  constructor() {
    this.bitcoin = new Bitcoin();
  }

  public initiateJointAccount = (
    mnemonic: string,
    details: { creator: string; walletName: string },
  ) => {
    const { keyPair } = this.bitcoin.generateHDWallet(mnemonic);
    const publicKey = keyPair.publicKey.toString("hex");

    const jointDetails = {
      cn: details.creator, // creator's name
      wn: details.walletName, // wallet's name
      cpk: publicKey, // creator's public key
      typ: "conf",
    };

    return JSON.stringify(jointDetails);
  }

  public mergeJointAccount = (
    mnemonic: string,
    details: { jointDetails: string; merger: string },
  ) => {
    const { keyPair } = this.bitcoin.generateHDWallet(mnemonic);
    const publicKey = keyPair.publicKey.toString("hex");
    const jointDetails = JSON.parse(details.jointDetails);

    jointDetails.mpk = publicKey; // merger's public key
    jointDetails.mn = details.merger; // merger's name

    const pubs = [jointDetails.cpk, jointDetails.mpk];
    const initMultiSig = this.bitcoin.generateMultiSig(pubs.length, pubs);

    const multiSig = {
      scripts: {
        redeem: initMultiSig.p2sh.redeem.output.toString("hex"),
        witness: initMultiSig.p2wsh.redeem.output.toString("hex"),
      },
      address: initMultiSig.address,
    };

    jointDetails.typ = "imp";
    return { multiSig, mergeJSON: JSON.stringify(jointDetails) };
  }

  public ackDetails = (jointDetails: string) => {
    const details = JSON.parse(jointDetails);
    delete details.cpk;
    details.typ = "ack";
    return JSON.stringify(details);
  }

  public createInitiatedJointAccount = (
    mnemonic: string,
    details: { jointDetails: string },
  ) => {
    const { keyPair } = this.bitcoin.generateHDWallet(mnemonic);
    const publicKey = keyPair.publicKey.toString("hex");

    const jointDetails = JSON.parse(details.jointDetails);
    jointDetails.cpk = publicKey;
    const pubs = [jointDetails.cpk, jointDetails.mpk];
    const initMultiSig = this.bitcoin.generateMultiSig(pubs.length, pubs);

    const multiSig = {
      scripts: {
        redeem: initMultiSig.p2sh.redeem.output.toString("hex"),
        witness: initMultiSig.p2wsh.redeem.output.toString("hex"),
      },
      address: initMultiSig.address,
    };
    jointDetails.add = multiSig.address;
    jointDetails.typ = "imp";
    return { multiSig, creationJSON: JSON.stringify(jointDetails) };
  }

  public initJointTxn = async ({
    senderAddress,
    recipientAddress,
    amount,
    privateKey,
    scripts,
  }: {
    senderAddress: string;
    recipientAddress: string;
    amount: number;
    privateKey: string;
    scripts: any;
  }) => {
    if (this.bitcoin.isValidAddress(recipientAddress)) {
      const { balanceData } = await this.bitcoin.getBalance(senderAddress);
      console.log({ balance: balanceData.final_balance });

      console.log("---- Creating Transaction ----");
      const { inputs, txb, fee } = await this.bitcoin.createTransaction(
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

      const signedTxb = this.bitcoin.signTransaction(
        inputs,
        txb,
        [this.bitcoin.getKeyPair(privateKey)],
        Buffer.from(scripts.redeem, "hex"),
        Buffer.from(scripts.witness, "hex"),
      );

      const txHex = signedTxb.buildIncomplete().toHex();
      console.log({ txHex });
      return {
        status: 200,
        data: txHex,
      };
    } else {
      return {
        status: 400,
        errorMessage: "Supplied recipient address is wrong.",
      };
    }
  }

  public recoverTxnDetails = async (txHex: string) => {
    const regenTx: Transaction = bitcoinJS.Transaction.fromHex(txHex);

    const sender = this.bitcoin.fromOutputScript(
      regenTx.outs[1].script, // considering that the output remains consistent
    );
    const recipient = this.bitcoin.fromOutputScript(regenTx.outs[0].script);
    const amount = regenTx.outs[0].value;

    const recoveredInputs = await this.bitcoin.recoverInputsFromTxHex(txHex);
    let valueIn: number = 0;
    recoveredInputs.forEach((input) => {
      valueIn += input.value;
    });

    let valueOut: number = 0;
    regenTx.outs.forEach((output) => {
      valueOut += output.value;
    });
    const txnFee = valueIn - valueOut;

    return {
      from: sender,
      to: recipient,
      amount: amount / 1e8,
      txnFee: txnFee / 1e8,
    };
  }

  public authorizeJointTxn = async (txHex: string, privateKey: string) => {
    const regenTx: Transaction = bitcoinJS.Transaction.fromHex(txHex);
    const recoveredInputs = await this.bitcoin.recoverInputsFromTxHex(txHex);

    // recover p2sh and p2wsh redeem scripts from the regenTxn
    const recoveredScripts = {
      p2sh: regenTx.ins[0].script.slice(1), // slicing because the first element of the buffer isn't actually a part of the redeem script
      p2wsh: regenTx.ins[0].witness[regenTx.ins[0].witness.length - 1], // confirm that it's always the 5th element
    };

    const regenTxb: TransactionBuilder = bitcoinJS.TransactionBuilder.fromTransaction(
      regenTx,
      this.bitcoin.network,
    );

    const regenSignTx = this.bitcoin.signTransaction(
      recoveredInputs,
      regenTxb,
      [this.bitcoin.getKeyPair(privateKey)],
      recoveredScripts.p2sh,
      recoveredScripts.p2wsh,
    );

    const reHex = regenSignTx.build().toHex();
    console.log({ txHex: reHex });
    const res = await this.bitcoin.broadcastTransaction(reHex);
    return res;
  }
}
