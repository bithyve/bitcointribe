import { Platform, NativeModules, Alert } from 'react-native';

const chunkArray = (arr: any, n: any) => {
  var chunkLength = Math.max(arr.length / n, 1);
  var chunks = [];
  for (var i = 0; i < n; i++) {
    if (chunkLength * (i + 1) <= arr.length)
      chunks.push(arr.slice(chunkLength * i, chunkLength * (i + 1)));
  }
  return chunks;
};


const getFormattedString = (qrString: string) => {
  qrString = qrString.split('"').join('Dquote');
  qrString = qrString.split(':').join('Qutation');
  qrString = qrString.split('{').join('Lbrace');
  qrString = qrString.split('}').join('Rbrace');
  qrString = qrString.split('/').join('Slash');
  qrString = qrString.split(',').join('Comma');
  qrString = qrString.split("'").join('Squote');
  qrString = qrString.split(' ').join('Space');
  return qrString;
};

export default async (pdfData, fileName, title, password) => {
  const { qrData, secondaryMnemonic, secondaryXpub, bhXpub } = pdfData;
  const qrcode: string[] = [];
  const qrCodeString: string[][] = [];
  qrData.forEach((qrString) => {
    qrcode.push(getFormattedString(qrString));
    qrCodeString.push(qrString);
  });
  let pdfDatas = {
    title,
    fileName,
    password,
    qrcode,
    qrCodeString,
    secondaryXpub,
    secondaryMnemonic,
    bhXpub,
  };

  return await getPdfPath(pdfDatas);
};

const getPdfPath = async (pdfData: any) => {
  if (Platform.OS == 'ios') {
    const PdfPassword = NativeModules.PdfPassword;
    return await PdfPassword.createPdf(JSON.stringify(pdfData));
  } else {
    var PdfPassword = await NativeModules.PdfPassword;
    await PdfPassword.createPdf(
      JSON.stringify(pdfData),
      async (err: any) => {
        return await err;
      },
      async (path: any) => {
        // console.log({ path });
        return await path;
      },
    );
    return '/storage/emulated/0/' + pdfData.fileName;
  }
};
