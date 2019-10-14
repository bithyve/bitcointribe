import { select, put } from "redux-saga/effects";
import { sagaWatcherHelper, getPriority } from "../utils";

var bitcoinClassState = require( "hexaClassState" );
var utils = require( "hexaUtils" );

// Types
const SEND_AMOUNT_T1 = "SEND_AMOUNT_T1";
const UPDATE_DATA_T1 = "UPDATE_DATA_T1";

const INITIAL_STATE = {
    sendAmountDataT1: {}
};


// Actions
export const onSendAmountT1 = ( args ) => {
    return {
        type: SEND_AMOUNT_T1,
        ...args
    };
};


//Reducers
export const paymentReducer = ( state = INITIAL_STATE, action: any ) => {
    console.log( action );
    switch ( action.type ) {
        case UPDATE_DATA_T1:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};


function* workerOnSendAmountT1( action ) {
    const { classStateReducer } = yield select( state => state );
    try {
        const { arr_SelectAccountDetails, address, amount, tranPrio, memo } = action;
        const { regularAccount, secureAccount } = classStateReducer;
        console.log( { regularAccount, secureAccount } );
        let amountFloat = parseFloat( amount );
        let priority = getPriority( tranPrio );
        let walletDetails = yield utils.getWalletDetails();
        var resTransferST;
        if ( arr_SelectAccountDetails.accountName == "Regular Account" ) {
            resTransferST = yield regularAccount.transferST1( address, amountFloat, priority );
            yield bitcoinClassState.setRegularClassState( regularAccount );
        } else {
            resTransferST = yield secureAccount.transferST1( address, amountFloat, priority );
            yield bitcoinClassState.setSecureClassState( secureAccount );
        }
        yield put( {
            type: UPDATE_DATA_T1,
            payload: {
                sendAmountDataT1: {
                    mnemonic: walletDetails.mnemonic,
                    amount,
                    respAddress: address,
                    bal: arr_SelectAccountDetails.balance,
                    accountName: arr_SelectAccountDetails.accountName,
                    memo,
                    priority: priority,
                    tranFee: resTransferST.data.fee.toString(),
                    selectedAccount: arr_SelectAccountDetails,
                    resTransferST: resTransferST
                }
            }
        } )
    } catch ( e ) {
        console.log( "error", e )
    }
}



export const watcherOnSendAmountT1 = sagaWatcherHelper( workerOnSendAmountT1, SEND_AMOUNT_T1 ); 