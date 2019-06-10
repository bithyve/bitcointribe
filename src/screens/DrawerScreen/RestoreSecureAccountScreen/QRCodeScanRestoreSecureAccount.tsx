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
import IconFontAwe from "react-native-vector-icons/FontAwesome";



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


//TODO: Custome Model
import ModelRestoreAssociateContactListForQRCodeScan from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelRestoreAssociateContactListForQRCodeScan";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

export default class QRCodeScanRestoreSecureAccount extends React.Component {
    constructor ( props: any ) {
        super( props );

        this.state = ( {
            item: [],

        } )

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
            var result = e.data;
            Alert.alert( result )
        } catch ( error ) {
            console.log( error );
        }
    }

    render() {
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <View style={ { flex: 0.8 } }>
                            <Text style={ [ globalStyle.ffFiraSansMedium, {
                                fontSize: 24, color: "#ffffff", textAlign: "center", margin: 20
                            } ] }>Restore { "\n" } Secure Account</Text>
                            <Text style={ { color: "#ffffff", textAlign: "center", fontSize: 14 } }>Step 1</Text>
                        </View>
                        <View style={ { flex: 2 } }>
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
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "center" } }>
                            <Text style={ { color: "#ffffff", textAlign: "center", fontSize: 18 } }>Scan Secondary xPub</Text>
                            <Text style={ { color: "#ffffff", textAlign: "center", fontSize: 12, margin: 20 } }>Open the PDF and scan the secoundary { "\n" } xPub QR Code</Text>
                        </View>
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
