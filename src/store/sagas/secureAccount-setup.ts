import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import config from '../../bitcoin/Config';
import {
    SETUP_SECUREACCOUNT,
    secureAccountSetup,
    CHECK_HEALTH,
    healthCheck,
  } from "../actions/secureAccount-setup";
import { Services, Database } from "../../common/interfaces/Interfaces";
import { insertIntoDB,fetchFromDB } from "../actions/storage";
import { useSelector } from "react-redux";

  function* setupSecureAccountWorker({ payload }) {
    try {
    const services: Services = yield select(state => state.storage.services);
    const res = yield call(services[payload.accountType].setupSecureAccount);
 
    res.status === 200
      ? yield put(secureAccountSetup( payload.accountType,res.data.setupData))
      : null;
      
    const secureAccSetupData = res.data.setupData;
    const toBeInserted = {
      secureAccSetupData
      };
      yield put(insertIntoDB(toBeInserted));
     
    }catch (err) {
      console.log(err);
    }
    } 
  
  export const setupSecureAccountWatcher = createWatcher(setupSecureAccountWorker, SETUP_SECUREACCOUNT);

  
  function* checkHealthWorker({ payload }) {
    let chunk;
    const POS = 1;
    const database: Database = yield select(state => state.storage.database);
    let {secureAccSetupData} = database;
    console.log(database);
    const secret = secureAccSetupData.secret;
    // const secret= yield call(dataManager.fetch, key);
    if (POS === 1) {
      chunk = secret.slice(0, config.SCHUNK_SIZE);
    } else if (POS === -1) {
      chunk = secret.slice(
        secret.length - config.SCHUNK_SIZE,
      );
    }
    const services: Services = yield select(state => state.storage.services);
    const res = yield call(services[payload.accountType].checkHealth,chunk, POS);
    console.log(res);
    res.status === 200
      ? yield put(healthCheck(payload.accountType,res.data))
      : null;
    }
   
  
  export const checkHealthtWatcher = createWatcher(checkHealthWorker, CHECK_HEALTH);