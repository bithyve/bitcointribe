// TODO: Bitcoin Class
// TODO: Custome Alert
import { AlertSimple } from 'hexaCustAlert';

// TODO: Custome object
import { localDB } from 'hexaConstants';

const bitcoinClassState = require('hexaClassState');

// TODO: Common Funciton
const comFunDBRead = require('hexaCommonDBReadData');

const alert = new AlertSimple();
const dbOpration = require('hexaDBOpration');

const getAccountTransaction = async () => {
  const dateTime = Date.now();
  const regularAccount = await bitcoinClassState.getRegularClassState();
  let regularAccountTransactions = await regularAccount.getTransactions();
  if (regularAccountTransactions.status == 200) {
    await bitcoinClassState.setRegularClassState(regularAccount);
    regularAccountTransactions = regularAccountTransactions.data;
  } else {
    alert.simpleOk('Oops', regularAccountTransactions.err);
  }
  const secureAccount = await bitcoinClassState.getSecureClassState();
  let secureAccountTransactions = await secureAccount.getTransactions();
  if (secureAccountTransactions.status == 200) {
    await bitcoinClassState.setSecureClassState(secureAccount);
    secureAccountTransactions = secureAccountTransactions.data;
  } else {
    alert.simpleOk('Oops', secureAccountTransactions.err);
  }
  let results = [
    ...regularAccountTransactions.transactions.transactionDetails,
    ...secureAccountTransactions.transactions.transactionDetails,
  ];
  results = results.sort((a, b) => {
    return a.confirmations - b.confirmations;
  });
  // console.log( { results } );
  const resStoreTrna = await dbOpration.insertTblTransation(
    localDB.tableName.tblTransaction,
    results,
    dateTime,
  );
  return resStoreTrna;
};

const getSecAccountTran = async (type: string) => {
  const arrTransList = [];
  const resTranList = await comFunDBRead.readTblTransaction();
  for (let i = 0; i < resTranList.length; i++) {
    if (resTranList[i].accountType == type) {
      arrTransList.push(resTranList[i]);
    }
  }
  return arrTransList;
};

module.exports = {
  getAccountTransaction,
  getSecAccountTran,
};
