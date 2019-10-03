import React, { Component } from "react";
import {
    StyleSheet,
    View,
    AsyncStorage,
    ImageBackground,
    SafeAreaView,
} from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


//TODO: Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import ModelRestoreSecureAccount from "HexaWallet/src/app/custcompontes/Model/ModelRestoreSecureAccount/ModelRestoreSecureAccount";
import ModelQRCodeScanRestoreSecureAccount from "HexaWallet/src/app/custcompontes/Model/ModelRestoreSecureAccount/ModelQRCodeScanRestoreSecureAccount";
import ModelRestoreGAVerificationCode from "HexaWallet/src/app/custcompontes/Model/ModelRestoreSecureAccount/ModelRestoreGAVerificationCode";
import ModelSecureAccountSucessRestore from "HexaWallet/src/app/custcompontes/Model/ModelRestoreSecureAccount/ModelSecureAccountSucessRestore";


//TODO: Custome Object
import {
    colors,
    images,
    asyncStorageKeys
} from "HexaWallet/src/app/constants/Constants";


//localization       
import { localization } from "HexaWallet/src/app/manage/Localization/i18n";


export default class RestoreSecureAccountScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            prevScreenName: "",
            prevData: [],
            arr_ModelRestoreSecureAccount: [],
            arr_ModelQRCodeScanRestoreSecureAccount: [],
            arr_ModelRestoreGAVerificationCode: [],
            arr_ModelSecureAccountSucessRestore: []
        };
    }

    componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let screenName = this.props.navigation.getParam( "prevScreen" );
        console.log( { data, screenName } );
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {
                this.setState( {
                    prevScreenName: screenName,
                    prevData: data,
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
                                click_Next={ ( xPub: string ) => {
                                    let prevScreenName = this.state.prevScreenName;
                                    let prevData = this.state.prevData;
                                    this.setState( {
                                        arr_ModelQRCodeScanRestoreSecureAccount: [
                                            {
                                                modalVisible: false
                                            }
                                        ],
                                        arr_ModelRestoreGAVerificationCode: [ {
                                            modalVisible: true,
                                            xPub,
                                            prevScreenName,
                                            prevData
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
                                click_Next={ () => {
                                    this.setState( {
                                        arr_ModelRestoreGAVerificationCode: [ {
                                            modalVisible: false,
                                            xPub: "",
                                            prevScreenName: "",
                                            prevData: []
                                        } ],
                                        arr_ModelSecureAccountSucessRestore: [
                                            {
                                                modalVisible: true
                                            }
                                        ]
                                    } );
                                } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelRestoreGAVerificationCode: [
                                            {
                                                modalVisible: false,
                                                xPub: ""
                                            }
                                        ],
                                        arr_ModelQRCodeScanRestoreSecureAccount: [
                                            {
                                                modalVisible: true
                                            }
                                        ]
                                    } );
                                } }
                            />

                            <ModelSecureAccountSucessRestore data={ this.state.arr_ModelSecureAccountSucessRestore }
                                click_Done={ () => {
                                    let prevScreenName = this.state.prevScreenName;
                                    console.log( { prevScreenName } );
                                    this.setState( {
                                        arr_ModelSecureAccountSucessRestore: [
                                            {
                                                modalVisible: false,
                                            }
                                        ]
                                    } )

                                    if ( prevScreenName != "WalletScreen" ) {
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
                                    } else {
                                        this.props.navigation.navigate( "TabbarBottom" )
                                    }
                                } }
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
