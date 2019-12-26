import { call, put, select, delay } from 'redux-saga/effects';
import { createWatcher } from '../utils/utilities';
import { SHARE_PDF } from '../actions/manageBackup';
import Share from 'react-native-share';

function* sharePdfWorker({ payload }) {
  const { databaseSSS } = yield select(state => state.storage);
  console.log({ databaseSSS });

  try {
    console.log({ payload });
    let shareOptions = {
      title: '5th share',
      message:
        'Please find attached the 5th share pdf, it is password protected by the answer to the security question.',
      url: databaseSSS.pdfDetails.personalCopy1PdfPath,
      type: 'application/pdf',
      showAppsToView: true,
      subject: '5th share pdf',
    };
    // console.log( { shareOptions } );
    yield Share.open(shareOptions).then((res: any) => {
      console.log({ res });
    });
  } catch (error) {
    console.log({ error });
  }
}

export const sharePdfWatcher = createWatcher(sharePdfWorker, SHARE_PDF);
