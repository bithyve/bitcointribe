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


export default class QrCodeScannerScreen extends React.Component {
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

    //TODO: Page life Cycle
    async componentWillUnmount() {
        try {
            AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
        } catch ( error ) {
            console.log( error );
        }
    }



    _renderTitleBar() {
        return (
            <Text></Text>
        );
    }

    _renderMenu() {
        return (
            <Text></Text>
        )
    }

    barcodeReceived( e: any ) {
        try {
            var result = JSON.parse( e.data );
            result = JSON.parse( result );
            //console.log( { result } );
            AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
            if ( result.type == "SSS Recovery" ) {
                utils.setDeepLinkingType( "SSS Recovery QrCode" );
                let deepLinkPara = {};
                deepLinkPara.n = "appasaheb lakade"
                deepLinkPara.m = result.phoneNo;
                deepLinkPara.data = result.data;
                utils.setDeepLinkingUrl( deepLinkPara );
                this.props.navigation.navigate( 'WalletScreen' );
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
