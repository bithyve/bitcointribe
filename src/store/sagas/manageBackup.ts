import { call, put, select, delay } from 'redux-saga/effects';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import { Platform, NativeModules } from 'react-native';

import { createWatcher } from '../utils/utilities';
import { SHARE_PDF, DBUPDATE_PDF_SEND, dbUpdatePdfSharing } from '../actions/manageBackup';


function* sharePdfWorker( { payload } ) {
  const { databaseSSS } = yield select( state => state.storage );
  const { security } = yield select(
    state => state.storage.database.WALLET_SETUP,
  );
  console.log( { databaseSSS, payload } );
  try {
    if ( payload.type == 'copy1' ) {
      let shareOptions = {
        title: 'Personal Copy 1',
        message:
          'Please find attached the personal copy 1 share pdf, it is password protected by the answer to the security question.',
        url:
          Platform.OS == 'android'
            ? 'file://' + databaseSSS.pdfDetails.copy1.path
            : databaseSSS.pdfDetails.copy1.path,
        type: 'application/pdf',
        showAppsToView: true,
        subject: 'Personal copy 1',
      };
      //console.log( { shareOptions } );
      let res = yield Share.open( shareOptions ).then( async ( res: any ) => {
        return await res;
      } );
      console.log( { res } );
      yield put( dbUpdatePdfSharing( { copy: "copy1", res } ) );
    } else if ( payload.type == 'copy2' ) {
      let shareOptions = {
        title: 'Personal Copy 2',
        message:
          'Please find attached the personal copy 2 share pdf, it is password protected by the answer to the security question.',
        url:
          Platform.OS == 'android'
            ? 'file://' + databaseSSS.pdfDetails.copy2.path
            : databaseSSS.pdfDetails.copy12.path,
        type: 'application/pdf',
        showAppsToView: true,
        subject: 'Personal copy 2',
      };
      // console.log( { shareOptions } );
      yield Share.open( shareOptions ).then( async ( res: any ) => {
        console.log( { res } );
      } );
    } else {
      console.log( { path: databaseSSS.pdfDetails.personalCopy1PdfPath } );
      let pdfDecr = {
        path: databaseSSS.pdfDetails.copy1.path,
        filename: 'Personal Copy Print.pdf',
        password: security.answer,
      };
      if ( Platform.OS == 'android' ) {
        var PdfPassword = yield NativeModules.PdfPassword;
        yield PdfPassword.print(
          JSON.stringify( pdfDecr ),
          async ( err: any ) => {
            console.log( { err } );
          },
          async ( res: any ) => {
            await RNPrint.print( {
              filePath: 'file://' + res,
            } );
            console.log( { res } );
          },
        );
      } else {
        yield RNPrint.print( {
          filePath: databaseSSS.pdfDetails.copy1.path,
        } );
      }
    }
  } catch ( error ) {
    console.log( { error } );
  }
}

function* dbUPdatePdfSharingWorker( { payload } ) {
  const { databaseSSS } = yield select( state => state.storage );
  const { copy, res } = payload;
  try {
    let updatedBackup;
    updatedBackup = {
      ...databaseSSS,
      pdfDetails: {
        copy1: {
          path: databaseSSS.pdfDetails.copy1.path,
          flagShare: true,
          shareDetails: res
        },
        copy2: databaseSSS.pdfDetails.copy2
      }
    }
    console.log( { updatedBackup } );
    console.log( { databaseSSS, payload } );

  } catch ( error ) {
    console.log( { error } );

  }
}









export const sharePdfWatcher = createWatcher( sharePdfWorker, SHARE_PDF );
export const dbUpdatePdfSharingWatcher = createWatcher( dbUPdatePdfSharingWorker, DBUPDATE_PDF_SEND );