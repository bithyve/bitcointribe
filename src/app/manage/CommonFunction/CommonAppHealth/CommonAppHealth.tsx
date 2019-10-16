import {
    localDB
} from "hexaConstants";
var dbOpration = require( "hexaDBOpration" );
var utils = require( "hexaUtils" );



//TODO: Bitcoin Files
//import { HealthStatus } from "hexaBitcoin"  
import HealthStatus from "HexaWallet/src/bitcoin/utilities/sss/HealthStatus"
import { AlertSimple } from "hexaComponent/Alert";
let alert = new AlertSimple();


//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );

//TODO: Bitcoin Class
var bitcoinClassState = require( "hexaClassState" );



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
            data.acceptedDate = resCheckHealth[ i ] != null ? resCheckHealth[ i ].updatedAt : 0;
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


const checkHealthWithServerAllShare = async ( share: any ) => {
    //  console.log( { share } );
    let dateTime = Date.now();
    let resCheckHealth = [
        { shareId: share.trustedContShareId1, updatedAt: share.trustedContDate1 },
        { shareId: share.trustedContShareId2, updatedAt: share.trustedContDate2 },
        { shareId: share.selfshareShareId1, updatedAt: share.selfshareDate1 },
        { shareId: share.selfshareShareShareId2, updatedAt: share.selfshareShareDate2 },
        { shareId: share.selfshareShareId3, updatedAt: share.selfshareShareDate3 },
    ];
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
            data.acceptedDate = resCheckHealth[ i ] != null ? resCheckHealth[ i ].updatedAt : 0;
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



module.exports = {
    checkHealthSetupShare,
    checkHealthAllShare,
    checkHealthWithServerAllShare
};