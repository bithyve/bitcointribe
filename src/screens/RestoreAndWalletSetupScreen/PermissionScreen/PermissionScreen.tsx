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
    SafeAreaView
} from "react-native";
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import { StackActions, NavigationActions } from "react-navigation";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import Permissions from 'react-native-permissions'


import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    colors,
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
import utils from "HexaWallet/src/app/constants/Utils";
import Singleton from "HexaWallet/src/app/constants/Singleton";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//localization
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

export default class PermissionScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {

        };
    }

    componentWillMount() {
        try {
            AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( false ) );
        } catch ( err ) {
            console.warn( err );
        }
    }



    click_GetPermisson = async () => {
        try {
            if ( Platform.OS == "android" ) {
                const cameraPer = await Permissions.request( 'camera' ).then( ( response: any ) => {
                    return response;
                } );
                const contactPer = await Permissions.request( 'contacts' ).then( ( response: any ) => {
                    return response;
                } );
                const readSmsPer = await Permissions.request( 'readSms' ).then( ( response: any ) => {
                    return response;
                } );
                if ( cameraPer == "authorized" && contactPer == "authorized" && readSmsPer == "authorized" ) {
                    this.goNextScreen();
                } else {
                    Alert.alert( 'Please set all permission.' )
                }

            } else {
                const cameraPer = await Permissions.request( 'camera' ).then( ( response: any ) => {
                    return response;
                } );
                const contactPer = await Permissions.request( 'contacts' ).then( ( response: any ) => {
                    return response;
                } );
                if ( cameraPer == "authorized" && contactPer == "authorized" ) {
                    this.goNextScreen();
                } else {
                    Alert.alert( 'Please set all permission.' )
                }
            }
        } catch ( err ) {
            console.warn( err );
        }
    }

    //TODO: func goNextScreen
    goNextScreen() {
        try {
            const resetAction = StackActions.reset( {
                index: 0, // <-- currect active route from actions array
                key: null,
                actions: [
                    NavigationActions.navigate( { routeName: "TabbarBottom" } )
                ]
            } );
            this.props.navigation.dispatch( resetAction );

        } catch ( error ) {
            console.log( error );
        }
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
                            <View style={ styles.viewAppLogo }>
                                <Image style={ styles.imgAppLogo } source={ images.appIcon } />
                                <Text
                                    style={ [ globalStyle.ffFiraSansBold, { color: "#000000", marginTop: 20 } ] }
                                >
                                    Welcome to Hexa Wallet
                     </Text>
                                <Text note style={ { textAlign: "center", margin: 10 } }>Hexa wallet app permission.</Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center" } }>
                                <View>
                                    <Text style={ [ globalStyle.ffFiraSansRegular ] }><IconFontAwe name="circle" size={ 10 } color={ colors.appColor }></IconFontAwe>    Camera (for scan barcode)</Text>
                                    <Text style={ [ globalStyle.ffFiraSansRegular ] }><IconFontAwe name="circle" size={ 10 } color={ colors.appColor }></IconFontAwe>    Contacts (for SSS)</Text>
                                    <Text style={ [ globalStyle.ffFiraSansRegular ] }><IconFontAwe name="circle" size={ 10 } color={ colors.appColor }></IconFontAwe>    ReadSms (for sending sms)</Text>
                                </View>

                            </View>
                            <View style={ styles.viewBtnProceed }>
                                <FullLinearGradientButton
                                    style={ [ { opacity: 1, borderRadius: 5 } ] }
                                    disabled={ false }
                                    title="ALLOW"
                                    click_Done={ () => this.click_GetPermisson() }
                                />
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
            </View >
        );
    }
}

let styles = StyleSheet.create( {
    container: {
        flex: 1
    },
    viewAppLogo: {
        marginTop: 20,
        flex: 4,
        alignItems: "center",
    },
    imgAppLogo: {
        height: 200,
        width: 200
    },
    viewBtnProceed: {
        flex: 3,
        justifyContent: "flex-end",
        marginBottom: 20
    }
} );
