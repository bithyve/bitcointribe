import bip32 from "bip32";
import bip39 from "bip39";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import qr from "qr-image";
import config from "../Config";

export default class SecurePDFGen {
  private mnemonic: string;
  private cipherSpec: {
    algorithm: string;
    salt: string;
    iv: Buffer;
    keyLength: number;
  };

  constructor(mnemonic: string) {
    this.cipherSpec = {
      algorithm: "aes-192-cbc",
      salt: "bithyeSalt",
      keyLength: 24,
      iv: Buffer.alloc(16, 0),
    };
    this.mnemonic = mnemonic;
  }

  public generate = async (
    password,
    secondaryMnemonic,
    bhXpub,
    twoFAsecret,
  ) => {
    const path = this.getXpubDerivationPath(bhXpub);
    const secondaryXpub = this.getRecoverableXKey(secondaryMnemonic, path);

    const assets = [{ secondaryXpub }, { bhXpub }, { twoFAsecret }];
    for (const asset of assets) {
      if (Object.keys(asset)[0] === "twoFAsecret") {
        this.qrGenerator(asset, false);
      } else {
        this.qrGenerator(asset);
      }
    }
    setTimeout(() => {
      this.pdfGenerator(
        password,
        secondaryMnemonic,
        bhXpub,
        twoFAsecret,
        assets,
      );
    }, 1000);
  }

  private getXpubDerivationPath = (bhXpub) => {
    const bhxpub = bip32.fromBase58(bhXpub, config.NETWORK);
    let path;
    if (bhxpub.index === 0) {
      path = config.DERIVATION_BRANCH;
    } else {
      path = config.WALLET_XPUB_PATH + config.DERIVATION_BRANCH;
    }
    return path;
  }

  private getRecoverableXKey = (mnemonic: string, path: string) => {
    const seed = bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed, config.NETWORK);
    const xpub = root
      .derivePath("m/" + path)
      .neutered()
      .toBase58();
    return xpub;
  }

  private generateKey = (psuedoKey: string) => {
    const hashRounds = 5048;
    let key = psuedoKey;
    for (let itr = 0; itr < hashRounds; itr++) {
      const hash = crypto.createHash("sha512");
      key = hash.update(key).digest("hex");
    }
    return key.slice(key.length - this.cipherSpec.keyLength);
  }

  private encryptor = (data, encKey) => {
    const key = this.generateKey(encKey);
    const cipher = crypto.createCipheriv(
      this.cipherSpec.algorithm,
      key,
      this.cipherSpec.iv,
    );
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  private decryptor = (encData, decKey) => {
    const key = this.generateKey(decKey);
    const decipher = crypto.createDecipheriv(
      this.cipherSpec.algorithm,
      key,
      this.cipherSpec.iv,
    );
    let decrypted = decipher.update(encData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  private pdfGenerator = (
    password: string,
    secondaryMnemonic: string,
    bhXpub: string,
    twoFAsecret: string,
    assets,
  ) => {
    const doc = new PDFDocument({ userPassword: password });
    doc.pipe(require("fs").createWriteStream("assets/secure.pdf"));

    doc.image(`assets/${Object.keys(assets[0])[0]}.png`, 175, 70, {
      fit: [250, 300],
    });
    doc.fontSize(15).text("Secondary Xpub (Encrypted)", 200, 320);
    doc.image(`assets/${Object.keys(assets[1])[0]}.png`, 175, 345, {
      fit: [250, 300],
    });
    doc.fontSize(15).text("BitHyve Xpub (Encrypted)", 210, 595);

    doc
      .fontSize(15)
      .text(
        "Scan the above QR Codes using your HEXA wallet in order to restore your Secure Account.",
        115,
        645,
      );

    doc.addPage();

    doc
      .fontSize(15)
      .text(
        `Following assets can be used to recover your funds using the open-sourced ga-recovery tool.\n\n\n`,
        50,
        70,
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(`Secondary Mnemonic:\n\n`);
    doc
      .font("Courier")
      .fontSize(17)
      .text(`${secondaryMnemonic}\n\n\n`);
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text(`BitHyve Xpub:\n\n`);
    doc
      .font("Courier")
      .fontSize(17)
      .text(`${bhXpub}\n\n\n`);
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("2FA Secret:\n");
    doc.image(`assets/${Object.keys(assets[2])[0]}.png`, 175);
    doc
      .font("Courier")
      .fontSize(17)
      .text(`${twoFAsecret}\n\n`, 125);

    doc.end();
  }

  private qrGenerator = (asset, encrypt = true) => {
    let data = JSON.stringify(asset);
    if (encrypt) {
      data = this.encryptor(data, this.mnemonic);
    }
    const qrPng = qr.image(data, { type: "png" });
    qrPng.pipe(
      require("fs").createWriteStream(`assets/${Object.keys(asset)[0]}.png`),
    );
  }
}

// const dummySecondaryMnemonic =
//   "expire frost parade cause ask border ritual weather sponsor cloud happy naive";
// const dummyTwoFAsecret = "NJDEK4TTKZWXMM3EOZZGWQRTNRSGE2BL";
// const dummyBHXpub =
//   "tpubDFe4ZoKYAQhR7JQq8s1AKqDeoGWE2Aovf2b4pqEE5Mt2HyqYMkq8AzHYU8zosVeSEf7EJtNGuTkDVqVrT8YjizbuvRttJMS6uRKabEA358d";
// const dummyMnemonic =
//   "unique issue slogan party van unfair assault warfare then rubber satisfy snack";
// const dummyPassword = "dummy";
// const securePDFGen = new SecurePDFGen(dummyMnemonic);
// securePDFGen.generate(
//   dummyPassword,
//   dummySecondaryMnemonic,
//   dummyBHXpub,
//   dummyTwoFAsecret,
// );
