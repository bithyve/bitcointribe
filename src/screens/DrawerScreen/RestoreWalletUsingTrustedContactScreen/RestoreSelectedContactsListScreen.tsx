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
import { SvgIcon } from "@up-shared/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Compontes  
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import ModelSelectedContactsList from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelSelectedContactsList";
import ModelSelectedPersonRequestSent from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelSelectedPersonRequestSent";



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



export default class RestoreSelectedContactsListScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_ModelSelectedContact: [],
            arr_ModelSelectedPersonRequestSent: []
        };
    }
    componentDidMount() {
        this.setState( {
            arr_ModelSelectedContact: [
                {
                    modalVisible: true
                }
            ]
        } )
    }

    //TODO: model  in request click
    click_Request = async ( item: any ) => {
        console.log( { item } );
        this.setState( {
            arr_ModelSelectedPersonRequestSent: [
                {
                    modalVisible: true,
                    item: {
                        name: item.givenName + " " + item.familyName,
                        thumbnailPath: item.thumbnailPath,
                        url: "http://bithyve.com"
                    }
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
                            <ModelSelectedContactsList data={ this.state.arr_ModelSelectedContact } click_Next={ () => {
                                this.setState( {
                                    arr_ModelSelectedContact: [
                                        {
                                            modalVisible: false
                                        }
                                    ]
                                } );
                            }
                            }
                                click_Request={ ( item: any ) => this.click_Request( item ) }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelSelectedContact: [
                                            {
                                                modalVisible: false
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } }
                            />
                            <ModelSelectedPersonRequestSent data={ this.state.arr_ModelSelectedPersonRequestSent } />
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
