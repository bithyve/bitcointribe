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
var db = SQLite.openDatabase(
  localDB.dbName,
  "1.0",
  "HexaWallet Database",
  200000
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
              data.lastUpdated = utils.decrypt( data.lastUpdated, passcode );
              temp.push( data );
            }
            else if ( tableName == "tblSSSDetails" ) {
              data.id = data.id;
              data.share = utils.decrypt( data.share, passcode );
              data.shareId = utils.decrypt( data.shareId, passcode );
              data.keeperInfo = utils.decrypt( data.keeperInfo, passcode );
              data.sharedDate = utils.decrypt( data.sharedDate, passcode );
              data.history = utils.decrypt( data.history, passcode );
              data.transferMethod = utils.decrypt( data.transferMethod, passcode );
              data.acceptedDate = utils.decrypt( data.acceptedDate, passcode );
              data.lastSuccessfulCheck = utils.decrypt( data.lastSuccessfulCheck, passcode );
              data.shareStage = utils.decrypt( data.shareStage, passcode );
              temp.push( data );
            }
            else if ( tableName == "tblTrustedPartySSSDetails" ) {
              data.id = data.id;
              data.dateCreated = utils.decrypt( data.dateCreated, passcode );
              data.userDetails = utils.decrypt( data.userDetails, passcode );
              data.decrShare = utils.decrypt( data.decrShare, passcode );
              data.shareId = utils.decrypt( data.shareId, passcode );
              data.allJson = utils.decrypt( data.allJson, passcode );
              data.nonPMDDData = utils.decrypt( data.nonPMDDData, passcode );
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
  setUpWalletAnswerDetails: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    db.transaction( function ( txn ) {
      txn.executeSql(
        "INSERT INTO " +
        tblName +
        " (dateCreated,mnemonic,privateKey,address,publicKey,walletType,setUpWalletAnswerDetails,lastUpdated) VALUES (:dateCreated,:mnemonic,:privateKey,:address,:publicKey,:walletType,:setUpWalletAnswerDetails,:lastUpdated)",
        [
          utils.encrypt( fulldate.toString(), passcode ),
          utils.encrypt( mnemonicValue.toString(), passcode ),
          utils.encrypt( priKeyValue.toString(), passcode ),
          utils.encrypt( address.toString(), passcode ),
          utils.encrypt( publicKey.toString(), passcode ),
          utils.encrypt( walletType.toString(), passcode ),
          utils.encrypt( JSON.stringify( setUpWalletAnswerDetails ).toString(), passcode ),
          utils.encrypt( fulldate.toString(), passcode )
        ]
      );
      resolve( true );
    } );
  } );
};
//update
const updateWalletAnswerDetails = (
  tblName: string,
  AnswerDetails: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        txn.executeSql(
          "update " +
          tblName +
          " set setUpWalletAnswerDetails = :setUpWalletAnswerDetails where id = 1",
          [
            utils.encrypt( JSON.stringify( AnswerDetails ).toString(), passcode )
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
      db.transaction( function ( txn ) {
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
const insertSSSShareAndShareId = (
  tblName: string,
  fulldate: string,
  share: any,
  shareId: any,
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    let temp = [];
    let data = {};
    data.title = "Secret Created.";
    data.date = utils.getUnixToDateFormat( fulldate );
    temp.push( data );
    db.transaction( function ( txn ) {
      for ( let i = 0; i < share.length; i++ ) {
        txn.executeSql(
          "INSERT INTO " +
          tblName +
          "(dateCreated,share,shareId,history) VALUES (:dateCreated,:share,:shareId,:history)",
          [
            utils.encrypt(
              fulldate.toString(),
              passcode
            ),
            utils.encrypt( share[ i ].toString(), passcode ),
            utils.encrypt( shareId[ i ].toString(), passcode ),
            utils.encrypt( JSON.stringify( temp ).toString(), passcode ),
          ]
        );
      }
      resolve( true );
    } );
  } );
};

//update
const updateSSSContactListDetails = (
  tblName: string,
  contactDetails: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    try {
      db.transaction( function ( txn ) {
        console.log( { contactDetails } );

        txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
          var len = results.rows.length;
          if ( len > 0 ) {
            for ( let i = 0; i < len; i++ ) {
              let dbdecryptShareId = results.rows.item( i ).shareId;
              //console.log( { dbdecryptShareId } );
              let jsonConstactDetial = JSON.stringify( contactDetails[ i ] ).toString();
              let jsonRecordId = ( contactDetails[ i ].recordID ).toString();
              //  console.log( { jsonConstactDetial, jsonRecordId } );
              txn.executeSql(
                "update " +
                tblName +
                " set keeperInfo = :keeperInfo,recordId =:recordId where shareId = :shareId",
                [
                  utils.encrypt( jsonConstactDetial, passcode ),
                  utils.encrypt( jsonRecordId, passcode ),
                  dbdecryptShareId
                ]
              );
            }
            console.log( "done" );

            resolve( true );
          }
        } );
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
              //console.log( { dbdecryptrecordID, recoardId } );
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

//TODO: ========================================>  SSS Trusted Party Details   <========================================
//insert
const insertTrustedPartyDetails = (
  tblName: string,
  fulldate: string,
  userDetails: any,
  decrShare: any,
  shareId: any,
  allJson: any,
  nonPMDDData: any
) => {
  let passcode = getPasscode();
  return new Promise( ( resolve, reject ) => {
    db.transaction( function ( txn ) {
      txn.executeSql( "SELECT * FROM " + tblName, [], ( tx, results ) => {
        var len = results.rows.length;
        if ( len > 0 ) {
          for ( let i = 0; i < len; i++ ) {
            let dbdecryptShareId = utils.decrypt(
              results.rows.item( i ).shareId,
              passcode
            );
            // console.log( { dbdecryptrecordID } );
            if ( dbdecryptShareId == shareId ) {
              resolve( "Already same share stored." );
            } else {
              txn.executeSql(
                "INSERT INTO " +
                tblName +
                "(dateCreated,userDetails,decrShare,shareId,allJson,nonPMDDData) VALUES (:dateCreated,:userDetails,:decrShare,:shareId,:allJson,:nonPMDDData)",
                [
                  utils.encrypt(
                    fulldate.toString(),
                    passcode
                  ),
                  utils.encrypt( JSON.stringify( userDetails ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( decrShare ).toString(), passcode ),
                  utils.encrypt( shareId.toString(), passcode ),
                  utils.encrypt( JSON.stringify( allJson ).toString(), passcode ),
                  utils.encrypt( JSON.stringify( nonPMDDData ).toString(), passcode )
                ]
              );
              resolve( true );
            }
          }
        } else {
          txn.executeSql(
            "INSERT INTO " +
            tblName +
            "(dateCreated,userDetails,decrShare,shareId,allJson,nonPMDDData) VALUES (:dateCreated,:userDetails,:decrShare,:shareId,:allJson,:nonPMDDData)",
            [
              utils.encrypt(
                fulldate.toString(),
                passcode
              ),
              utils.encrypt( JSON.stringify( userDetails ).toString(), passcode ),
              utils.encrypt( JSON.stringify( decrShare ).toString(), passcode ),
              utils.encrypt( shareId.toString(), passcode ),
              utils.encrypt( JSON.stringify( allJson ).toString(), passcode ),
              utils.encrypt( JSON.stringify( nonPMDDData ).toString(), passcode )
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
  updateWalletAnswerDetails,
  updateWalletMnemonic,
  updateWalletAppHealthStatus,

  insertCreateAccount,
  insertLastBeforeCreateAccount,
  insertTblTransation,
  updateTableData,
  //SSS Details
  readSSSTableData,
  insertSSSShareAndShareId,
  updateSSSContactListDetails,
  updateSSSTransferMehtodDetails,
  updateSSSShareStage,
  //SSS Trusted Party Details 
  insertTrustedPartyDetails
};
