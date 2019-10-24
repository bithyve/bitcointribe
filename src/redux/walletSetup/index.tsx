import { select, put } from 'redux-saga/effects';
import { sagaWatcherHelper } from '../utils';

import { localDB } from 'hexaConstants';
var dbOpration = require('hexaDBOpration');

// Types
const ADD_ACCOUTNS = 'ADD_NEW_ACCOUTNS';
const UPDATE_ACCOUNTS = 'UPDATE_NEW_ACCOUNTS';

const INITIAL_STATE = {};

//  Action
export const addAccounts = args => {
  return {
    type: ADD_ACCOUTNS,
    ...args,
  };
};

// Reducers
export const walletSetupReducer = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case UPDATE_ACCOUNTS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Worker
function* workerAddAccounts(action) {
  const { accountsSetupReducer } = yield select(state => state);
  try {
    const { dateTime, question, answer, walletName } = action;
    const {
      mnemonic,
      regularAccount,
      secureAccount,
      sss,
    } = accountsSetupReducer;

    // setup Check Health
    //  let updateShareIdStatus = yield comAppHealth.checkHealthSetupShare( dateTime );
    //  if ( updateShareIdStatus != "" ) {
    //      let arrQustionList = [];
    //      let questionData = {};
    //      questionData.Question = question;
    //      questionData.Answer = answer;
    //      arrQustionList.push( questionData );
    //      let arrBackupInfo = [ { backupType: "new" }, { backupMethod: "share" } ];
    //      let resInsertWallet = yield dbOpration.insertWallet(
    //          localDB.tableName.tblWallet,
    //          dateTime,
    //          mnemonic,
    //          "",
    //          "",
    //          "",
    //          walletName,
    //          arrBackupInfo,
    //          arrQustionList,
    //          updateShareIdStatus
    //      );
    //      yield comFunDBRead.readTblWallet();
    //      let resInsertCreateAcc = yield dbOpration.insertCreateAccount(
    //          localDB.tableName.tblAccount,
    //          dateTime,
    //          "",
    //          "0",
    //          "BTC",
    //          "Regular Account",
    //          "Regular Account",
    //          ""
    //      );
    //      let resInsertSecureCreateAcc = yield dbOpration.insertCreateAccount(
    //          localDB.tableName.tblAccount,
    //          dateTime,
    //          "",
    //          "0",
    //          "BTC",
    //          "Secure Account",
    //          "Secure Account",
    //          ""
    //      );
    //      let resDeleteTableData = yield dbOpration.deleteTableData(
    //          localDB.tableName.tblSSSDetails
    //      );
    //      if ( resInsertWallet && resInsertSecureCreateAcc && resInsertCreateAcc && resDeleteTableData ) {
    //          this.props.writeAccountsState( { regularAccount, secureAccount, sss } );
    //      }
    // }
  } catch (error) {
    console.log('error', error);
  }
}

// Watcher
export const watcherAddAccounts = sagaWatcherHelper(
  workerAddAccounts,
  ADD_ACCOUTNS,
);
