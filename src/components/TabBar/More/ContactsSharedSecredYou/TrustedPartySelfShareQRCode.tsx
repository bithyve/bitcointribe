import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Dimensions } from "react-native";
import {
    Container,
    Header,
    Title,
    Content,
    Item,
    Input,
    Button,
    Left,
    Right,
    Body,
    Text,
    Icon,
    List,
    ListItem,
    Thumbnail
} from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import QRCode from "react-native-qrcode";
import QRCode from 'react-native-qrcode-svg';

//TODO: Custome Pages
import { CustomStatusBar } from "hexaCustStatusBar";
import { HeaderTitle } from "hexaCustHeader";
import { ModelLoader } from "hexaLoader";





//TODO: Custome Alert 
import { AlertSimple } from "hexaCustAlert";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import FontFamily from "hexaStyles";

//TODO: Custome Object
import { colors, images } from "hexaConstants";


//TODO: Bitcoin class
var bitcoinClassState = require( "hexaClassState" );


export default class TrustedPartySelfShareQRCode extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: "hexa",
            flag_Loading: true
        } )
    }

    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        console.log( { data } );
        let decryptedMetaShare = JSON.parse( data.resSharedSecretList.decrShare );
        console.log( { decryptedMetaShare } );
        const sss = await bitcoinClassState.getS3ServiceClassState();
        var resGenerateEncryptedMetaShare = await sss.generateEncryptedMetaShare( decryptedMetaShare );
        if ( resGenerateEncryptedMetaShare.status == 200 ) {
            resGenerateEncryptedMetaShare = resGenerateEncryptedMetaShare.data;
            let resUploadShare = await sss.uploadShare( resGenerateEncryptedMetaShare.encryptedMetaShare, resGenerateEncryptedMetaShare.messageId );
            if ( resUploadShare.status != 200 ) {
                await bitcoinClassState.setS3ServiceClassState( sss );
                alert.simpleOk( "Oops", resUploadShare.err );
            } else {
                this.setState( {
                    flag_Loading: false
                } );
            }
        } else {
            alert.simpleOk( "Oops", resGenerateEncryptedMetaShare.err );
        }
        let qrCodeData = {};
        qrCodeData.type = "SSS Restore Self Share";
        qrCodeData.wn = data.name;
        qrCodeData.data = resGenerateEncryptedMetaShare.key;
        console.log( { qrCodeData } );
        this.setState( {
            data: JSON.stringify( qrCodeData ).toString()
        } );
    }

    goBack() {
        const { navigation } = this.props;
        navigation.pop();
        // navigation.state.params.onSelect( { selected: true } );
    }

    render() {
        //flag
        let { flag_Loading } = this.state;
        return (
            <Container>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <HeaderTitle title="Share via QR"
                        pop={ () => this.goBack() }
                    />
                    <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                        <KeyboardAwareScrollView
                            enableOnAndroid
                            extraScrollHeight={ 40 }
                        >
                            <View style={ { flex: 0.1, margin: 20 } }>
                                <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center" } ] }>Present this QR code to contact that trusted you, this will help that contact to restore wallet.</Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center" } }>
                                <QRCode
                                    value={ this.state.data }
                                    size={ Dimensions.get( 'screen' ).width - 50 }
                                />
                            </View>
                            <View style={ { flex: 0.5, alignItems: "center" } }>
                                <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center", margin: 10 } ] }>Do not share this QR code with anyone other than that contact, whom you want to share the secret with</Text>
                            </View>
                        </KeyboardAwareScrollView>
                    </SafeAreaView>
                </ImageBackground>
                <ModelLoader loading={ flag_Loading } color={ colors.appColor } size={ 30 } message="Making QRCode" />
                <CustomStatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
            </Container >
        );
    }
}


const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    }
} );
