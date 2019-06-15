import bip32 from "bip32";
import bip39 from "bip39";
import bip65 from "bip65";
import bitcoinJS from "bitcoinjs-lib";
import Bitcoin from "../../utilities/Bitcoin";

export default class VaultAccount {
  public bitcoin: Bitcoin;
  constructor() {
    this.bitcoin = new Bitcoin();
  }

  public cltvCheckSigOutput = (publicKey, lockTime) => {
    return bitcoinJS.script.compile([
      bitcoinJS.script.number.encode(lockTime),
      bitcoinJS.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoinJS.opcodes.OP_DROP,
      publicKey,
      bitcoinJS.opcodes.OP_CHECKSIG
    ]);
  };

  public createTLC = async (
    mnemonic: string,
    time: number,
    blockHeight: number
  ): Promise<{
    address: string;
    lockTime: number;
    privateKey: string;
    redeemScript: string;
  }> => {
    let lockTime: any;
    if (time && blockHeight) {
      throw new Error("You can't specify time and block height together");
    } else if (time) {
      const { mediantime } = await this.bitcoin.client.getBlockchainInfo();
      lockTime = bip65.encode({ utc: mediantime + time }); // time should be specified in seconds (ex: 3600 * 3 represent 3 hours)
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
    const redeemScript = this.cltvCheckSigOutput(keyPair.publicKey, lockTime);

    const p2sh = bitcoinJS.payments.p2sh({
      redeem: bitcoinJS.payments.p2wsh({
        redeem: { output: redeemScript, network: this.bitcoin.network },
        network: this.bitcoin.network
      }),
      network: this.bitcoin.network
    });

    return {
      address: p2sh.address,
      lockTime,
      privateKey: keyPair.toWIF(),
      redeemScript: redeemScript.toString("hex")
    };
  };

  public transfer = async (
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    lockTime: number,
    privateKey: string
  ) => {
    if (this.bitcoin.isValidAddress(recipientAddress)) {
      const { balanceData } = await this.bitcoin.getBalance(senderAddress);
      console.log({ balance: balanceData.final_balance });

      const { utc } = bip65.decode(lockTime);
      if (utc) {
        // non functional in time; transaction broadcast failing with 64: non-final
        const { mediantime } = await this.bitcoin.client.getBlockchainInfo();
        console.log({ mediantime, lockTime });
        if (mediantime < lockTime) {
          const errorMessage = `${lockTime -
            mediantime} second(s) remaining for the UTXO to be spendable (approximately)`;
          return {
            status: 400,
            errorMessage
          };
        }
      } else {
        const { height } = await this.bitcoin.fetchChainInfo();
        console.log({ height, lockTime });
        if (height < lockTime) {
          const errorMessage = `${lockTime -
            height} block(s) remaining for the UTXO to be spendable`;
          return {
            status: 400,
            errorMessage
          };
        }
      }

      const { txb, fee } = await this.bitcoin.createTransaction(
        senderAddress,
        recipientAddress,
        amount,
        0xfffffffe
      );
      console.log("---- Transaction Created ----");
      if (parseInt(balanceData.final_balance, 10) + fee <= amount) {
        throw new Error(
          "Insufficient balance to compensate for transfer amount and the txn fee"
        );
      }

      const keyPair = this.bitcoin.getKeyPair(privateKey);

      txb.setLockTime(lockTime);
      const tx = txb.buildIncomplete();
      const redeemScript = this.bitcoin.cltvCheckSigOutput(keyPair, lockTime);

      console.log({ redeemScript: redeemScript.toString("hex") });
      const hashType = bitcoinJS.Transaction.SIGHASH_ALL;
      const signatureHash = tx.hashForSignature(0, redeemScript, hashType);

      const unlockingScript = bitcoinJS.script.compile([
        bitcoinJS.script.signature.encode(keyPair.sign(signatureHash), hashType)
      ]);

      const redeemScriptSig = bitcoinJS.payments.p2sh({
        redeem: {
          input: unlockingScript,
          output: redeemScript,
          network: this.bitcoin.network
        },
        network: this.bitcoin.network
      }).input;
      tx.setInputScript(0, redeemScriptSig);
      console.log("---- Transaction Signed ----");

      const txHex = tx.toHex();
      console.log({ txHex });
      const res = await this.bitcoin.broadcastTransaction(txHex);
      console.log("---- Transaction Broadcasted ----");
      return res;
    } else {
      return {
        status: 400,
        errorMessage: "Supplied recipient address is wrong."
      };
    }
  };

  public recoverVault = async (redeemScriptHex: string) => {
    const decodedScript = await this.bitcoin.client.decodeScript(
      redeemScriptHex
    );
    const { asm } = decodedScript;
    const splits = asm.split(" ");
    const lockTime = parseInt(splits[0], 10);
    const pubKey = Buffer.from(splits[3], "hex");
    const redeemScript = this.cltvCheckSigOutput(pubKey, lockTime);
    if (redeemScript.toString("hex") === redeemScriptHex) {
      const address = bitcoinJS.payments.p2sh({
        redeem: bitcoinJS.payments.p2wsh({
          redeem: { output: redeemScript, network: this.bitcoin.network },
          network: this.bitcoin.network
        }),
        network: this.bitcoin.network
      }).address;

      return {
        address,
        lockTime,
        publicKey: pubKey.toString("hex")
      };
    } else {
      throw new Error("Vault recovery failed");
    }
  };
}
