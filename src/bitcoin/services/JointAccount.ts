import bitcoinJS, { Transaction, TransactionBuilder } from "bitcoinjs-lib";
import Bitcoin from "../utilities/Bitcoin";

class JointAccount {
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
    const balance = await this.bitcoin.checkBalance(senderAddress); // disabled due to latency
    console.log({ balance });
    if (parseInt(balance.final_balance, 10) <= amount + 1000) {
      // TODO: accomodate logic for fee inclusion
      throw new Error("Insufficient balance");
    }

    console.log("---- Creating Transaction ----");
    const { inputs, txb } = await this.bitcoin.createTransaction(
      senderAddress,
      recipientAddress,
      amount,
    );

    console.log("---- Transaction Created ----");
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
      statusCode: 200,
      data: txHex,
    };
  }

  public recoverTxnDetails = async (txHex: string) => {
    const regenTx: Transaction = bitcoinJS.Transaction.fromHex(txHex);

    const sender = this.bitcoin.fromOutputScript(
      regenTx.outs[1].script, // considering that the output remains consistent
      this.bitcoin.network,
    );
    const recipient = this.bitcoin.fromOutputScript(
      regenTx.outs[0].script,
      this.bitcoin.network,
    );
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

export default new JointAccount();

/////////// SMOKE TEST ///////
// const jointAccount = new JointAccount();
// const dummyTxHex =
//   "02000000000101dc35fa5ec0530de092961fc13afca6ade05fdaf3fa39eda5f2b2659b77afcfea01000000232200209d117d8d1fc27e5234ecdba6e86277eb015cf10aa7403631421711be5147a437ffffffff02941100000000000017a9147f1585da47b5685f80aa9f4e185dfce610bc840e872b398f000000000017a9143dedba7493dddde093bf3aa5122971926c3b60f5870500004730440220694aedda116c18a7eddfc8cc5a4570c34f6adcd5794c6c18ee3d72565e12bf930220518933e531e931885a8390806fa703594e82326de663eff9907b4e333db76e0a010069522102d3812ea3ae76b90ac4fd2b848fef2ec50ddf7100aad145690ff2adddc6512a882103fd74cc5d84670c2c824cc0baf9d54a0192381b755da4fba63d3369642ab368fa2103cf13ab640dcc69f797e3267f55eac44e06fb16fd6da3cf6b8f1a325bc15b1c3853ae00000000";
// jointAccount.recoverTxnDetails(dummyTxHex).then(console.log);
