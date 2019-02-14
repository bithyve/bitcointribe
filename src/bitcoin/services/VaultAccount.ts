import bip32 from "bip32";
import bip39 from "bip39";
import bip65 from "bip65";
import bitcoinJS from "bitcoinjs-lib";
import Bitcoin from "../utilities/Bitcoin";

class VaultAccount {
  public bitcoin: Bitcoin;
  constructor() {
    this.bitcoin = new Bitcoin();
  }

  public cltvCheckSigOutput = (keyPair, lockTime) => {
    return bitcoinJS.script.compile([
      bitcoinJS.script.number.encode(lockTime),
      bitcoinJS.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoinJS.opcodes.OP_DROP,
      keyPair.publicKey,
      bitcoinJS.opcodes.OP_CHECKSIG,
    ]);
  }

  public createTLC = async (
    mnemonic: string,
    time: number,
    blockHeight: number,
  ): Promise<any> => {
    let lockTime: any;
    if (time && blockHeight) {
      throw new Error("You can't specify time and block height together");
    } else if (time) {
      lockTime = bip65.encode({ utc: this.bitcoin.utcNow() + time }); // time should be specified in seconds (ex: 3600 * 3)
    } else if (blockHeight) {
      const chainInfo = await this.bitcoin.fetchChainInfo();
      lockTime = bip65.encode({ blocks: chainInfo.height + blockHeight });
    } else {
      throw new Error("Please specify time or block height");
    }

    const seed = bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed, this.bitcoin.network);
    const keyPair = root.derivePath("m/1'/2'/3'/0");
    // keyPair = bip32.fromBase58(keyPair, this.bitcoin.network);
    const redeemScript = this.cltvCheckSigOutput(keyPair, lockTime);

    console.log({ redeemScript: redeemScript.toString("hex") });

    const p2sh = bitcoinJS.payments.p2sh({
      redeem: { output: redeemScript, network: this.bitcoin.network },
      network: this.bitcoin.network,
    });

    return {
      address: p2sh.address,
      lockTime,
      privateKey: keyPair.toWIF(),
    };
  }

  public transfer = async (
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    lockTime: number,
    privateKey: string,
  ) => {
    const { final_balance } = await this.bitcoin.checkBalance(senderAddress);
    console.log({ final_balance });
    if (final_balance < amount + 1000) {
      const errorMessage =
        "Not enough balance to accomodate for the transfer amount and mining fee";
      return {
        statusCode: 400,
        errorMessage,
      };
    }

    const { utc } = bip65.decode(lockTime);
    if (utc) {
      // non functional in time; transaction broadcast failing with 64: non-final
      const present = bip65.encode({ utc: this.bitcoin.utcNow() });
      if (present < lockTime) {
        const errorMessage = `${lockTime -
          present} second(s) remaining for the UTXO to be spendable`;
        return {
          statusCode: 400,
          errorMessage,
        };
      }
    } else {
      const { height } = await this.bitcoin.fetchChainInfo();
      // console.log({ height, lockTime, balance: final_balance });
      if (height < lockTime) {
        const errorMessage = `${lockTime -
          height} block(s) remaining for the UTXO to be spendable`;
        return {
          statusCode: 400,
          errorMessage,
        };
      }
    }

    const { txb } = await this.bitcoin.createTransaction(
      senderAddress,
      recipientAddress,
      amount,
      0xfffffffe,
    );
    console.log("---- Transaction Created ----");

    const keyPair = this.bitcoin.getKeyPair(privateKey);

    txb.setLockTime(lockTime);
    const tx = txb.buildIncomplete();
    const redeemScript = this.bitcoin.cltvCheckSigOutput(keyPair, lockTime);

    console.log({ redeemScript: redeemScript.toString("hex") });
    const hashType = bitcoinJS.Transaction.SIGHASH_ALL;
    const signatureHash = tx.hashForSignature(0, redeemScript, hashType);

    const unlockingScript = bitcoinJS.script.compile([
      bitcoinJS.script.signature.encode(keyPair.sign(signatureHash), hashType),
    ]);

    const redeemScriptSig = bitcoinJS.payments.p2sh({
      redeem: {
        input: unlockingScript,
        output: redeemScript,
        network: this.bitcoin.network,
      },
      network: this.bitcoin.network,
    }).input;
    tx.setInputScript(0, redeemScriptSig);
    console.log("---- Transaction Signed ----");

    const txHex = tx.toHex();
    console.log({ txHex });
    const res = await this.bitcoin.broadcastTransaction(txHex);
    console.log("---- Transaction Broadcasted ----");
    return res;
  }
}

export default new VaultAccount();

class SmokeTest {
  public vault: VaultAccount;
  public mnemonic =
    "much false truck sniff extend infant pony venture path imitate tongue pluck";

  constructor() {
    this.vault = new VaultAccount();
  }

  public testVaultFlow = async () => {
    // const res = await this.vault.createTLC(this.mnemonic, -3600, null);
    // return res;

    const transferObj = {
      senderAddress: "2N5yxxgQYcw4iJgdWnaDn8WgKT7DgKe4DSV",
      recipientAddress: "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL",
      amount: 4500,
      lockTime: 1549176365,
      privateKey: "cSkAj86cjR3mXEyHzm7VvhpZ3smWFXZeBctvkDfBriibam7p22Bm",
    };
    const res = await this.vault.transfer(
      transferObj.senderAddress,
      transferObj.recipientAddress,
      transferObj.amount,
      transferObj.lockTime,
      transferObj.privateKey,
    );
    return res;
  }
}

///////////// SMOKE TEST /////////////////
// const smokeTest = new SmokeTest();
// smokeTest.testVaultFlow().then(console.log);
