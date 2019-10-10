import { select, put } from "redux-saga/effects";
import { sagaWatcherHelper } from "./controller";

// Types
const CREATE_SSS = "CREATE_SSS";
const UPDATE_SSS = "UPDATE_SSS";

const INITIAL_STATE = {
    sss: undefined
};

// Actions

export const createSSS = () => {
    return {
        type: CREATE_SSS
    };
};


// Reducers
export const walletReducer = ( state = INITIAL_STATE, action: any ) => {
    switch ( action.type ) {
        case UPDATE_SSS:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};


// Sagas

function* workerSSS() {
    const { walletReducer } = yield select( state => state );
    try {
        const { mnemonic } = walletReducer;
        const sss = new S3Service( mnemonic );
        yield put( {
            type: UPDATE_SSS,
            payload: { sss }
        } );
    } catch ( e ) {
        console.log( "error", e )
    }
}


export const watcherSSS = sagaWatcherHelper( workerSSS, CREATE_SSS );