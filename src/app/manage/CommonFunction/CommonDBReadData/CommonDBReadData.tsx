import { localDB } from 'hexaConstants';

const dbOpration = require('hexaDBOpration');
const utils = require('hexaUtils');

const readTblWallet = async () => {
  let resultWallet = await dbOpration.readTablesData(
    localDB.tableName.tblWallet,
  );
  resultWallet = resultWallet.temp[0];
  await utils.setWalletDetails(resultWallet);
  return resultWallet;
};

const readTblAccount = async () => {
  let resAccount = await dbOpration.readTablesData(
    localDB.tableName.tblAccount,
  );
  resAccount = resAccount.temp;
  return resAccount;
};

const readTblSSSDetails = async () => {
  let resSSSDetails = await dbOpration.readTablesData(
    localDB.tableName.tblSSSDetails,
  );
  resSSSDetails = resSSSDetails.temp;
  // console.log( { resSSSDetails } );
  await utils.setSSSDetails(resSSSDetails);
  return resSSSDetails;
};

const readTblTransaction = async () => {
  const resTranList = await dbOpration.readTablesData(
    localDB.tableName.tblTransaction,
  );
  return resTranList.temp;
};

const readTblTrustedPartySSSDetails = async () => {
  let resSharedSecretList = await dbOpration.readTablesData(
    localDB.tableName.tblTrustedPartySSSDetails,
  );
  resSharedSecretList = resSharedSecretList.temp;
  return resSharedSecretList;
};

module.exports = {
  readTblWallet,
  readTblAccount,
  readTblSSSDetails,
  readTblTransaction,
  readTblTrustedPartySSSDetails,
};
