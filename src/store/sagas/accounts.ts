xchangeAxios = axios.create({
  baseURL: 'https://blockchain.info/',
  timeout: 15000, // 15 seconds
});
const res = yield call(exchangeAxios.get, 'ticker');
if (res.status == 200) {
  const exchangeRates = res.data;
  exchangeRates.lastFetched = Date.now();
  yield put(exchangeRatesCalculated(exchangeRates));
  yield call(
    AsyncStorage.setItem,
    'exchangeRates',
    JSON.stringify(exchangeRates),
  );
} else {
  if (res.err === 'ECONNABORTED') requestTimedout();
  console.log('Failed to retrieve exchange rates', res);
}
} catch (err) {
  console.log({ err });
}
}

export const exchangeRateWatcher = createWatcher(
  exchangeRateWorker,
  EXCHANGE_RATE,
);

function* resetTwoFAWorker({ payload }) {
  const service = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );

  const res = yield call(service.resetTwoFA, payload.secondaryMnemonic);

  if (res.status == 200) {
    yield put(twoFAResetted(true));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    console.log('Failed to reset twoFA', res.err);
    yield put(twoFAResetted(false));
  }
}

export const resetTwoFAWatcher = createWatcher(resetTwoFAWorker, RESET_TWO_FA);

function* removeTwoFAWorker() {
  const service: SecureAccount = yield select(
    (state) => state.accounts[SECURE_ACCOUNT].service,
  );

  const { removed } = yield call(service.removeTwoFADetails);

  if (removed) {
    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [SECURE_ACCOUNT]: JSON.stringify(service),
    };

    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    console.log('Failed to remove 2FA details');
  }
}

export const removeTwoFAWatcher = createWatcher(
  removeTwoFAWorker,
  REMOVE_TWO_FA,
);

function* accountsSyncWorker({ payload }) {
  try {
    const accounts = yield select((state) => state.accounts);

    const testService = accounts[TEST_ACCOUNT].service;
    const regularService = accounts[REGULAR_ACCOUNT].service;
    const secureService = accounts[SECURE_ACCOUNT].service;

    // sequential sync
    // yield call(fetchBalanceTxWorker,{
    //   payload: {
    //     serviceType: REGULAR_ACCOUNT,
    //     options: {
    //       service: regularService,
    //       restore: payload.restore,
    //       shouldNotInsert: true,
    //     },
    //   },
    // });

    // yield call(fetchBalanceTxWorker, {
    //   payload: {
    //     serviceType: SECURE_ACCOUNT,
    //     options: {
    //       service: secureService,
    //       restore: payload.restore,
    //       shouldNotInsert: true,
    //     },
    //   },
    // });

    // yield call(fetchBalanceTxWorker, {
    //   payload: {
    //     serviceType: TEST_ACCOUNT,
    //     options: {
    //       service: testService,
    //       restore: payload.restore,
    //       shouldNotInsert: true,
    //     },
    //   },
    // });

    // concurrent sync
    yield all([
      fetchBalanceTxWorker({
        payload: {
          serviceType: TEST_ACCOUNT,
          options: {
            service: testService,
            restore: payload.restore,
            shouldNotInsert: true,
          },
        },
      }),
      fetchBalanceTxWorker({
        payload: {
          serviceType: REGULAR_ACCOUNT,
          options: {
            service: regularService,
            restore: payload.restore,
            shouldNotInsert: true,
          },
        },
      }),
      fetchBalanceTxWorker({
        payload: {
          serviceType: SECURE_ACCOUNT,
          options: {
            service: secureService,
            restore: payload.restore,
            shouldNotInsert: true,
          },
        },
      }),
    ]);

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [TEST_ACCOUNT]: JSON.stringify(testService),
      [REGULAR_ACCOUNT]: JSON.stringify(regularService),
      [SECURE_ACCOUNT]: JSON.stringify(secureService),
    };

    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    yield put(accountsSynched(true));
  } catch (err) {
    console.log({ err });
    yield put(accountsSynched(false));
  }
}

export const accountsSyncWatcher = createWatcher(
  accountsSyncWorker,
  SYNC_ACCOUNTS,
);

function* startupSyncWorker({ payload }) {

  try {
    console.log('Synching accounts...');
    yield call(accountsSyncWorker, { payload });
  } catch (err) {
    console.log('Accounts sync failed: ', err);
  }

  try {
    console.log('Synching derivative accounts...');
    yield call(syncDerivativeAccountsWorker, {
      payload: { serviceTypes: [REGULAR_ACCOUNT, SECURE_ACCOUNT] },
    });
  } catch (err) {
    console.log('Derivative accounts sync failed: ', err);
  }

  yield put(startupSyncLoaded(true))
}

export const startupSyncWatcher = createWatcher(
  startupSyncWorker,
  STARTUP_SYNC,
);

function* setupDonationAccountWorker({ payload }) {
  const {
    serviceType,
    donee,
    subject,
    description,
    configuration,
    disableAccount,
  } = payload;
  const service = yield select((state) => state.accounts[serviceType].service);

  const res = yield call(
    service.setupDonationAccount,
    donee,
    subject,
    description,
    configuration,
    disableAccount,
  );

  if (res.status === 200) {
    console.log({ res });
    if (!res.data.setupSuccessful) {
      yield put(settedDonationAccount(serviceType, false));
      throw new Error('Donation account setup failed');
    }

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
    yield put(settedDonationAccount(serviceType, true));
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error(res.err);
  }
}

export const setupDonationAccountWatcher = createWatcher(
  setupDonationAccountWorker,
  SETUP_DONATION_ACCOUNT,
);

function* updateDonationPreferencesWorker({ payload }) {
  const { serviceType, accountNumber, preferences } = payload;
  const service = yield select((state) => state.accounts[serviceType].service);

  const res = yield call(
    service.updateDonationPreferences,
    accountNumber,
    preferences,
  );

  if (res.status === 200) {
    console.log({ res });

    const { SERVICES } = yield select((state) => state.storage.database);
    const updatedSERVICES = {
      ...SERVICES,
      [serviceType]: JSON.stringify(service),
    };
    yield call(insertDBWorker, { payload: { SERVICES: updatedSERVICES } });
  } else {
    if (res.err === 'ECONNABORTED') requestTimedout();
    throw new Error(res.err);
  }
}

export const updateDonationPreferencesWatcher = createWatcher(
  updateDonationPreferencesWorker,
  UPDATE_DONATION_PREFERENCES,
);