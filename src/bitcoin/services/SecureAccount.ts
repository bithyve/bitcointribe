import axios, { AxiosResponse } from "axios";
import bip32 from "bip32";
import bip39 from "bip39";
import crypto from "crypto";
import config from "../Config";
import Bitcoin from "../utilities/Bitcoin";

const SERVER = config.BH_SERVER.PROD;
class SecureAccount {
  public bitcoin: Bitcoin;
  constructor() {
    this.bitcoin = new Bitcoin();
  }

  public getRecoveryMnemonic = async () => {
    const recoveryMnemonic = await bip39.generateMnemonic();
    return recoveryMnemonic;
  }

  public getRecoverableXKey = (
    mnemonic: string,
    path: string,
    priv?: boolean,
  ) => {
    const seed = bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed, this.bitcoin.network);
    if (!priv) {
      const xpub = root
        .derivePath("m/" + path)
        .neutered()
        .toBase58();
      return xpub;
    } else {
      const xpriv = root.derivePath("m/" + path).toBase58();
      return xpriv;
    }
  }

  // public deriveChildXKey = (extendedKey: string, childIndex: number) => {
  //   const xKey = bip32.fromBase58(extendedKey, this.bitcoin.network);
  //   const childXKey = xKey.derivePath("m/" + childIndex);
  //   return childXKey.toBase58();
  // }

  public deriveChildXKey = (extendedKey: string, childIndex: number) => {
    const xKey = bip32.fromBase58(extendedKey, this.bitcoin.network);
    const childXKey = xKey.derive(childIndex);
    return childXKey.toBase58();
  }

  public getPub = (extendedKey: string) => {
    const xKey = bip32.fromBase58(extendedKey, this.bitcoin.network);
    return xKey.publicKey.toString("hex");
  }

  public getAssets = async (primaryMnemonic: string, path: string) => {
    const recoveryMnemonic = await this.getRecoveryMnemonic();
    const primaryXpub = this.getRecoverableXKey(primaryMnemonic, path);
    const primaryXpriv = this.getRecoverableXKey(primaryMnemonic, path, true);
    const recoveryXpub = this.getRecoverableXKey(recoveryMnemonic, path);
    const hash = crypto.createHash("sha512");
    const seed = bip39.mnemonicToSeed(primaryMnemonic);
    hash.update(seed);
    const walletID = hash.digest("hex");

    return {
      recoveryMnemonic,
      xpubs: {
        primary: primaryXpub,
        recovery: recoveryXpub,
      },
      xpriv: {
        primary: primaryXpriv,
      },
      walletID,
    };
  }

  public createSecureMultiSig = (
    { xpubs },
    bhXpub: string,
    childIndex: number = 0,
  ) => {
    const childPrimaryPub = this.getPub(
      this.deriveChildXKey(xpubs.primary, childIndex),
    );
    const childRecoveryPub = this.getPub(
      this.deriveChildXKey(xpubs.recovery, childIndex),
    );
    const childBHPub = this.getPub(this.deriveChildXKey(bhXpub, childIndex));

    // public keys should be aligned in the following way: [bhPub, primaryPub, recoveryPub]
    // for generating ga_recovery based recoverable multiSigs
    const pubs = [childBHPub, childPrimaryPub, childRecoveryPub];
    console.log({ pubs });
    const multiSig = this.bitcoin.generateMultiSig(2, pubs);

    return multiSig;
  }

  public setupSecureAccount = async (primaryMnemonic) => {
    let res;
    try {
      res = await axios.get(SERVER + "/setup2FA");
    } catch (err) {
      console.log("An error occured:", err);
      return {
        statusCode: err.response.status,
        errorMessage: err.response.data,
      };
    }

    const bhXpub = bip32.fromBase58(res.data.bhXpub, this.bitcoin.network);
    let path: string;
    if (bhXpub.index === 0) {
      path = config.DERIVATION_BRANCH;
    } else {
      path = config.WALLET_XPUB_PATH + config.DERIVATION_BRANCH;
    }
    const assets = await this.getAssets(primaryMnemonic, path);
    const initMultiSig = this.createSecureMultiSig(assets, res.data.bhXpub);
    const multiSig = {
      scripts: {
        redeem: initMultiSig.p2sh.redeem.output.toString("hex"),
        witness: initMultiSig.p2wsh.redeem.output.toString("hex"),
      },
      address: initMultiSig.address,
    };
    return {
      statusCode: res.status,
      data: { ...assets, setupData: res.data, multiSig },
    };
  }

  public validateSecureAccountSetup = async (
    token: number,
    secret: string,
    walletID: string,
  ) => {
    try {
      const res = await axios.post(SERVER + "/validate2FASetup", {
        token,
        secret,
        walletID,
      });
      return { statusCode: res.status, data: res.data };
    } catch (err) {
      console.log("Error:", err.response.data);
      return {
        statusCode: err.response.status,
        errorMessage: err.response.data,
      };
    }
  }

  public secureTransaction = async ({
    senderAddress,
    recipientAddress,
    amount,
    primaryXpriv,
    scripts,
    token,
    walletID,
    childIndex = 0,
  }: {
    senderAddress: string;
    recipientAddress: string;
    amount: number;
    primaryXpriv: string;
    scripts: any;
    token: number;
    walletID: string;
    childIndex: number;
  }) => {
    if (this.bitcoin.isValidAddress(recipientAddress)) {
      const balance = await this.bitcoin.checkBalance(senderAddress);
      console.log({ balance: balance.final_balance });
      console.log("---- Creating Transaction ----");
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
      const keyPair = this.deriveChildXKey(primaryXpriv, childIndex);
      const signedTxb = this.bitcoin.signTransaction(
        inputs,
        txb,
        [bip32.fromBase58(keyPair, this.bitcoin.network)],
        Buffer.from(scripts.redeem, "hex"),
        Buffer.from(scripts.witness, "hex"),
      );
      console.log(
        "---- Transaction Signed by User (1st sig for 2/3 MultiSig)----",
      );
      const txHex = signedTxb.buildIncomplete().toHex();
      console.log(txHex);

      let res: AxiosResponse;
      try {
        res = await axios.post(SERVER + "/secureTranasction", {
          walletID,
          token,
          txHex,
          childIndex,
        });

        console.log(
          "---- Transaction Signed by BH Server (2nd sig for 2/3 MultiSig)----",
        );
        console.log(res.data.txHex);
        console.log("------ Broadcasting Transaction --------");
        // const txHash = await this.bitcoin.broadcastLocally(data.txHex); // TODO: If API falls; globally expose the tesnet RPC (via ngRox maybe)
        const bRes = await this.bitcoin.broadcastTransaction(res.data.txHex);
        return bRes;
      } catch (err) {
        console.log("An error occured:", err);
        return {
          statusCode: err.response.status,
          errorMessage: err.response.data,
        };
      }
    } else {
      return {
        statusCode: 400,
        errorMessage: "Supplied recipient address is wrong.",
      };
    }
  }
}

export default new SecureAccount();
