import {
    localDB
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );
//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import HealthStatus from "HexaWallet/src/bitcoin/utilities/HealthStatus"
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();


//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Bitcoin Class
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );



//Setup Flow 
const checkHealthSetupShare = async ( qatime: number ) => {
    console.log( { qatime } );
    const healthStatus = new HealthStatus();
    let arrShares = [
        { shareId: "", updatedAt: 0 },
        { shareId: "", updatedAt: 0 },
        { shareId: "", updatedAt: 0 },
        { shareId: "", updatedAt: 0 },
        { shareId: "", updatedAt: 0 },
    ];
    const res = await healthStatus.appHealthStatus( qatime, arrShares );
    console.log( { res } );
    await utils.setAppHealthStatus( res )
    return res;
}


const checkHealthAllShare = async ( share: any ) => {
    //  console.log( { share } );
    let dateTime = Date.now();
    let temp = [ share.trustedContShareId1, share.trustedContShareId2, share.selfshareShareId1 ];
    console.log( { temp } );

    const sss = await bitcoinClassState.getS3ServiceClassState();
    var resCheckHealth = await sss.checkHealth( temp );
    if ( resCheckHealth.status == 200 ) {
        await bitcoinClassState.setS3ServiceClassState( sss );
        resCheckHealth = resCheckHealth.data.lastUpdateds;
    } else {
        alert.simpleOk( "Oops", resCheckHealth.err );
    }

    console.log( { resCheckHealth } );

    let shares = [
        { shareId: share.selfshareShareShareId2, updatedAt: share.selfshareShareDate2 },
        { shareId: share.selfshareShareId3, updatedAt: share.selfshareShareDate3 },
    ];
    resCheckHealth.push.apply( resCheckHealth, shares )
    console.log( { resCheckHealth } );
    const healthStatus = new HealthStatus();
    const res = await healthStatus.appHealthStatus( share.qatime, resCheckHealth );
    let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
        localDB.tableName.tblWallet,
        res
    );
    console.log( { res } );
    if ( resupdateWalletDetials ) {
        let temp = [];
        for ( let i = 0; i < res.sharesInfo.length; i++ ) {
            let data = {};
            data.shareId = res.sharesInfo[ i ].shareId;
            data.shareStage = res.sharesInfo[ i ].shareStage;
            temp.push( data );
        }
        let resupdateSSSShareStage = await dbOpration.updateSSSShareStage(
            localDB.tableName.tblSSSDetails,
            temp,
            dateTime
        );
        console.log( { resupdateSSSShareStage } );
        await comFunDBRead.readTblWallet();
        await comFunDBRead.readTblSSSDetails();
        return res
    }
}


//TODO: func connection_AppHealthStatus (WalletScreen,TrustedContactScreen)
// const connection_AppHealthStatus = async ( qatime: number, sharesId: any ) => {
//     console.log( { qatime, sharesId } );
//     sharesId = sharesId.slice( 0, 3 );
//     let temp = [];
//     for ( let i = 0; i < sharesId.length; i++ ) {
//         temp.push( sharesId[ i ].data.shareId );
//     }
//     console.log( { temp } );

//     const dateTime = Date.now();
//     const sss = await bitcoinClassState.getS3ServiceClassState();
//     var resCheckHealth = await sss.checkHealth( temp );
//     if ( resCheckHealth.status == 200 ) {
//         await bitcoinClassState.setS3ServiceClassState( sss );
//         resCheckHealth = resCheckHealth.data.lastUpdateds;
//     } else {
//         alert.simpleOk( "Oops", resCheckHealth.err );
//     }
//     console.log( { resCheckHealth } );

//     let shares = [
//         { shareId: "", updatedAt: 0 },
//         { shareId: "", updatedAt: 0 },
//     ];
//     resCheckHealth.push.apply( resCheckHealth, shares )
//     //console.log( "Initializing HealthStatuss" )
//     const healthStatus = new HealthStatus();
//     console.log( { qatime, resCheckHealth } );
//     const res = await healthStatus.appHealthStatus( qatime, resCheckHealth );
//     console.log( { res } );
//     await utils.setAppHealthStatus( res )
//     console.log( { res } );
//     let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
//         localDB.tableName.tblWallet,
//         res
//     );
//     console.log( { resupdateWalletDetials } );

//     if ( resupdateWalletDetials ) {
//         return res.sharesInfo;
//     }

// }

// const connection_AppHealthAndSSSUpdate = async ( qatime: number, sharesId: any ) => {
//     // console.log( { qatime, sharesId } );
//     sharesId = sharesId.slice( 0, 3 );
//     const sss = await bitcoinClassState.getS3ServiceClassState();
//     console.log( { sss } );
//     const dateTime = Date.now();
//     console.log( { sharesId } );
//     var resCheckHealth = await sss.checkHealth( sharesId );
//     console.log( { resCheckHealth } );
//     if ( resCheckHealth.status == 200 ) {
//         await bitcoinClassState.setS3ServiceClassState( sss );
//         resCheckHealth = resCheckHealth.data.lastUpdateds;
//     } else {
//         alert.simpleOk( "Oops", resCheckHealth.err );
//     }
//     // console.log( { resCheckHealth } );
//     let shares = [
//         { shareId: "", updatedAt: 0 },
//         { shareId: "", updatedAt: 0 },
//     ];
//     resCheckHealth.push.apply( resCheckHealth, shares )
//     //console.log( "Initializing HealthStatuss" )
//     const healthStatus = new HealthStatus();
//     // console.log( { qatime, resCheckHealth } );
//     const res = await healthStatus.appHealthStatus( qatime, resCheckHealth );
//     // console.log( { res } );
//     let temp = [];
//     for ( let i = 0; i < sharesId.length; i++ ) {
//         let data = {};
//         data.shareId = sharesId[ i ];
//         data.shareStage = res.sharesInfo[ i ].shareStage;
//         temp.push( data );
//     }
//     //console.log( { temp } );
//     await utils.setAppHealthStatus( res )
//     let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
//         localDB.tableName.tblWallet,
//         res
//     );
//     if ( resupdateWalletDetials ) {
//         let resupdateSSSShareStage = await dbOpration.updateSSSShareStage(
//             localDB.tableName.tblSSSDetails,
//             temp,
//             dateTime
//         );
//         if ( resupdateSSSShareStage ) {
//             await comFunDBRead.readTblSSSDetails();
//             return resupdateWalletDetials;
//         }
//     }
// }

// const connection_AppHealthForAllShare = async ( qatime: number, shares: any ) => {
//     console.log( { qatime, shares } );
//     let arr_ShareId = [];
//     let arr_UpdateAt = [];
//     for ( let i = 0; i < shares.length; i++ ) {
//         arr_ShareId.push( shares[ i ].shareId );
//         arr_UpdateAt.push( shares[ i ].updatedAt )
//     }
//     let sortFirstSharedId = arr_ShareId.slice( 0, 3 );
//     let sortShare = shares.slice( 3, 5 );
//     console.log( { sortFirstSharedId, sortShare } );
//     const sss = await bitcoinClassState.getS3ServiceClassState();
//     const dateTime = Date.now();
//     var resCheckHealth = await sss.checkHealth( sortFirstSharedId );
//     if ( resCheckHealth.status == 200 ) {
//         await bitcoinClassState.setS3ServiceClassState( sss );
//         resCheckHealth = resCheckHealth.data.lastUpdateds;
//     } else {
//         alert.simpleOk( "Oops", resCheckHealth.err );
//     }
//     resCheckHealth.push.apply( resCheckHealth, sortShare )
//     console.log( { resCheckHealth } );
//     //console.log( "Initializing HealthStatuss" )
//     const healthStatus = new HealthStatus();
//     // console.log( { qatime, resCheckHealth } );
//     const res = await healthStatus.appHealthStatus( qatime, resCheckHealth );
//     console.log( { res } );
//     let temp = [];
//     for ( let i = 0; i < shares.length; i++ ) {
//         let data = {};
//         data.shareId = shares[ i ].shareId;
//         data.shareStage = res.sharesInfo[ i ].shareStage;
//         temp.push( data );
//     }
//     console.log( { temp } );
//     await utils.setAppHealthStatus( res )
//     let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
//         localDB.tableName.tblWallet,
//         res
//     );
//     if ( resupdateWalletDetials ) {
//         let resupdateSSSShareStage = await dbOpration.updateSSSShareStage(
//             localDB.tableName.tblSSSDetails,
//             temp,
//             dateTime
//         );
//         if ( resupdateSSSShareStage ) {
//             await comFunDBRead.readTblSSSDetails();
//             return resupdateWalletDetials;
//         }


//     }

// }


// const check_HealthRestoWalletUsingTrustedContact = async ( qatime: number, share: any ) => {
//     console.log( { qatime, share } );
// }




// const connection_AppHealthStatusUpdateUsingRetoreWalletTrustedContact = async ( qatime: number, satime: number, encrShares: any, mnemonic: any, arr_RecordId: any ) => {
//     //  console.log( { qatime, satime, encrShares, mnemonic } );
//     const dateTime = Date.now();
//     const sss = new S3Service(
//         mnemonic
//     );
//     var resCheckHealth = await sss.checkHealth( encrShares );
//     resCheckHealth = resCheckHealth.lastUpdateds;
//     if ( resCheckHealth.length == 2 ) {
//         let data = {};
//         data.shareId = "0";
//         data.updatedAt = 0;
//         resCheckHealth.push( data );
//     }
//     //console.log( { resCheckHealth } );
//     const healthStatus = new HealthStatus();
//     const res = await healthStatus.appHealthStatus( qatime, satime, resCheckHealth, 0, "share" );
//     // console.log( { res } );
//     await utils.setAppHealthStatus( res )
//     //console.log( { res } );
//     let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
//         localDB.tableName.tblWallet,
//         res
//     );
//     //console.log( { resupdateWalletDetials } );
//     let resupdateSSSShareStage = await dbOpration.updateSSSShareStageWhereRecordId(
//         localDB.tableName.tblSSSDetails,
//         res.sharesInfo,
//         arr_RecordId,
//         dateTime
//     );
//     if ( resupdateSSSShareStage ) {
//         return resupdateSSSShareStage;
//     }
// }
// //Secure Account Backup
// const connection_AppHealthStatusSecureAccountBackup = async ( qatime: number, satime: number, encrShares: any, mnemonic: any ) => {
//     //  console.log( { qatime, satime, encrShares, mnemonic } );
//     const healthStatus = new HealthStatus();
//     const res = await healthStatus.appHealthStatus( qatime, satime, encrShares, 0, "share" );
//     // console.log( { res } );
//     await utils.setAppHealthStatus( res )
//     let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
//         localDB.tableName.tblWallet,
//         res
//     );
//     if ( resupdateWalletDetials ) {
//         return resupdateWalletDetials;
//     }

// }



// const check_AppHealthStausUsingMnemonic = async ( qatime: number, satime: number, shares: any, mnemonicTime: any ) => {
//     const healthStatus = new HealthStatus();
//     const res = await healthStatus.appHealthStatus( qatime, satime, shares, mnemonicTime, "mnemonic" );
//     await utils.setAppHealthStatus( res )
//     //console.log( { res } );
//     let resupdateWalletDetials = await dbOpration.updateWalletAppHealthStatus(
//         localDB.tableName.tblWallet,
//         res
//     );
//     if ( resupdateWalletDetials ) {
//         return resupdateWalletDetials;
//     }  
// }

module.exports = {
    checkHealthSetupShare,
    checkHealthAllShare
    // connection_AppHealthStatus,
    // connection_AppHealthAndSSSUpdate,
    // connection_AppHealthForAllShare,
    // check_HealthRestoWalletUsingTrustedContact
};