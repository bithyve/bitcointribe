import { localDB } from "hexaConstants";
var DataManager = require( "hexaDataManager" );

const getAccountDetails = async ( { selectedAccount = {} as any, data = undefined as any } ) => {
    let address = data != undefined ? data.address : "";
    let amount = data != undefined ? data.amount.toString() : "0";
    var arr_AccountList = await DataManager.readTblAccounts( localDB.tableName.tblAccount );
    arr_AccountList = arr_AccountList.temp;
    var temp = [], arr_SelectAccountDetails = [], accountbal;
    let flag_DisableSentBtn = true;
    for ( let i = 0; i < arr_AccountList.length; i++ ) {
        let item = arr_AccountList[ i ];
        let jsonData = {} as any;
        if ( data != undefined || data != {} ) {
            if ( i == 0 ) {
                jsonData.checked = true;
                arr_SelectAccountDetails = item;
                accountbal = item.balance;
            } else {
                jsonData.checked = false;
            }
        } else {
            if ( item.accountType == selectedAccount.accountType ) {
                jsonData.checked = true;
                arr_SelectAccountDetails = item;
                accountbal = item.balance;
            } else {
                jsonData.checked = false;
            }
        }
        jsonData.balance = item.balance;
        jsonData.accountName = item.accountName;
        temp.push( jsonData );
    }

    if ( amount != "" && parseFloat( amount ) > parseFloat( accountbal ) && address != "" ) {
        flag_DisableSentBtn = false;
    }

    return {
        address,
        amount,
        arr_AccountList: temp,
        arr_SelectAccountDetails,
        selectedAccountBal: accountbal,
        flag_DisableSentBtn
    }

}

export {
    getAccountDetails
}