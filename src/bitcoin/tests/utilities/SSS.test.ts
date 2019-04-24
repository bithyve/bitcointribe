import axios from "axios";
import bip39 from "bip39";
import crypto from "crypto";
import config from "../../Config";
import SSS from "../../utilities/sss/SSS";

describe("Shamir's Secret Sharing", async () => {
  let mnemonic: string;
  let answers;
  let sss: SSS;
  let tag: string;
  let encryptedShares;
  let sharedAssets;
  let recoveredShares;
  let dummyNonPMDD;
  let walletId: string;
  let userWalletId: string;
  let encryptedNonPMDD: string;

  beforeAll(() => {
    jest.setTimeout(50000);
    mnemonic = bip39.generateMnemonic(256);
    answers = ["answer1", "answer2"];
    sss = new SSS(mnemonic);
    tag = "TheCryptoBee";
    sharedAssets = [];
    recoveredShares = [];
    walletId = crypto
      .createHash("sha512")
      .update(bip39.mnemonicToSeed(mnemonic))
      .digest("hex");

    dummyNonPMDD = {
      encryptedShare:
        "363d310ae7dc166501c3efa5ccb98e231dd0c1351e53a709b0030b6a8b49639c980704eb047593a37a58b4d75f038c21877ffdec95e7cbd4c2982816e2d6234c01e6227811e4e3e52a425f0025a6095b0490f1e327a28210310d8b561a2458557ca1d45fb690fdaa1a5dbdbf9af334e87a977bdae1f66142eeb4529d30d2acfc0185c29c2e2c9f0977aa90b4ad6294dd48fa7641ba46d19482a9027f81eccf446b23cfc58adcfe7533cf200cd9c957fdf4f026f4b855127adfa393b4fbef17867966e4967699bc89ca1b73f7048542758c096593556f6dac5571b466aa6def95f9c2764d614f5f3264defcba88a236c530bb6500d6420e3d2f9c6b0caf8422758c431e0843ae763684c9b625470f2ac8c430f01ce3bde97a94a5c85a43c29c757e95416cea4b8d6849c8138bcc0823a02a2be0980b72a99f6eebb51edfe42fef7366fef29ecd23d98a1477c8bbd7ffc091a8b0e273851552bfebada447836e9f5498f78a4800288fca94ea9d434e4d76412a8a551a862224314073aec0f47836d4f214b86e0664aea3b0bdd96eb10f62ff276a1412d14f210a784cc7ff1aad53a5e4cbabf2802f9a33aed2772248ab0b4bfe8d3452159fcbb7d893bc3edc4c4da48c42f92caa695cf4ddb1e3f340c23924525ae339edc5a92922991dcf22044b046343e77172bd5fa1a92b865f118325a892e48c647b091417ac73a1a8b73a3e756f7b00645f86a99c07ac77d2c5e54f971343772b04c535dd1826142f1999dd8e25c9cf57d27467bea7af762c327362d12503d1304a536187e532a9797ba8191575c2f6255d1bdf507774ccf5cef60c4c42ff6e3b4c1eae36e55bb06bea1bce3656d77fcba12c6b766da3f5ce5b7096",
      meta: {
        validator: "HEXA",
        walletId:
          "6beca89eb6a14f63b813b6c6fa20368505d5a7d65a870c16b54007201804f7a9ccf36175d9df4432fa78724f6d8dc78b883b98e60d8d9c88c303debd2b554f3a",
        tag: "TheCryptoBee",
        timeStamp: "3/27/2019, 6:17 PM",
        info: "TheCryptoBee's sss share",
      },
    };
  });

  test("generates encrypted shares corresponding to supplied mnemonic", () => {
    const shares = sss.generateShares();
    encryptedShares = sss.encryptShares(shares, answers);
    expect(encryptedShares.length).toEqual(config.SSS_TOTAL);
    expect(encryptedShares[0]).toBeTruthy();
  });

  test("initializes Healthcheck", async () => {
    const { success } = await sss.initializeHealthcheck(encryptedShares);
    expect(success).toBe(true);
  });

  test("encrypts and uploads the non-PMDD data to the server", async () => {
    encryptedNonPMDD = await sss.encryptNonPMDD(dummyNonPMDD);
    const { updated } = await sss.updateNonPMDD(encryptedNonPMDD);
    expect(updated).toBe(true);
  });

  test("downloads the non-PMDD and decrypts it (user specific)", async () => {
    const { nonPMDD } = await sss.fetchNonPMDD(walletId);
    const decryptedNonPMDD = await sss.decryptNonPMDD(nonPMDD);
    expect(decryptedNonPMDD).toEqual(dummyNonPMDD);
  });

  test("generates messageID against supplied shares and encrypts the shares with OTPs", () => {
    for (const encryptedShare of encryptedShares) {
      const metaShare = sss.addMeta(encryptedShare, tag);
      const { share, otp } = sss.encryptViaOTP(metaShare);
      sharedAssets.push({
        otpEncryptedShare: share,
        messageId: sss.generateMessageID(),
        otp,
      });
    }

    expect(sharedAssets).toBeTruthy();
    expect(sharedAssets.length).toEqual(encryptedShares.length);
  });

  test("uploads the otp encrypted share to the server (stored against the supplied messageId)", async () => {
    for (const sharedAsset of sharedAssets) {
      const { otpEncryptedShare, messageId } = sharedAsset;
      const { success } = await sss.uploadShare(otpEncryptedShare, messageId);
      expect(success).toBe(true);
    }
  });

  test("downloads the shares corresponding to the supplied messageIds and then decrypts them using OTPs", async () => {
    for (const sharedAsset of sharedAssets) {
      const { messageId, otp } = sharedAsset;
      const { otpEncryptedShare } = await sss.downloadShare(messageId);
      const decryptedMetaShare = sss.decryptViaOTP(otpEncryptedShare, otp);

      const res = await axios.post(config.SERVER + "/affirmDecryption", {
        messageId,
      });
      expect(res.data.deleted).toBe(true);

      userWalletId = decryptedMetaShare.meta.walletId;
      recoveredShares.push(decryptedMetaShare.encryptedShare);
    }

    for (let itr = 0; itr < encryptedShares.length; itr++) {
      expect(recoveredShares[itr]).toEqual(encryptedShares[itr]);
    }
  });

  test("updates the health of a given share and gets updated nonPMDD (trusted party specific)", async () => {
    const { updated, data } = await sss.updateHealth(
      userWalletId,
      recoveredShares[1],
    );
    expect(updated).toBe(true);
    expect(data).toBeTruthy();
  });

  test("checks the health of a given share (user specific)", async () => {
    const { health } = await sss.checkHealth(recoveredShares[1]);
    expect(health).toBe("GREEN");
  });

  test("recovers the mnemonic from an encrypted set of shares (above threshold)", () => {
    const decryptedShares = sss.decryptShares(recoveredShares, answers);
    const recoveredMnemonic = sss.recoverFromShares([
      decryptedShares[0],
      decryptedShares[2],
    ]);
    expect(recoveredMnemonic).toEqual(mnemonic);
  });
});
