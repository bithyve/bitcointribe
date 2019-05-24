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


//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";

export default class RestoreWalletUsingTrustedContactQueAndAnwScreen extends Component {

    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_WalletDetail: [],
            arr_SSSDetails: [],
            arr_QuestionList: [],
            arr_FirstQuestionList: [ {
                "item": "Name of your first pet?"
            }, {
                "item": "Name of your favourite teacher?"
            }, {
                "item": "Name of your favourite food?"
            }, {
                "item": "Name of your first company?"
            }, {
                "item": "Name of your first employee?"
            }
            ],
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
    click_SecoundNext = async ( secoundQuestion: string, secoundAnswer: string, arr_QuestionList: any ) => {
        this.setState( {
            flag_Loading: true
        } );
        const dateTime = Date.now();
        let walletDetail = this.state.arr_WalletDetail;
        let sssDetails = this.state.arr_SSSDetails;
        console.log( { walletDetail } );
        var temp = [];
        temp = this.state.arr_QuestionAndAnwserDetails;
        let data = {};
        data.secoundQuestion = secoundQuestion;
        data.secoundAnswer = secoundAnswer;
        temp.push( data );
        let decryptedShare = [];
        let arr_RecordId = [];
        let answers = [ temp[ 0 ].firstAnswer, temp[ 1 ].secoundAnswer ];
        for ( let i = 0; i < sssDetails.length; i++ ) {
            let data = sssDetails[ i ];
            if ( data.decryptedShare != "" ) {
                let decryptedShareJson = JSON.parse( data.decryptedShare );
                decryptedShare.push( decryptedShareJson.encryptedShare );
            }
            arr_RecordId.push( data.recordId );
        }
        console.log( { sssDetails, temp } );
        console.log( { decryptedShare, answers } );
        const mnemonic = await S3Service.recoverFromShares( decryptedShare, answers );
        console.log( mnemonic )
        const regularAccount = new RegularAccount(
            mnemonic
        );
        await dbOpration.updateWalletMnemonicAndAnwserDetails(
            localDB.tableName.tblWallet,
            mnemonic,
            temp,
            dateTime
        );
        const res = await comAppHealth.connection_AppHealthStatusUpdateUsingRetoreWalletTrustedContact( dateTime, 0, decryptedShare, mnemonic, arr_RecordId );
        // console.log( { res } );
        const getBal = await regularAccount.getBalance();
        //console.log( { getBal } );
        if ( getBal.status == 200 && res ) {
            this.setState( {
                flag_Loading: false
            } )
            await dbOpration.insertCreateAccount(
                localDB.tableName.tblAccount,
                dateTime,
                "",
                getBal.data.balance,
                "BTC",
                "Daily Wallet",
                "Daily Wallet",
                ""
            );
            setTimeout( () => {
                this.setState( {
                    arr_QuestionAndAnwserDetails: temp,
                    arr_ModelRestoreWalletSecoundQuestion: [
                        {
                            modalVisible: false,
                            arr_QuestionList
                        }
                    ],
                    arr_ModelRestoreWalletSuccessfullyUsingTrustedContact: [
                        {
                            modalVisible: true,
                            walletName: walletDetail.walletType,
                            bal: getBal.data.balance
                        }
                    ]
                } )
            }, 1000 );
        } else {
            Alert.alert( "App health not updated." )
        }
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
        AsyncStorage.setItem(
            asyncStorageKeys.rootViewController,
            "TabbarBottom"
        );
        this.props.navigation.dispatch( resetAction );
    }


    render() {
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
                            <ModelRestoreWalletFirstQuestion data={ this.state.arr_ModelRestoreWalletFirstQuestion } click_Next={ ( firstQuestion: string, firstAnswer: string, arr_QuestionList: any ) => {
                                console.log( { arr_QuestionList } );

                                let temp = [];
                                let data = {};
                                data.firstQuestion = firstQuestion;
                                data.firstAnswer = firstAnswer;
                                temp.push( data );
                                this.setState( {
                                    arr_QuestionAndAnwserDetails: temp,
                                    arr_ModelRestoreWalletFirstQuestion: [
                                        {
                                            modalVisible: false
                                        }
                                    ],
                                    arr_ModelRestoreWalletSecoundQuestion: [
                                        {
                                            modalVisible: true,
                                            arr_QuestionList
                                        }
                                    ]
                                } )
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
                            <ModelRestoreWalletSecoundQuestion data={ this.state.arr_ModelRestoreWalletSecoundQuestion }
                                flag_Loading={ this.state.flag_Loading }
                                click_Next={ ( secoundQuestion: string, secoundAnswer: string, arr_QuestionList: any ) => {
                                    this.setState( {
                                        arr_QuestionList
                                    } )
                                    this.click_SecoundNext( secoundQuestion, secoundAnswer, arr_QuestionList );
                                }
                                }
                                pop={ () => {
                                    let arr_FirstQuestionList = this.state.arr_FirstQuestionList;
                                    let arr_QuestionList = this.state.arr_QuestionList;
                                    this.setState( {
                                        arr_ModelRestoreWalletSecoundQuestion: [
                                            {
                                                modalVisible: false,
                                                arr_QuestionList
                                            }
                                        ],
                                        arr_ModelRestoreWalletFirstQuestion: [
                                            {
                                                modalVisible: true,
                                                arr_FirstQuestionList
                                            }
                                        ]
                                    } );
                                } }
                            />
                            <ModelRestoreWalletSuccessfullyUsingTrustedContact data={ this.state.arr_ModelRestoreWalletSuccessfullyUsingTrustedContact }
                                click_Skip={ () => {
                                    this.click_Skip()
                                }
                                }
                                click_RestoreSecureAccount={ () => Alert.alert( 'Working' ) }
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
