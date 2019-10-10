import React from "react";
import {
    ImageBackground,
    StyleSheet,
    SafeAreaView
} from "react-native";
import {
    Container,
    Text
} from "native-base";
//import BarcodeScanner from "react-native-barcode-scanners";
import QRCodeScanner from 'react-native-qrcode-scanner';



//TODO: Custome object
import {
    colors,
    images
} from "hexaConstants";


//TODO: Custome Alert 
import { AlertSimple } from "hexaComponent/Alert";;
let alert = new AlertSimple();


//Custome Compontes
import { StatusBar } from "hexaComponent/StatusBar";
import { HeaderTitle } from "hexaComponent/Header";

//TODO: Common Funciton
var bitcoinClassState = require( "hexaClassState" );


let flagGoback = true;

export default class SendPaymentAddressScan extends React.Component {
    constructor ( props: any ) {
        super( props );

    }


    componentWillMount() {
        flagGoback = true;
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

    click_ResetFlag = async () => {
        flagGoback = true;
    }


    barcodeReceived = async ( e: any ) => {
        try {
            var result = e.data;
            let regularAccount = await bitcoinClassState.getRegularClassState();
            var resAddressDiff = await regularAccount.addressDiff( result );
            //console.log( { resAddressDiff } );
            if ( resAddressDiff.status == 200 ) {
                resAddressDiff = resAddressDiff.data;
            } else {
                if ( flagGoback == true ) {
                    flagGoback = false;
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
                    if ( flagGoback == true ) {
                        flagGoback = false;
                        alert.simpleOkAction( "Oops", resDecPaymentURI.err, this.click_ResetFlag );
                    }
                }
                data.address = resDecPaymentURI.address;
                data.amount = resDecPaymentURI.options.amount;
                data.type = "paymentURI";
            } else {
                data.address = result;
                data.type = "address";
            }
            if ( flagGoback == true ) {
                flagGoback = false;
                const { navigation } = this.props;
                navigation.goBack();
                navigation.state.params.onSelect( { selected: true, data: data } );
            }
        } catch ( error ) {
            if ( flagGoback == true ) {
                flagGoback = false;
                alert.simpleOkAction( "Oops", error, this.click_ResetFlag );
            }
        }
    }

    //TODO: GoBack
    click_GoBack() {
        const { navigation } = this.props;
        navigation.goBack();
        navigation.state.params.onSelect( { selected: true } );
    }

    render() {
        return (
            <Container>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <HeaderTitle title="Scan Payment QRCode"
                        pop={ () => this.click_GoBack() }
                    />
                    <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                        <QRCodeScanner
                            onRead={ this.barcodeReceived }
                            topContent={ this._renderTitleBar() }
                            bottomContent={
                                this._renderMenu()
                            }
                            cameraType="back"
                            showMarker={ true }
                            vibrate={ true }
                        />
                    </SafeAreaView>
                </ImageBackground>
                <StatusBar backgroundColor={ colors.white } hidden={ false } barStyle="light-content" />
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1
    },

} );
