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
    // const balance = await this.bitcoin.checkBalance(senderAddress); //disabled due to latency
    // console.log({ balance });
    // if (parseInt(balance.final_balance, 10) <= amount + 1000) {
    //   // TODO: accomodate logic for fee inclusion
    //   throw new Error("Insufficient balance");
    // }

    console.log("---- Creating Transaction ----");
    const { inputs, txb } = await this.bitcoin.createTransaction(
      senderAddress,
      recipientAddress,
      amount,
    );

    console.log("---- Transaction Created ----");
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
  }
}

export default new SecureAccount();

class SmokeTest {
  public secureAccount: SecureAccount;
  public primaryMnemonic =
    "much false truck sniff extend infant pony venture path imitate tongue pluck";

  constructor() {
    this.secureAccount = new SecureAccount();
  }

  public testAssets = () => {
    const recoveryMnemonic =
      "frost drive safe pause come apology jungle fortune myself stable talent country";

    const bhMnemonic =
      "aware illness leaf birth raise puzzle start search vivid nephew accuse tank";

    const primarySeed = bip39.mnemonicToSeed(this.primaryMnemonic);
    const primaryRoot = bip32.fromSeed(
      primarySeed,
      this.secureAccount.bitcoin.network,
    );

    const hash = crypto.createHash("sha512");
    hash.update(primarySeed);
    const walletID = hash.digest("hex");
    console.log({ walletID });

    const recoverySeed = bip39.mnemonicToSeed(recoveryMnemonic);
    const recoveryRoot = bip32.fromSeed(
      recoverySeed,
      this.secureAccount.bitcoin.network,
    );

    // to be recieved from the server while setting up the secure account
    const bhSeed = bip39.mnemonicToSeed(bhMnemonic);
    const bhRoot = bip32.fromSeed(bhSeed, this.secureAccount.bitcoin.network);
    // const childBHXPub = bhRoot.derivePath(config.BH_XPUB_PATH);
    const xpubBH = bhRoot.neutered();
    // xpubBH.index = 1; // setting childNum to 1; as it's going to be used by the ga_recovery_tool
    // this is the master XPub

    return {
      walletID,
      primaryRoot,
      recoveryRoot,
      xpubBH: xpubBH.toBase58(),
    };
  }

  public getTestMultiSig = (pointer: number = 0) => {
    const assets = this.testAssets();
    const xpubBH = bip32.fromBase58(
      assets.xpubBH,
      this.secureAccount.bitcoin.network,
    ); // provided by the server
    console.log("here");
    const path = config.WALLET_XPUB_PATH + "/" + pointer;

    const primaryChildXpriv = assets.primaryRoot.derivePath(path);
    const recoveryChildXpriv = assets.recoveryRoot.derivePath(path);

    const childXpubBH = xpubBH.derivePath("m/" + pointer);

    const primaryChildPub = primaryChildXpriv.publicKey.toString("hex");
    const recoveryChildPub = recoveryChildXpriv.publicKey.toString("hex");
    const childPubBH = childXpubBH.publicKey.toString("hex");

    const pubs = [childPubBH, primaryChildPub, recoveryChildPub];
    console.log({ childPubBH, primaryChildPub, recoveryChildPub });

    const bitcoin = new Bitcoin();
    const multiSig = bitcoin.generateMultiSig(2, pubs);

    return {
      multiSig,
      primaryChildXpriv: primaryChildXpriv.toBase58(), // store xpubs & xprivs in base58
      pointer,
      walletID: assets.walletID,
    };
  }

  public testSecureAccountFlow = async (token?: number) => {
    // STEP 1. Setting up a Secure Account
    // const { data } = await this.secureAccount.setupSecureAccount(
    //   this.primaryMnemonic,
    // );
    // console.log(data);

    // STEP 2. Validating Secure Account Setup
    const secret = "NEZDIY3ILJJHU4CHJFKFSODVOJYFOOLN"; // logs from step 1
    const walletID =
      "dd2631ee3c5a0ab4da603f3ada062ef32b3c5acccd69567d120e9830d5c94a9b4aa63c598ec96faf85f781f4ae9e34f899ed27db2b86c05d3e91399eb04d3eae";
    // const { data } = await this.secureAccount.validateSecureAccountSetup(
    //   token,
    //   secret,
    //   walletID,
    // );
    // console.log(data);

    // STEP 3. Perform a secure transaction (pre fund the multiSig)

    const multiSig = {
      address: "2Mxtfze6MDr5biqYvATbff768mEcZkeFzkT",
      scripts: {
        redeem:
          "00209d117d8d1fc27e5234ecdba6e86277eb015cf10aa7403631421711be5147a437",
        witness:
          "522102d3812ea3ae76b90ac4fd2b848fef2ec50ddf7100aad145690ff2adddc6512a882103fd74cc5d84670c2c824cc0baf9d54a0192381b755da4fba63d3369642ab368fa2103cf13ab640dcc69f797e3267f55eac44e06fb16fd6da3cf6b8f1a325bc15b1c3853ae",
      },
    };
    const res = await this.secureAccount.secureTransaction({
      senderAddress: multiSig.address,
      recipientAddress: "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL",
      amount: 4500,
      primaryXpriv:
        "tprv8gC86VUCsCShN6nKpgsAXQpW8c7n1gRaeajChkira5pKZgqmdBTz9Tni3X7xE1fkbT5qEWpfuYAizFuQnUQ5nq6LiK1GCCQUJhq4t8cvfVV",
      scripts: multiSig.scripts,
      token,
      childIndex: 0,
      walletID,
    });
    console.log(res);
  }
}

// ////// SMOKE TEST ZONE //////
// const smokeTest = new SmokeTest();
// smokeTest.testSecureAccountFlow(parseInt(process.argv[2], 10));
