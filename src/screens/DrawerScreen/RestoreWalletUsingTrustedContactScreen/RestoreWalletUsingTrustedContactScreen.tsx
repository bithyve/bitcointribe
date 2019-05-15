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



//TODO: Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import ModelWalletName from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelWalletName";

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




export default class RestoreWalletUsingTrustedContactScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_ModelWalletName: [],
            arr_ConfirmPassphrase: [],
            arr_ModelRestoreSucess: [],
            wallerName: "",
            flag_Loading: false
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
