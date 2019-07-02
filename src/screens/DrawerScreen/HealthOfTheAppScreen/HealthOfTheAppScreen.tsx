import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
import {
    Container,
    Header,
    Title,
    Content,
    Item,
    Input,
    Button,
    Left,
    Right,
    Body,
    Text,
    List, ListItem,
    Icon
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Permissions from 'react-native-permissions';
import { Avatar } from 'react-native-elements';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder'
import TimerCountdown from "react-native-timer-countdown";
var converter = require( 'number-to-words' );
var Mailer = require( 'NativeModules' ).RNMail;

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome model  
import ModelBackupYourWallet from "HexaWallet/src/app/custcompontes/Model/ModelBackupYourWallet/ModelBackupYourWallet";
import ModelFindYourTrustedContacts from "HexaWallet/src/app/custcompontes/Model/ModelFindYourTrustedContacts/ModelFindYourTrustedContacts";



//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );


//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );


export default class HealthOfTheAppScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_TrustedContacts: [ {
                thumbnailPath: "user",
                givenName: "Trusted Contact 1",
                familyName: "",
                statusMsgColor: "gray",
                statusMsg: "Status",
                opt: undefined,
            }, {
                thumbnailPath: "user",
                givenName: "Trusted Contact 1",
                familyName: "",
                statusMsgColor: "gray",
                statusMsg: "Status",
                opt: undefined,
            } ],
            arr_SelfShare: [ {
                thumbnailPath: "bars",
                givenName: "Wallet",
                familyName: "",
                statusMsgColor: "gray",
                statusMsg: "Status",
                opt: undefined,
            }, {
                thumbnailPath: "bars",
                givenName: "Email",
                familyName: "",
                statusMsgColor: "gray",
                statusMsg: "Status",
                opt: undefined,
            }, {
                thumbnailPath: "bars",
                givenName: "Cloud Store",
                familyName: "",
                statusMsgColor: "gray",
                statusMsg: "Status",
                opt: undefined,
            } ],
            arr_Mnemonic: [],
            arr_MnemonicDetails: [],
            arr_SecretQuestion: [],
            arr_QuestionAndAnswerDetails: [],
            arr_2FactorAuto: [],
            arr_SecureAccountDetials: [],
            arr_ModelBackupYourWallet: [],
            arr_ModelFindYourTrustedContacts: [],

            //flag
            flag_isTrustedContacts: true,
            flag_SelfShare: true,
            flag_SelfShareDisable: true,
            flag_isSetupTrustedContact: true,
            flag_isMnemonic: false,
            flag_isSecretQuestions: false,
            flag_isTwoFactor: false,
            flag_Loading: false,
            //TouchableOpacity Disable
            flag_DisableSecureTwoFactor: true,
            flag_DisableSecretQuestion: true
        } )
    }

    async componentWillMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {
                this.loaddata();
            }
        );
    }
    componentWillUnmount() {
        this.willFocusSubscription.remove();
    }

    // loaddata = async () => {
    //     let walletDetails = await utils.getWalletDetails();
    //     var resAccountDetails = await comFunDBRead.readTblAccount();
    //     let backupType = JSON.parse( walletDetails.appHealthStatus );
    //     console.log( { backupType } );
    //     let sssDetails = await utils.getSSSDetails();
    //     // console.log( { walletDetails, sssDetails } );
    //     let flag_isSetupTrustedContact, flag_isMnemonic;
    //     let encrShares = [];
    //     let history = [];
    //     let tempOpt = [];
    //     let temp = [];
    //     //Trusted Contacts
    //     if ( sssDetails.length > 0 ) {
    //         if ( sssDetails[ 0 ].keeperInfo == "" ) {
    //             flag_isSetupTrustedContact = true;
    //         } else {
    //             flag_isSetupTrustedContact = false;
    //             //Trusted Contacts list
    //             for ( let i = 0; i < sssDetails.length; i++ ) {
    //                 encrShares.push( sssDetails[ i ].share )
    //                 history.push( JSON.parse( sssDetails[ i ].history ) )
    //             }
    //             //for history get opt
    //             for ( let i = 0; i < history.length; i++ ) {
    //                 let eachHistory = history[ i ];
    //                 let eachHistoryLength = eachHistory.length;
    //                 let otp = eachHistory[ eachHistoryLength - 1 ].otp;
    //                 tempOpt.push( otp )
    //             }
    //             //console.log( parseInt( walletDetails.lastUpdated ) );
    //             let updateShareIdStatus = await comAppHealth.connection_AppHealthStatus( parseInt( walletDetails.lastUpdated ), 0, encrShares, walletDetails.mnemonic );
    //             // console.log( { updateShareIdStatus } );
    //             if ( updateShareIdStatus ) {
    //                 var data = await dbOpration.readTablesData(
    //                     localDB.tableName.tblSSSDetails
    //                 );
    //                 data = data.temp;
    //                 //console.log( { data } );
    //                 const dateTime = Date.now();
    //                 //const fulldate = Math.floor( dateTime / 1000 );
    //                 for ( let i = 0; i < data.length; i++ ) {
    //                     let jsondata = JSON.parse( data[ i ].keeperInfo );
    //                     jsondata.history = JSON.parse( data[ i ].history );
    //                     let sharedDate = parseInt( data[ i ].sharedDate );
    //                     // console.warn( 'sharedDate date =' + sharedDate.toString() + "and full date =" + fulldate.toString() );
    //                     var startDate = new Date( dateTime );
    //                     var endDate = new Date( sharedDate );
    //                     //console.warn( 'sart date =' + startDate.toString() + "end date = " + endDate.toString() )
    //                     var diff = Math.abs( startDate.getTime() - endDate.getTime() );
    //                     //console.warn( 'diff' + diff.toString() );  
    //                     const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
    //                     const seconds: any = Math.floor( diff / 1000 % 60 );
    //                     //console.log( { minutes, seconds } );
    //                     //console.warn( minutes.toString() )
    //                     const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
    //                     let mesData = data[ i ];
    //                     //  console.log( { totalSec, mesData } );
    //                     jsondata.totalSec = 540 - totalSec;
    //                     if ( totalSec < 540 && data[ i ].shareStage == "Ugly" ) {
    //                         jsondata.statusMsg = "Shared";
    //                         jsondata.statusMsgColor = "#C07710";
    //                         jsondata.flag_timer = true;
    //                         jsondata.opt = tempOpt[ i ];
    //                     } else if ( totalSec >= 540 && data[ i ].shareStage == "Ugly" ) {
    //                         jsondata.statusMsg = "Shared OTP expired.";
    //                         jsondata.statusMsgColor = "#C07710";
    //                         jsondata.flag_timer = false;
    //                     } else if ( data[ i ].shareStage == "Good" ) {
    //                         jsondata.statusMsg = "Share accessible";
    //                         jsondata.statusMsgColor = "#008000";
    //                         jsondata.flag_timer = false;
    //                     } else if ( data[ i ].shareStage == "Bad" ) {
    //                         jsondata.statusMsg = "Share accessible";
    //                         jsondata.statusMsgColor = "#C07710";
    //                         jsondata.flag_timer = false;
    //                     } else if ( data[ i ].shareStage == "Ugly" && data[ i ].sharedDate != "" ) {
    //                         jsondata.statusMsg = "Share not accessible";
    //                         jsondata.statusMsgColor = "#ff0000";
    //                         jsondata.flag_timer = false;
    //                     }
    //                     else {
    //                         jsondata.statusMsg = "Not shared";
    //                         jsondata.statusMsgColor = "#ff0000";
    //                         jsondata.flag_timer = false;
    //                     }
    //                     temp.push( jsondata )
    //                 }
    //             } else {
    //                 Alert.alert( "ShareId status not changed." )
    //             }
    //         }
    //     } else {
    //         flag_isMnemonic = true;
    //     }
    //     //Mnemonic
    //     if ( backupType.backupType != "share" ) {
    //         flag_isMnemonic = true;
    //     } else {
    //         flag_isMnemonic = false;
    //     }
    //     let arr_Mnemonic = [
    //         {
    //             title: "Mnemonic",
    //             subTitle: "Not backed up",
    //             color: "#ff0000",
    //             icon: "shield"
    //         }
    //     ];
    //     let dbMnemonic = walletDetails.mnemonic;
    //     let arr_CheckMnemonic = dbMnemonic.split( ' ' );
    //     let arr_randomNo = utils.getRandomBetweenNumber( 1, arr_CheckMnemonic.length );
    //     console.log( { arr_CheckMnemonic, arr_randomNo } );
    //     let arr_MnemonicNumbers = [ converter.toOrdinal( arr_randomNo[ 0 ] ), converter.toOrdinal( arr_randomNo[ 1 ] ), converter.toOrdinal( arr_randomNo[ 2 ] ) ]
    //     let arr_MnemoicWords = [ arr_CheckMnemonic[ arr_randomNo[ 0 ] - 1 ], arr_CheckMnemonic[ arr_randomNo[ 1 ] - 1 ], arr_CheckMnemonic[ arr_randomNo[ 2 ] - 1 ] ]
    //     var arr_MnemonicDetails = [];
    //     arr_MnemonicDetails = [ arr_MnemonicNumbers, arr_MnemoicWords ];
    //     console.log( { arr_MnemonicDetails } );


    //     //Secret Questions  
    //     let flag_DisableSecretQuestion, subTitleQA;
    //     let setUpWalletAnswerDetails = JSON.parse( walletDetails.setUpWalletAnswerDetails );
    //     if ( setUpWalletAnswerDetails != "" ) {
    //         flag_DisableSecretQuestion = false;
    //         subTitleQA = "Not backed up";
    //     } else {
    //         flag_DisableSecretQuestion = true;
    //         subTitleQA = "Please first setup your Secret Questions.";
    //     }
    //     let arr_SecretQuestion = [
    //         {
    //             title: "First Secret Question",
    //             subTitle: subTitleQA,
    //             color: "#ff0000",
    //             icon: "shield"
    //         }
    //     ];

    //     //Secure Two Factor Auto
    //     let flag_DisableSecureTwoFactor, subTitleTwoFactor;
    //     //Two Factor Autoentication
    //     let secureAccountDetails = resAccountDetails[ 1 ];
    //     if ( secureAccountDetails.address != "" ) {
    //         flag_DisableSecureTwoFactor = false
    //         subTitleTwoFactor = "Not backed up";
    //     } else {
    //         flag_DisableSecureTwoFactor = true;
    //         subTitleTwoFactor = "Please first active Secure Account.";
    //     }

    //     let arr_2FactorAuto = [
    //         {
    //             title: "2 Factor Aunthentication",
    //             subTitle: subTitleTwoFactor,
    //             color: "#ff0000",
    //             icon: "shield"
    //         }
    //     ];
    //     let secureAdditionalInfo = JSON.parse( resAccountDetails[ 1 ].additionalInfo );
    //     let arr_SecureAccountDetials = [ {
    //         secret: secureAdditionalInfo[ 0 ].setupData.secret
    //     } ];

    //     // console.log( { arr_SecureAccountDetials } );
    //     this.setState( {
    //         flag_isSetupTrustedContact,
    //         arr_Mnemonic,
    //         arr_MnemonicDetails,
    //         flag_isMnemonic,
    //         arr_TrustedContacts: temp,
    //         arr_SecretQuestion,
    //         arr_2FactorAuto,
    //         arr_SecureAccountDetials,
    //         arr_QuestionAndAnswerDetails: setUpWalletAnswerDetails[ 0 ],
    //         //TouchableOpacity  
    //         flag_DisableSecureTwoFactor,
    //         flag_DisableSecretQuestion,
    //         flag_Loading: false
    //     } )
    // }



    loaddata = async () => {
        let walletDetails = await utils.getWalletDetails();
        let setUpWalletAnswerDetails = walletDetails.setUpWalletAnswerDetails;
        var resAccountDetails = await comFunDBRead.readTblAccount();
        let backupType = JSON.parse( walletDetails.appHealthStatus );
        console.log( { backupType } );
        let sssDetails = await utils.getSSSDetails();
        console.log( { walletDetails, sssDetails } );
        //flag   
        let flag_isSetupTrustedContact, flag_isSecretQuestions, flag_isMnemonic;
        //array  
        let arr_TrustedContacts = [], arr_SecretQuestion = [];
        let encrShares = [];
        let history = [];
        let tempOpt = [];
        let temp = [];
        //Trusted Contacts
        if ( sssDetails.length > 0 ) {
            //setup sss
            if ( sssDetails[ 0 ].keeperInfo == "" ) {
                flag_isSetupTrustedContact = true;
            } else {
                flag_isSetupTrustedContact = false;
            }

            for ( let i = 0; i <= 1; i++ ) {
                let keeperInfo = JSON.parse( sssDetails[ i ].keeperInfo );
                console.log( { keeperInfo } );
                let data = {};
                data.encryptedMetaShare = JSON.parse( sssDetails[ i ].encryptedMetaShare );
                data.emailAddresses = keeperInfo.emailAddresses;
                data.phoneNumbers = keeperInfo.phoneNumbers;
                data.history = JSON.parse( sssDetails[ i ].history );
                data.recordID = keeperInfo.recordID;
                data.thumbnailPath = keeperInfo.thumbnailPath
                data.givenName = keeperInfo.givenName;
                data.familyName = keeperInfo.familyName;
                const dateTime = Date.now();
                let sharedDate = parseInt( sssDetails[ i ].sharedDate );
                // console.warn( 'sharedDate date =' + sharedDate.toString() + "and full date =" + fulldate.toString() );
                var startDate = new Date( dateTime );
                var endDate = new Date( sharedDate );
                //console.warn( 'sart date =' + startDate.toString() + "end date = " + endDate.toString() )
                var diff = Math.abs( startDate.getTime() - endDate.getTime() );
                //console.warn( 'diff' + diff.toString() );  
                const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
                const seconds: any = Math.floor( diff / 1000 % 60 );
                //console.log( { minutes, seconds } );
                //console.warn( minutes.toString() )
                const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
                data.totalSec = 540 - totalSec;

                console.log( { histry: data.history } );

                //for history get opt     
                for ( let i = 0; i < data.history.length; i++ ) {
                    let eachHistory = data.history;
                    console.log( { eachHistory } );
                    let eachHistoryLength = eachHistory.length;
                    console.log( { eachHistory } );
                    console.log( eachHistory[ eachHistoryLength - 1 ] );
                    // let otp = "otp" in eachHistory[ eachHistoryLength - 1 ] ? eachHistory[ eachHistoryLength - 1 ].otp : undefined
                    let otp = 'otp' in eachHistory[ eachHistoryLength - 1 ] || undefined
                    tempOpt.push( otp );
                }
                console.log( { share: sssDetails[ i ] } );

                if ( totalSec < 540 && sssDetails[ i ].shareStage == "Ugly" ) {
                    data.statusMsg = "Shared";
                    data.statusMsgColor = "#C07710";
                    data.flag_timer = true;
                    data.opt = tempOpt[ i ];
                } else if ( totalSec >= 540 && sssDetails[ i ].shareStage == "Ugly" ) {
                    data.statusMsg = "Shared OTP expired.";
                    data.statusMsgColor = "#C07710";
                    data.flag_timer = false;
                } else if ( sssDetails[ i ].shareStage == "Good" ) {
                    data.statusMsg = "Share accessible";
                    data.statusMsgColor = "#008000";
                    data.flag_timer = false;
                } else if ( sssDetails[ i ].shareStage == "Bad" ) {
                    data.statusMsg = "Share accessible";
                    data.statusMsgColor = "#C07710";
                    data.flag_timer = false;
                } else if ( sssDetails[ i ].shareStage == "Ugly" && sssDetails[ i ].sharedDate != "" ) {
                    data.statusMsg = "Share not accessible";
                    data.statusMsgColor = "#ff0000";
                    data.flag_timer = false;
                }
                else {
                    data.statusMsg = "Not shared";
                    data.statusMsgColor = "#ff0000";
                    data.flag_timer = false;
                }
                arr_TrustedContacts.push( data );
            }
            //secret question
            console.log( { setUpWalletAnswerDetails } );
            if ( setUpWalletAnswerDetails == "" ) {
                flag_isSecretQuestions = false
            } else {
                flag_isSecretQuestions = true
            }
            let data = {};
            data.icon = "timelockNew";
            data.title = "First Secret Question";
            data.subTitle = "Not Backed up";
            data.color = "#ff0000";
            arr_SecretQuestion.push( data )
            this.setState( {
                flag_isSetupTrustedContact,
                arr_TrustedContacts,
                flag_isSecretQuestions,
                arr_SecretQuestion
            } )
        }
        // //Trusted Contacts list
        // for ( let i = 0; i < sssDetails.length; i++ ) {
        //     encrShares.push( sssDetails[ i ].share )
        //     history.push( JSON.parse( sssDetails[ i ].history ) )
        // }
        // //for history get opt
        // for ( let i = 0; i < history.length; i++ ) {
        //     let eachHistory = history[ i ];
        //     let eachHistoryLength = eachHistory.length;
        //     let otp = eachHistory[ eachHistoryLength - 1 ].otp;
        //     tempOpt.push( otp )
        // }
        // //console.log( parseInt( walletDetails.lastUpdated ) );
        // let updateShareIdStatus = await comAppHealth.connection_AppHealthStatus( parseInt( walletDetails.lastUpdated ), 0, encrShares, walletDetails.mnemonic );
        // // console.log( { updateShareIdStatus } );
        // if ( updateShareIdStatus ) {
        //     var data = await dbOpration.readTablesData(
        //         localDB.tableName.tblSSSDetails
        //     );
        //     data = data.temp;
        //     //console.log( { data } );
        //     const dateTime = Date.now();
        //     //const fulldate = Math.floor( dateTime / 1000 );
        //     for ( let i = 0; i < data.length; i++ ) {
        //         let jsondata = JSON.parse( data[ i ].keeperInfo );
        //         jsondata.history = JSON.parse( data[ i ].history );
        //         let sharedDate = parseInt( data[ i ].sharedDate );
        //         // console.warn( 'sharedDate date =' + sharedDate.toString() + "and full date =" + fulldate.toString() );
        //         var startDate = new Date( dateTime );
        //         var endDate = new Date( sharedDate );
        //         //console.warn( 'sart date =' + startDate.toString() + "end date = " + endDate.toString() )
        //         var diff = Math.abs( startDate.getTime() - endDate.getTime() );
        //         //console.warn( 'diff' + diff.toString() );  
        //         const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
        //         const seconds: any = Math.floor( diff / 1000 % 60 );
        //         //console.log( { minutes, seconds } );
        //         //console.warn( minutes.toString() )
        //         const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
        //         let mesData = data[ i ];
        //         //  console.log( { totalSec, mesData } );
        //         jsondata.totalSec = 540 - totalSec;
        //         if ( totalSec < 540 && data[ i ].shareStage == "Ugly" ) {
        //             jsondata.statusMsg = "Shared";
        //             jsondata.statusMsgColor = "#C07710";
        //             jsondata.flag_timer = true;
        //             jsondata.opt = tempOpt[ i ];
        //         } else if ( totalSec >= 540 && data[ i ].shareStage == "Ugly" ) {
        //             jsondata.statusMsg = "Shared OTP expired.";
        //             jsondata.statusMsgColor = "#C07710";
        //             jsondata.flag_timer = false;
        //         } else if ( data[ i ].shareStage == "Good" ) {
        //             jsondata.statusMsg = "Share accessible";
        //             jsondata.statusMsgColor = "#008000";
        //             jsondata.flag_timer = false;
        //         } else if ( data[ i ].shareStage == "Bad" ) {
        //             jsondata.statusMsg = "Share accessible";
        //             jsondata.statusMsgColor = "#C07710";
        //             jsondata.flag_timer = false;
        //         } else if ( data[ i ].shareStage == "Ugly" && data[ i ].sharedDate != "" ) {
        //             jsondata.statusMsg = "Share not accessible";
        //             jsondata.statusMsgColor = "#ff0000";
        //             jsondata.flag_timer = false;
        //         }
        //         else {
        //             jsondata.statusMsg = "Not shared";
        //             jsondata.statusMsgColor = "#ff0000";
        //             jsondata.flag_timer = false;
        //         }
        //         temp.push( jsondata )
        //     }
        // } else {
        //     Alert.alert( "ShareId status not changed." )
        // }
        //}
        // } else {
        //     flag_isMnemonic = true;
        // }
        //Mnemonic
        // if ( backupType.backupType != "share" ) {
        //     flag_isMnemonic = true;
        // } else {
        //     flag_isMnemonic = false;
        // }
        // let arr_Mnemonic = [
        //     {
        //         title: "Mnemonic",
        //         subTitle: "Not backed up",
        //         color: "#ff0000",
        //         icon: "shield"
        //     }
        // ];
        // let dbMnemonic = walletDetails.mnemonic;
        // let arr_CheckMnemonic = dbMnemonic.split( ' ' );
        // let arr_randomNo = utils.getRandomBetweenNumber( 1, arr_CheckMnemonic.length );
        // console.log( { arr_CheckMnemonic, arr_randomNo } );
        // let arr_MnemonicNumbers = [ converter.toOrdinal( arr_randomNo[ 0 ] ), converter.toOrdinal( arr_randomNo[ 1 ] ), converter.toOrdinal( arr_randomNo[ 2 ] ) ]
        // let arr_MnemoicWords = [ arr_CheckMnemonic[ arr_randomNo[ 0 ] - 1 ], arr_CheckMnemonic[ arr_randomNo[ 1 ] - 1 ], arr_CheckMnemonic[ arr_randomNo[ 2 ] - 1 ] ]
        // var arr_MnemonicDetails = [];
        // arr_MnemonicDetails = [ arr_MnemonicNumbers, arr_MnemoicWords ];
        // console.log( { arr_MnemonicDetails } );


        // //Secret Questions  
        // let flag_DisableSecretQuestion, subTitleQA;
        // let setUpWalletAnswerDetails = JSON.parse( walletDetails.setUpWalletAnswerDetails );
        // if ( setUpWalletAnswerDetails != "" ) {
        //     flag_DisableSecretQuestion = false;
        //     subTitleQA = "Not backed up";
        // } else {
        //     flag_DisableSecretQuestion = true;
        //     subTitleQA = "Please first setup your Secret Questions.";
        // }
        // let arr_SecretQuestion = [
        //     {
        //         title: "First Secret Question",
        //         subTitle: subTitleQA,
        //         color: "#ff0000",
        //         icon: "shield"
        //     }
        // ];

        // //Secure Two Factor Auto
        // let flag_DisableSecureTwoFactor, subTitleTwoFactor;
        // //Two Factor Autoentication
        // let secureAccountDetails = resAccountDetails[ 1 ];
        // if ( secureAccountDetails.address != "" ) {
        //     flag_DisableSecureTwoFactor = false
        //     subTitleTwoFactor = "Not backed up";
        // } else {
        //     flag_DisableSecureTwoFactor = true;
        //     subTitleTwoFactor = "Please first active Secure Account.";
        // }

        // let arr_2FactorAuto = [
        //     {
        //         title: "2 Factor Aunthentication",
        //         subTitle: subTitleTwoFactor,
        //         color: "#ff0000",
        //         icon: "shield"
        //     }
        // ];
        // let secureAdditionalInfo = JSON.parse( resAccountDetails[ 1 ].additionalInfo );
        // let arr_SecureAccountDetials = [ {
        //     secret: secureAdditionalInfo[ 0 ].setupData.secret
        // } ];

        // console.log( { arr_SecureAccountDetials } );

    }



    //TODO: func click_Item
    click_Item = ( item: any ) => {
        this.props.navigation.push( "TrustedContactNavigator", {
            data: item
        } );
    }

    //TODO: func click_FirstMenuItem
    click_SecretQuestion( item: any ) {
        this.props.navigation.push( "BackupSecretQuestionsScreen", { data: this.state.arr_QuestionAndAnswerDetails } );
    }

    //TODO: click_SetupTrustedContacts
    click_SetupTrustedContacts() {
        this.setState( {
            arr_ModelBackupYourWallet: [
                {
                    modalVisible: true
                }
            ]
        } )
    }

    //TODO: Setup Two Factor 
    click_TwoFactorSetup() {
        this.props.navigation.push( "BackupSecureTwoFactorAutoScreen", { data: this.state.arr_SecureAccountDetials } );
    }

    //Mnemonic click
    click_MnemoicItem() {
        this.props.navigation.push( "HealthCheckMnemonicScreen", { data: this.state.arr_MnemonicDetails } );
    }


    //TODO: Self share
    click_SelfShare = async ( item: any ) => {
        let sssDetails = await utils.getSSSDetails();
        console.log( { sssDetails } );
        let key = JSON.parse( sssDetails[ 2 ].encryptedMetaShare )
        var email4shareFilePath = sssDetails[ 3 ].encryptedMetaShare;
        email4shareFilePath = email4shareFilePath.split( '"' ).join( "" );
        console.log( { email4shareFilePath } );

        if ( item.givenName == "Wallet" ) {
            this.props.navigation.push( "SelfShareUsingWalletQRCode", { data: key.key } )
        } else if ( item.givenName == "Email" ) {
            Mailer.mail( {
                subject: 'For 4 Share.',
                recipients: [ 'appasahebl@bithyve.com' ],
                body: '<b>For 4 share.Pdf password is your answer.</b>',
                isHTML: true,
                attachment: {
                    path: email4shareFilePath,  // The absolute path of the file from which to read data.
                    type: 'pdf',      // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                    name: 'For4Share',   // Optional: Custom filename for attachment
                }
            }, ( error, event ) => {
                if ( event == "sent" ) {

                    Alert.alert(
                        "Success",
                        "Email sent success.",
                        [
                            { text: 'Ok', onPress: () => console.log( 'OK' ) },
                        ],
                        { cancelable: true }
                    )
                } else {
                    Alert.alert(
                        error,
                        event,
                        [
                            { text: 'Ok', onPress: () => console.log( 'OK: Email Error Response' ) },
                        ],
                        { cancelable: true }
                    )
                }

            } );
        } else {
            alert.simpleOk( "Oops", "Working." );
        }

    }




    render() {
        //flag
        let { flag_isTrustedContacts, flag_isSetupTrustedContact, flag_isMnemonic, flag_isSecretQuestions, flag_isTwoFactor, flag_Loading, flag_SelfShare, flag_SelfShareDisable } = this.state;
        //TouchableOpacity
        let { flag_DisableSecureTwoFactor, flag_DisableSecretQuestion } = this.state;
        //array
        let { arr_TrustedContacts, arr_SelfShare, arr_SecretQuestion } = this.state;
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Health of the App</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >

                            { renderIf( flag_isTrustedContacts == true )(
                                <View style={ styles.viewTrustedContacts }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Trusted Contacts</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={
                                                arr_TrustedContacts
                                            }
                                            showsVerticalScrollIndicator={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity style={ {
                                                } } onPress={ () => {
                                                    this.click_Item( item )
                                                } }
                                                    disabled={ flag_isSetupTrustedContact }
                                                >
                                                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                            { renderIf( item.thumbnailPath != "" )(
                                                                flag_isSetupTrustedContact == true ? <Avatar medium rounded icon={ { name: item.thumbnailPath, type: 'font-awesome' } } /> : <Avatar medium rounded source={ { uri: item.thumbnailPath } } />

                                                            ) }
                                                            { renderIf( item.thumbnailPath == "" )(
                                                                <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                            ) }
                                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                                <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                                <View style={ { flexDirection: "row" } }>
                                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>{ item.statusMsg }</Text>
                                                                    { renderIf( typeof item.opt !== "undefined" )(
                                                                        <TimerCountdown
                                                                            initialMilliseconds={ item.totalSec * 1000 }
                                                                            onExpire={ () => this.connection_Load() }
                                                                            formatMilliseconds={ ( milliseconds ) => {
                                                                                const remainingSec = Math.round( milliseconds / 1000 );
                                                                                const seconds = parseInt( ( remainingSec % 60 ).toString(), 10 );
                                                                                const minutes = parseInt( ( ( remainingSec / 60 ) % 60 ).toString(), 10 );
                                                                                const hours = parseInt( ( remainingSec / 3600 ).toString(), 10 );
                                                                                const s = seconds < 10 ? '0' + seconds : seconds;
                                                                                const m = minutes < 10 ? '0' + minutes : minutes;
                                                                                let h = hours < 10 ? '0' + hours : hours;
                                                                                h = h === '00' ? '' : h + ':';
                                                                                return h + m + ':' + s;
                                                                            } }
                                                                            allowFontScaling={ true }
                                                                            style={ { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } }
                                                                        />
                                                                    ) }
                                                                </View>
                                                                { renderIf( typeof item.opt !== "undefined" )(
                                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>OTP { " " }{ item.opt }</Text>
                                                                ) }
                                                            </View>
                                                            <View style={ {
                                                                flex: 1,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexDirection: "row"
                                                            } }>
                                                                <View style={ { flexDirection: "column", flex: 1, alignItems: "center" } }>
                                                                    <Text note style={ { fontSize: 14 } }>Last assessed on</Text>
                                                                    <Text style={ { fontSize: 14 } }>4/11/2019 12:23</Text>
                                                                </View>
                                                                <IconFontAwe name="angle-right" style={ { fontSize: 25, marginRight: 10, flex: 0.1 } } />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ item => item.recordID }
                                            extraData={ this.state }
                                        />
                                    </View>
                                    { renderIf( flag_isSetupTrustedContact == true )(
                                        <View style={ { flex: 1 } }>
                                            <Button
                                                onPress={ () => {
                                                    this.setState( {
                                                        arr_ModelFindYourTrustedContacts: [
                                                            {
                                                                modalVisible: true
                                                            }
                                                        ]
                                                    } );
                                                } }
                                                style={ [ globalStyle.ffFiraSansSemiBold, {
                                                    backgroundColor: "#838383", borderRadius: 10, margin: 5,
                                                    height: 40,
                                                } ] }
                                                full>
                                                <Text style={ { color: "#ffffff" } }>Setup your SSS</Text>
                                            </Button>
                                        </View>
                                    ) }
                                </View>
                            ) }

                            { renderIf( flag_SelfShare == true )(
                                <View style={ { flex: 3 } }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Self Share</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={
                                                arr_SelfShare
                                            }
                                            showsVerticalScrollIndicator={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity style={ {
                                                } } onPress={ () => {
                                                    this.click_SelfShare( item )
                                                } }
                                                    disabled={ flag_isSetupTrustedContact }
                                                >
                                                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                            <Avatar medium rounded icon={ { name: item.thumbnailPath, type: 'font-awesome' } } />
                                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                                <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                                <View style={ { flexDirection: "row" } }>
                                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>{ item.statusMsg }</Text>
                                                                    { renderIf( typeof item.opt !== "undefined" )(
                                                                        <TimerCountdown
                                                                            initialMilliseconds={ item.totalSec * 1000 }
                                                                            onExpire={ () => this.connection_Load() }
                                                                            formatMilliseconds={ ( milliseconds ) => {
                                                                                const remainingSec = Math.round( milliseconds / 1000 );
                                                                                const seconds = parseInt( ( remainingSec % 60 ).toString(), 10 );
                                                                                const minutes = parseInt( ( ( remainingSec / 60 ) % 60 ).toString(), 10 );
                                                                                const hours = parseInt( ( remainingSec / 3600 ).toString(), 10 );
                                                                                const s = seconds < 10 ? '0' + seconds : seconds;
                                                                                const m = minutes < 10 ? '0' + minutes : minutes;
                                                                                let h = hours < 10 ? '0' + hours : hours;
                                                                                h = h === '00' ? '' : h + ':';
                                                                                return h + m + ':' + s;
                                                                            } }
                                                                            allowFontScaling={ true }
                                                                            style={ { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } }
                                                                        />
                                                                    ) }
                                                                </View>
                                                                { renderIf( typeof item.opt !== "undefined" )(
                                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>OTP { " " }{ item.opt }</Text>
                                                                ) }
                                                            </View>
                                                            <View style={ {
                                                                flex: 1,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexDirection: "row"
                                                            } }>
                                                                <View style={ { flexDirection: "column", flex: 1, alignItems: "center" } }>
                                                                    <Text note style={ { fontSize: 14 } }>Last assessed on</Text>
                                                                    <Text style={ { fontSize: 14 } }>4/11/2019 12:23</Text>
                                                                </View>
                                                                <IconFontAwe name="angle-right" style={ { fontSize: 25, marginRight: 10, flex: 0.1 } } />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ item => item.recordID }
                                            extraData={ this.state }
                                        />
                                    </View>

                                </View>
                            ) }




                            { renderIf( flag_isMnemonic == true )(
                                <View style={ styles.viewMnemonic }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Mnemonic</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={ this.state.arr_Mnemonic }
                                            showsVerticalScrollIndicator={ false }
                                            scrollEnabled={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity
                                                    onPress={ () => this.click_MnemoicItem() }
                                                >
                                                    <RkCard
                                                        rkType="shadowed"
                                                        style={ {
                                                            flex: 1,
                                                            borderRadius: 8,
                                                            marginLeft: 8,
                                                            marginRight: 8,
                                                            marginBottom: 4,
                                                        } }
                                                    >
                                                        <View
                                                            rkCardHeader
                                                            style={ {
                                                                flex: 1,
                                                            } }
                                                        >
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                                <SvgIcon
                                                                    name={ item.icon }
                                                                    color="#BABABA"
                                                                    size={ 30 }
                                                                />
                                                            </View>
                                                            <View style={ { flex: 1, flexDirection: "column" } }>
                                                                <Text
                                                                    style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                                >
                                                                    { item.title }
                                                                </Text>
                                                                <Text note numberOfLines={ 1 } style={ { fontSize: 11, color: item.color } }>{ item.subTitle }</Text>
                                                            </View>
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                                <SvgIcon
                                                                    name="icon_forword"
                                                                    color="#BABABA"
                                                                    size={ 20 }
                                                                />
                                                            </View>
                                                        </View>
                                                    </RkCard>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ ( item, index ) => index }
                                        />
                                    </View>
                                </View>
                            ) }


                            { renderIf( flag_isSecretQuestions == true )(
                                <View style={ { flex: 1 } }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Secret Questions</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={ arr_SecretQuestion }
                                            showsVerticalScrollIndicator={ false }
                                            scrollEnabled={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity
                                                    onPress={ () => this.click_SecretQuestion( item ) }
                                                >
                                                    <RkCard
                                                        rkType="shadowed"
                                                        style={ {
                                                            flex: 1,
                                                            borderRadius: 8,
                                                            marginLeft: 8,
                                                            marginRight: 8,
                                                            marginBottom: 4,
                                                        } }
                                                    >
                                                        <View
                                                            rkCardHeader
                                                            style={ {
                                                                flex: 1,
                                                            } }
                                                        >
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                                <SvgIcon
                                                                    name={ item.icon }
                                                                    color="#BABABA"
                                                                    size={ 30 }
                                                                />
                                                            </View>
                                                            <View style={ { flex: 1, flexDirection: "column" } }>
                                                                <Text
                                                                    style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                                >
                                                                    { item.title }
                                                                </Text>
                                                                <Text note numberOfLines={ 1 } style={ { fontSize: 11, color: item.color } }>{ item.subTitle }</Text>
                                                            </View>
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                                <SvgIcon
                                                                    name="icon_forword"
                                                                    color="#BABABA"
                                                                    size={ 20 }
                                                                />
                                                            </View>
                                                        </View>
                                                    </RkCard>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ ( item, index ) => index }
                                        />
                                    </View>
                                </View>
                            ) }

                            { renderIf( flag_isTwoFactor == true )(
                                <View style={ styles.view2FactorAuto }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Secure Wallet Two-Factor Autoentication</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={ this.state.arr_2FactorAuto }
                                            showsVerticalScrollIndicator={ false }
                                            scrollEnabled={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity
                                                    onPress={ () => this.click_TwoFactorSetup() }
                                                    disabled={ flag_DisableSecureTwoFactor }
                                                >
                                                    <RkCard
                                                        rkType="shadowed"
                                                        style={ {
                                                            flex: 1,
                                                            borderRadius: 8,
                                                            marginLeft: 8,
                                                            marginRight: 8,
                                                            marginBottom: 4,
                                                        } }
                                                    >
                                                        <View
                                                            rkCardHeader
                                                            style={ {
                                                                flex: 1,
                                                            } }
                                                        >
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                                <SvgIcon
                                                                    name={ item.icon }
                                                                    color="#BABABA"
                                                                    size={ 30 }
                                                                />
                                                            </View>
                                                            <View style={ { flex: 1, flexDirection: "column" } }>
                                                                <Text
                                                                    style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                                >
                                                                    { item.title }
                                                                </Text>
                                                                <Text note numberOfLines={ 1 } style={ { fontSize: 11, color: item.color } }>{ item.subTitle }</Text>
                                                            </View>
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                                <SvgIcon
                                                                    name="icon_forword"
                                                                    color="#BABABA"
                                                                    size={ 20 }
                                                                />
                                                            </View>
                                                        </View>
                                                    </RkCard>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ ( item, index ) => index }
                                        />
                                    </View>
                                </View>
                            ) }

                        </KeyboardAwareScrollView>
                    </ImageBackground>
                    <ModelFindYourTrustedContacts
                        data={ this.state.arr_ModelFindYourTrustedContacts }
                        click_Confirm={ async () => {
                            await Permissions.request( 'contacts' ).then( ( response: any ) => {
                                console.log( response );
                                if ( response == "authorized" ) {
                                    this.props.navigation.push( "BackUpYourWalletNavigator" )
                                } else {
                                    alert.simpleOk( "Oops", "Please add contacts permission." );
                                }
                            } );
                            this.setState( {
                                arr_ModelFindYourTrustedContacts: [
                                    {
                                        modalVisible: false
                                    }
                                ]
                            } )

                        } }
                        closeModal={ () => {
                            this.setState( {
                                arr_ModelFindYourTrustedContacts: [
                                    {
                                        modalVisible: false
                                    }
                                ]
                            } )
                        } }
                    />
                </SafeAreaView>
                <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
            </Container >
        );
    }
}
const primaryColor = colors.appColor;
const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    },
    viewTrustedContacts: {
        flex: 1,
    },
    viewMnemonic: {
        flex: 1
    },
    viewSecretQuestion: {
        flex: 1
    },
    view2FactorAuto: {
        flex: 1
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    }
} );
