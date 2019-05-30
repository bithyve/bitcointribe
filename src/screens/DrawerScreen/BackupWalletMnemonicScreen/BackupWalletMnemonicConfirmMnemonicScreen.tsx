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
import ModelConfirmMnemonic1of3 from "HexaWallet/src/app/custcompontes/Model/ModelBackupWalletMnemonic/ModelConfirmMnemonic1of3";
import ModelConfirmMnemonic2of3 from "HexaWallet/src/app/custcompontes/Model/ModelBackupWalletMnemonic/ModelConfirmMnemonic2of3";
import ModelConfirmMnemonic3of3 from "HexaWallet/src/app/custcompontes/Model/ModelBackupWalletMnemonic/ModelConfirmMnemonic3of3";
import ModelWalletSuccessfullyBackedUp from "HexaWallet/src/app/custcompontes/Model/ModelBackupWalletMnemonic/ModelWalletSuccessfullyBackedUp";
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

export default class BackupWalletMnemonicConfirmMnemonicScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_randomNo: [],
            arr_Mnemonic: [],
            arr_ModelConfirmMnemonic1of3: [],
            arr_ModelConfirmMnemonic2of3: [],
            arr_ModelConfirmMnemonic3of3: [],
            arr_ModelWalletSuccessfullyBackedUp: []
        };
    }
    async componentDidMount() {
        var resultWallet = await comFunDBRead.readTblWallet();
        let mnemonic = resultWallet.mnemonic;
        let arr_Mnemonic = mnemonic.split( ' ' );
        let arr_randomNo = this.getRandomNumber( 0, arr_Mnemonic.length );
        // console.log( { arr_Mnemonic, arr_randomNo } );
        this.setState( {
            arr_randomNo,
            arr_Mnemonic,
            arr_ModelConfirmMnemonic1of3: [
                {
                    modalVisible: true,
                    number: converter.toWords( arr_randomNo[ 0 ] ),
                    word: arr_Mnemonic[ arr_randomNo[ 0 ] ]
                }
            ]
        } )
    }

    getRandomNumber( min: number, max: number ) {
        let arr_Number = [];
        for ( let i = 0; i < 3; i++ ) {
            let value = min + Math.floor( Math.random() * ( max - min ) )
            if ( arr_Number.indexOf( value ) !== -1 ) {
                arr_Number.push( min + Math.floor( Math.random() * ( max - min ) ) );
            } else {
                arr_Number.push( value )
            }
        }
        return arr_Number;
    }

    render() {
        let arr_randomNo = this.state.arr_randomNo;
        let arr_Mnemonic = this.state.arr_Mnemonic;

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
                            <ModelConfirmMnemonic1of3 data={ this.state.arr_ModelConfirmMnemonic1of3 } click_Next={ () => {
                                this.setState( {
                                    arr_ModelConfirmMnemonic1of3: [
                                        {
                                            modalVisible: false,
                                            number: converter.toWords( arr_randomNo[ 0 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 0 ] ]
                                        }
                                    ],
                                    arr_ModelConfirmMnemonic2of3: [
                                        {
                                            modalVisible: true,
                                            number: converter.toWords( arr_randomNo[ 1 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 1 ] ]
                                        }
                                    ]
                                } );
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelConfirmMnemonic1of3: [
                                            {
                                                modalVisible: false,
                                                number: converter.toWords( arr_randomNo[ 0 ] ),
                                                word: arr_Mnemonic[ arr_randomNo[ 0 ] ]
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } }
                            />
                            <ModelConfirmMnemonic2of3 data={ this.state.arr_ModelConfirmMnemonic2of3 } click_Next={ () => {
                                this.setState( {
                                    arr_ModelConfirmMnemonic2of3: [
                                        {
                                            modalVisible: false,
                                            number: converter.toWords( arr_randomNo[ 1 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 1 ] ]
                                        }
                                    ],
                                    arr_ModelConfirmMnemonic3of3: [
                                        {
                                            modalVisible: true,
                                            number: converter.toWords( arr_randomNo[ 2 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 2 ] ]
                                        }
                                    ]
                                } );
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelConfirmMnemonic2of3: [
                                            {
                                                modalVisible: false,
                                                number: converter.toWords( arr_randomNo[ 1 ] ),
                                                word: arr_Mnemonic[ arr_randomNo[ 1 ] ]
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } } />
                            <ModelConfirmMnemonic3of3 data={ this.state.arr_ModelConfirmMnemonic3of3 } click_Next={ () => {
                                this.setState( {
                                    arr_ModelConfirmMnemonic3of3: [
                                        {
                                            modalVisible: false,
                                            number: converter.toWords( arr_randomNo[ 2 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 2 ] ]
                                        }
                                    ],
                                    arr_ModelWalletSuccessfullyBackedUp: [
                                        {
                                            modalVisible: true,
                                        }
                                    ]
                                } );
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelConfirmMnemonic3of3: [
                                            {
                                                modalVisible: false,
                                                number: converter.toWords( arr_randomNo[ 2 ] ),
                                                word: arr_Mnemonic[ arr_randomNo[ 2 ] ]
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } } />
                            <ModelWalletSuccessfullyBackedUp data={ this.state.arr_ModelWalletSuccessfullyBackedUp } click_GoWallet={ () => {
                                this.setState( {
                                    arr_ModelWalletSuccessfullyBackedUp: [
                                        {
                                            modalVisible: false,
                                        }
                                    ]
                                } )
                                this.props.navigation.navigate( "TabbarBottom" );
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
