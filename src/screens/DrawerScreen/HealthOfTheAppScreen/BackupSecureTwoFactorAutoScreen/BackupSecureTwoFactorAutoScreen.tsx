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
import ModelSecureTwoFactorSecretThreeCode from "HexaWallet/src/app/custcompontes/Model/ModelSecureTwoFactorAuto/ModelSecureTwoFactorSecretThreeCode";
import ModelSecureTwoFactorSuccessBackedUp from "HexaWallet/src/app/custcompontes/Model/ModelSecureTwoFactorAuto/ModelSecureTwoFactorSuccessBackedUp";

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

export default class BackupSecureTwoFactorAutoScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_ModelSecureTwoFactorSecretThreeCode: [],
            arr_ModelSecureTwoFactorSuccessBackedUp: []
        };
    }

    componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        setTimeout( () => {
            this.setState( {
                arr_ModelSecureTwoFactorSecretThreeCode: [ {
                    modalVisible: true,
                    data
                } ]
            } )
        }, 100 );
    }

    render() {
        let { arr_ModelSecureTwoFactorSuccessBackedUp } = this.state;
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
                            <ModelSecureTwoFactorSecretThreeCode data={ this.state.arr_ModelSecureTwoFactorSecretThreeCode } click_Next={ () => {
                                this.setState( {
                                    arr_ModelSecureTwoFactorSecretThreeCode: [
                                        {
                                            modalVisible: false,
                                            data: []
                                        }
                                    ],
                                    arr_ModelSecureTwoFactorSuccessBackedUp: [ {
                                        modalVisible: true,
                                    } ]
                                } );
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelSecureTwoFactorSecretThreeCode: [
                                            {
                                                modalVisible: false,
                                                data: []
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } }
                            />
                            <ModelSecureTwoFactorSuccessBackedUp data={ arr_ModelSecureTwoFactorSuccessBackedUp }
                                click_GoToWallet={ () => {
                                    this.setState( {
                                        arr_ModelSecureTwoFactorSuccessBackedUp: [ {
                                            modalVisible: false,
                                        } ]
                                    } )
                                    this.props.navigation.pop()
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
