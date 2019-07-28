//TODO: Custome Pages
import { localDB } from "../../../app/constants/Constants";
var utils = require( "../../../app/constants/Utils" );
import Singleton from "../../constants/Singleton";
import "../../../assets/static/js/sugar.js";

const getPasscode = () => {
  let commonData = Singleton.getInstance();
  return commonData.getPasscode();
};
import SQLite from "react-native-sqlite-storage";


errorCB = ( err ) => {
  console.log( "SQL Error: " + err );
}

successCB = () => {
  console.log( "SQL executed fine" );
}

openCB = () => {
  console.log( "Database OPENED" );
}

var db = SQLite.openDatabase(
  localDB.dbName,
  "1.0",
  "HexaWallet Database",
  200000,
  this.openCB(), this.errorCB()
);

//TODO: Json Files
import accountTypeData from "../../../assets/jsonfiles/tblAccountType/tblAccountType.json";
//TODO: Select All Table Data
const readTablesData = ( tableName: any ) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    var temp = [];
    db.transaction( tx => {
      tx.executeSql( "SELECT * FROM " + tableName, [], ( tx, results ) => {
        var len = results.rows.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            let data = results.rows.item( i );
            if ( tableName == "tblWallet" ) {
              data.id = data.id;
              data.address = utils.decrypt( data.address, passcode );
              data.privateKey = utils.decrypt( data.privateKey, passcode );
              data.mnemonic = utils.decrypt( data.mnemonic, passcode );
              data.dateCreated = utils.decrypt( data.dateCreated, passcode );
              data.lastUpdated = utils.decrypt( data.lastUpdated, passcode );
              data.publicKey = utils.decrypt( data.publicKey, passcode );
              data.walletType = utils.decrypt( data.walletType, passcode );
              data.appHealthStatus = utils.decrypt( data.appHealthStatus, passcode );
              data.setUpWalletAnswerDetails = utils.decrypt( data.setUpWalletAnswerDetails, passcode );
              temp.push( data );
            } else if ( tableName == "tblAccount" ) {
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
            else if ( tableName == "tblSSSDetails" ) {
              data.id = data.id;
              data.dateCreated = utils.decrypt( data.dateCreated, passcode );
              data.share = utils.decrypt( data.share, passcode );
              data.shareId = utils.decrypt( data.shareId, passcode );
              data.keeperInfo = utils.decrypt( data.keeperInfo, passcode );
              data.sharedDate = utils.decrypt( data.sharedDate, passcode );
              data.history = utils.decrypt( data.history, passcode );
              data.transferMethod = utils.decrypt( data.transferMethod, passcode );
              data.acceptedDate = utils.decrypt( data.acceptedDate, passcode );
              data.lastSuccessfulCheck = utils.decrypt( data.lastSuccessfulCheck, passcode );
              data.shareStage = utils.decrypt( data.shareStage, passcode );
              data.recordId = utils.decrypt( data.recordId, passcode );
              data.decryptedShare = utils.decrypt( data.decryptedShare, passcode );
              data.encryptedMetaShare = utils.decrypt( data.encryptedMetaShare, passcode );
              data.type = utils.decrypt( data.type, passcode );
              temp.push( data );
            }
            else if ( tableName == "tblTrustedPartySSSDetails" ) {
              data.id = data.id;
              data.dateCreated = utils.decrypt( data.dateCreated, passcode );
              data.keeperInfo = utils.decrypt( data.keeperInfo, passcode );
              data.urlScript = utils.decrypt( data.urlScript, passcode );
              data.decrShare = utils.decrypt( data.decrShare, passcode );
              data.metaData = utils.decrypt( data.metaData, passcode );
              data.nonPMDDData = utils.decrypt( data.nonPMDDData, passcode );
              data.history = utils.decrypt( data.history, passcode );
              data.sharedDate = utils.decrypt( data.sharedDate, passcode );
              data.type = utils.decrypt( data.type, passcode );
              temp.push( data );
            }
            else {
              temp.push( data );
            }
          }
          resolve( { temp } );
        } else {
          resolve( { temp } );
        }
      } );
    } );
  } );
};



const readAccountTablesData = ( tableName: string ) => {
  let passcode = getPasscode();
  return new Promise( ( resolve: any, reject: any ) => {
    var temp = [];
    db.transaction( tx => {
      let accountId: number;
      tx.executeSql( "SELECT * FROM " + tableName, [], ( tx, results ) => {
        var len = results.rows.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            let dbaccountType = utils.decrypt(
              results.rows.item( i ).accountType,
              passcode
            );
            if ( dbaccountType == "UnKnown" ) {
              accountId = parseInt( results.rows.item( i ).id );
              break;
            }
          }
        }
        tx.executeSql(
          "SELECT * from " +
          tableName +
          " ORDER BY (id= " +
          accountId +
          ") ASC",
          [],
          ( tx, results ) => {
            var len = results.rows.length;
            if ( len > 0 ) {
              for ( let i = 0; i < len; i++ ) {
                let data = results.rows.item( i );
                data.id = data.id;
                data.dateCreated = utils.decrypt( data.dateCreated, passcode );
                data.lastUpdated = utils.decrypt( data.lastUpdated, passcode );
                data.accountName = utils.decrypt( data.accountName, passcode );
                data.accountType = utils.decrypt( data.accountType, passcode );
                data.address = utils.decrypt( data.address, passcode );
                data.additionalInfo = utils.decrypt(
                  data.additionalInfo,
                  passcode
                );
                data.balance = utils.decrypt( data.balance, passcode );
                data.unit = utils.decrypt( data.unit, passcode );
                temp.push( data );
              }
              resolve( { temp } );
            }
          }
        );
      } );
    } );
  } );
};
//TODO: Select tblAccountType
const readTableAcccountType = async (
  tableName1: string,
  tableName2: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve: any, reject: any ) => {
    var temp = [];
    db.transaction( tx => {
      tx.executeSql( "select name  from " + tableName1, [], ( tx, results ) => {
        var len = results.rows.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            var data = results.rows.item( i );
            data.name = utils.decrypt( results.rows.item( i ).name, passcode );
            temp.push( data );
          }
          temp.shift();
          temp.pop();

          //for hide vault account and joint account
          temp.splice( 1, 1 );
          temp.splice( 1, 1 );
          tx.executeSql(
            "select accountType  from " + tableName2,
            [],
            ( tx2, results2 ) => {
              var len2 = results2.rows.length;
              if ( len2 > 0 ) {
                for ( let i2 = 0; i2 < len2; i2++ ) {
                  var data2 = {};
                  data2.name = utils.decrypt(
                    results2.rows.item( i2 ).accountType,
                    passcode
                  );
                  if ( data2.name == "Secure" ) {
                    for ( var i = 0; i < temp.length; i++ )
                      if ( temp[ i ].name === "Secure" ) {
                        temp.splice( i, 1 );
                        break;
                      }
                  } else if ( data2.name == "Vault" ) {
                    for ( var i = 0; i < temp.length; i++ )
                      if ( temp[ i ].name === "Vault" ) {
                        temp.splice( i, 1 );
                        break;
                      }
                  } else if ( data2.name == "Joint" ) {
                    for ( var i = 0; i < temp.length; i++ )
                      if ( temp[ i ].name === "Joint" ) {
                        temp.splice( i, 1 );
                        break;
                      }
                  }
                }
              }
            }
          );
          resolve( { temp } );
        }
      } );
    } );
  } );
};

//TODO: Select Recent Transaciton Address Wise
const readRecentTransactionAddressWise = (
  tableName: string,
  address: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    var temp: any = [];
    db.transaction( tx => {
      let accountId: number;
      tx.executeSql( "SELECT * FROM " + tableName, [], ( tx, results ) => {
        var len = results.rows.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            let dbdecryptAddress = utils.decrypt(
              results.rows.item( i ).accountAddress,
              passcode
            );
            // console.log(results.rows.item(i));
            // console.log({dbdecryptAddress,address});
            if ( dbdecryptAddress == address ) {
              accountId = parseInt( results.rows.item( i ).id );
              tx.executeSql(
                "SELECT * FROM " +
                tableName +
                " where id = " +
                accountId +
                " order by id asc",
                [],
                ( tx, results ) => {
                  var len = results.rows.length;
                  if ( len > 0 ) {
                    for ( let i = 0; i < len; i++ ) {
                      let data = {};
                      data.id = results.rows.item( i ).id;
                      data.accountAddress = utils.decrypt(
                        results.rows.item( i ).accountAddress,
                        passcode
                      );
                      data.balance = utils.decrypt(
                        results.rows.item( i ).balance,
                        passcode
                      );
                      data.confirmationType = utils.decrypt(
                        results.rows.item( i ).confirmationType,
                        passcode
                      );
                      data.dateCreated = utils.decrypt(
                        results.rows.item( i ).dateCreated,
                        passcode
                      );
                      data.fees = utils.decrypt(
                        results.rows.item( i ).fees,
                        passcode
                      );
                      data.lastUpdated = utils.decrypt(
                        results.rows.item( i ).lastUpdated,
                        passcode
                      );
                      data.transactionHash = utils.decrypt(
                        results.rows.item( i ).transactionHash,
                        passcode
                      );
                      data.transactionType = utils.decrypt(
                        results.rows.item( i ).transactionType,
                        passcode
                      );
                      data.unit = utils.decrypt(
                        results.rows.item( i ).unit,
                        passcode
                      );
                      temp.push( data );
                    }
                    resolve( { temp } );
                  } else {
                    // resolve({ temp });
                  }
                }
              );
            } else {
              // resolve({ temp });
            }
          }
        } else {
          resolve( { temp } );
        }
      } );
    } );
  } );
};

//TODO: Update
//update:tblAmount
const updateTableData = (
  tblName: string,
  balance: string,
  address: string,
  lastUdateDate: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        //select all data form tblAccount
        let accountId;
        txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
          var len = results.rows.length;
          if ( len > 0 ) {
            for ( let i = 0; i < len; i++ ) {
              let dbdecryptAddress = utils.decrypt(
                results.rows.item( i ).address,
                passcode
              );
              if ( dbdecryptAddress == address ) {
                accountId = results.rows.item( i ).id;
              }
              txn.executeSql(
                "update " +
                tblName +
                " set balance = :amount,lastUpdated = :lastUpdated where id = :id",
                [
                  utils.encrypt( balance.toString(), passcode ),
                  lastUdateDate,
                  accountId
                ]
              );
              resolve( true );
            }
          }
        } );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};

//TODO: Insert

//TODO: insert Account Type
const insertAccountTypeData = ( tblName, txtDate ) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    db.transaction( function ( txn ) {
      if ( accountTypeData ) {
        var len = accountTypeData.accountType.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            var data = accountTypeData.accountType[ i ];
            txn.executeSql(
              "INSERT INTO " +
              tblName +
              " (dateCreated,name,lastUpdated) VALUES (:dateCreated,:name,:lastUpdated)",
              [
                utils.encrypt( txtDate.toString(), passcode ),
                utils.encrypt( data.name.toString(), passcode ),
                utils.encrypt( txtDate.toString(), passcode )
              ]
            );
          }
        }
      }
      resolve( true );
    } );
  } );
};

//TODO: ========================================>  Wallet Details  <========================================
//insert   
const insertWallet = (
  tblName: string,
  fulldate: string,
  mnemonicValue: any,
  priKeyValue: any,
  address: string,
  publicKey: string,
  walletType: string,
  setUpWalletAnswerDetails: any,
  appHealthStatus: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    db.transaction( function ( txn ) {
      txn.executeSql(
        "DELETE FROM " +
        tblName
      );
      txn.executeSql(
        "INSERT INTO " +
        tblName +
        " (dateCreated,mnemonic,privateKey,address,publicKey,walletType,setUpWalletAnswerDetails,appHealthStatus,lastUpdated) VALUES (:dateCreated,:mnemonic,:privateKey,:address,:publicKey,:walletType,:setUpWalletAnswerDetails,:appHealthStatus,:lastUpdated)",
        [
          utils.encrypt( fulldate.toString(), passcode ),
          utils.encrypt( mnemonicValue.toString(), passcode ),
          utils.encrypt( priKeyValue.toString(), passcode ),
          utils.encrypt( address.toString(), passcode ),
          utils.encrypt( publicKey.toString(), passcode ),
          utils.encrypt( walletType.toString(), passcode ),
          utils.encrypt( JSON.stringify( setUpWalletAnswerDetails ).toString(), passcode ),
          utils.encrypt( JSON.stringify( appHealthStatus ).toString(), passcode ),
          utils.encrypt( fulldate.toString(), passcode )
        ]
      );
      resolve( true );
    } );
  } );
};


//update
const updateWalletBackedUpSecretQue = (
  tblName: string,
  fulldate: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        txn.executeSql(
          "update " +
          tblName +
          " set lastUpdated = :lastUpdated where id = 1",
          [
            utils.encrypt( fulldate.toString(), passcode )
          ]
        );
        resolve( true );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};



const updateWalletAppHealthStatus = (
  tblName: string,
  AppHealthStatus: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn: any ) {
        txn.executeSql(
          "update " +
          tblName +
          " set appHealthStatus = :appHealthStatus where id = 1",
          [
            utils.encrypt( JSON.stringify( AppHealthStatus ).toString(), passcode )
          ]
        );
        resolve( true );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};



const updateWalletMnemonic = (
  tblName: string,
  mnemonic: string,
  fulldate: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        txn.executeSql(
          "update " +
          tblName +
          " set mnemonic = :mnemonic,lastUpdated = :lastUpdated where id = 1",
          [
            utils.encrypt( mnemonic.toString(), passcode ),
            utils.encrypt( fulldate.toString(), passcode )
          ]
        );
        resolve( true );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};


const updateWalletMnemonicAndAnwserDetails = (
  tblName: string,
  mnemonic: string,
  QueAnwserDetails: any,
  fulldate: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        txn.executeSql(
          "update " +
          tblName +
          " set mnemonic = :mnemonic,setUpWalletAnswerDetails = :setUpWalletAnswerDetails, lastUpdated = :lastUpdated where id = 1",
          [
            utils.encrypt( mnemonic.toString(), passcode ),
            utils.encrypt( JSON.stringify( QueAnwserDetails ).toString(), passcode ),
            utils.encrypt( fulldate.toString(), passcode )
          ]
        );
        resolve( true );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};






//TODO: ========================================>  Accounts  Details  <========================================

//TODO: insert tblAccount Only First Time
const insertCreateAccount = (
  tblName: string,
  date: string,
  address: string,
  bal: string,
  unit: string,
  accountName: string,
  accountType: string,
  additionalInfo: any
) => {
  let passcode = getPasscode();
  let fullDate = utils.encrypt( date.toString(), passcode );
  return new Promise( ( resolve, reject ) => {
    db.transaction( function ( txn ) {
      txn.executeSql(
        "INSERT INTO " +
        tblName +
        "(dateCreated,address,balance,unit,accountName,accountType,additionalInfo,lastUpdated) VALUES (:dateCreated,:address,:balance,:unit,:accountName,:accountType,:additionalInfo,:lastUpdated)",
        [
          fullDate,
          utils.encrypt( address.toString(), passcode ),
          utils.encrypt( bal.toString(), passcode ),
          utils.encrypt( unit.toString(), passcode ),
          utils.encrypt( accountName.toString(), passcode ),
          utils.encrypt( accountType.toString(), passcode ),
          utils.encrypt( JSON.stringify( additionalInfo ).toString(), passcode ),
          fullDate
        ]
      );
      resolve( true );
    } );
  } );
};

//TODO: insert Last Before Create Account
const insertLastBeforeCreateAccount = (
  tblName: string,
  fulldate: string,
  address: string,
  unit: string,
  accountName: string,
  accountType: string,
  additionalInfo: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    let date = utils.encrypt( fulldate.toString(), passcode );
    let add = utils.encrypt( address.toString(), passcode );
    let amount = utils.encrypt( "0.0", passcode );
    let unitvalue = utils.encrypt( unit.toString(), passcode );
    let accountNameValue = utils.encrypt( accountName.toString(), passcode );
    let accountTypesValue = utils.encrypt( accountType.toString(), passcode );
    let moreInfo = utils.encrypt(
      JSON.stringify( additionalInfo ).toString(),
      passcode
    );

    db.transaction( function ( txn ) {
      txn.executeSql(
        "INSERT INTO tblAccount(dateCreated,address,balance,unit,accountName,accountType,additionalInfo,lastUpdated) VALUES (:dateCreated,:address,:balance,:unit,:accountName,:accountType,:additionalInfo,:lastUpdated)",
        [
          date,
          add,
          amount,
          unitvalue,
          accountNameValue,
          accountTypesValue,
          moreInfo,
          date
        ]
      );
      resolve( true );
    } );
  } );
};



//update   
const updateSecureAccountAddressAndBal = (
  tblName: string,
  address: string,
  bal: string,
  id: string,
  isActive: number
) => {
  let passcode = getPasscode();
  let date = Date.now();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
          var len = results.rows.length;
          if ( len > 0 ) {
            for ( let i = 0; i < len; i++ ) {
              let dbId = results.rows.item( i ).id;
              if ( dbId == id ) {
                txn.executeSql(
                  "update " +
                  tblName +
                  " set address = :address,balance =:balance,lastUpdated =:lastUpdated,isActive =:isActive where id = :id",
                  [
                    utils.encrypt( address.toString(), passcode ),
                    utils.encrypt( bal.toString(), passcode ),
                    utils.encrypt( date.toString(), passcode ),
                    isActive,
                    dbId,
                  ]
                );
                resolve( true );
              }
            }
          }
        } );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};

const updateAccountBalAddressWise = (
  tblName: string,
  address: string,
  bal: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
          var len = results.rows.length;
          if ( len > 0 ) {
            for ( let i = 0; i < len; i++ ) {
              let dbdecryptAddress = utils.decrypt(
                results.rows.item( i ).address,
                passcode
              );
              let dbAddress = results.rows.item( i ).address;
              if ( dbdecryptAddress == address ) {
                txn.executeSql(
                  "update " +
                  tblName +
                  " set balance =:balance where address = :address",
                  [
                    utils.encrypt( bal.toString(), passcode ),
                    dbAddress
                  ]
                );
                resolve( true );
              }
            }
          }
        } );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};


const updateAccountBal = (
  tblName: string,
  address: string,
  bal: string,
  id: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
          var len = results.rows.length;
          if ( len > 0 ) {
            for ( let i = 0; i < len; i++ ) {
              let dbdecryptAddress = utils.decrypt(
                results.rows.item( i ).address,
                passcode
              );
              let dbId = results.rows.item( i ).id;
              let dbAddress = results.rows.item( i ).address;
              if ( dbId == id && dbdecryptAddress == address ) {
                txn.executeSql(
                  "update " +
                  tblName +
                  " set balance =:balance where id = :id and address = :address",
                  [
                    utils.encrypt( bal.toString(), passcode ),
                    dbId,
                    dbAddress
                  ]
                );
                resolve( true );
              }
            }
          }
        } );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};

const updateSecureAccountAddInfo = (
  tblName: string,
  date: string,
  addInfo: any,
  id: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn: any ) {
        txn.executeSql(
          "update " +
          tblName +
          " set lastUpdated =:lastUpdated,additionalInfo =:additionalInfo where id = :id",
          [
            utils.encrypt( date.toString(), passcode ),
            utils.encrypt( JSON.stringify( addInfo ).toString(), passcode ),
            id
          ]
        );
        resolve( true );


      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};

//TODO: ========================================>  Transaction  Details  <========================================


//TODO: insert Transaction
const insertTblTransation = (
  tblName: string,
  transactionDetails: any,
  address: string,
  fulldate: string
) => {
  let bal;
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    db.transaction( function ( txn ) {
      let accountId: number;
      txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
        let len = results.rows.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            let dbdecryptAddress = utils.decrypt(
              results.rows.item( i ).accountAddress,
              passcode
            );
            if ( dbdecryptAddress == address ) {
              accountId = parseInt( results.rows.item( i ).id );
              //delete
              txn.executeSql(
                "DELETE FROM " + tblName + " WHERE id = " + accountId + ""
              );
            }
          }
        }
      } );
      //insert
      for ( let i = 0; i < transactionDetails.length; i++ ) {
        if ( transactionDetails[ i ].transactionType == "Received" ) {
          bal = transactionDetails[ i ].totalReceived;
        } else {
          bal = transactionDetails[ i ].totalSpent;
        }
        txn.executeSql(
          "INSERT INTO " +
          tblName +
          "(dateCreated,accountAddress,transactionHash,balance,unit,fees,transactionType,confirmationType,lastUpdated) VALUES (:dateCreated,:accountAddress,:transactionHash,:balance,:unit,:fees,:transactionType,:confirmationType,:lastUpdated)",
          [
            utils.encrypt(
              utils.getUnixTimeDate( transactionDetails[ i ].received ).toString(),
              passcode
            ),
            utils.encrypt( address.toString(), passcode ),
            utils.encrypt( transactionDetails[ i ].hash.toString(), passcode ),
            utils.encrypt( bal.toString(), passcode ),
            utils.encrypt( "BTC", passcode ),
            utils.encrypt( transactionDetails[ i ].fees.toString(), passcode ),
            utils.encrypt(
              transactionDetails[ i ].transactionType.toString(),
              passcode
            ),
            utils.encrypt(
              transactionDetails[ i ].confirmationType.toString(),
              passcode
            ),
            utils.encrypt( fulldate.toString(), passcode )
          ]
        );
      }

      resolve( true );
    } );
  } );
};


//TODO: ========================================>  SSS Details  <========================================
//read

const readSSSTableData = ( tableName: any, recordID: string ) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    var temp = [];
    db.transaction( tx => {
      tx.executeSql( "SELECT * FROM " + tableName, [], ( tx, results ) => {
        var len = results.rows.length;
        console.log( { len } );

        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            // console.log( { results } );
            // console.log( results.rows.item( i ).recordId );
            let dbdecryptrecordID = utils.decrypt(
              results.rows.item( i ).recordId,
              passcode
            );
            // console.log( { dbdecryptrecordID } );
            if ( dbdecryptrecordID == recordID ) {
              let data = results.rows.item( i );
              data.id = data.id;
              data.share = utils.decrypt( data.share, passcode );
              data.shareId = utils.decrypt( data.shareId, passcode );
              data.keeperInfo = utils.decrypt( data.keeperInfo, passcode );
              data.encryptedMetaShare = utils.decrypt( data.encryptedMetaShare, passcode );
              temp.push( data );
              break;
            }
          }
          resolve( { temp } );
        } else {
          resolve( { temp } );
        }
      } );
    } );
  } );
};

//insert
const insertSSSShareDetails = (
  tblName: string,
  temp: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    temp = temp[ 0 ];
    console.log( { temp } );
    let histroy = [];
    let data = {};
    data.title = "Secret Created.";
    data.date = utils.getUnixToDateFormat2();;
    histroy.push( data );
    db.transaction( function ( txn: any ) {
      for ( let i = 0; i < temp.share.length; i++ ) {
        // console.log( { len: temp.share.length, i: i } );
        // console.log( { date: temp.date.toString(), share: temp.share[ i ].toString(), keerinfo: JSON.stringify( temp.keeperInfo[ i ].info ).toString(), history: JSON.stringify( histroy ).toString() } );
        txn.executeSql(
          "INSERT INTO " +
          tblName +
          "(dateCreated,share,shareId,keeperInfo,history,decryptedShare,lastSuccessfulCheck,type) VALUES (:dateCreated,:share,:shareId,:keeperInfo,:history,:decryptedShare,:lastSuccessfulCheck,:type)",
          [
            utils.encrypt(
              temp.date.toString(),
              passcode
            ),
            utils.encrypt( temp.share[ i ].toString(), passcode ),
            utils.encrypt( temp.shareId[ i ].data.shareId.toString(), passcode ),
            utils.encrypt( JSON.stringify( temp.keeperInfo[ i ].info ).toString(), passcode ),
            utils.encrypt( JSON.stringify( histroy ).toString(), passcode ),
            utils.encrypt( JSON.stringify( temp.encryptedMetaShare[ i ].metaShare ).toString(), passcode ),
            utils.encrypt(
              temp.date.toString(),
              passcode
            ),
            utils.encrypt( temp.type[ i ].type.toString(), passcode ),
          ]
        );
      }
      resolve( true );
    } );
  } );
};

const insertRestoreUsingTrustedContactKeepInfo = (
  tblName: string,
  fulldate: string,
  keepInfo: any,
  type: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    let temp = [];
    let jsonData = {};
    jsonData.title = "Secret Created.";
    jsonData.date = utils.getUnixToDateFormat2();;
    temp.push( jsonData );
    db.transaction( function ( txn ) {
      for ( let i = 0; i < keepInfo.length; i++ ) {
        let data = keepInfo[ i ];
        console.log( { data } );
        txn.executeSql(
          "INSERT INTO " +
          tblName +
          "(dateCreated,keeperInfo,history,recordId,lastSuccessfulCheck,type) VALUES (:dateCreated,:keeperInfo,:history,:recordId,:lastSuccessfulCheck,:type)",
          [
            utils.encrypt(
              fulldate.toString(),
              passcode
            ),
            utils.encrypt( JSON.stringify( data ).toString(), passcode ),
            utils.encrypt( JSON.stringify( temp ).toString(), passcode ),
            utils.encrypt( data.recordID.toString(), passcode ),
            utils.encrypt(
              fulldate.toString(),
              passcode
            ),
            utils.encrypt( type[ i ].type.toString(), passcode ),
          ]
        );
      }
      resolve( true );
    } );
  } );
};


const insertRestoreUsingTrustedContactSelfShare = (
  tblName: string,
  fulldate: string,
  shares: any,
  type: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    let temp = [];
    let jsonData = {};
    jsonData.title = "Secret Created.";
    jsonData.date = utils.getUnixToDateFormat2();;
    temp.push( jsonData );
    db.transaction( function ( txn ) {
      txn.executeSql(
        "INSERT INTO " +
        tblName +
        "(dateCreated,decryptedShare,history,lastSuccessfulCheck,type,sharedDate,acceptedDate,shareStage) VALUES (:dateCreated,:decryptedShare,:history,:lastSuccessfulCheck,:type,:sharedDate,:acceptedDate,:shareStage)",
        [
          utils.encrypt(
            fulldate.toString(),
            passcode
          ),
          utils.encrypt( JSON.stringify( shares ).toString(), passcode ),
          utils.encrypt( JSON.stringify( temp ).toString(), passcode ),
          utils.encrypt(
            fulldate.toString(),
            passcode
          ),
          utils.encrypt( type.toString(), passcode ),
          utils.encrypt(
            fulldate.toString(),
            passcode
          ),
          utils.encrypt(
            fulldate.toString(),
            passcode
          ),
          utils.encrypt(
            "Good",
            passcode
          ),
        ]
      );
      resolve( true );
    } );
  } );
};



//update shareId shareStage
const updateSSSRetoreDecryptedShare = (
  tblName: string,
  decryptedMetaShare: any,
  fulldate: string,
  id: number
) => {
  let passcode = getPasscode();
  console.log( { id } );
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn: any ) {
        txn.executeSql(
          "update " +
          tblName +
          " set decryptedShare = :decryptedShare,acceptedDate =:acceptedDate,lastSuccessfulCheck =:lastSuccessfulCheck,sharedDate =:sharedDate,shareStage =:shareStage where id = :id",
          [
            utils.encrypt( JSON.stringify( decryptedMetaShare ).toString(), passcode ),
            utils.encrypt( fulldate.toString(), passcode ),
            utils.encrypt( fulldate.toString(), passcode ),
            utils.encrypt( fulldate.toString(), passcode ),
            utils.encrypt( "Good", passcode ),
            id
          ]
        );
        resolve( true );
      } );
    }
    catch ( error ) {
      console.log( error );
    }
  } );
};


//update
const updateSSSContactListDetails = (
  tblName: string,
  contactDetails: any,
  shareIds: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        console.log( { contactDetails } );
        for ( let i = 0; i < shareIds.length; i++ ) {
          console.log( { contactDetails } );
          console.log( { shares: shareIds[ i ] } );
          let shareId1 = shareIds[ i ];
          txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
            var len = results.rows.length;
            for ( let ii = 0; ii < len; ii++ ) {
              let dbdecryptShareId = utils.decrypt(
                results.rows.item( ii ).shareId,
                passcode
              );
              let encpShareId = results.rows.item( ii ).shareId;
              console.log( { dbdecryptShareId, shareId1 } );
              if ( dbdecryptShareId == shareId1 ) {
                console.log( { same: encpShareId } );
                txn.executeSql(
                  "update " +
                  tblName +
                  " set keeperInfo = :keeperInfo,recordId =:recordId where shareId = :shareId",
                  [
                    utils.encrypt( JSON.stringify( contactDetails[ i ] ).toString(), passcode ),
                    utils.encrypt( contactDetails[ i ].recordID.toString(), passcode ),
                    encpShareId
                  ]
                );
                break;
              }
            }
          } );
        }
        resolve( true );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};




//update trnasfer method and shared date
const updateSSSTransferMehtodDetails = (
  tblName: string,
  type: string,
  date: string,
  history: any,
  recoardId: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    console.log( { tblName, type, date, history, recoardId } );
    try {
      db.transaction( function ( txn ) {
        txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
          var len = results.rows.length;
          if ( len > 0 ) {
            for ( let i = 0; i < len; i++ ) {
              //  console.log( results.rows.item( i ).recordId );
              let dbdecryptrecordID = utils.decrypt(
                results.rows.item( i ).recordId,
                passcode
              );
              console.log( { dbdecryptrecordID, recoardId } );
              let recordId = results.rows.item( i ).recordId;
              if ( dbdecryptrecordID == recoardId ) {
                txn.executeSql(
                  "update " +
                  tblName +
                  " set transferMethod = :transferMethod,sharedDate =:sharedDate,history =:history where recordId = :recordId",
                  [
                    utils.encrypt( type.toString(), passcode ),
                    utils.encrypt( date.toString(), passcode ),
                    utils.encrypt( JSON.stringify( history ).toString(), passcode ),
                    recordId
                  ]
                );
                resolve( true );
                break;
              }
            }
          }
        } );
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};

//update shareId shareStage
const updateSSSShareStage = (
  tblName: string,
  shareInfo: any,
  fulldate: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        //console.log( { tblName, shareInfo, fulldate } );
        for ( let i = 0; i < shareInfo.length; i++ ) {
          txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
            var len = results.rows.length;
            if ( len > 0 ) {
              for ( let j = 0; j < len; j++ ) {
                let decryptShareId = utils.decrypt(
                  results.rows.item( j ).shareId,
                  passcode
                );
                let shareId = results.rows.item( j ).shareId;
                if ( decryptShareId == shareInfo[ i ].shareId ) {
                  txn.executeSql(
                    "update " +
                    tblName +
                    " set shareStage = :shareStage,lastSuccessfulCheck =:lastSuccessfulCheck where shareid = :shareid",
                    [
                      utils.encrypt( shareInfo[ i ].shareStage.toString(), passcode ),
                      utils.encrypt( fulldate.toString(), passcode ),
                      shareId
                    ]
                  );
                  resolve( true );
                  break;
                }
              }
            }
          } );
        }
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};



//update shareId shareStage Id Wise 
const updateSSSShareStageIdWise = (
  tblName: string,
  resCheckHealth: any,
  sharesInfo: any,
  arrEachShareId: any,
  fulldate: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        //console.log( { tblName, shareInfo, fulldate } );
        for ( let i = 0; i < arrEachShareId.length; i++ ) {
          txn.executeSql(
            "update " +
            tblName +
            " set  shareid = :shareid,  shareStage = :shareStage,lastSuccessfulCheck =:lastSuccessfulCheck where id = :id",
            [
              utils.encrypt( resCheckHealth[ i ].shareId.toString(), passcode ),
              utils.encrypt( sharesInfo[ i ].shareStage.toString(), passcode ),
              utils.encrypt( fulldate.toString(), passcode ),
              arrEachShareId[ i ]
            ]
          );
          resolve( true );
          break;
        }
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};



const updateSSSShareStageWhereRecordId = (
  tblName: string,
  shareInfo: any,
  arr_RecordId: any,
  fulldate: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        //console.log( { tblName, shareInfo, fulldate } );
        for ( let i = 0; i < shareInfo.length; i++ ) {
          txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
            var len = results.rows.length;
            if ( len > 0 ) {
              for ( let j = 0; j < len; j++ ) {
                let decryptRecordId = utils.decrypt(
                  results.rows.item( j ).recordId,
                  passcode
                );
                let encpRecordId = results.rows.item( j ).recordId;
                if ( decryptRecordId == arr_RecordId[ i ] ) {
                  txn.executeSql(
                    "update " +
                    tblName +
                    " set shareStage = :shareStage,lastSuccessfulCheck =:lastSuccessfulCheck where recordId = :recordId",
                    [
                      utils.encrypt( shareInfo[ i ].shareStage.toString(), passcode ),
                      utils.encrypt( fulldate.toString(), passcode ),
                      encpRecordId
                    ]
                  );
                  resolve( true );
                  break;
                }
              }
            }
          } );
        }
      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};



const updateHistroyAndSharedDate = (
  tblName: string,
  history: any,
  sharedDate: string,
  id: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        //  console.log( { tblName, history, sharedDate, id } );
        txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
          var len = results.rows.length;
          if ( len > 0 ) {
            for ( let j = 0; j < len; j++ ) {
              let tableId = results.rows.item( j ).id;
              if ( tableId == id ) {
                txn.executeSql(
                  "update " +
                  tblName +
                  " set history = :history,sharedDate =:sharedDate where id = :id",
                  [
                    utils.encrypt( JSON.stringify( history ).toString(), passcode ),
                    utils.encrypt( sharedDate.toString(), passcode ),
                    id
                  ]
                );
                resolve( true );
                break;
              }
            }
          }
        } );

      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};


const updateHistroyAndAcceptDate = (
  tblName: string,
  history: any,
  sharedDate: string,
  id: string
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        //  console.log( { tblName, history, sharedDate, id } );
        txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
          var len = results.rows.length;
          if ( len > 0 ) {
            for ( let j = 0; j < len; j++ ) {
              let tableId = results.rows.item( j ).id;
              if ( tableId == id ) {
                txn.executeSql(
                  "update " +
                  tblName +
                  " set history = :history,acceptedDate =:acceptedDate where id = :id",
                  [
                    utils.encrypt( JSON.stringify( history ).toString(), passcode ),
                    utils.encrypt( sharedDate.toString(), passcode ),
                    id
                  ]
                );
                resolve( true );
                break;
              }
            }
          }
        } );

      } );
    } catch ( error ) {
      console.log( error );
    }
  } );
};





//TODO: ========================================>  SSS Trusted Party Details   <========================================
//insert
const insertTrustedPartyDetails = (
  tblName: string,
  fulldate: string,
  keeperInfo: any,
  urlScript: any,
  decrShare: any,
  metaData: any,
  nonPMDDData: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    let temp = [];
    let jsonData = {};
    jsonData.title = "Secret Stored.";
    jsonData.date = utils.getUnixToDateFormat( fulldate );
    temp.push( jsonData );
    db.transaction( function ( txn ) {
      txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
        var len = results.rows.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            let dbdecryptNonPMDDData = utils.decrypt(
              results.rows.item( i ).nonPMDDData,
              passcode
            );
            // console.log( { dbdecryptrecordID } );
            if ( dbdecryptNonPMDDData == nonPMDDData ) {
              resolve( "Already same nonPMDDData stored." );
            } else {
              txn.executeSql(
                "INSERT INTO " +
                tblName +
                "(dateCreated,keeperInfo,urlScript,decrShare,metaData,nonPMDDData,history,type) VALUES (:dateCreated,:keeperInfo,:urlScript,:decrShare,:metaData,:nonPMDDData,:history,:type)",
                [
                  utils.encrypt(
                    fulldate.toString(),
                    passcode
                  ),
                  utils.encrypt( JSON.stringify( keeperInfo ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( urlScript ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( decrShare ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( metaData ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( nonPMDDData ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( temp ).toString(), passcode ),
                  utils.encrypt( "With Associate Contact", passcode )
                ]
              );
              resolve( true );
            }
          }
        } else {
          txn.executeSql(
            "INSERT INTO " +
            tblName +
            "(dateCreated,keeperInfo,urlScript,decrShare,metaData,nonPMDDData,history,type) VALUES (:dateCreated,:keeperInfo,:urlScript,:decrShare,:metaData,:nonPMDDData,:history,:type)",
            [
              utils.encrypt(
                fulldate.toString(),
                passcode
              ),
              utils.encrypt( JSON.stringify( keeperInfo ).toString(), passcode ),
              utils.encrypt( JSON.stringify( urlScript ).toString(), passcode ),
              utils.encrypt( JSON.stringify( decrShare ).toString(), passcode ),
              utils.encrypt( JSON.stringify( metaData ).toString(), passcode ),
              utils.encrypt( JSON.stringify( nonPMDDData ).toString(), passcode ),
              utils.encrypt( JSON.stringify( temp ).toString(), passcode ),
              utils.encrypt( "With Associate Contact", passcode )
            ]
          );
          resolve( true );
        }
      } );
    } );
  } );
};



const insertTrustedPartyDetailWithoutAssociate = (
  tblName: string,
  fulldate: string,
  urlScript: any,
  decrShare: any,
  metaData: any,
  nonPMDDData: any,
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    let temp = [];
    let jsonData = {};
    jsonData.title = "Secret Stored.";
    jsonData.date = utils.getUnixToDateFormat( fulldate );
    temp.push( jsonData );
    db.transaction( function ( txn ) {
      txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
        var len = results.rows.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            let dbdecryptNonPMDDData = utils.decrypt(
              results.rows.item( i ).nonPMDDData,
              passcode
            );
            // console.log( { dbdecryptrecordID } );
            if ( dbdecryptNonPMDDData == nonPMDDData ) {
              resolve( "Already same nonPMDDData stored." );
            } else {
              txn.executeSql(
                "INSERT INTO " +
                tblName +
                "(dateCreated,urlScript,decrShare,metaData,nonPMDDData,history,type) VALUES (:dateCreated,:urlScript,:decrShare,:metaData,:nonPMDDData,:history,:type)",
                [
                  utils.encrypt(
                    fulldate.toString(),
                    passcode
                  ),
                  utils.encrypt( JSON.stringify( urlScript ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( decrShare ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( metaData ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( nonPMDDData ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( temp ).toString(), passcode ),
                  utils.encrypt( "Without Associate Contact", passcode )
                ]
              );
              resolve( true );
            }
          }
        } else {
          txn.executeSql(
            "INSERT INTO " +
            tblName +
            "(dateCreated,urlScript,decrShare,metaData,nonPMDDData,history,type) VALUES (:dateCreated,:urlScript,:decrShare,:metaData,:nonPMDDData,:history,:type)",
            [
              utils.encrypt(
                fulldate.toString(),
                passcode
              ),
              utils.encrypt( JSON.stringify( urlScript ).toString(), passcode ),
              utils.encrypt( JSON.stringify( decrShare ).toString(), passcode ),
              utils.encrypt( JSON.stringify( metaData ).toString(), passcode ),
              utils.encrypt( JSON.stringify( nonPMDDData ).toString(), passcode ),
              utils.encrypt( JSON.stringify( temp ).toString(), passcode ),
              utils.encrypt( "Without Associate Contact", passcode )
            ]
          );
          resolve( true );
        }
      } );
    } );
  } );
};



const insertTrustedPartyDetailSelfShare = (
  tblName: string,
  fulldate: string,
  urlScript: any,
  decrShare: any,
  metaData: any,
  nonPMDDData: any,
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    let temp = [];
    let jsonData = {};
    jsonData.title = "Secret Stored.";
    jsonData.date = utils.getUnixToDateFormat( fulldate );
    temp.push( jsonData );
    db.transaction( function ( txn ) {
      txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
        var len = results.rows.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            let dbdecryptNonPMDDData = utils.decrypt(
              results.rows.item( i ).nonPMDDData,
              passcode
            );
            // console.log( { dbdecryptrecordID } );
            if ( dbdecryptNonPMDDData == nonPMDDData ) {
              resolve( "Already same nonPMDDData stored." );
            } else {
              txn.executeSql(
                "INSERT INTO " +
                tblName +
                "(dateCreated,urlScript,decrShare,metaData,nonPMDDData,history,type) VALUES (:dateCreated,:urlScript,:decrShare,:metaData,:nonPMDDData,:history,:type)",
                [
                  utils.encrypt(
                    fulldate.toString(),
                    passcode
                  ),
                  utils.encrypt( JSON.stringify( urlScript ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( decrShare ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( metaData ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( nonPMDDData ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( temp ).toString(), passcode ),
                  utils.encrypt( "Self Share", passcode )
                ]
              );
              resolve( true );
            }
          }
        } else {
          txn.executeSql(
            "INSERT INTO " +
            tblName +
            "(dateCreated,urlScript,decrShare,metaData,nonPMDDData,history,type) VALUES (:dateCreated,:urlScript,:decrShare,:metaData,:nonPMDDData,:history,:type)",
            [
              utils.encrypt(
                fulldate.toString(),
                passcode
              ),
              utils.encrypt( JSON.stringify( urlScript ).toString(), passcode ),
              utils.encrypt( JSON.stringify( decrShare ).toString(), passcode ),
              utils.encrypt( JSON.stringify( metaData ).toString(), passcode ),
              utils.encrypt( JSON.stringify( nonPMDDData ).toString(), passcode ),
              utils.encrypt( JSON.stringify( temp ).toString(), passcode ),
              utils.encrypt( "Self Share", passcode )
            ]
          );
          resolve( true );
        }
      } );
    } );
  } );
};

module.exports = {
  readTablesData,
  readAccountTablesData,
  readTableAcccountType,
  readRecentTransactionAddressWise,
  insertAccountTypeData,

  //Wallet Details
  insertWallet,
  updateWalletBackedUpSecretQue,
  updateWalletMnemonic,
  updateWalletAppHealthStatus,
  updateWalletMnemonicAndAnwserDetails,

  //Account Details
  insertCreateAccount,
  insertLastBeforeCreateAccount,
  updateSecureAccountAddressAndBal,
  updateAccountBal,
  updateAccountBalAddressWise,
  updateSecureAccountAddInfo,

  //Transation Details
  insertTblTransation,
  updateTableData,

  //SSS Details
  readSSSTableData,
  insertSSSShareDetails,
  insertRestoreUsingTrustedContactKeepInfo,
  insertRestoreUsingTrustedContactSelfShare,
  updateSSSContactListDetails,
  updateSSSTransferMehtodDetails,
  updateSSSShareStage,
  updateSSSShareStageIdWise,
  updateSSSShareStageWhereRecordId,
  updateSSSRetoreDecryptedShare,


  //SSS Trusted Party Details 
  insertTrustedPartyDetails,
  insertTrustedPartyDetailWithoutAssociate,
  updateHistroyAndSharedDate,
  updateHistroyAndAcceptDate,
  insertTrustedPartyDetailSelfShare
};    
