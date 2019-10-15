import { AsyncStorage } from "react-native";
import { put } from "redux-saga/effects";
import { sagaWatcherHelper } from "../utils";
import { asyncStorageKeys } from "hexaConstants";



//TODO: Bitcoin Files
import { S3Service, RegularAccount, SecureAccount } from "hexaBitcoin";

// Types
const WRITE_ACCOUNTSSTATE = "WRITE_ACCOUNTSSTATE";
const READ_ACCOUNTSSTATE = "READ_ACCOUNTSSTATE";
const UPDATE_ACCOUNTSSTATE = "UPDATE_ACCOUNTSSTATE";



const INITIAL_STATE = {
    regularAccount: undefined,
    secureAccount: undefined,
    sss: undefined
};


// Actions
export const readAccountsState = () => {
    return {
        type: READ_ACCOUNTSSTATE,
    };
};

export const writeAccountState = ( args ) => {
    return {
        type: WRITE_ACCOUNTSSTATE,
        ...args
    }
}

// Reducers
export const accountsStateReducer = ( state = INITIAL_STATE, action: any ) => {
    console.log( { callsStateReducer: { state, action } } );
    switch ( action.type ) {
        case UPDATE_ACCOUNTSSTATE:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

// Sagas
function* workerReadAccountsState() {
    try {
        let regularClassObject = yield AsyncStorage.getItem( asyncStorageKeys.regularClassObject );
        let secureClassObject = yield AsyncStorage.getItem( asyncStorageKeys.secureClassObject );
        let setS3ServiceObject = yield AsyncStorage.getItem( asyncStorageKeys.s3ServiceClassObject );
        const regularAccount = yield RegularAccount.fromJSON( regularClassObject );
        const secureAccount = yield SecureAccount.fromJSON( secureClassObject );
        const sss = yield S3Service.fromJSON( setS3ServiceObject );
        yield put( {
            type: UPDATE_ACCOUNTSSTATE,
            payload: { regularAccount, secureAccount, sss }
        } );

    } catch ( e ) {
        console.log( "error", e )
    }
}

function* workerWriteAccountsState( action ) {
    try {
        var { regularAccount, secureAccount, sss } = action;
        regularAccount = JSON.stringify( regularAccount );
        yield AsyncStorage.setItem(
            asyncStorageKeys.regularClassObject,
            regularAccount
        );
        secureAccount = JSON.stringify( secureAccount );
        yield AsyncStorage.setItem(
            asyncStorageKeys.secureClassObject,
            secureAccount
        );
        sss = JSON.stringify( sss );
        yield AsyncStorage.setItem(
            asyncStorageKeys.s3ServiceClassObject,
            sss
        );
        yield put( {
            type: UPDATE_ACCOUNTSSTATE,
            payload: { regularAccount, secureAccount, sss }
        } );
    } catch ( error ) {
        console.log( "error", error )
    }
}

export const watcherReadAccountsState = sagaWatcherHelper( workerReadAccountsState, READ_ACCOUNTSSTATE );
export const watcherWriteAccountsState = sagaWatcherHelper( workerWriteAccountsState, WRITE_ACCOUNTSSTATE );


