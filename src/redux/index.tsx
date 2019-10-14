import { applyMiddleware, createStore, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { all, fork } from 'redux-saga/effects';

// Import from ReduxDucks.    

//TODO: Class State
import {
    readClassState,
    classStateReducer,
    watcherClassState
} from "./classState";

//TODO: Wallet (Account Create)
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

//TODO: Payment (Send and Receive)
import {
    onSendAmountT1,
    onSendAmountT2,
    paymentReducer,
    watcherOnSendAmountT1,
    watcherOnSendAmountT2
} from './payment';

const reducers = combineReducers( {
    classStateReducer,
    walletReducer,
    paymentReducer
} );


const rootSaga = function* () {
    yield all( [
        fork( watcherSetupAccounts ),
        fork( watcherRegularAccount ),
        fork( watcherSecureAccount ),
        fork( watcherSSS ),
        fork( watcherOnSendAmountT1 ),
        fork( watcherOnSendAmountT2 ),
        fork( watcherClassState )
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
    //classState  
    readClassState,
    //wallet
    setupAccounts,
    createRegularAccount,
    createSecureAccount,
    createSSS,
    //payment   
    onSendAmountT1,
    onSendAmountT2
};