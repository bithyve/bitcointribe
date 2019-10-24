import { Component } from 'react';
import SQLite from 'react-native-sqlite-storage';
import { localDB } from '../../../app/constants/Constants';

export default class CreateTables extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var db = SQLite.openDatabase(
      { name: localDB.dbName, readOnly: true },
      this.openCB,
      this.errorCB,
    );
    db.transaction(function(txn) {
      // TODO: TABLE
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          localDB.tableName.tblWallet +
          "(id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT ,mnemonic TEXT,privateKey TEXT,address TEXT,publicKey TEXT,walletType TEXT,setUpWalletAnswerDetails TEXT,appHealthStatus TEXT NOT NULL DEFAULT '',backupInfo TEXT NOT NULL DEFAULT '',lastUpdated TEXT)",
        [],
      );
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          localDB.tableName.tblAccountType +
          ' (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,name TEXT,lastUpdated TEXT)',
        [],
      );
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          localDB.tableName.tblAccount +
          ' (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,address TEXT,balance TEXT,unit TEXT,accountName TEXT,accountType TEXT,additionalInfo TEXT,isActive INTEGER DEFAULT 0,lastUpdated TEXT)',
        [],
      );
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          localDB.tableName.tblTransaction +
          ' (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,accountType TEXT,amount TEXT,confimation TEXT,tranDate TEXT,fees TEXT,receipientAddress TEXT,senderAddress TEXT,status TEXT,transactionType TEXT,txid TEXT,lastUpdated TEXT)',
        [],
      );
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          localDB.tableName.tblSSSDetails +
          " (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,share TEXT NOT NULL DEFAULT '',shareId TEXT NOT NULL DEFAULT '',keeperInfo TEXT NOT NULL DEFAULT '',recordId TEXT NOT NULL DEFAULT '',encryptedMetaShare  TEXT NOT NULL DEFAULT '',transferMethod TEXT NOT NULL DEFAULT '',sharedDate TEXT NOT NULL DEFAULT '',history TEXT NOT NULL DEFAULT '',acceptedDate TEXT NOT NULL DEFAULT '',decryptedShare TEXT NOT NULL DEFAULT '',lastSuccessfulCheck TEXT NOT NULL DEFAULT '',shareStage TEXT NOT NULL DEFAULT '',type TEXT NOT NULL DEFAULT '')",
        [],
      );
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS ' +
          localDB.tableName.tblTrustedPartySSSDetails +
          " (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,keeperInfo TEXT NOT NULL DEFAULT '',urlScript TEXT NOT NULL DEFAULT '',decrShare TEXT NOT NULL DEFAULT '',metaData TEXT NOT NULL DEFAULT '',nonPMDDData TEXT NOT NULL DEFAULT '',history TEXT NOT NULL DEFAULT '',sharedDate TEXT NOT NULL DEFAULT '',type TEXT NOT NULL DEFAULT '')",
        [],
      );
      // console.log( "create database." );
    });
  }

  errorCB(err) {
    // console.log( "SQL Error: " + err );
  }

  successCB() {
    // console.log( "SQL executed fine" );
  }

  openCB() {
    // console.log( "Database OPENED" );
  }

  render() {
    return null;
  }
}
