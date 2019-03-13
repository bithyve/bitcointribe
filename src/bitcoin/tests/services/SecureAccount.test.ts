import crypto from "crypto";
import authenticator from "otplib/authenticator";
import secureAccount from "../../services/SecureAccount";
import Bitcoin from "../../utilities/Bitcoin";

describe("Secure Account", () => {
  let primaryMnemonic: string;
  let validationData: {
    walletID: string;
    secret: string;
  };
  beforeAll(async () => {
    jest.setTimeout(50000);
    authenticator.options = { crypto };
    const bitcoin = new Bitcoin();
    const { mnemonic } = await bitcoin.createHDWallet();
    primaryMnemonic = mnemonic;
  });

  test("generates the required assets and sets up the secure account", async () => {
    const res = await secureAccount.setupSecureAccount(primaryMnemonic);
    if (res.statusCode !== 200) {
      throw new Error("secure account setup failed");
    } else {
      const {
        recoveryMnemonic,
        xpubs,
        walletID,
        setupData,
        multiSig,
        xpriv,
      } = res.data;
      expect(recoveryMnemonic).toBeDefined();
      expect(xpubs).toBeDefined();
      expect(res.data.walletID).toBeDefined();
      expect(setupData.bhXpub).toBeDefined();
      expect(setupData.secret).toBeDefined();
      expect(multiSig.address).toBeDefined();
      expect(xpriv.primary).toBeDefined();

      validationData = {
        secret: setupData.secret,
        walletID,
      };
    }
  });

  test("validates setup of the secure account", async () => {
    const token = authenticator.generate(validationData.secret);
    const res = await secureAccount.validateSecureAccountSetup(
      token,
      validationData.secret,
      validationData.walletID,
    );
    if (res.statusCode !== 200) {
      throw new Error("secure account setup validation failed");
    } else {
      const { setupSuccessful } = res.data;
      expect(setupSuccessful).toBe(true);
    }
  });

  test("transacts from a (pre-funded) secure account", async () => {
    // assets for testing ga_recovery
    const recoveryMnemonic =
      "canal torch damp lumber exhibit tool erase demand enrich prosper among frog";
    const bhXpub =
      "tpubDFe4ZoKYAQhR7JQq8s1AKqDeoGWE2Aovf2b4pqEE5Mt2HyqYMkq8AzHYU8zosVeSEf7EJtNGuTkDVqVrT8YjizbuvRttJMS6uRKabEA358d";

    const secret = "MJVGM22OGVJGC5JUNQ4GUWBTIYVXCQ3L";
    const walletID =
      "6ec8cf624cbaf486beeeecdf4af4c19db62c750827ddf205997a2fb7be83f2a744e4bf03cf4e24e7344e27b9dcfd672d979372174551bc25afa37737a1468d9d";

    const multiSig = {
      scripts: {
        redeem:
          "00208e41f47589e91fc67540eda41f88c3b468a97adbdcf9ff833cbb3f740316de30",
        witness:
          "522102d3812ea3ae76b90ac4fd2b848fef2ec50ddf7100aad145690ff2adddc6512a882102cead8265ee8e1c725191ef3c79f4d06877d57c74318bbf739f55564b76358f922103379942c29cc5cdcc5c9880c3a5cf1b7a8d6f5489832c363b50b54249bde40cb653ae",
      },
      address: "2NBn5rSGFLNYekdB1RXVFwWkHBn1JbsySFm",
    };

    const primaryXpriv =
      "tprv8fgNkSX6UvNMv9DwEasxkwDfS1QP5Reubj4bcpNsB6bttqGd9A6je6GE3NUdgq6FQiVH2BhP2r4NwLjbt5L4zaA2ohht3D8NLGULmKZN3Mz";

    const amount = 3500;
    const { balanceData } = await secureAccount.bitcoin.getBalance(
      multiSig.address,
    );
    console.log({ final_balance: balanceData.final_balance });
    if (balanceData.final_balance < amount + 1000) {
      throw new Error("insufficient balance to conduct the secure transaction");
    } else {
      const token = authenticator.generate(secret);
      const res = await secureAccount.secureTransaction({
        senderAddress: multiSig.address,
        recipientAddress: "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL",
        amount,
        primaryXpriv,
        scripts: multiSig.scripts,
        token,
        childIndex: 0,
        walletID,
      });
      if (res.statusCode !== 200) {
        throw new Error("transaction from secure account failed");
      } else {
        expect(res.data.txid).toBeDefined();
      }
    }
  });
});
