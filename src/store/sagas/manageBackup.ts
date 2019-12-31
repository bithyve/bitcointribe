import { call, put, select, delay } from 'redux-saga/effects';
import { createWatcher } from '../utils/utilities';
import { SHARE_PDF } from '../actions/manageBackup';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, NativeModules } from 'react-native';

function* sharePdfWorker({ payload }) {
  const { databaseSSS } = yield select(state => state.storage);
  const { security } = yield select(
    state => state.storage.database.WALLET_SETUP,
  );
  console.log({ databaseSSS, payload });
  try {
    if (payload.type == 'copy1') {
      let shareOptions = {
        title: 'Personal Copy 1',
        message:
          'Please find attached the personal copy 1 share pdf, it is password protected by the answer to the security question.',
        url: databaseSSS.pdfDetails.personalCopy1PdfPath,
        type: 'application/pdf',
        showAppsToView: true,
        subject: 'Personal copy 1',
      };
      // console.log( { shareOptions } );
      yield Share.open(shareOptions).then((res: any) => {
        console.log({ res });
      });
    } else if (payload.type == 'copy2') {
      let shareOptions = {
        title: 'Personal Copy 2',
        message:
          'Please find attached the personal copy 2 share pdf, it is password protected by the answer to the security question.',
        url: databaseSSS.pdfDetails.personalCopy2PdfPath,
        type: 'application/pdf',
        showAppsToView: true,
        subject: 'Personal copy 2',
      };
      // console.log( { shareOptions } );
      yield Share.open(shareOptions).then((res: any) => {
        console.log({ res });
      });
    } else {
      console.log({ path: databaseSSS.pdfDetails.personalCopy1PdfPath });
      let pdfDecr = {
        path:
          '/storage/emulated/0/Hexa Hexa Recovery Secret (Personal Copy 1).pdf',
        filename: 'Personal Copy Print.pdf',
        password: security.answer,
      };
      console.log({ pdfDecr });

      if (Platform.OS == 'android') {
        var PdfPassword = yield NativeModules.PdfPassword;
        yield PdfPassword.print(
          JSON.stringify(pdfDecr),
          async (err: any) => {
            console.log({ err });
          },
          async (res: any) => {
            await RNPrint.print({
              filePath: 'file://' + res,
            });
            console.log({ res });
          },
        );
      } else {
        yield RNPrint.print({
          filePath: databaseSSS.pdfDetails.personalCopy1PdfPath,
        });
      }
    }
  } catch (error) {
    console.log({ error });
  }
}

export const sharePdfWatcher = createWatcher(sharePdfWorker, SHARE_PDF);
