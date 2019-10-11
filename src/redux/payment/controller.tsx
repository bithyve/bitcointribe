// @ts-ignore
var comFunDBRead = require( "hexaCommonDBReadData" );
var bitcoinClassState = require( "hexaClassState" );
var utils = require( "hexaUtils" );



const getAccountDetails = async ( { selectedAccount = {} as any, data = undefined as any } ) => {
    console.log( { selectedAccount } );
    console.log( { data } );
    let address = data != undefined ? data.address : "";
    let amount = data != undefined ? data.amount.toString() : "0";
    let arr_AccountList = await comFunDBRead.readTblAccount();
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
    console.log( {
        address,
        amount,
        arr_AccountList: temp,
        arr_SelectAccountDetails,
        selectedAccountBal: accountbal,
        flag_DisableSentBtn
    } );


    return {
        address,
        amount,
        arr_AccountList: temp,
        arr_SelectAccountDetails,
        selectedAccountBal: accountbal,
        flag_DisableSentBtn
    }
}

const getPriority = ( no: any ) => {
    if ( no == 0 ) {
        return "Low"
    } else if ( no == 1 ) {
        return "Medium"
    } else {
        return "High"
    }
}

const onSendAmount = async ( {
    arr_SelectAccountDetails = {} as any,
    address = undefined,
    amount = '0',
    tranPrio = 'low',
    memo = undefined
} ) => {
    let amountFloat = parseFloat( amount );
    let priority = getPriority( tranPrio );
    let walletDetails = await utils.getWalletDetails();
    let regularAccount = await bitcoinClassState.getRegularClassState();
    let secureAccount = await bitcoinClassState.getSecureClassState();
    var resTransferST;
    var data = {}
    if ( arr_SelectAccountDetails.accountName == "Regular Account" ) {
        resTransferST = await regularAccount.transferST1( address, amountFloat, priority );
        await bitcoinClassState.setRegularClassState( regularAccount );
    } else {
        resTransferST = await secureAccount.transferST1( address, amountFloat, priority );
        await bitcoinClassState.setSecureClassState( secureAccount );
    }
    if ( resTransferST.status == 200 ) {
        data = {
            mnemonic: walletDetails.mnemonic,
            amount,
            respAddress: address,
            bal: arr_SelectAccountDetails.balance,
            accountName: arr_SelectAccountDetails.accountName,
            memo,
            priority: priority,
            tranFee: resTransferST.data.fee.toString(),
            selectedAccount: arr_SelectAccountDetails,
            resTransferST: resTransferST
        }
    }
    return { resTransferST, data }
}


export {
    getAccountDetails,
    onSendAmount
}