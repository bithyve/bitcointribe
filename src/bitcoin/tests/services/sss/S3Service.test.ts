import bip39 from "bip39";
import crypto from "crypto";
import config from "../../../Config";
import S3Service from "../../../services/sss/S3Service";
import {
  IBuddyStaticNonPMDD,
  IMetaShare,
  ISocialStaticNonPMDD,
} from "../../../utilities/Interface";

describe("Shamir's Secret Sharing", async () => {
  let userMnemonic: string;
  let trustedMnemonic: string;
  let secondaryMnemonic: string;
  let twoFASecret: string;
  let answer;
  let userSSS: S3Service;
  let trustedSSS: S3Service;
  let tag: string;
  let encryptedShares;
  let encryptedSocialStaticNonPMDD;
  let encryptedBuddyStaticNonPMDD;
  let sharedAssets;
  let recoveredShares;
  let dummyNonPMDD;
  let walletId: string;
  let userWalletId: string;
  let dummyBHXpub: string;
  let dummySecoundryXpub: string;
  const metaShares: IMetaShare[] = [];

  beforeAll(() => {
    jest.setTimeout(50000);
    userMnemonic = bip39.generateMnemonic(256);
    trustedMnemonic = bip39.generateMnemonic(256);
    secondaryMnemonic = bip39.generateMnemonic(256);
    twoFASecret = "some_secret";
    answer = "answer1";
    dummyBHXpub =
      "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";
    dummySecoundryXpub =
      "tpubDDGFLSXWA8K2z1fmg37ivgFmQC5xBMcEycBD5pmYuzpM1GyeoeTeykZxFFcQpVVGvv6scShvtCfRkf59tzJzwoL44VMRR78RywTU46TvCrJ";
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
        index: 4,
        walletId:
          "6beca89eb6a14f63b813b6c6fa20368505d5a7d65a870c16b54007201804f7a9ccf36175d9df4432fa78724f6d8dc78b883b98e60d8d9c88c303debd2b554f3a",
        tag: "TheCryptoBee",
        timeStamp: "3/27/2019, 6:17 PM",
      },
      encryptedStaticNonPMDD:
        "363d310ae7dc166501c3efa5ccb98e231dd0c1351e53a709b0030b6a8b49639c980704eb047593a37a58b4d75f038c21877ffdec95e7cbd4c2982816e2d6234c01e6227811e4e3e52a425f0025a6095b0490f1e327a28210310d8b561a2458557ca1d45fb690fdaa1a5dbdbf9af334e87a977bdae1f66142eeb4529d30d2acfc0185c29c2e2c9f0977aa90b4ad6294dd48fa7641ba46d19482a9027f81eccf446b23cfc58adcfe7533cf200cd9c957fdf4f026f4b855127adfa393b4fbef17867966e4967699bc89ca1b73f7048542758c096593556f6dac5571b466aa6def95f9c2764d614f5f3264defcba88a236c530bb6500d6420e3d2f9c6b0caf8422758c431e0843ae763684c9b625470f2ac8c430f01ce3bde97a94a5c85a43c29c757e95416cea4b8d6849c8138bcc0823a02a2be0980b72a99f6eebb51edfe42fef7366fef29ecd23d98a1477c8bbd7ffc091a8b0e273851552bfebada447836e9f5498f78a4800288fca94ea9d434e4d76412a8a551a862224314073aec0f47836d4f214b86e0664aea3b0bdd96eb10f62ff276a1412d14f210a784cc7ff1aad53a5e4cbabf2802f9a33aed2772248ab0b4bfe8d3452159fcbb7d893bc3edc4c4da48c42f92caa695cf4ddb1e3f340c23924525ae339edc5a92922991dcf22044b046343e77172bd5fa1a92b865f118325a892e48c647b091417ac73a1a8b73a3e756f7b00645f86a99c07ac77d2c5e54f971343772b04c535dd1826142f1999dd8e25c9cf57d27467bea7af762c327362d12503d1304a536187e532a9797ba8191575c2f6255d1bdf507774ccf5cef60c4c42ff6e3b4c1eae36e55bb06bea1bce3656d77fcba12c6b766da3f5ce5b7096",
    };
  });

  test("generates encrypted shares corresponding to supplied mnemonic", () => {
    const res = userSSS.generateShares(answer);
    encryptedShares = res.data.encryptedShares;
    expect(res.status).toBe(config.STATUS.SUCCESS);
    expect(encryptedShares.length).toEqual(config.SSS_TOTAL);
    expect(encryptedShares[0]).toBeTruthy();
  });

  test("initializes Healthcheck", async () => {
    const res = await userSSS.initializeHealthcheck(encryptedShares);
    console.log(res);
    expect(res.status).toBe(config.STATUS.SUCCESS);
    expect(res.data.success).toBe(true);
  });

  test("generate encrypted static non pmdd  for 1st, 2nd, 3rd share", () => {
    const socialStaticNonPMDD: ISocialStaticNonPMDD = {
      secoundaryXpub: dummySecoundryXpub,
      bhXpub: dummyBHXpub,
    };
    const buddyStaticNonPMDD: IBuddyStaticNonPMDD = {
      secondaryMnemonic,
      twoFASecret,
      secoundaryXpub: dummySecoundryXpub,
      bhXpub: dummyBHXpub,
    };
    const res = userSSS.encryptStaticNonPMDD(socialStaticNonPMDD);
    expect(res.status).toBe(config.STATUS.SUCCESS);
    encryptedSocialStaticNonPMDD = res.data.encryptedStaticNonPMDD;
    expect(encryptedSocialStaticNonPMDD).toBeTruthy();

    const buddyRes = userSSS.encryptStaticNonPMDD(buddyStaticNonPMDD);
    expect(buddyRes.status).toBe(config.STATUS.SUCCESS);
    encryptedBuddyStaticNonPMDD = buddyRes.data.encryptedStaticNonPMDD;
    expect(encryptedBuddyStaticNonPMDD).toBeTruthy();
  });

  test("creates encrypted MetaShares against supplied encryptedShares w/ corresponding encStaticNonPMDDs)", async () => {
    const index: number = 0;
    for (const encryptedShare of encryptedShares) {
      let res;
      if (index !== 2) {
        res = userSSS.createMetaShare(
          index + 1,
          encryptedShare,
          encryptedSocialStaticNonPMDD,
          tag,
        );
      } else {
        res = userSSS.createMetaShare(
          index + 1,
          encryptedShare,
          encryptedBuddyStaticNonPMDD,
          tag,
        );
      }
      const { metaShare } = res.data;
      expect(metaShare).toBeTruthy();
      metaShares.push(metaShare);
    }
    expect(metaShares.length).toBe(5);

    for (let itr = 0; itr < metaShares.length - 2; itr++) {
      const res = userSSS.generateEncryptedMetaShare(metaShares[itr]);
      expect(res.status).toBe(config.STATUS.SUCCESS);
      const { encryptedMetaShare, key, messageId } = res.data;

      const otpRes = userSSS.encryptViaOTP(key);
      expect(otpRes.status).toBe(config.STATUS.SUCCESS);
      expect(otpRes.data.otpEncryptedData).toBeTruthy();

      sharedAssets.push({
        encryptedMetaShare,
        otpEncryptedKey: otpRes.data.otpEncryptedData,
        key,
        messageId,
        otp: otpRes.data.otp,
      });
    }

    expect(sharedAssets).toBeTruthy();
    expect(sharedAssets.length).toEqual(3);
  });

  test("something that needs to be done", async () => {
    for (let itr = 4; itr > metaShares.length - 3; itr--) {
      const qrRes = await userSSS.createQR(metaShares[itr], itr + 1);
      expect(qrRes.status).toBe(config.STATUS.SUCCESS);
      console.log({ qrData: qrRes.data.qrData });

      const recQRRes = userSSS.recoverMetaShareFromQR(qrRes.data.qrData);
      expect(recQRRes.status).toBe(config.STATUS.SUCCESS);

      expect(recQRRes.data.metaShare).toEqual(metaShares[itr]);
    }
  });

  test("uploads the  encrypted metashare to the server (stored against the supplied messageId)", async () => {
    for (let itr = 0; itr < sharedAssets.length; itr++) {
      const { encryptedMetaShare } = sharedAssets[itr];
      const { messageId } = sharedAssets[itr];
      const res = await userSSS.uploadShare(encryptedMetaShare, messageId);
      expect(res.status).toBe(config.STATUS.SUCCESS);
      const { success } = res.data;
      expect(success).toBe(true);
    }
  });

  test("downloads the metashares corresponding to the supplied messageIds and then decrypts them using encrypted key (trusted party specific)", async () => {
    for (const sharedAsset of sharedAssets) {
      const { otpEncryptedKey, otp } = sharedAsset;
      const { data } = S3Service.decryptViaOTP(otpEncryptedKey, otp);
      const key = data.decryptedData;

      const res = await S3Service.downloadShare(key);
      expect(res.status).toBe(config.STATUS.SUCCESS);

      expect(key).toBeTruthy();
      const decryptRes = await S3Service.decryptEncMetaShare(
        res.data.encryptedMetaShare,
        key,
      );
      expect(decryptRes.status).toBe(config.STATUS.SUCCESS);
      userWalletId = decryptRes.data.decryptedMetaShare.meta.walletId;

      recoveredShares.push(decryptRes.data.decryptedMetaShare.encryptedShare);
    }

    for (let itr = 0; itr < recoveredShares.length; itr++) {
      expect(recoveredShares[itr]).toEqual(encryptedShares[itr]);
    }
  });

  test("encrypts and uploads the non-PMDD data to the server", async () => {
    const res = await userSSS.updateDynamicNonPMDD(dummyNonPMDD);
    expect(res.status).toBe(config.STATUS.SUCCESS);
    expect(res.data.updated).toBe(true);
  });

  test("downloads the non-PMDD and decrypts it (user specific)", async () => {
    const res = await userSSS.downloadDynamicNonPMDD(walletId);
    expect(res.status).toBe(config.STATUS.SUCCESS);
    console.log({ res });
    const decryptRes = await userSSS.decryptStaticNonPMDD(res.data.nonPMDD);
    console.log({ decryptRes });
    expect(decryptRes.status).toBe(config.STATUS.SUCCESS);
    expect(decryptRes.data.decryptedStaticNonPMDD).toEqual(dummyNonPMDD);
  });

  test("updates the health of a given share and gets updated nonPMDD (trusted party specific)", async () => {
    const res = await trustedSSS.updateHealth(userWalletId, recoveredShares[0]);

    expect(res.status).toBe(config.STATUS.SUCCESS);

    const { updated, nonPMDD } = res.data;
    expect(updated).toBe(true);
    expect(nonPMDD).toBeTruthy();
  });

  test("checks the health of a given share (user specific)", async () => {
    const shareIDs = [];
    for (const recoveredShare of recoveredShares) {
      const { data } = userSSS.getShareId(recoveredShare);
      shareIDs.push(data.shareId);
    }
    const res = await userSSS.checkHealth(shareIDs);
    expect(res.status).toBe(config.STATUS.SUCCESS);

    const { lastUpdateds } = res.data;
    expect(lastUpdateds).toBeDefined();
    expect(lastUpdateds.length).toEqual(recoveredShares.length);
  });

  test("recovers the mnemonic from an encrypted set of shares (above threshold)", () => {
    const res = S3Service.recoverFromShares(recoveredShares, answer);
    expect(res.status).toBe(config.STATUS.SUCCESS);

    const { mnemonic } = res.data;
    expect(mnemonic).toEqual(userMnemonic);
  });
});
