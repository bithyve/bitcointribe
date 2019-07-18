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


//Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();


//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome Model
import ModelRestoreAssociateContactListForQRCodeScan from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelRestoreAssociateContactListForQRCodeScan";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Bitcoin files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";


let flag_ReadQRCode = true;

export default class RestoreTrustedContactsQRCodeScanScreen extends React.Component {
    constructor ( props: any ) {
        super( props );

        this.state = ( {
            data: [],
            flag_Loading: false
        } )

    }

    componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        this.setState( {
            data
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



    click_ResetFlagRead = () => {
        flag_ReadQRCode = true;
        this.props.navigation.pop();
    }



    barcodeReceived = async ( e: any ) => {
        try {
            var result = e.data;
            result = JSON.parse( result );
            let { data } = this.state;
            const dateTime = Date.now();
            if ( result.type == "SSS Restore QR" ) {
                if ( flag_ReadQRCode == true ) {
                    flag_ReadQRCode = false;
                    let resDownlaodShare = await S3Service.downloadShare( result.data );
                    if ( resDownlaodShare.status == 200 ) {
                        let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownlaodShare.data.encryptedMetaShare, result.data );
                        if ( resDecryptEncMetaShare.status == 200 ) {
                            const resUpdateSSSRetoreDecryptedShare = await dbOpration.updateSSSRetoreDecryptedShare(
                                localDB.tableName.tblSSSDetails,
                                resDecryptEncMetaShare.data.decryptedMetaShare,
                                dateTime,
                                data.sssDetails.id
                            );
                            console.log( {} );
                            if ( resUpdateSSSRetoreDecryptedShare == true ) {
                                flag_ReadQRCode = false;
                                await comFunDBRead.readTblSSSDetails();
                                this.props.navigation.pop( 2 );
                            }
                        } else {
                            flag_ReadQRCode = false;
                            alert.simpleOkAction( "Oops", resDecryptEncMetaShare.err, this.click_ResetFlagRead );
                        }
                    } else {
                        flag_ReadQRCode = false;
                        alert.simpleOkAction( "Oops", resDownlaodShare.err, this.click_ResetFlagRead );
                    }
                } else {
                    flag_ReadQRCode = false;
                    alert.simpleOkAction( "Oops", "Please scan correct qrcode.", this.click_ResetFlagRead );
                }
            }
        } catch ( error ) {
            console.log( error );
        }
    }


    //TODO: GoBack
    click_GoBack() {
        const { navigation } = this.props;
        navigation.goBack();
        navigation.state.params.onSelect( { selected: true } );
    }


    //TODO: Popup select any contact 
    click_UpdateMsg = async () => {
        const dateTime = Date.now();

        // const resUpdateSSSRetoreDecryptedShare = await dbOpration.updateSSSRetoreDecryptedShare(
        //     localDB.tableName.tblSSSDetails,
        //     JSON.parse( decryptedShare ),
        //     dateTime,
        //     recordId
        // );
        // if ( resUpdateSSSRetoreDecryptedShare == true ) {
        //     this.click_GoBack();
        // } else {
        //     Alert.alert( resUpdateSSSRetoreDecryptedShare );
        // }
    }

    render() {
        //flag
        let { flag_Loading } = this.state;
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 22 : 17, marginLeft: 0 } ] }>Scan QRCode</Text>
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
                <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1
    },

} );
