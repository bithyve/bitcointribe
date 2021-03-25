import { Platform, NativeModules } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { getFormattedString } from '../../common/CommonFunctions';

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


export default async (pdfData, fileName, title) => {
  const { qrData } = pdfData;
  const qrcode: string[] = [];
  const qrCodeString: string[][] = [];
  qrData.forEach((qrString) => {
    qrcode.push(getFormattedString(qrString));
    qrCodeString.push(qrString);
  });
  let pdfDatas = {
    title,
    fileName,
    qrcode,
    qrCodeString,
  };
  let pdfPath = await getPdfPath(pdfDatas);
   console.log({ pdfPath });
  return pdfPath;
};
const getPdfPath = async (pdfData: any) => {
  if(pdfData){
    console.log("PDFDATA", pdfData);
  if (Platform.OS == 'ios') {
    var PdfPassword = await NativeModules.PdfPassword;
    console.log("PADFPASSWORD", PdfPassword);
    return await PdfPassword.createPdfKeeper(JSON.stringify(pdfData));
  } else {
    if (!(await requestStoragePermission())) {
      throw new Error('Storage Permission Denied');
    }
    var PdfPassword = await NativeModules.PdfPassword;
    await PdfPassword.createPdfKeeper(
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
}
};
