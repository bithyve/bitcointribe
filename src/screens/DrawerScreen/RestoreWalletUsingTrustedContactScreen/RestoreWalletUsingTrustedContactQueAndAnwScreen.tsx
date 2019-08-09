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
    click_Next = async ( data: any ) => {
        this.setState( {
            arr_ModelRestoreWalletFirstQuestion: [
                {
                    modalVisible: false,
                }
            ],
            arr_ModelRestoreWalletSuccessfullyUsingTrustedContact: [
                {
                    modalVisible: true,
                    walletName: data.walletName,
                    balR: data.balR,
                    balS: data.balS,
                }
            ]
        } );
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
        //flag
        let { flag_Loading } = this.state;
        //array                
        let { arr_QuestionList, arr_ModelRestoreWalletFirstQuestion, arr_ModelRestoreWalletSuccessfullyUsingTrustedContact } = this.state;
        return (
            <View style={ styles.container }>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <ModelRestoreWalletFirstQuestion data={ arr_ModelRestoreWalletFirstQuestion } click_Next={ ( data: any ) => {
                                this.click_Next( data );
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
                            <ModelRestoreWalletSuccessfullyUsingTrustedContact data={ arr_ModelRestoreWalletSuccessfullyUsingTrustedContact }
                                click_Skip={ () => {
                                    this.click_Skip()
                                }
                                }
                            />

                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
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
