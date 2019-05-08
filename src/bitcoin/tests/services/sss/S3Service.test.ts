import bip39 from "bip39";
import crypto from "crypto";
import config from "../../../Config";
import S3Service from "../../../services/sss/S3Service";

describe("Shamir's Secret Sharing", async () => {
  let userMnemonic: string;
  let trustedMnemonic: string;
  let answers;
  let userSSS: S3Service;
  let trustedSSS: S3Service;
  let tag: string;
  let encryptedShares;
  let sharedAssets;
  let recoveredShares;
  let dummyNonPMDD;
  let walletId: string;
  let userWalletId: string;

  beforeAll(() => {
    jest.setTimeout(50000);
    userMnemonic = bip39.generateMnemonic(256);
    trustedMnemonic = bip39.generateMnemonic(256);
    answers = ["answer1", "answer2"];
    userSSS = new S3Service(userMnemonic);
    trustedSSS = new S3Service(trustedMnemonic);
    tag = "TheCryptoBee";
    sharedAssets = [];
    recoveredShares = [];
    walletId = crypto
      .createHash("sha512")
      .update(bip39.mnemonicToSeed(userMnemonic))
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
    encryptedShares = userSSS.generateShares(answers);
    expect(encryptedShares.length).toEqual(config.SSS_TOTAL);
    expect(encryptedShares[0]).toBeTruthy();
  });

  test("initializes Healthcheck", async () => {
    const { success } = await userSSS.initializeHealthcheck(encryptedShares);
    expect(success).toBe(true);
  });

  test("encrypts and uploads the non-PMDD data to the server", async () => {
    const { updated } = await userSSS.updateNonPMDD(dummyNonPMDD);
    expect(updated).toBe(true);
  });

  test("downloads the non-PMDD and decrypts it (user specific)", async () => {
    const { nonPMDD } = await userSSS.downloadNonPMDD(walletId);
    const decryptedNonPMDD = await userSSS.decryptNonPMDD(nonPMDD);
    expect(decryptedNonPMDD).toEqual(dummyNonPMDD);
  });

  test("generates messageID against supplied shares and encrypts the shares with OTPs", () => {
    for (const encryptedShare of encryptedShares) {
      const { share, otp } = userSSS.createTransferShare(encryptedShare, tag);
      sharedAssets.push({
        otpEncryptedShare: share,
        otp,
      });
    }

    expect(sharedAssets).toBeTruthy();
    expect(sharedAssets.length).toEqual(encryptedShares.length);
  });

  test("uploads the otp encrypted share to the server (stored against the supplied messageId)", async () => {
    for (let itr = 0; itr < sharedAssets.length; itr++) {
      const { otpEncryptedShare } = sharedAssets[itr];
      const { success, messageId } = await userSSS.uploadShare(
        otpEncryptedShare,
      );
      sharedAssets[itr].messageId = messageId;
      expect(success).toBe(true);
    }
  });

  test("downloads the shares corresponding to the supplied messageIds and then decrypts them using OTPs (trusted party specific)", async () => {
    for (const sharedAsset of sharedAssets) {
      const { messageId, otp } = sharedAsset;
      const otpEncryptedShare = await trustedSSS.downloadShare(messageId);
      const { decryptedShare } = await trustedSSS.decryptOTPEncShare(
        otpEncryptedShare,
        messageId,
        otp,
      );

      userWalletId = decryptedShare.meta.walletId;
      recoveredShares.push(decryptedShare.encryptedShare);
    }

    for (let itr = 0; itr < encryptedShares.length; itr++) {
      expect(recoveredShares[itr]).toEqual(encryptedShares[itr]);
    }
  });

  test("updates the health of a given share and gets updated nonPMDD (trusted party specific)", async () => {
    const { updated, data } = await trustedSSS.updateHealth(
      userWalletId,
      recoveredShares[1],
    );
    expect(updated).toBe(true);
    expect(data).toBeTruthy();
  });

  test("checks the health of a given share (user specific)", async () => {
    const { lastUpdateds } = await userSSS.checkHealth(recoveredShares);
    expect(lastUpdateds).toBeDefined();
    expect(lastUpdateds.length).toEqual(recoveredShares.length);
  });

  test("recovers the mnemonic from an encrypted set of shares (above threshold)", () => {
    const recoveredMnemonic = userSSS.recoverFromShares(
      [recoveredShares[0], recoveredShares[2]],
      answers,
    );
    expect(recoveredMnemonic).toEqual(userMnemonic);
  });
});
