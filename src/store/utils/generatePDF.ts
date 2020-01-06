import { Platform, NativeModules, Alert } from 'react-native';
import { PermissionsAndroid } from 'react-native';

// async function requestStoragePermission() {
//   try {
//     await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//       {
//         title: 'Hexa Storage Permission',
//         message: 'Storage permission is required to store the PDF',
//         buttonNeutral: 'Ask Me Later',
//         buttonNegative: 'Cancel',
//         buttonPositive: 'OK',
//       },
//     );

//     return PermissionsAndroid.RESULTS.GRANTED;
//   } catch (err) {
//     console.warn(err);
//   }
// }

async function requestStoragePermission() {
  try {
    const userResponse = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]);
    return userResponse;
  } catch (err) {
    console.log(err);
  }
  return null;
}

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
    bhXpub,
  } = pdfData;
  const qrcode: string[] = [];
  const qrCodeString: string[][] = [];
  qrData.forEach(qrString => {
    qrcode.push(getFormattedString(qrString));
    // qrCodeString.push(chunkArray(qrString, 4));
    qrCodeString.push(qrString);
  });
  let pdfDatas = {
    title,
    fileName,
    password,
    qrcode,
    qrCodeString,
    secondaryXpub,
    twoFAQR,
    twoFASecret,
    secondaryMnemonic,
    bhXpub,
  };
  let pdfPath = await getPdfPath(pdfDatas);
  // console.log({ pdfPath });
  return pdfPath;
};
const getPdfPath = async (pdfData: any) => {
  if (Platform.OS == 'ios') {
    const PdfPassword = NativeModules.PdfPassword;
    return await PdfPassword.createPdf(JSON.stringify(pdfData));
  } else {
    if (!(await requestStoragePermission())) {
      throw new Error('Storage Permission Denied');
    }
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
