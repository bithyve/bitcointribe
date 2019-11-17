import { call, put, select } from "redux-saga/effects";
import { createWatcher } from "../utils/watcher-creator";
import config from '../../bitcoin/Config';
import {
    SETUP_SECUREACCOUNT,
    secureAccountSetup,
    CHECK_HEALTH,
    healthCheck,
    IS_ACTIVE,
    activated,
  } from "../actions/secureAccount-setup";
import { Services, Database } from "../../common/interfaces/Interfaces";
import { insertIntoDB } from "../actions/storage";
  function* setupSecureAccountWorker({ payload }) {
    try {
    const services: Services = yield select(state => state.storage.services);
    const res = yield call(services[payload.accountType].setupSecureAccount);
    console.log("secureAcc setup 1");
    console.log(services[payload.accountType]);
    res.status === 200
      ? yield put(secureAccountSetup( payload.accountType,res))
      : null;
    console.log("here->");
    console.log(res.data.setupData); 

    const secureAccSetupData = res.data.setupData;
    const accounts = {
      SECURE_ACCOUNT: res,
    }
    const toBeInserted = {
      secureAccSetupData,
      accounts
      };
      yield put(insertIntoDB(toBeInserted));
      console.log("secureAcc setup 2");
      console.log(services[payload.accountType]);
     
    }catch (err) {
      console.log(err);
    }
    } 
  
  export const setupSecureAccountWatcher = createWatcher(setupSecureAccountWorker, SETUP_SECUREACCOUNT);

  
  function* checkHealthWorker({ payload }) {
    try {
    let chunk;
    const POS = 1;
    const database: Database = yield select(state => state.storage.database);
    let {secureAccSetupData} = database;
    console.log(database);
    const secret = secureAccSetupData.secret;
   
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
    }catch (err) {
      console.log(err);
    }
    }
   
  
  export const checkHealthtWatcher = createWatcher(checkHealthWorker, CHECK_HEALTH);

  function* isActiveWorker ({ payload }) {
    try {
    const services: Services = yield select(state => state.storage.services);
    const res = yield call(services[payload.accountType].isActive);
    res.status === 200
      ? yield put(activated(payload.accountType,res.data))
      : null;
      const secureAccIsActive = res.data.isActive;
      const toBeInserted = {
        secureAccIsActive
        };
        yield put(insertIntoDB(toBeInserted));
        console.log(res.data.isActive);
    }catch (err) {
      console.log(err);
    } 
  }
  export const isActiveWatcher = createWatcher(isActiveWorker, IS_ACTIVE);

  