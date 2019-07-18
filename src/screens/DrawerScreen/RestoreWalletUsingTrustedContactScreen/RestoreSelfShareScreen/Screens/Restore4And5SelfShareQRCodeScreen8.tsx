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

//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

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


interface Props {
    click_Confirm: Function;
}

let flag_ReadQRCode = true;

export default class Restore4And5SelfShareQRCodeScreen8 extends React.Component<Props, any> {
    constructor ( props: any ) {
        super( props );

        this.state = ( {
            flag_qrcode: false
        } )

    }

    componentWillUnmount() {
        flag_ReadQRCode = true;
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

    click_resetFlag = () => {
        flag_ReadQRCode = true;
    }

    barcodeReceived( e: any ) {
        try {
            var result = e.data;
            result = result.split( "Doublequote" ).join( '"' );
            result = result.split( "Leftbrace" ).join( '{' );
            result = result.split( "Rightbrace" ).join( '}' );
            result = result.split( "Slash" ).join( '/' );
            result = result.split( "Comma" ).join( ',' );
            result = result.split( "Space" ).join( ' ' );
            let type = this.props.type;
            var firstChar = result.slice( 0, 3 );
            if ( type == "iCloud" ) {
                if ( firstChar == "c08" ) {
                    if ( flag_ReadQRCode ) {
                        console.log( { result } );
                        this.props.click_Confirm( "Self Share 3", [ result ] );
                        flag_ReadQRCode = false;
                    }
                } else {
                    if ( flag_ReadQRCode ) {
                        alert.simpleOkAction( "Oops", "Please scan share 8 qrcode.", this.click_resetFlag );
                        flag_ReadQRCode = false;
                    }
                }
            } else {
                if ( firstChar == "e08" ) {
                    if ( flag_ReadQRCode ) {
                        this.props.click_Confirm( "Self Share 2", [ result ] );
                        flag_ReadQRCode = false;
                    }
                } else {
                    if ( flag_ReadQRCode ) {
                        alert.simpleOkAction( "Oops", "Please scan share 8 qrcode.", this.click_resetFlag );
                        flag_ReadQRCode = false;
                    }
                }
            }
        } catch ( error ) {
            console.log( error );
        }
    }


    render() {
        //flag 
        let { flag_qrcode } = this.state;
        return (
            <Container>
                <View style={ styles.container }>
                    { renderIf( flag_qrcode == false )(
                        <Button
                            full
                            style={ { flex: 1, margin: 20, borderRadius: 10, backgroundColor: "gray" } }
                            onPress={ () => this.setState( { flag_qrcode: !flag_qrcode } ) }
                        >
                            <Text style={ { color: "#000000" } }>Tab To Scan share 8</Text>
                        </Button>
                    ) }
                    { renderIf( flag_qrcode == true )(
                        <QRScannerView
                            hintText=""
                            rectHeight={ Dimensions.get( 'screen' ).height / 2.0 }
                            rectWidth={ Dimensions.get( 'screen' ).width - 20 }
                            scanBarColor={ colors.appColor }
                            cornerColor={ colors.appColor }
                            onScanResultReceived={ this.barcodeReceived.bind( this ) }
                            renderTopBarView={ () => this._renderTitleBar() }
                            renderBottomMenuView={ () => this._renderMenu() }
                        />
                    ) }
                </View>
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1
    },

} );
