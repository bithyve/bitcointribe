import {
    localDB
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );
//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import HealthStatus from "HexaWallet/src/bitcoin/utilities/HealthStatus"




//TODO: func connection_AppHealthStatus (WalletScreen,TrustedContactScreen)
const connection_AppHealthStatus = async ( qatime: number, satime: number, encrShares: any, mnemonic: any ) => {
    console.log( { qatime, satime, encrShares, mnemonic } );
    const dateTime = Date.now();
    // const fulldate = Math.floor( dateTime / 1000 );
    const sss = new S3Service(
        mnemonic
    );
    var resCheckHealth = await sss.checkHealth( encrShares );
    resCheckHealth = resCheckHealth.lastUpdateds;
    console.log( "Initializing HealthStatuss" )
    const healthStatus = new HealthStatus();
    console.log( { qatime, satime, resCheckHealth } );

    const res = await healthStatus.appHealthStatus( qatime, satime, resCheckHealth, 0, "share" );
    console.log( { res } );
    await utils.setAppHealthStatus( res )
    //console.log( { res } );
    let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
        localDB.tableName.tblWallet,
        res
    );
    // console.log( { resupdateWalletDetials } );
    let resupdateSSSShareStage = await dbOpration.updateSSSShareStage(
        localDB.tableName.tblSSSDetails,
        res.sharesInfo,
        dateTime
    );
    //console.log( { resupdateSSSShareStage } );
    return resupdateSSSShareStage;
    // console.log( { resupdateSSSShareStage } );
    // console.log( { resupdateWalletDetials } );
    // console.log( { res } );
}


const connection_AppHealthStatusUpdateUsingRetoreWalletTrustedContact = async ( qatime: number, satime: number, encrShares: any, mnemonic: any, arr_RecordId: any ) => {
    //  console.log( { qatime, satime, encrShares, mnemonic } );
    const dateTime = Date.now();
    const sss = new S3Service(
        mnemonic
    );
    var resCheckHealth = await sss.checkHealth( encrShares );
    resCheckHealth = resCheckHealth.lastUpdateds;
    if ( resCheckHealth.length == 2 ) {
        let data = {};
        data.shareId = "0";
        data.updatedAt = 0;
        resCheckHealth.push( data );
    }
    //console.log( { resCheckHealth } );
    const healthStatus = new HealthStatus();
    const res = await healthStatus.appHealthStatus( qatime, satime, resCheckHealth, 0, "share" );
    // console.log( { res } );
    await utils.setAppHealthStatus( res )
    //console.log( { res } );
    let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
        localDB.tableName.tblWallet,
        res
    );
    //console.log( { resupdateWalletDetials } );
    let resupdateSSSShareStage = await dbOpration.updateSSSShareStageWhereRecordId(
        localDB.tableName.tblSSSDetails,
        res.sharesInfo,
        arr_RecordId,
        dateTime
    );
    // console.log( { resupdateSSSShareStage } );
    return resupdateSSSShareStage;
    // console.log( { resupdateSSSShareStage } );
    // console.log( { resupdateWalletDetials } );
    // console.log( { res } );
}

const check_AppHealthStausUsingMnemonic = async ( qatime: number, satime: number, shares: any, mnemonicTime: any ) => {
    const healthStatus = new HealthStatus();
    const res = await healthStatus.appHealthStatus( qatime, satime, shares, mnemonicTime, "mnemonic" );
    await utils.setAppHealthStatus( res )
    console.log( { res } );
    let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
        localDB.tableName.tblWallet,
        res
    );
    return resupdateWalletDetials;
}

module.exports = {
    connection_AppHealthStatus,
    connection_AppHealthStatusUpdateUsingRetoreWalletTrustedContact,
    check_AppHealthStausUsingMnemonic
};