import { put } from "redux-saga/effects";
import { sagaWatcherHelper } from "../utils";

//TODO: Bitcoin Class
var bitcoinClassState = require( "hexaClassState" );

const READ_CLASSSTATE = "READ_CLASSSTATE";
const UPDATE_CLASSSTATE = "UPDATE_CLASSSTATE";



const INITIAL_STATE = {
    regularAccount: undefined,
    secureAccount: undefined,
    sss: undefined
};


// Actions
export const readClassState = () => {
    return {
        type: READ_CLASSSTATE,
    };
};

// Reducers
export const classStateReducer = ( state = INITIAL_STATE, action: any ) => {
    console.log( { callsStateReducer: { state, action } } );
    switch ( action.type ) {
        case UPDATE_CLASSSTATE:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

// Sagas
function* workerReadClassState() {
    try {
        const regularAccount = yield bitcoinClassState.getRegularClassState();
        const secureAccount = yield bitcoinClassState.getSecureClassState();
        const sss = yield bitcoinClassState.getS3ServiceClassState();
        yield put( {
            type: UPDATE_CLASSSTATE,
            payload: { regularAccount, secureAccount, sss }
        } );

    } catch ( e ) {
        console.log( "error", e )
    }
}

export const watcherClassState = sagaWatcherHelper( workerReadClassState, READ_CLASSSTATE );



