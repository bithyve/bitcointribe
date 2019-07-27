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
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
import Singleton from "HexaWallet/src/app/constants/Singleton";

//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";

//TODO: Custome Model
import ModelRestoreAssociateContactListForQRCodeScan from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelRestoreAssociateContactListForQRCodeScan";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );
let goBackI = 0;

export default class ConfirmSelfShareQRScannerScreen extends React.Component {
    constructor ( props: any ) {
        super( props );
        this.state = ( {
            data: ""
        } )
    }



    async componentWillMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {
                goBackI = 0;
                let data = this.props.navigation.getParam( "data" );
                this.setState( {
                    data
                } )
            } );
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
            result = result.split( "Doublequote" ).join( '"' );
            result = result.split( "Leftbrace" ).join( '{' );
            result = result.split( "Rightbrace" ).join( '}' );
            result = result.split( "Slash" ).join( '/' );
            result = result.split( "Comma" ).join( ',' );
            result = result.split( "Space" ).join( ' ' );
            let { data } = this.state;
            console.log( { result, data } );
            if ( result == data ) {
                if ( goBackI == 0 ) {
                    const { navigation } = this.props;
                    navigation.goBack();
                    navigation.state.params.onSelect( { selected: true, result: result, data: data } );
                    goBackI++;
                }
            } else {
                alert.simpleOk( "Oops", "Invalid qrcode please scan first share qrcode." );
            }

        } catch ( error ) {
            console.log( error );
        }
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
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 22 : 17, marginLeft: 0 } ] }>Scan 1st Share</Text>
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
