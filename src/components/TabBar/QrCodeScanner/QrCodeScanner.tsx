import React from "react";
import {
    View,
    ImageBackground,
    StyleSheet,
    SafeAreaView
} from "react-native";
import {
    Container,
    Button,
    Text
} from "native-base";
import QRCodeScanner from 'react-native-qrcode-scanner';




//TODO: Custome Alert 
import { AlertSimple } from "hexaCustAlert";
let alert = new AlertSimple();

//TODO: Custome object
import {
    colors,
    images
} from "hexaConstants";
var utils = require( "hexaUtils" );

//Custome Compontes
import { CustomeStatusBar } from "hexaCustStatusBar";

//TODO: Bitcoin Class
var bitcoinClassState = require( "hexaClassState" );



export default class QrCodeScanner extends React.Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            focusedScreen: true
        };

    }

    componentDidMount() {
        const { navigation } = this.props;
        navigation.addListener( 'willFocus', () =>
            this.setState( { focusedScreen: true } )
        );
        navigation.addListener( 'willBlur', () =>
            this.setState( { focusedScreen: false } )
        );
    }


    _renderTitleBar() {
        return (
            <View style={ { height: 0 } }></View>
        );
    }

    _renderMenu() {
        return (
            <Button
                full
                style={ { margin: 15, borderRadius: 10, backgroundColor: colors.appColor } }
                onPress={ () => this.props.navigation.push( "ReceivePaymentNavigator" ) }
            >
                <Text style={ { color: "#ffffff" } }>Request Payment</Text>
            </Button>
        )
    }



    click_ResetFlag = async () => {
        utils.setFlagQRCodeScreen( true );
    }

    barcodeReceived = async ( e: any ) => {
        try {
            var result = e.data;
            console.log( { result } );
            if ( utils.isJson( result ) ) {
                if ( utils.getFlagQRCodeScreen() == true ) {
                    utils.setFlagQRCodeScreen( false );
                    result = JSON.parse( result );
                    if ( result.type == "SSS Recovery QR" ) {
                        utils.setDeepLinkingType( "SSS Recovery QR" );
                        let deepLinkPara = {};
                        deepLinkPara.wn = result.wn;
                        deepLinkPara.data = result.data;
                        //console.log( { deepLinkPara } );
                        utils.setDeepLinkingUrl( deepLinkPara );
                        this.props.navigation.navigate( 'WalletScreen' );
                    } else if ( result.type == "Self Share" ) {
                        utils.setDeepLinkingType( "Self Share" );
                        let deepLinkPara = {};
                        deepLinkPara.wn = result.wn;
                        deepLinkPara.data = result.data;
                        utils.setDeepLinkingUrl( deepLinkPara );
                        this.props.navigation.navigate( 'WalletScreen' );
                    } else if ( result.type == "" ) {
                        if ( utils.getFlagQRCodeScreen() == true ) {
                            utils.setFlagQRCodeScreen( false );
                            alert.simpleOkAction( "Oops", "Invalid qrcode.Please scan correct qrcode.", this.click_ResetFlag );
                        }
                    }
                }
            }
            else {
                let regularAccount = await bitcoinClassState.getRegularClassState();
                var resAddressDiff = await regularAccount.addressDiff( result );
                if ( resAddressDiff.status == 200 ) {
                    resAddressDiff = resAddressDiff.data;
                } else {
                    if ( utils.getFlagQRCodeScreen() == true ) {
                        utils.setFlagQRCodeScreen( false );
                        alert.simpleOkAction( "Oops", resAddressDiff.err, this.click_ResetFlag );
                    }
                }
                let data = {};
                if ( resAddressDiff.type == "paymentURI" ) {
                    var resDecPaymentURI = await regularAccount.decodePaymentURI( result );
                    if ( resDecPaymentURI.status == 200 ) {
                        await bitcoinClassState.setRegularClassState( regularAccount );
                        resDecPaymentURI = resDecPaymentURI.data;
                    } else {
                        if ( utils.getFlagQRCodeScreen() == true ) {
                            utils.setFlagQRCodeScreen( false );
                            alert.simpleOkAction( "Oops", resDecPaymentURI.err, this.click_ResetFlag );
                        }
                    }
                    data.address = resDecPaymentURI.address;
                    data.amount = resDecPaymentURI.options.amount;
                    data.type = "paymentURI";
                } else {
                    data.address = result;
                    data.type = "address";
                    data.amount = "0";
                }
                if ( utils.getFlagQRCodeScreen() == true ) {
                    utils.setFlagQRCodeScreen( false );
                    this.props.navigation.push( "SendPaymentNavigator", { data: data } );
                }
            }
        } catch ( error ) {
            console.log( error );
        }
    }



    cameraView() {
        return (
            <QRCodeScanner
                style={ { flex: 1 } }
                onRead={ this.barcodeReceived }
                topContent={ this._renderTitleBar() }
                bottomContent={
                    this._renderMenu()
                }

                cameraType="back"
                showMarker={ true }
                vibrate={ true }
            />
        )
    }

    render() {
        const { focusedScreen } = this.state;
        if ( focusedScreen ) {
            return ( this.cameraView() );
        }
        return (
            <Container>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <SafeAreaView style={ styles.container }>
                        { this.cameraView }
                    </SafeAreaView>
                </ImageBackground>
                <CustomeStatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
    },

} );