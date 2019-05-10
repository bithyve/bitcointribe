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
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import ModelWalletName from "HexaWallet/src/app/custcompontes/Model/ModelWalletUsingPassphrase/ModelWalletName";
import ModelEnterAndConfirmPassphrase from "HexaWallet/src/app/custcompontes/Model/ModelWalletUsingPassphrase/ModelEnterAndConfirmPassphrase";
import ModelWalletSuccessfullyRestored from "HexaWallet/src/app/custcompontes/Model/ModelWalletUsingPassphrase/ModelWalletSuccessfullyRestored";

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
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import HealthStatus from "HexaWallet/src/bitcoin/utilities/HealthStatus"

export default class WalletUsingPassphraseScrren extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_ModelWalletName: [],
            arr_ConfirmPassphrase: [],
            arr_ModelRestoreSucess: [],
            wallerName: ""
        };
    }

    componentDidMount() {
        this.setState( {
            arr_ModelWalletName: [
                {
                    modalVisible: true
                }
            ]
        } )
    }

    //TODO: func click_getWalletDetails
    getWalletDetails = async ( mnemonic: string ) => {
        const dateTime = Date.now();
        const fulldate = Math.floor( dateTime / 1000 );
        let walletName = this.state.wallerName;
        const healthStatus = new HealthStatus();
        const res = await healthStatus.appHealthStatus( 0, 0, null, fulldate, "mnemonic" );
        console.log( { res } );
        await utils.setAppHealthStatus( res );
        await dbOpration.updateWalletMnemonic(
            localDB.tableName.tblWallet,
            mnemonic,
            fulldate
        );
        await dbOpration.updateWalletDetials(
            localDB.tableName.tblWallet,
            res
        );
        await dbOpration.insertCreateAccount(
            localDB.tableName.tblAccount,
            fulldate,
            "",
            "BTC",
            walletName,
            "Wallet",
            ""
        );
    }

    //TODO: Sucess Model
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
                            <ModelWalletName data={ this.state.arr_ModelWalletName } click_Confirm={ ( val ) => {
                                console.log( { val } );
                                this.setState( {
                                    wallerName: val,
                                    arr_ModelWalletName: [
                                        {
                                            modalVisible: false
                                        }
                                    ],
                                    arr_ConfirmPassphrase: [
                                        {
                                            modalVisible: true
                                        }
                                    ]
                                } )
                            }
                            }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelWalletName: [
                                            {
                                                modalVisible: false
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } }
                            />
                            <ModelEnterAndConfirmPassphrase data={ this.state.arr_ConfirmPassphrase } click_Confirm={ ( val: string ) => {
                                this.getWalletDetails( val );
                                this.setState( {
                                    arr_ConfirmPassphrase: [
                                        {
                                            modalVisible: false
                                        }
                                    ],
                                    arr_ModelRestoreSucess: [
                                        {
                                            modalVisible: true
                                        }
                                    ]
                                } )
                            }
                            }
                                pop={ () => {
                                    this.setState( {
                                        arr_ConfirmPassphrase: [
                                            {
                                                modalVisible: false
                                            }
                                        ],
                                        arr_ModelWalletName: [
                                            {
                                                modalVisible: true
                                            }
                                        ],

                                    } );

                                } }

                            />
                            <ModelWalletSuccessfullyRestored data={ this.state.arr_ModelRestoreSucess } click_Skip={ () => {
                                this.click_Skip()
                            }
                            }
                                click_RestoreSecureAccount={ () => Alert.alert( 'Working' ) }
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
