import { call, put, select, delay } from 'redux-saga/effects';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import { Platform, NativeModules } from 'react-native';

import { createWatcher } from '../utils/utilities';
import { SHARE_PDF, DBUPDATE_PDF_SEND, dbUpdatePdfSharing } from '../actions/manageBackup';
import { dbUpdateSSS } from "../actions/storage"
import { socialMediaType } from "../utils/media";

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
      yield put( dbUpdatePdfSharing( { copy: "copy1", socialMedia: { type: socialMediaType( res.app.split( "/", 1 )[ 0 ] ) } } ) );
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
      let res = yield Share.open( shareOptions ).then( ( res: any ) => {
        return res;
      } );
      console.log( { res } );
      yield put( dbUpdatePdfSharing( { copy: "copy2", socialMedia: { type: socialMediaType( res.app.split( "/", 1 )[ 0 ] ) } } ) );
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
      yield put( dbUpdatePdfSharing( { copy: "copy1", socialMedia: { type: "Print" } } ) );
    }
  } catch ( error ) {
    console.log( { error } );
  }
}
export const sharePdfWatcher = createWatcher( sharePdfWorker, SHARE_PDF );

function* dbUPdatePdfSharingWorker( { payload } ) {
  const { databaseSSS } = yield select( state => state.storage );
  const { copy, socialMedia } = payload;
  try {
    let updatedBackup;
    if ( copy == "copy1" ) {
      updatedBackup = {
        ...databaseSSS,
        pdfDetails: {
          copy1: {
            path: databaseSSS.pdfDetails.copy1.path,
            flagShare: true,
            shareDetails: socialMedia
          },
          copy2: databaseSSS.pdfDetails.copy2
        }
      }
    } else {
      updatedBackup = {
        ...databaseSSS,
        pdfDetails: {
          copy1: databaseSSS.pdfDetails.copy1,
          copy2: {
            path: databaseSSS.pdfDetails.copy2.path,
            flagShare: true,
            shareDetails: socialMedia
          }
        }
      }
    }
    yield put( dbUpdateSSS( updatedBackup ) );
  } catch ( error ) {
    console.log( { error } );
  }
}
export const dbUpdatePdfSharingWatcher = createWatcher( dbUPdatePdfSharingWorker, DBUPDATE_PDF_SEND );