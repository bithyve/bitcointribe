import Contacts from 'react-native-contacts';
import {
    colors,
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );
//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";


//TODO: func connection_AppHealthStatus (WalletScreen,TrustedContactScreen)
const connection_AppHealthStatus = async ( qatime: number, satime: number, shares: any, resultWallet: any ) => {
    const dateTime = Date.now();
    const fulldate = Math.floor( dateTime / 1000 );
    let arr_EncpShare = [];
    for ( let i = 0; i < shares.length; i++ ) {
        let data = shares[ i ];
        arr_EncpShare.push( data.share )
    }
    const sss = new S3Service(
        resultWallet.mnemonic
    );
    const resCheckHealth = await sss.checkHealth( arr_EncpShare );
    //console.log( { resCheckHealth } );
    //console.log( qatime, satime, resCheckHealth.lastUpdateds );
    const res = await sss.appHealthStatus( qatime, satime, resCheckHealth.lastUpdateds );
    await utils.setAppHealthStatus( res )
    // console.log( { res } );
    let resupdateWalletDetials = await dbOpration.updateWalletDetials(
        localDB.tableName.tblWallet,
        res
    )
    //console.log( { resupdateWalletDetials } );
    let resupdateSSSShareStage = await dbOpration.updateSSSShareStage(
        localDB.tableName.tblSSSDetails,
        res.sharesInfo,
        fulldate
    );
    //console.log( { resupdateSSSShareStage } );
    return resupdateSSSShareStage;
    // console.log( { resupdateSSSShareStage } );
    // console.log( { resupdateWalletDetials } );
    // console.log( { res } );
}





module.exports = {
    connection_AppHealthStatus
};