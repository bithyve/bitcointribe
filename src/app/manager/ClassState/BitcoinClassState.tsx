import { AsyncStorage } from "react-native";
import { asyncStorageKeys } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );

//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";
import SecureAccount from "HexaWallet/src/bitcoin/services/accounts/SecureAccount";

const setRegularClassState = async ( value: any ) => {
    value = JSON.stringify( value );
    AsyncStorage.setItem(
        asyncStorageKeys.regularClassObject,
        value
    );
}

const getRegularClassState = async () => {
    let regularClassObject = await AsyncStorage.getItem( asyncStorageKeys.regularClassObject );
    if ( regularClassObject != null ) {
        let regularAccount = RegularAccount.fromJSON( regularClassObject );
        await utils.setRegularAccountObject( regularAccount );
        return regularAccount;
    }
    return null;
}

const setSecureClassState = async ( value: any ) => {
    value = JSON.stringify( value );
    AsyncStorage.setItem(
        asyncStorageKeys.secureClassObject,
        value
    );
}

const getSecureClassState = async () => {
    let secureClassObject = await AsyncStorage.getItem( asyncStorageKeys.secureClassObject );
    if ( secureClassObject != null ) {
        let secureAccount = SecureAccount.fromJSON( secureClassObject );
        await utils.setSecureAccountObject( secureAccount );
        return secureAccount;
    }
    return null;
}

const setS3ServiceClassState = async ( value: any ) => {
    value = JSON.stringify( value );
    AsyncStorage.setItem(
        asyncStorageKeys.s3ServiceClassObject,
        value
    );
}


const getS3ServiceClassState = async () => {
    let setS3ServiceObject = await AsyncStorage.getItem( asyncStorageKeys.s3ServiceClassObject );
    if ( setS3ServiceObject != null ) {
        let s3Service = S3Service.fromJSON( setS3ServiceObject );
        await utils.setS3ServiceObject( s3Service );
        return s3Service;
    }
    return null;
}


module.exports = {
    setRegularClassState,
    getRegularClassState,
    setSecureClassState,
    getSecureClassState,
    setS3ServiceClassState,
    getS3ServiceClassState
}; 