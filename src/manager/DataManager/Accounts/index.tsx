import SQLite from "react-native-sqlite-storage";
import { localDB } from "hexaConstants";
var utils = require( "hexaUtils" );
import Singleton from "hexaSingleton";


const getPasscode = () => {
    let commonData = Singleton.getInstance();
    return commonData.getPasscode();
};

errorCB = ( err ) => {
    //console.log( "SQL Error: " + err );
}

openCB = () => {
    //console.log( "Database OPENED" );
}

var db = SQLite.openDatabase(
    localDB.dbName,
    "1.0",
    "HexaWallet Database",
    200000
    // this.openCB(), this.errorCB()
);

const readTblAccounts = async ( tableName: any ) => {
    let passcode = getPasscode();
    return new Promise( ( resolve, reject ) => {
        var temp = [];
        db.transaction( tx => {
            tx.executeSql( "SELECT * FROM " + tableName, [], ( tx, results ) => {
                var len = results.rows.length;
                if ( len > 0 ) {
                    for ( let i = 0; i < len; i++ ) {
                        let data = results.rows.item( i );
                        data.id = data.id;
                        data.dateCreated = utils.decrypt( data.dateCreated, passcode );
                        data.address = utils.decrypt( data.address, passcode );
                        data.balance = utils.decrypt( data.balance, passcode );
                        data.unit = utils.decrypt( data.unit, passcode );
                        data.accountName = utils.decrypt( data.accountName, passcode );
                        data.accountType = utils.decrypt( data.accountType, passcode );
                        data.additionalInfo = utils.decrypt( data.additionalInfo, passcode );
                        data.isActive = data.isActive;
                        data.lastUpdated = utils.decrypt( data.lastUpdated, passcode );
                        temp.push( data );
                    }
                    resolve( { temp } );
                } else {
                    resolve( { temp } );
                }
            } );
        } );
    } );
}


export {
    readTblAccounts
}