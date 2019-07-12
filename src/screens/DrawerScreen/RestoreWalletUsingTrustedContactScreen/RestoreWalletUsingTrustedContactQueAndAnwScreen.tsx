import React, { Component } from "react";
import {
    StyleSheet,
    View,
    AsyncStorage,
    Platform,
    Dimensions,
    Image,
    Keyboard,
    StatusBar,
    Linking,
    Alert,
    ImageBackground,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { RkCard } from "react-native-ui-kitten";
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Button } from 'native-base';
import { StackActions, NavigationActions } from "react-navigation";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import Permissions from 'react-native-permissions'
import { SvgIcon } from "@up-shared/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";

//TODO: Custome Models  
import ModelRestoreWalletFirstQuestion from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelRestoreWalletFirstQuestion";
import ModelRestoreWalletSecoundQuestion from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelRestoreWalletSecoundQuestion";
import ModelRestoreWalletSuccessfullyUsingTrustedContact from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelRestoreWalletSuccessfullyUsingTrustedContact";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    colors,
    images,
    localDB,
    asyncStorageKeys
} from "HexaWallet/src/app/constants/Constants";
import utils from "HexaWallet/src/app/constants/Utils";
import Singleton from "HexaWallet/src/app/constants/Singleton";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//localization
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";
import SecureAccount from "HexaWallet/src/bitcoin/services/accounts/SecureAccount";



export default class RestoreWalletUsingTrustedContactQueAndAnwScreen extends Component {

    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_WalletDetail: [],
            arr_SSSDetails: [],

            arr_ModelRestoreWalletFirstQuestion: [],
            arr_ModelRestoreWalletSecoundQuestion: [],
            arr_QuestionAndAnwserDetails: [],
            arr_ModelRestoreWalletSuccessfullyUsingTrustedContact: [],
            flag_Loading: false
        };
    }


    async componentDidMount() {
        let arr_WalletDetail = await comFunDBRead.readTblWallet();
        let arr_SSSDetails = await comFunDBRead.readTblSSSDetails();
        console.log( { arr_WalletDetail } );
        this.setState( {
            arr_WalletDetail,
            arr_SSSDetails,
            arr_ModelRestoreWalletFirstQuestion: [
                {
                    modalVisible: true
                }
            ]
        } )
    }

    //TODO: Secound question click Next 
    click_Next = async ( Question: string, Answer: string ) => {
        // this.setState( {
        //     flag_Loading: true
        // } );
        console.log( { Question, Answer } );
        const dateTime = Date.now();
        let walletDetail = await utils.getWalletDetails();
        let sssDetails = await utils.getSSSDetails();



        console.log( { sssDetails } );

        // var temp = [];
        // data.Question = secoundQuestion;
        // data.secoundAnswer = secoundAnswer;
        // temp.push( data );

        let decryptedShare = [];
        let arr_TableId = [];
        // let answers = [ temp[ 0 ].firstAnswer, temp[ 1 ].secoundAnswer ];

        for ( let i = 0; i < sssDetails.length; i++ ) {
            let data = sssDetails[ i ];
            if ( data.decryptedShare != "" ) {
                let decryptedShareJson = JSON.parse( data.decryptedShare );
                decryptedShare.push( decryptedShareJson );
            }
            arr_TableId.push( data.id );
        }

        console.log( { decryptedShare, Answer } );
        const resMnemonic = await S3Service.recoverFromShares( decryptedShare, Answer );
        if ( resMnemonic.status == 200 ) {

        } else {
            alert.simpleOk( "Oops", resMnemonic.err );
        }

        // let regularAccount = await utils.getRegularAccountObject();
        // await dbOpration.updateWalletMnemonicAndAnwserDetails(
        //     localDB.tableName.tblWallet,
        //     mnemonic,
        //     temp,
        //     dateTime
        // );
        // const res = await comAppHealth.connection_AppHealthStatusUpdateUsingRetoreWalletTrustedContact( dateTime, 0, decryptedShare, mnemonic, arr_RecordId );
        // // console.log( { res } );
        // const getBal = await regularAccount.getBalance();
        // let secureAccount = await utils.getSecureAccountObject();
        // // const secureAccount = new SecureAccount( mnemonic );
        // const resSetupSecureAccount = await secureAccount.setupSecureAccount();
        // //console.log( { getBal } );
        // if ( getBal.status == 200 && res ) {
        //     this.setState( {
        //         flag_Loading: false
        //     } )
        //     utils.setDeepLinkingType( "" );
        //     utils.setDeepLinkingUrl( "" );
        //     await dbOpration.insertCreateAccount(
        //         localDB.tableName.tblAccount,
        //         dateTime,
        //         "",
        //         getBal.data.balance / 1e8,
        //         "BTC",
        //         "Daily Wallet",
        //         "Daily Wallet",
        //         ""
        //     );
        //     const secondaryMnemonic = await secureAccount.getRecoveryMnemonic();
        //     let arr_SecureDetails = [];
        //     let secureDetails = {};
        //     secureDetails.setupData = resSetupSecureAccount.data.setupData;
        //     secureDetails.secondaryXpub = resSetupSecureAccount.data.secondaryXpub;
        //     secureDetails.secondaryMnemonic = secondaryMnemonic;
        //     secureDetails.backupDate = dateTime;
        //     secureDetails.title = "Active Now";
        //     secureDetails.addInfo = "";
        //     arr_SecureDetails.push( secureDetails );
        //     let resInsertSecureCreateAcc = await dbOpration.insertCreateAccount(
        //         localDB.tableName.tblAccount,
        //         dateTime,
        //         "",
        //         "0.0",
        //         "BTC",
        //         "Secure Account",
        //         "Secure Account",
        //         arr_SecureDetails
        //     );
        //     if ( resInsertSecureCreateAcc ) {
        //         setTimeout( () => {
        //             this.setState( {
        //                 arr_QuestionAndAnwserDetails: temp,
        //                 arr_ModelRestoreWalletSecoundQuestion: [
        //                     {
        //                         modalVisible: false,
        //                         arr_QuestionList
        //                     }
        //                 ],
        //                 arr_ModelRestoreWalletSuccessfullyUsingTrustedContact: [
        //                     {
        //                         modalVisible: true,
        //                         walletName: walletDetail.walletType,
        //                         bal: getBal.data.balance / 1e8
        //                     }
        //                 ]
        //             } )
        //             AsyncStorage.setItem(
        //                 asyncStorageKeys.rootViewController,
        //                 "TabbarBottom"
        //             );
        //         }, 1000 );
        //     }
        // } else {
        //     Alert.alert( "App health not updated." )
        // }
    }




    //TODO: Success Wallet Setup then skip button on click
    click_Skip() {
        const resetAction = StackActions.reset( {
            index: 0, // <-- currect active route from actions array
            key: null,
            actions: [
                NavigationActions.navigate( { routeName: "TabbarBottom" } )
            ]
        } );
        this.props.navigation.dispatch( resetAction );
    }

    render() {
        //array                
        let { arr_QuestionList } = this.state;
        return (
            <View style={ styles.container }>
                <SafeAreaView style={ styles.container }>
                    <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <ModelRestoreWalletFirstQuestion data={ this.state.arr_ModelRestoreWalletFirstQuestion } click_Next={ ( firstQuestion: string, firstAnswer: string ) => {
                                console.log( { firstQuestion } );
                                this.click_Next( firstQuestion, firstAnswer );
                            }
                            }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelRestoreWalletFirstQuestion: [
                                            {
                                                modalVisible: false
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } }
                            />
                            <ModelRestoreWalletSuccessfullyUsingTrustedContact data={ this.state.arr_ModelRestoreWalletSuccessfullyUsingTrustedContact }
                                click_Skip={ () => {
                                    this.click_Skip()
                                }
                                }
                                click_RestoreSecureAccount={ () => {
                                    this.setState( {
                                        arr_ModelRestoreWalletSuccessfullyUsingTrustedContact: [
                                            {
                                                modalVisible: false
                                            }
                                        ]
                                    } )
                                    this.props.navigation.push( "ResotreSecureAccountNavigator", { prevScreen: "RestoreWallet" } );
                                } }
                            />

                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } />
            </View >
        );
    }
}


let styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#1F8BCD"
    },
    viewSetupWallet: {
        flex: 4,
        margin: 10
    },
    viewAppLogo: {
        marginTop: 20,
        flex: 1,
        alignItems: "center",
    },
    imgAppLogo: {
        height: 70,
        width: 70
    },
    txtWhiteColor: {
        color: "#ffffff"
    }

} );
