import { applyMiddleware, createStore, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { all, fork } from 'redux-saga/effects';

// Import from ReduxDucks.    

//TODO: Class State
import {
    readAccountsState,
    writeAccountsState,
    writeRegularAccount,
    writeSecureAccount,
    writeSSSAccount,
    accountsStateReducer,
    watcherReadAccountsState,
    watcherWriteAccountsState,
    watcherWriteRegularAccountState,
    watcherWriteSecureAccountState,
    watcherWriteSSSAccountState
} from "./accountsState";

//TODO: Wallet (Account Create)
import {
    setupAccounts,
    accountsSetupReducer,
    watcherSetupAccounts,
} from './accountsSetup';

//TODO: Payment (Send and Receive)
import {
    onSendAmountT1,
    onSendAmountT2,
    onSendAmountT3,
    paymentReducer,
    watcherOnSendAmountT1,
    watcherOnSendAmountT2,
    watcherOnSendAmountT3
} from './payment';

const reducers = combineReducers( {
    accountsStateReducer,
    accountsSetupReducer,
    paymentReducer
} );


const rootSaga = function* () {
    yield all( [
        fork( watcherSetupAccounts ),

        fork( watcherOnSendAmountT1 ),
        fork( watcherOnSendAmountT2 ),
        fork( watcherOnSendAmountT3 ),

        fork( watcherReadAccountsState ),
        fork( watcherWriteAccountsState ),
        fork( watcherWriteRegularAccountState ),
        fork( watcherWriteSecureAccountState ),
        fork( watcherWriteSSSAccountState ),


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
    readAccountsState,
    writeAccountsState,
    writeRegularAccount,
    writeSecureAccount,
    writeSSSAccount,

    //accountSetup   
    setupAccounts,

    //payment   
    onSendAmountT1,
    onSendAmountT2,
    onSendAmountT3
};      