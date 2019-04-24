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
import BarcodeScanner from "react-native-barcode-scanners";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome object
import {
    colors,
    images,
    localDB,
    errorMessage
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
        AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( false ) );
    }

    //TODO: Page life Cycle
    async componentWillUnmount() {
        try {
            AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
        } catch ( error ) {
            console.log( error );
        }
    }

    onReadBarCodeByGalleryFailure() {
        Alert.alert( "Note", "Not found barcode!" );
    }

    onBarCodeRead( res: any ) {
        try {
            AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
            console.log( res.data );

        } catch ( error ) {
            console.log( error );
        }
    }

    onBarCodeReadByGalleryStart( res: any ) {
        console.log( "read data from gallery" );
        console.log( { res } );
    }
    render() {
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <BarcodeScanner
                            Title={ "QRCode Scanner" }
                            styles={ styles.barcodeScanner }
                            cameraProps={ { captureAudio: false } }
                            onBarCodeReadByGalleryStart={ data =>
                                this.onBarCodeReadByGalleryStart.call( this, data )
                            }
                            onReadBarCodeByGalleryFailure={ () =>
                                this.onReadBarCodeByGalleryFailure.call( this )
                            }
                            onBarCodeRead={ data => this.onBarCodeRead.call( this, data ) }
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
