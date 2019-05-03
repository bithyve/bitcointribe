import { Component } from "react";
import SQLite from "react-native-sqlite-storage";
import { localDB } from "../../../app/constants/Constants";

export default class CreateTables extends Component {
  constructor ( props ) {
    super( props );
  }

  componentDidMount() {
    var db = SQLite.openDatabase(
      { name: localDB.dbName, readOnly: true },
      this.openCB,
      this.errorCB
    );
    db.transaction( function ( txn ) {
      //TODO: TABLE
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS " +
        localDB.tableName.tblWallet +
        "(id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT ,mnemonic TEXT,privateKey TEXT,address TEXT,publicKey TEXT,walletType TEXT,setUpWalletAnswerDetails TEXT,appHealthStatus TEXT NOT NULL DEFAULT '',lastUpdated TEXT)",
        []
      );
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS " +
        localDB.tableName.tblAccountType +
        " (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,name TEXT,lastUpdated TEXT)",
        []
      );
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS " +
        localDB.tableName.tblAccount +
        " (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,address TEXT,balance TEXT,unit TEXT,accountName TEXT,accountType TEXT,additionalInfo TEXT,lastUpdated TEXT)",
        []
      );
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS " +
        localDB.tableName.tblTransaction +
        " (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,accountAddress TEXT,transactionHash TEXT,balance INTEGER,unit TEXT,fees INTEGER,transactionType TEXT,confirmationType TEXT,lastUpdated TEXT)",
        []
      );
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS " +
        localDB.tableName.tblSSSDetails +
        " (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,share TEXT,shareId TEXT,keeperInfo TEXT NOT NULL DEFAULT '',recordId TEXT NOT NULL DEFAULT '',transferMethod TEXT NOT NULL DEFAULT '',sharedDate TEXT NOT NULL DEFAULT '',acceptedDate TEXT NOT NULL DEFAULT '',lastSuccessfulCheck TEXT NOT NULL DEFAULT '')",
        []
      );
      txn.executeSql(
        "CREATE TABLE IF NOT EXISTS " +
        localDB.tableName.tblTrustedPartySSSDetails +
        " (id  INTEGER PRIMARY KEY AUTOINCREMENT,dateCreated TEXT,userDetails TEXT,decrShare TEXT,shareId TEXT,allJson TEXT,nonPMDDData TEXT)",
        []
      );
      console.log( "create database." );
    } );
  }

  errorCB( err ) {
    console.log( "SQL Error: " + err );
  }

  successCB() {
    console.log( "SQL executed fine" );
  }

  openCB() {
    console.log( "Database OPENED" );
  }

  render() {
    return null;
  }
}
