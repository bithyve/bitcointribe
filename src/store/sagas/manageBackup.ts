
import { call, put, select, delay } from 'redux-saga/effects';
import Share from 'react-native-share';
import RNPrint from 'react-native-print';
import Mailer from 'react-native-mail';
//var RNFS = require( 'react-native-fs' );
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
  let { type, item } = payload;
  console.log( { type, item } );
  try {
    if ( item.type == 'copy1' && type != "Print" ) {
      if ( type == "Other" ) {
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
        // yield put( dbUpdatePdfSharing( { copy: "copy1", socialMedia: { type: socialMediaType( res.app.split( "/", 1 )[ 0 ] ), date: Math.floor( Date.now() / 1000 ) } } ) );
        yield put( dbUpdatePdfSharing( { copy: "copy1", socialMedia: { type: "Other", date: Math.floor( Date.now() / 1000 ) } } ) );
      } else {
        yield Mailer.mail( {
          subject: item.title,
          body: '<b>Please find attached the personal copy 1 share pdf, it is password protected by the answer to the security question.</b>',
          isHTML: true,
          attachment: {
            path: Platform.OS == 'android'
              ? 'file://' + databaseSSS.pdfDetails.copy1.path
              : databaseSSS.pdfDetails.copy1.path,  // The absolute path of the file from which to read data.
            type: 'pdf',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
            name: item.title,   // Optional: Custom filename for attachment
          }
        }, ( error, event ) => {
          console.log( { event, error } );
        } );
        yield put( dbUpdatePdfSharing( { copy: "copy1", socialMedia: { type: "Email", date: Math.floor( Date.now() / 1000 ) } } ) );
      }
    } else if ( item.type == 'copy2' && type != "Print" ) {
      if ( type == "Other" ) {
        let shareOptions = {
          title: 'Personal Copy 2',
          message:
            'Please find attached the personal copy 2 share pdf, it is password protected by the answer to the security question.',
          url:
            Platform.OS == 'android'
              ? 'file://' + databaseSSS.pdfDetails.copy2.path
              : databaseSSS.pdfDetails.copy2.path,
          type: 'application/pdf',
          showAppsToView: true,
          subject: 'Personal copy 2',
        };
        let res = yield Share.open( shareOptions ).then( ( res: any ) => {
          return res;
        } );
        // yield put( dbUpdatePdfSharing( { copy: "copy2", socialMedia: { type: socialMediaType( res.app.split( "/", 1 )[ 0 ] ) }, date: Math.floor( Date.now() / 1000 ) } ) );
        yield put( dbUpdatePdfSharing( { copy: "copy2", socialMedia: { type: "Other" }, date: Math.floor( Date.now() / 1000 ) } ) );
      } else {
        yield Mailer.mail( {
          subject: item.title,
          body: '<b>Please find attached the personal copy 2 share pdf, it is password protected by the answer to the security question.</b>',
          isHTML: true,
          attachment: {
            path: Platform.OS == 'android'
              ? 'file://' + databaseSSS.pdfDetails.copy2.path
              : databaseSSS.pdfDetails.copy2.path,  // The absolute path of the file from which to read data.
            type: 'pdf',   // Mime Type: jpg, png, doc, ppt, html, pdf, csv
            name: item.title,   // Optional: Custom filename for attachment
          }
        }, ( error, event ) => {
          console.log( { event, error } );
        } );
        yield put( dbUpdatePdfSharing( { copy: "copy2", socialMedia: { type: "Email" }, date: Math.floor( Date.now() / 1000 ) } ) );
      }
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
      yield put( dbUpdatePdfSharing( { copy: "copy1", socialMedia: { type: "Print", date: Math.floor( Date.now() / 1000 ) } } ) );
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

    console.log( { updatedBackup } );

    yield put( dbUpdateSSS( updatedBackup ) );
  } catch ( error ) {
    console.log( { error } );
  }
}

export const dbUpdatePdfSharingWatcher = createWatcher( dbUPdatePdfSharingWorker, DBUPDATE_PDF_SEND );