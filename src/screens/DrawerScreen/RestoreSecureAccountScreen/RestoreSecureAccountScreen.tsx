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
var converter = require( 'number-to-words' );

//TODO: Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import ModelRestoreSecureAccount from "HexaWallet/src/app/custcompontes/Model/ModelRestoreSecureAccount/ModelRestoreSecureAccount";
import ModelQRCodeScanRestoreSecureAccount from "HexaWallet/src/app/custcompontes/Model/ModelRestoreSecureAccount/ModelQRCodeScanRestoreSecureAccount";
import ModelRestoreGAVerificationCode from "HexaWallet/src/app/custcompontes/Model/ModelRestoreSecureAccount/ModelRestoreGAVerificationCode";


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

export default class RestoreSecureAccountScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_ModelRestoreSecureAccount: [],
            arr_ModelQRCodeScanRestoreSecureAccount: [],
            arr_ModelRestoreGAVerificationCode: []
        };
    }

    componentWillMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {
                this.setState( {
                    arr_ModelRestoreSecureAccount: [
                        {
                            modalVisible: true,
                        }
                    ]
                } );
            }
        );
    }

    componentWillUnmount() {
        this.willFocusSubscription.remove();
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
                            <ModelRestoreSecureAccount data={ this.state.arr_ModelRestoreSecureAccount } click_Next={ () => {
                                this.setState( {
                                    arr_ModelRestoreSecureAccount: [
                                        {
                                            modalVisible: false
                                        }
                                    ],
                                    arr_ModelQRCodeScanRestoreSecureAccount: [
                                        {
                                            modalVisible: true
                                        }
                                    ]

                                } );
                                // this.props.navigation.push( "QRCodeScanRestoreSecureAccount" );
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelRestoreSecureAccount: [
                                            {
                                                modalVisible: false
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } }
                            />
                            <ModelQRCodeScanRestoreSecureAccount data={ this.state.arr_ModelQRCodeScanRestoreSecureAccount }
                                click_Next={ () => {
                                    this.setState( {
                                        arr_ModelQRCodeScanRestoreSecureAccount: [
                                            {
                                                modalVisible: false
                                            }
                                        ],
                                        arr_ModelRestoreGAVerificationCode: [ {
                                            modalVisible: true
                                        } ]
                                    } );
                                } }
                                closeModal={ () => {
                                    this.setState( {
                                        arr_ModelQRCodeScanRestoreSecureAccount: [
                                            {
                                                modalVisible: false
                                            }
                                        ],
                                        arr_ModelRestoreSecureAccount: [
                                            {
                                                modalVisible: true
                                            }
                                        ]
                                    } );
                                } }
                            />
                            <ModelRestoreGAVerificationCode data={ this.state.arr_ModelRestoreGAVerificationCode }
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
