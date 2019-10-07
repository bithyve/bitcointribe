//TODO: Bitcoin Class
var bitcoinClassState = require( "hexaClassState" );

//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );

//TODO: Custome Alert 
import { AlertSimple } from "hexaCustAlert";
let alert = new AlertSimple();

//TODO: Custome object 
import { localDB } from "hexaConstants";
var dbOpration = require( "hexaDBOpration" );

const getAccountTransaction = async () => {
    let dateTime = Date.now();
    let regularAccount = await bitcoinClassState.getRegularClassState();
    var regularAccountTransactions = await regularAccount.getTransactions();
    if ( regularAccountTransactions.status == 200 ) {
        await bitcoinClassState.setRegularClassState( regularAccount );
        regularAccountTransactions = regularAccountTransactions.data;
    } else {
        alert.simpleOk( "Oops", regularAccountTransactions.err );
    }
    let secureAccount = await bitcoinClassState.getSecureClassState();
    var secureAccountTransactions = await secureAccount.getTransactions();
    if ( secureAccountTransactions.status == 200 ) {
        await bitcoinClassState.setSecureClassState( secureAccount );
        secureAccountTransactions = secureAccountTransactions.data;

    } else {
        alert.simpleOk( "Oops", secureAccountTransactions.err );
    }
    let results = [ ...regularAccountTransactions.transactions.transactionDetails, ...secureAccountTransactions.transactions.transactionDetails ];
    results = results.sort( ( a, b ) => { return a.confirmations - b.confirmations } )
    //console.log( { results } );
    let resStoreTrna = await dbOpration.insertTblTransation(
        localDB.tableName.tblTransaction,
        results,
        dateTime
    );
    return resStoreTrna;
}




const getSecAccountTran = async ( type: string ) => {
    let arrTransList = [];
    var resTranList = await comFunDBRead.readTblTransaction();
    for ( let i = 0; i < resTranList.length; i++ ) {
        if ( resTranList[ i ].accountType == type ) {
            arrTransList.push( resTranList[ i ] );
        }
    }
    return arrTransList;
}





module.exports = {
    getAccountTransaction,
    getSecAccountTran
};