
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

function getMediaType( type ) {
  switch ( type ) {
    case "cloud":
      return Share.Social.GOOGLEPLUS;
    case "email":
      return Share.Social.EMAIL;
    default:
      return Share.Social.PINTEREST
  }
}




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

      if ( type == "Cloud" ) {
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
        yield put( dbUpdatePdfSharing( { copy: "copy1", socialMedia: { type: socialMediaType( res.app.split( "/", 1 )[ 0 ] ), date: Math.floor( Date.now() / 1000 ) } } ) );
        // var uploadUrl = Platform.OS == 'android'
        //   ? 'file://' + databaseSSS.pdfDetails.copy1.path
        //   : databaseSSS.pdfDetails.copy1.path;
        // // For testing purposes, go to http://requestb.in/ and create your own link
        // // create an array of objects of the files you want to upload

        // const files = [
        //   {
        //     name: 'test1',
        //     filename: 'test1.w4a',
        //     filepath: uploadUrl,
        //     filetype: 'application/pdf'
        //   }
        // ];

        // const uploadBegin = ( response ) => {
        //   var jobId = response.jobId;
        //   console.log( 'UPLOAD HAS BEGUN! JobId: ' + jobId );
        // };

        // const uploadProgress = ( response ) => {
        //   var percentage = Math.floor( ( response.totalBytesSent / response.totalBytesExpectedToSend ) * 100 );
        //   console.log( 'UPLOAD IS ' + percentage + '% DONE!' );
        // };

        // // upload files
        // RNFS.uploadFiles( {
        //   toUrl: uploadUrl,
        //   files: files,
        //   method: 'POST',
        //   headers: {
        //     'Accept': 'application/pdf',
        //   },
        //   begin: uploadBegin,
        //   progress: uploadProgress
        // } ).promise.then( ( response ) => {
        //   if ( response.statusCode == 200 ) {
        //     console.log( 'FILES UPLOADED!' ); // response.statusCode, response.headers, response.body
        //   } else {
        //     console.log( 'SERVER ERROR' );
        //   }
        // } )
        //   .catch( ( err ) => {
        //     if ( err.description === "cancelled" ) {
        //       // cancelled by user
        //     }
        //     console.log( err );
        //   } );
      } else {
        let res = Mailer.mail( {
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
          return event;
        } );
        yield put( dbUpdatePdfSharing( { copy: "copy1", socialMedia: { type: "Email", date: Math.floor( Date.now() / 1000 ) } } ) );
      }
    } else if ( item.type == 'copy2' && type != "Print" ) {
      if ( type == "Cloud" ) {
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
        yield put( dbUpdatePdfSharing( { copy: "copy2", socialMedia: { type: socialMediaType( res.app.split( "/", 1 )[ 0 ] ) }, date: Math.floor( Date.now() / 1000 ) } ) );
      } else {
        let res = Mailer.mail( {
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
          return event;
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