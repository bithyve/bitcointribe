import { applyMiddleware, createStore, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { all, fork } from 'redux-saga/effects';

// Import from ReduxDucks.    
import {
    setupAccounts,
    createRegularAccount,
    createSecureAccount,
    createSSS,
    walletReducer,
    watcherSetupAccounts,
    watcherRegularAccount,
    watcherSecureAccount,
    watcherSSS
} from './wallet';

import {
    onSendAmountT1,
    paymentReducer,
    watcherOnSendAmountT1
} from './payment';

const reducers = combineReducers( { walletReducer, paymentReducer } );

const rootSaga = function* () {
    yield all( [
        fork( watcherSetupAccounts ),
        fork( watcherRegularAccount ),
        fork( watcherSecureAccount ),
        fork( watcherSSS ),
        fork( watcherOnSendAmountT1 )
    ] );
};

const middleWare = [];

// Setup Redux-Saga
const sagaMiddleware = createSagaMiddleware();
middleWare.push( sagaMiddleware );

const store = createStore( reducers, {}, composeWithDevTools( applyMiddleware( ...middleWare ) ) );

// Initiate root saga.
sagaMiddleware.run( rootSaga );

export {
    store,
    //wallet
    setupAccounts,
    createRegularAccount,
    createSecureAccount,
    createSSS,
    //payment
    onSendAmountT1
};