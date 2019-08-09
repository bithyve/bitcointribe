import {
    localDB
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );

const readTblWallet = async () => {
    var resultWallet = await dbOpration.readTablesData(
        localDB.tableName.tblWallet
    );
    resultWallet = resultWallet.temp[ 0 ];
    await utils.setWalletDetails( resultWallet );
    return resultWallet;
}

const readTblAccount = async () => {
    var resAccount = await dbOpration.readTablesData(
        localDB.tableName.tblAccount
    );
    resAccount = resAccount.temp;
    return resAccount;
}

const readTblSSSDetails = async () => {
    var resSSSDetails = await dbOpration.readTablesData(
        localDB.tableName.tblSSSDetails
    );
    resSSSDetails = resSSSDetails.temp;
    //console.log( { resSSSDetails } );
    await utils.setSSSDetails( resSSSDetails );
    return resSSSDetails;
}

const readTblTransaction = async () => {
    var resTranList = await dbOpration.readTablesData(
        localDB.tableName.tblTransaction
    );
    return resTranList.temp;
}


const readTblTrustedPartySSSDetails = async () => {
    var resSharedSecretList = await dbOpration.readTablesData(
        localDB.tableName.tblTrustedPartySSSDetails
    );
    resSharedSecretList = resSharedSecretList.temp;
    return resSharedSecretList;
}



module.exports = {
    readTblWallet,
    readTblAccount,
    readTblSSSDetails,
    readTblTransaction,
    readTblTrustedPartySSSDetails
};