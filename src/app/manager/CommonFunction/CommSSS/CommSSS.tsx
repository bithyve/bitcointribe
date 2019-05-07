import Contacts from 'react-native-contacts';
import {
    colors,
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import HealthStatus from "HexaWallet/src/bitcoin/utilities/HealthStatus";

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
    let healthStatus = new HealthStatus();
    // console.log( qatime, satime, resCheckHealth.lastUpdateds );
    const res = await healthStatus.appHealthStatus( qatime, satime, resCheckHealth.lastUpdateds );
    // console.log( { res } );
    let resupdateWalletDetials = await dbOpration.updateWalletDetials(
        localDB.tableName.tblWallet,
        res
    )
    let resupdateSSSShareStage = await dbOpration.updateSSSShareStage(
        localDB.tableName.tblSSSDetails,
        res.shareInfo,
        fulldate
    );
    return resupdateSSSShareStage;
    // console.log( { resupdateSSSShareStage } );
    // console.log( { resupdateWalletDetials } );
    // console.log( { res } );
}





const getContactNameSMS = async ( mobileNo: string ) => {

}



const getContactNameEmail = async ( email: string ) => {

}




module.exports = {
    connection_AppHealthStatus,
    getContactNameSMS,
    getContactNameEmail
};