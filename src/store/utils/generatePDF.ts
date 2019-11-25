import RNHTMLtoPDF from "react-native-html-to-pdf";
import { Platform, NativeModules } from "react-native";
import QRCode from "qrcode-svg";

const getFormattedString = (qrString: string) => {
  qrString = qrString.split('"').join("Dquote");
  qrString = qrString.split(":").join("Qutation");
  qrString = qrString.split("{").join("Lbrace");
  qrString = qrString.split("}").join("Rbrace");
  qrString = qrString.split("/").join("Slash");
  qrString = qrString.split(",").join("Comma");
  qrString = qrString.split("'").join("Squote");
  qrString = qrString.split(" ").join("Space");
  return qrString;
};

const chunkArray = (arr: any, n: any) => {
  var chunkLength = Math.max(arr.length / n, 1);
  var chunks = [];
  for (var i = 0; i < n; i++) {
    if (chunkLength * (i + 1) <= arr.length)
      chunks.push(arr.slice(chunkLength * i, chunkLength * (i + 1)));
  }
  return chunks;
};

export default async (pdfData, fileName, title, password) => {
  const {
    qrData,
    secondaryMnemonic,
    twoFASecret,
    twoFAQR,
    secondaryXpub,
    bhXpub
  } = pdfData;

  const qrCodes: string[] = [];
  const chunkedQR: string[][] = [];
  qrData.forEach(qrString => {
    qrCodes.push(getFormattedString(qrString));
    chunkedQR.push(chunkArray(qrString, 4));
  });

  let chunkedSecondaryMnemonic = chunkArray(secondaryMnemonic.split(" "), 2);
  chunkedSecondaryMnemonic = chunkedSecondaryMnemonic.map(chunk =>
    chunk
      .toString()
      .split(",")
      .join(" ")
  );
  let chunkedBHXpub = chunkArray(bhXpub, 2);

  const shareParts: string[] = [];
  for (let index = 0; index < 8; index++) {
    const part =
      `<h3 style='text-decoration: underline;'>Part ${index + 1}<h3>` +
      new QRCode(qrCodes[index]).svg() +
      "<p align='center'>" +
      chunkedQR[index][0].toString() +
      "</p>" +
      "<p align='center'>" +
      chunkedQR[index][1].toString() +
      "</p>" +
      "<p align='center'>" +
      chunkedQR[index][2].toString() +
      "</p>" +
      "<p align='center'>" +
      chunkedQR[index][3].toString() +
      "</p>";
    shareParts.push(part);
  }

  const html =
    "<h1>" +
    title.toString() +
    "</h1>" +
    shareParts.join("") +
    "<h3 style='text-decoration: underline;'>Secondary Xpub (Encrypted):<h3>" +
    new QRCode(secondaryXpub).svg() +
    "<p align='center'>Scan the above QR Code using your HEXA wallet in order to restore your Secure Account.</p>" +
    "<p>2FA Secret:<p><br/>" +
    new QRCode(twoFAQR).svg() +
    "<p align='center'>" +
    twoFASecret +
    "</p>" +
    "<p>Following assets can be used to recover your funds using the open - sourced ga - recovery tool.</p><br/><br/>" +
    "<p>Secondary Mnemonic:<p>" +
    "<p align='center'>" +
    chunkedSecondaryMnemonic[0] +
    "</p>" +
    "<p align='center'>" +
    chunkedSecondaryMnemonic[1] +
    "</p><br/>" +
    "<p>BitHyve Xpub:<p>" +
    "<p align='center'>" +
    chunkedBHXpub[0].toString() +
    "</p>" +
    "<p align='center'>" +
    chunkedBHXpub[1].toString() +
    "</p>";

  if (Platform.OS == "ios") {
    let options = {
      padding: 0,
      height: 842,
      width: 595,
      html,
      fileName: fileName,
      directory: "Documents"
    };

    const file = await RNHTMLtoPDF.convert(options);
    // console.log({ file });
    // console.log({ NativeModules });
    // const PdfPassword = NativeModules.PdfPassword;
    // console.log({ PdfPassword });
    // PdfPassword.addEvent("/" + fileName + ".pdf", password);
    // console.log({ filePath: file.filePath });
    return file.filePath;
  } else {
    // TODO: PDF creation @Android
    // let options = {
    //   html,
    //   fileName: fileName,
    //   directory: "Documents"
    // };
    // let file = await RNHTMLtoPDF.convert(options);
    // console.log({ file });
    // setPdfAndroidPasswrod(file.filePath, password);
  }
};
