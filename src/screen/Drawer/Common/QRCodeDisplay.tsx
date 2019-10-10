import React from "react";
import { StyleSheet, ImageBackground, View, SafeAreaView, Dimensions } from "react-native";
import {
    Container,
    Text
} from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import QRCode from "react-native-qrcode";
import QRCode from 'react-native-qrcode-svg';

//TODO: Custome Pages
import { StatusBar } from "hexaComponent/StatusBar";
import { HeaderTitle } from "hexaComponent/Header";



//TODO: Custome StyleSheet Files       
import FontFamily from "hexaComponent/Styles/FontFamily";

//TODO: Custome Object  
import { colors, images } from "hexaConstants";



export default class QRCodeDisplay extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            flag_Loading: false,
            msg_Loading: "Loading"
        } )
    }

    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let walletName = this.props.navigation.getParam( "walletName" );
        let mobileNo = this.props.navigation.getParam( "mobileNo" );
        let qrCodeData = {};
        qrCodeData.type = "SSS Restore";
        qrCodeData.wn = walletName;
        // qrCodeData.mo = mobileNo;
        qrCodeData.data = data.toString();
        //console.log( { qrCodeData } );
        this.setState( {
            data: JSON.stringify( qrCodeData ).toString()
        } )
    }

    goBack() {
        const { navigation } = this.props;
        navigation.goBack();
        navigation.state.params.onSelect( { selected: true } );
    }

    render() {
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
                                <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center" } ] }>Some information about the importance of trust with these contacts</Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center" } }>
                                <QRCode
                                    value={ this.state.data }
                                    size={ Dimensions.get( 'screen' ).width - 50 }
                                />
                            </View>
                            <View style={ { flex: 0.5, alignItems: "center" } }>
                                <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center", margin: 10 } ] }>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut faucibus pulvinar elementum integer enim neque volutpat. Leo integer malesuada nunc vel. Purus faucibus ornare suspendisse sed nisi lacus sed. Et ligula ullamcorper malesuada proin libero nunc consequat. A cras semper auctor neque vitae tempus quam pellentesque. In nisl nisi scelerisque eu ultrices vitae auctor eu augue. Sed risus ultricies tristique nulla aliquet enim tortor. Curabitur gravida arcu ac tortor dignissim convallis. Adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus urna neque. Porta lorem mollis aliquam ut porttitor Leo a.</Text>
                            </View>
                        </KeyboardAwareScrollView>
                    </SafeAreaView>
                </ImageBackground>
                <StatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
            </Container >
        );
    }
}

const primaryColor = colors.appColor;
const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    }
} );
