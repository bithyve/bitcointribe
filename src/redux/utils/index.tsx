import { take, fork } from 'redux-saga/effects';
// @ts-ignore
import bip39 from 'react-native-bip39';


export const createMnemonic = async () => {
    try {
        const mnemonic = await bip39.generateMnemonic( 256 );
        return mnemonic;
    } catch ( e ) {
        return undefined;
    }
}

export const sagaWatcherHelper = function ( worker: any, type: any ) {
    return function* () {
        while ( true ) {
            const action = yield take( type );
            yield fork( worker, action );
        }
    };
};