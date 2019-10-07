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
    images,
    localDB
} from "hexaConstants";
var dbOpration = require( "hexaDBOpration" );

//TODO: Custome Alert 
import { AlertSimple } from "hexaCustAlert";
let alert = new AlertSimple();

//Custome Compontes
import { CustomeStatusBar } from "hexaCustStatusBar";
import { HeaderTitle } from "hexaCustHeader";
import { ModelLoader } from "hexaLoader";

//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );

let flag_ReadQRCode = true;

//TODO: Bitcoin files
import { S3Service } from "hexaBitcoin";

export default class Restore3SelfSahreQRCodeScanner extends React.Component {
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
            console.log( { result } );

            if ( result.type == "SSS Restore Self Share" ) {
                if ( flag_ReadQRCode == true ) {
                    console.log( 'calling' );
                    let resDownlaodShare = await S3Service.downloadShare( result.data );
                    console.log( { resDownlaodShare } );
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
                    }
                    else {
                        if ( flag_ReadQRCode == true ) {
                            flag_ReadQRCode = false;
                            alert.simpleOkAction( "Oops", resDownlaodShare.err, this.click_ResetFlagRead );
                        }
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
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <HeaderTitle title="Scan QRCode"
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
                <ModelLoader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
                <CustomeStatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1
    },

} );
