import React from "react";
import {
    View,
    ImageBackground,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    TouchableHighlight,
    StyleSheet,
    RefreshControl,
    Platform,
    SafeAreaView,
    FlatList,
    ScrollView,
    Animated,
    LayoutAnimation,
    AsyncStorage,
    Alert
} from "react-native";
import {
    Container,
    Header,
    Title,
    Content,
    Button,
    Left,
    Right,
    Body,
    Text,
    List,
    ListItem
} from "native-base";
//import BarcodeScanner from "react-native-barcode-scanners";
import { QRScannerView } from 'ac-qrcode';
import Permissions from 'react-native-permissions'


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome object
import {
    colors,
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
import Singleton from "HexaWallet/src/app/constants/Singleton";


//Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";


//TODO: Bitcoin Files
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";

export default class QrCodeScannerScreen extends React.Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
        };
    }

    componentDidMount() {
        Permissions.request( 'camera' ).then( ( response: any ) => {
            if ( response == "authorized" ) {
                this.render();
            }
        } );
    }

    _renderTitleBar() {
        return (
            <Text></Text>
        );
    }

    _renderMenu() {
        return (
            <Button
                full
                style={ { margin: 15, borderRadius: 10, backgroundColor: "#ffffff" } }
                onPress={ () => this.props.navigation.push( "ReceivePaymentNavigator" ) }
            >
                <Text style={ { color: "#000000" } }>Request Payment</Text>
            </Button>
        )
    }


    barcodeReceived = async ( e: any ) => {
        try {
            var result = e.data;
            let walletDetails = await utils.getWalletDetails();
            const regularAccount = new RegularAccount(
                walletDetails.mnemonic
            );
            let resAddressDiff = await regularAccount.addressDiff( result );
            if ( resAddressDiff.type == "paymentURI" ) {
                let resDecPaymentURI = await regularAccount.decodePaymentURI( result );
                console.log( { resDecPaymentURI } );
            } else if ( resAddressDiff.type == "address" ) {

            } else {
                result = JSON.parse( result );
                AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
                if ( result.type == "SSS Recovery" ) {
                    utils.setDeepLinkingType( "SSS Recovery QR" );
                    let deepLinkPara = {};
                    deepLinkPara.wn = result.wn;
                    deepLinkPara.data = result.data;
                    //console.log( { deepLinkPara } );
                    utils.setDeepLinkingUrl( deepLinkPara );
                    this.props.navigation.navigate( 'WalletScreen' );
                }
            }
        } catch ( error ) {
            console.log( error );
        }
    }


    render() {
        return (
            <Container>
                <StatusBar hidden />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        < QRScannerView
                            hintText=""
                            rectHeight={ Dimensions.get( 'screen' ).height / 2.0 }
                            rectWidth={ Dimensions.get( 'screen' ).width - 20 }
                            scanBarColor={ colors.appColor }
                            cornerColor={ colors.appColor }
                            onScanResultReceived={ this.barcodeReceived.bind( this ) }
                            renderTopBarView={ () => this._renderTitleBar() }
                            renderBottomMenuView={ () => this._renderMenu() }
                        />

                    </ImageBackground>
                </SafeAreaView>
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1
    },

} );
