import { put } from "redux-saga/effects";
import { sagaWatcherHelper } from "../utils";
import { asyncStorageKeys } from "hexaConstants";
import { getAsyncStorageValue, setAsyncStorageValue } from "hexaRedux/dbManager/asyncStorage";


//TODO: Bitcoin Files
import { S3Service, RegularAccount, SecureAccount } from "hexaBitcoin";

// Types
const WRITE_ACCOUNTS_STATE = "WRITE_ACCOUNTS_STATE";
const WRITE_REGUALR_ACCOUNT_STATE = "WRITE_REGUALR_ACCOUNT_STATE";
const WRITE_SECURE_ACCOUNT_STATE = "WRITE_SECURE_ACCOUNT_STATE";
const WRITE_SSS_ACCOUNT_STATE = "WRITE_SSS_ACCOUNT_STATE";
const READ_ACCOUNTS_STATE = "READ_ACCOUNTS_STATE";
const UPDATE_ACCOUNTS_STATE = "UPDATE_ACCOUNTS_STATE";


const INITIAL_STATE = {
    regularAccount: undefined,
    secureAccount: undefined,
    sss: undefined
};

// Actions
export const readAccountsState = () => {
    return {
        type: READ_ACCOUNTS_STATE,
    };
};

export const writeAccountsState = ( args ) => {
    return {
        type: WRITE_ACCOUNTS_STATE,
        ...args
    }
}


export const writeRegularAccount = ( args ) => {
    return {
        type: WRITE_REGUALR_ACCOUNT_STATE,
        ...args
    }
}

export const writeSecureAccount = ( args ) => {
    return {
        type: WRITE_SECURE_ACCOUNT_STATE,
        ...args
    }
}

export const writeSSSAccount = ( args ) => {
    return {
        type: WRITE_SSS_ACCOUNT_STATE,
        ...args
    }
}


// Reducers
export const accountsStateReducer = ( state = INITIAL_STATE, action: any ) => {
    console.log( { accountsStates: { state, action } } );
    switch ( action.type ) {
        case UPDATE_ACCOUNTS_STATE:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

// Sagas
function* workerReadAccountsState() {
    try {
        let regularClassObject = yield getAsyncStorageValue( asyncStorageKeys.regularClassObject );
        let secureClassObject = yield getAsyncStorageValue( asyncStorageKeys.secureClassObject );
        let setS3ServiceObject = yield getAsyncStorageValue( asyncStorageKeys.s3ServiceClassObject );
        const regularAccount = yield RegularAccount.fromJSON( regularClassObject );
        const secureAccount = yield SecureAccount.fromJSON( secureClassObject );
        const sss = yield S3Service.fromJSON( setS3ServiceObject );
        yield put( {
            type: UPDATE_ACCOUNTS_STATE,
            payload: { regularAccount, secureAccount, sss }
        } );

    } catch ( e ) {
        console.log( "error", e )
    }
}

function* workerWriteAccountsState( action ) {
    try {

        var { regularAccount, secureAccount, sss } = action;
        yield put( {
            type: UPDATE_ACCOUNTS_STATE,
            payload: { regularAccount, secureAccount, sss }
        } );

        regularAccount = JSON.stringify( regularAccount );
        yield setAsyncStorageValue(
            asyncStorageKeys.regularClassObject,
            regularAccount
        );

        secureAccount = JSON.stringify( secureAccount );
        yield setAsyncStorageValue(
            asyncStorageKeys.secureClassObject,
            secureAccount
        );

        sss = JSON.stringify( sss );
        yield setAsyncStorageValue(
            asyncStorageKeys.s3ServiceClassObject,
            sss
        );
    } catch ( error ) {
        console.log( "error", error )
    }
}

function* workerWriteRegularAccountState( action ) {
    try {
        var { regularAccount } = action;
        yield put( {
            type: UPDATE_ACCOUNTS_STATE,
            payload: { regularAccount }
        } );
        yield setAsyncStorageValue(
            asyncStorageKeys.regularClassObject,
            regularAccount
        );
    } catch ( error ) {
        console.log( "error", error )
    }
}

function* workerWriteSecureAccountState( action ) {
    try {
        var { secureAccount } = action;
        yield put( {
            type: UPDATE_ACCOUNTS_STATE,
            payload: { secureAccount }
        } );
        yield setAsyncStorageValue(
            asyncStorageKeys.secureClassObject,
            secureAccount
        );
    } catch ( error ) {
        console.log( "error", error )
    }
}

function* workerWriteSSSAccountState( action ) {
    try {
        var { sss } = action;
        yield put( {
            type: UPDATE_ACCOUNTS_STATE,
            payload: { sss }
        } );
        yield setAsyncStorageValue(
            asyncStorageKeys.s3ServiceClassObject,
            sss
        );
    } catch ( error ) {
        console.log( "error", error )
    }
}

export const watcherReadAccountsState = sagaWatcherHelper( workerReadAccountsState, READ_ACCOUNTS_STATE );
export const watcherWriteAccountsState = sagaWatcherHelper( workerWriteAccountsState, WRITE_ACCOUNTS_STATE );


export const watcherWriteRegularAccountState = sagaWatcherHelper( workerWriteRegularAccountState, WRITE_REGUALR_ACCOUNT_STATE );
export const watcherWriteSecureAccountState = sagaWatcherHelper( workerWriteSecureAccountState, WRITE_SECURE_ACCOUNT_STATE );
export const watcherWriteSSSAccountState = sagaWatcherHelper( workerWriteSSSAccountState, WRITE_SSS_ACCOUNT_STATE );   