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
import { SvgIcon } from "@up-shared/components";



//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome object
import {
    colors,
    images
} from "HexaWallet/src/app/constants/Constants";


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();


//Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";


//TODO: Common Funciton
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

let flagGoback = true;

export default class SendPaymentAddressScanScreen extends React.Component {
    constructor ( props: any ) {
        super( props );

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
            console.log( { resAddressDiff } );
            if ( resAddressDiff.status == 200 ) {
                resAddressDiff = resAddressDiff.data;
            } else {
                if ( flagGoback ) {
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
                    if ( flagGoback ) {
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
            if ( flagGoback ) {
                flagGoback = false;
                const { navigation } = this.props;
                navigation.goBack();
                navigation.state.params.onSelect( { selected: true, data: data } );
            }
        } catch ( error ) {
            if ( flagGoback ) {
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
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10 } }>
                            <Button
                                transparent
                                onPress={ () => this.click_GoBack() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 22 : 17, marginLeft: 0 } ] }>Scan Payment QRCode</Text>
                            </Button>
                        </View>
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
