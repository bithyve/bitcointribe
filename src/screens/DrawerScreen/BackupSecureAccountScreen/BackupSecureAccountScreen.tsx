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
    PermissionsAndroid
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
import ModelBackupSecureAccount from "HexaWallet/src/app/custcompontes/Model/ModelBackupSecureAccount/ModelBackupSecureAccount";
import ModelAuto6DigitCode from "HexaWallet/src/app/custcompontes/Model/ModelBackupSecureAccount/ModelAuto6DigitCode";
import ModelSecureAccountSucessBackup from "HexaWallet/src/app/custcompontes/Model/ModelBackupSecureAccount/ModelSecureAccountSucessBackup";
import ModelSecureAccountFailedBackup from "HexaWallet/src/app/custcompontes/Model/ModelBackupSecureAccount/ModelSecureAccountFailedBackup";


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







//TODO: Bitcoin Files
import SecurePDFGen from "HexaWallet/src/bitcoin/utilities/securePDFGenerator";

export default class BackupSecureAccountScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_SecureAccountDetails: [],
            arr_ModelBackupSecureAccount: [],
            arr_ModelAuto6DigitCode: [],
            arr_ModelSecureAccountSucessBackup: [],
            arr_ModelSecureAccountFailedBackup: []
        };
    }

    async componentDidMount() {
        let data = this.props.navigation.getParam( "data" );
        console.log( { data } );
        if ( Platform.OS == "android" ) {
            try {
                await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message:
                            'Write storage permission need.',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
            } catch ( err ) {
                console.warn( err );
            }
        }
        this.setState( {
            arr_SecureAccountDetails: data,
            arr_ModelBackupSecureAccount: [
                {
                    modalVisible: true,
                    secureAccountDetails: data
                }
            ]
        } )

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
                            <ModelBackupSecureAccount data={ this.state.arr_ModelBackupSecureAccount } click_Next={ ( data: any ) => {
                                this.setState( {
                                    arr_ModelBackupSecureAccount: [
                                        {
                                            modalVisible: false
                                        }
                                    ],
                                    arr_ModelAuto6DigitCode: [
                                        {
                                            modalVisible: true,
                                            data: data
                                        }
                                    ]
                                } );
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelBackupSecureAccount: [
                                            {
                                                modalVisible: false
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } }
                            />
                            <ModelAuto6DigitCode data={ this.state.arr_ModelAuto6DigitCode } click_Next={ () =>
                                this.setState( {
                                    arr_ModelAuto6DigitCode: [
                                        {
                                            modalVisible: false,
                                            data: []
                                        }
                                    ],
                                    arr_ModelSecureAccountSucessBackup: [
                                        {
                                            modalVisible: true
                                        }
                                    ],
                                } )
                            } pop={ () => {
                                this.setState( {
                                    arr_ModelAuto6DigitCode: [
                                        {
                                            modalVisible: false
                                        }
                                    ],
                                } );
                                this.props.navigation.pop()
                            } } />
                            <ModelSecureAccountSucessBackup data={ this.state.arr_ModelSecureAccountSucessBackup }
                                click_Done={ () => {
                                    this.setState( {
                                        arr_ModelSecureAccountSucessBackup: [
                                            {
                                                modalVisible: false
                                            }
                                        ]
                                    } )
                                    this.props.navigation.navigate( "TabbarBottom" )
                                } } />
                            <ModelSecureAccountFailedBackup data={ this.state.arr_ModelSecureAccountFailedBackup }
                                click_Done={ () => {
                                    this.setState( {
                                        arr_ModelSecureAccountFailedBackup: [
                                            {
                                                modalVisible: false
                                            }
                                        ]
                                    } )
                                    this.props.navigation.navigate( "TabbarBottom" )
                                } } />
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
