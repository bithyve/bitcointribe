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
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";


//TODO: Custome Model
import ModelRestoreAssociateContactListForQRCodeScan from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelRestoreAssociateContactListForQRCodeScan";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

let flag_ReadQRCode = true;

//TODO: Bitcoin files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";

export default class Restore3SelfSahreQRCodeScannerScreen extends React.Component {
    constructor ( props: any ) {
        super( props );

        this.state = ( {
            item: [],
            arr_ModelRestoreAssociateContactList: [],
            recordId: "",
            decryptedShare: "",
            flag_Loading: false
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

    click_ResetFlagRead = () => {
        flag_ReadQRCode = true;
    }

    barcodeReceived = async ( e: any ) => {
        try {
            var result = e.data;
            result = JSON.parse( result );
            if ( result.type == "SSS Restore Self Share" ) {
                let resDownlaodShare = await S3Service.downloadShare( result.data );
                if ( resDownlaodShare.status == 200 ) {
                    var resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownlaodShare.data.encryptedMetaShare, result.data );
                    console.log( { resDecryptEncMetaShare } );
                    if ( resDecryptEncMetaShare.status == 200 ) {
                        resDecryptEncMetaShare = resDecryptEncMetaShare.data;
                        const dateTime = Date.now();
                        let resInsertContactList = await dbOpration.updateRestoreUsingTrustedContactSelfShare(
                            localDB.tableName.tblSSSDetails,
                            dateTime,
                            resDecryptEncMetaShare.decryptedMetaShare,
                            "Self Share 1",
                            "Good"
                        );
                        if ( resInsertContactList ) {
                            if ( flag_ReadQRCode == true ) {
                                flag_ReadQRCode = false;
                                await comFunDBRead.readTblSSSDetails();
                                this.props.navigation.pop( 2 );
                            }
                        } else {
                            if ( flag_ReadQRCode == true ) {
                                flag_ReadQRCode = false;
                                alert.simpleOkAction( "Oops", "Please try again databse insert issue.", this.click_ResetFlagRead );
                            }
                        }
                    }
                    else {
                        if ( flag_ReadQRCode == true ) {
                            flag_ReadQRCode = false;
                            alert.simpleOkAction( "Oops", resDecryptEncMetaShare.err, this.click_ResetFlagRead );
                        }
                    }
                } else {
                    if ( flag_ReadQRCode == true ) {
                        flag_ReadQRCode = false;
                        alert.simpleOkAction( "Oops", resDownlaodShare.err, this.click_ResetFlagRead );
                    }
                }
            } else {
                if ( flag_ReadQRCode == true ) {
                    flag_ReadQRCode = false;
                    alert.simpleOkAction( "Oops", "Please scan correct self share.", this.click_ResetFlagRead );
                }
            }
        }
        catch ( error ) {
            console.log( error );

        }
    }


    //TODO: GoBack
    click_GoBack() {
        const { navigation } = this.props;
        navigation.goBack();
        //navigation.state.params.onSelect( { selected: true } );
    }




    render() {
        //flag
        let { flag_Loading } = this.state;
        return (
            <Container>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
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
