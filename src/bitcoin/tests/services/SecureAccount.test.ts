import bip39 from "bip39";
import crypto from "crypto";
import authenticator from "otplib/authenticator";
import SecureAccount from "../../services/accounts/SecureAccount";

describe("Secure Account", () => {
  let secureAccount: SecureAccount;
  let validationData: {
    secret: string;
    xIndex: number;
  };

  beforeAll(async () => {
    jest.setTimeout(200000);
    const mnemonic = bip39.generateMnemonic(256);
    secureAccount = new SecureAccount(mnemonic);
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
      expect(setupData.xIndex).toBeDefined();
      expect(secureAccount.secureHDWallet.walletID).toBeDefined();

      validationData = {
        secret: setupData.secret,
        xIndex: setupData.xIndex,
      };
    }
  });

  test("validates setup of the secure account", async () => {
    const token = authenticator.generate(validationData.secret);
    const res = await secureAccount.validateSecureAccountSetup(
      token,
      validationData.secret,
      validationData.xIndex,
    );
    if (res.status !== 200) {
      throw new Error("secure account setup validation failed");
    } else {
      const { setupSuccessful } = res.data;
      expect(setupSuccessful).toBe(true);
    }
  });

  test("imports secure account", async () => {
    const dummyMnemonic =
      "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
    const dummySecondaryXpub =
      "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";
    const dummyBHXpub =
      "tpubDFe4ZoKYAQhR7JQq8s1AKqDeoGWE2Aovf2b4pqEE5Mt2HyqYMkq8AzHYU8zosVeSEf7EJtNGuTkDVqVrT8YjizbuvRttJMS6uRKabEA358d";

    const secureHDAccount = new SecureAccount(dummyMnemonic);
    secureHDAccount.importSecureAccount(dummyBHXpub, dummySecondaryXpub);
    const address = await secureHDAccount.getAddress();
    expect(address).toBeTruthy();
  });

  test("transacts from a (pre-funded) secure account", async () => {
    const dummyMnemonic =
      "six sort kangaroo special couch fabric dream tuition process sail dutch quarter impact gauge era maple during section width young certain engage collect ahead";
    const dummySecret = "GZFXQUJSKI4GMNSLMN3VIK3SKBSU64KV";
    const dummySecondaryXpub =
      "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";
    const dummyBHXpub =
      "tpubDHmUoBnFtKNcX4tD21HJXCKS1HPZTAZpYVuCvQtuPHzghwpWUwGQuLDURiWt77BsQnnhhRqXwDwJL3SiRQxudegC73FSLHRHXoCu2tAKoHG";

    const transfer = {
      recipientAddress: "2NAwqcZHo2DW9c8Qs9Jxaat3jHW3aqsBpFs",
      amount: 3500,
    };
    const secureHDAccount = new SecureAccount(dummyMnemonic);
    await secureHDAccount.importSecureAccount(dummyBHXpub, dummySecondaryXpub);
    // secureHDAccount.secureHDWallet.xpubs.secondary = dummySecondaryXpub;
    // secureHDAccount.secureHDWallet.xpubs.bh = dummyBHXpub;

    // const address = await secureHDAccount.getAddress();
    // console.log({ address });
    // const data = await secureHDAccount.getBalance();
    // console.log(data);
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
