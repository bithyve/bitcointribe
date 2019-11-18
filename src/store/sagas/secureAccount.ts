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
    SECURE_FETCH_ADDR,
    secureAddressFetched,
    SECURE_FETCH_BALANCE,
    secureBalanceFetched,
    SECURE_FETCH_TRANSACTIONS,
    secureTransactionsFetched,
  } from "../actions/secureAccount";
import { insertIntoDB } from "../actions/storage";
function* setupSecureAccountWorker({ payload }) {
    try {
      const service = yield select(
        state => state.accounts[payload.serviceType].service
      );
      const res = yield call(service.setupSecureAccount);
    if(res.status === 200)
      {
      yield put(secureAccountSetup( payload.serviceType,res.data.setupData));
      yield put(insertIntoDB({ SECURE_ACCOUNT: JSON.stringify(service) }));
      yield put(insertIntoDB({secureAccSetupData:res.data.setupData}));  
    } else {
        console.log({ err: res.err });
      } 
    console.log(res.data.setupData);
    }catch (err) {
      console.log(err);
    }
    } 
  
  export const setupSecureAccountWatcher = createWatcher(setupSecureAccountWorker, SETUP_SECUREACCOUNT);

  
  function* checkHealthWorker({ payload }) {
    try {
    let chunk;
    const POS = 1;
    const service = yield select(
      state => state.accounts[payload.serviceType].service
    );
    const {secret} = yield select(state => state.storage.database.secureAccSetupData);   
    if (POS === 1) {
      chunk = secret.slice(0, config.SCHUNK_SIZE);
    } else if (POS === -1) {
      chunk = secret.slice(
        secret.length - config.SCHUNK_SIZE,
      );
    }
    const res = yield call(service.checkHealth,chunk, POS);
    console.log(res);
    res.status === 200
      ? yield put(healthCheck(payload.serviceType,res.data))
      : null;
    }catch (err) {
      console.log(err);
    }
    } 
  export const checkHealthtWatcher = createWatcher(checkHealthWorker, CHECK_HEALTH);

  function* isActiveWorker ({ payload }) {
    try {
      const service = yield select(
        state => state.accounts[payload.serviceType].service
      );
      const res = yield call(service.isActive);
      res.status === 200
      ? yield put(activated(payload.serviceType,res.data))
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

  function* secureFetchAddrWorker({ payload }) {
    try{
    // yield put(switchLoader(payload.serviceType, "receivingAddress"));
    const service = yield select(
      state => state.accounts[payload.serviceType].service
    );
    console.log("address");
    console.log(service);
    const preFetchAddress = service.secureHDWallet.receivingAddress;
    const res = yield call(service.getAddress);
    const postFetchAddress =
      res.status === 200 ? res.data.address : preFetchAddress;
  
    if (
      res.status === 200 &&
      JSON.stringify(preFetchAddress) !== JSON.stringify(postFetchAddress)
    ) {
      yield put(secureAddressFetched(payload.serviceType, postFetchAddress));
    } else {
      // yield put(switchLoader(payload.serviceType, "receivingAddress"));
    }
    console.log(res.data.address);
  }catch(err){
  console.log(err);
  }
  }
export const secureFetchAddrWatcher = createWatcher(secureFetchAddrWorker, SECURE_FETCH_ADDR);

function* secureFetchBalanceWorker({ payload }) {
  try{
  // yield put(switchLoader(payload.serviceType, "balances"));
  const service = yield select(
    state => state.accounts[payload.serviceType].service
  );

  const preFetchBalances = service.secureHDWallet.balances;
  const res = yield call(service.getBalance);
  const postFetchBalances = res.status === 200 ? res.data : preFetchBalances;

  if (
    res.status === 200 &&
    JSON.stringify(preFetchBalances) !== JSON.stringify(postFetchBalances)
  ) {
    yield put(secureBalanceFetched(payload.serviceType, postFetchBalances));
    yield put(
      insertIntoDB({
        [payload.serviceType]: JSON.stringify(service)
      })
    );
  } else {
    // yield put(switchLoader(payload.serviceType, "balances"));
  }
  console.log(res.data);
}catch(err){
  console.log(err);
}
}

export const secureFetchBalanceWatcher = createWatcher(
  secureFetchBalanceWorker,
  SECURE_FETCH_BALANCE
);

function* secureFetchTransactionsWorker({ payload }) {
  try{
  // yield put(switchLoader(payload.serviceType, "transactions"));
  const service = yield select(
    state => state.accounts[payload.serviceType].service
  );

  const preFetchTransactions = service.secureHDWallet.transactions;
  const res = yield call(service.getTransactions);
  const postFetchTransactions =
    res.status === 200 ? res.data.transactions : preFetchTransactions;
  console.log({ preFetchTransactions, postFetchTransactions });

  if (
    res.status === 200 &&
    JSON.stringify(preFetchTransactions) !==
      JSON.stringify(postFetchTransactions)
  ) {
    yield put(secureTransactionsFetched(payload.serviceType, postFetchTransactions));
    yield put(
      insertIntoDB({
        [payload.serviceType]: JSON.stringify(service)
      })
    );
  } else {
    // yield put(switchLoader(payload.serviceType, "transactions"));
  }
  console.log(res.data.transactions);
}catch(err){
  console.log(err);  
}
}

export const secureFetchTransactionsWatcher = createWatcher(
  secureFetchTransactionsWorker,
  SECURE_FETCH_TRANSACTIONS
);
