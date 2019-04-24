import bip39 from "bip39";
import crypto from "crypto";
import authenticator from "otplib/authenticator";
import SecureAccount from "../../services/accounts/SecureAccount";

describe("Secure Account", () => {
  let secureAccount: SecureAccount;
  let validationData: {
    walletID: string;
    secret: string;
  };
  beforeAll(async () => {
    jest.setTimeout(200000);
    secureAccount = new SecureAccount(bip39.generateMnemonic());
    authenticator.options = { crypto };
  });

  test("generates the required assets and sets up the secure account", async () => {
    const res = await secureAccount.setupSecureAccount();
    if (res.status !== 200) {
      throw new Error("secure account setup failed");
    } else {
      const { setupData } = res.data;

      expect(setupData.bhXpub).toBeDefined();
      expect(setupData.secret).toBeDefined();

      expect(secureAccount.secureHDWallet.walletID).toBeDefined();

      validationData = {
        secret: setupData.secret,
        walletID: secureAccount.secureHDWallet.walletID,
      };
    }
  });

  test("validates setup of the secure account", async () => {
    const token = authenticator.generate(validationData.secret);
    const res = await secureAccount.validateSecureAccountSetup(
      token,
      validationData.secret,
    );
    if (res.status !== 200) {
      throw new Error("secure account setup validation failed");
    } else {
      const { setupSuccessful } = res.data;
      expect(setupSuccessful).toBe(true);
    }
  });

  test("transacts from a (pre-funded) secure account", async () => {
    const dummyMnemonic =
      "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
    const dummySecret = "JVSE63CKNZHHKUKHKRAVSVRSIIVUK6DX";
    const dummyRecoveryXpub =
      "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";
    const transfer = {
      recipientAddress: "2NAwqcZHo2DW9c8Qs9Jxaat3jHW3aqsBpFs",
      amount: 3500,
    };
    const secureHDAccount = new SecureAccount(dummyMnemonic);
    await secureHDAccount.setupSecureAccount(); // enables internal sync of the assets
    secureHDAccount.secureHDWallet.xpubs.recovery = dummyRecoveryXpub;

    const {
      txHex,
      childIndexArray,
    } = await secureHDAccount.partiallySignedSecureTransaction({
      recipientAddress: transfer.recipientAddress,
      amount: transfer.amount,
    });

    const token = authenticator.generate(dummySecret);
    const res = await secureHDAccount.serverSigningAndBroadcasting(
      token,
      txHex,
      childIndexArray,
    );

    if (res.status !== 200) {
      throw new Error("transaction from secure account failed");
    } else {
      console.log({ txid: res.data.txid });
      expect(res.data.txid).toBeTruthy();
    }
  });
});
