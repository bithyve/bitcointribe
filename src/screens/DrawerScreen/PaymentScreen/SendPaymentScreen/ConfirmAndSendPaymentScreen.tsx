import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Dimensions, Clipboard, Image } from "react-native";
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
    List, ListItem,
    Picker,
    Icon,
    Card, CardItem
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import QRCode from 'react-native-qrcode-svg';
//import QRCode from 'react-native-qrcode';
import Toast from 'react-native-simple-toast';
import Share from 'react-native-share';
import RNFetchBlob from 'react-native-fetch-blob';
import { Slider, CheckBox } from 'react-native-elements';

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome model  
import ModelBackupYourWallet from "HexaWallet/src/app/custcompontes/Model/ModelBackupYourWallet/ModelBackupYourWallet";
import ModelFindYourTrustedContacts from "HexaWallet/src/app/custcompontes/Model/ModelFindYourTrustedContacts/ModelFindYourTrustedContacts";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );


//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Bitcoin Files
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";


export default class ConfirmAndSendPaymentScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            flag_DisableSentBtn: false
        } )
    }

    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        console.log( { data } );
        let walletDetails = await utils.getWalletDetails();
        let arr_AccountList = await comFunDBRead.readTblAccount();

    }


    render() {
        //flag  
        let { flag_DisableSentBtn } = this.state;
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Confirm & Send</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <View style={ { flex: 1, marginTop: 20, alignItems: "center" } }>
                                <Text note>FUNDS BEING TRANSFERRED TO</Text>
                                <Text style={ [ { margin: 10, fontWeight: "bold" } ] }>9843729548372</Text>
                                <Text note style={ { textAlign: "center", margin: 10 } }>Kindly confirm the address Founds once transferred can not be recovered.</Text>
                            </View>
                            <View style={ { flex: 1 } }>
                                <View style={ { flex: 1, justifyContent: "center", marginLeft: 20, marginRight: 20 } }>
                                    <View style={ { flexDirection: "row" } }>
                                        <SvgIcon
                                            name="icon_dailywallet"
                                            color="#D0D0D0"
                                            size={ 40 }
                                            style={ { flex: 0.25 } }
                                        />
                                        <View style={ { flexDirection: "column" } }>
                                            <Text style={ [ globalStyle.ffFiraSansBold, { fontSize: 16 } ] }>account</Text>
                                            <View style={ { flexDirection: "row", alignItems: "center" } }>
                                                <Text note style={ [ { fontSize: 12 } ] }>Available balance</Text>
                                                <SvgIcon
                                                    name="icon_bitcoin"
                                                    color="#D0D0D0"
                                                    size={ 15 }
                                                />
                                                <Text note style={ { fontSize: 12, marginLeft: -0.01 } }>bal</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={ { flex: 1 } }>
                                    <Card style={ { flex: 1, marginLeft: 10, marginRight: 10, marginTop: 10, alignItems: "center" } }>
                                        <CardItem>
                                            <Body>
                                                <Text>
                                                //Your text here
                                                </Text>
                                            </Body>
                                        </CardItem>
                                    </Card>
                                </View>

                                <View style={ { flex: 1 } }>

                                </View>

                            </View>
                            <View style={ { flex: 1 } }>

                                <FullLinearGradientButton
                                    style={ [ flag_DisableSentBtn == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                    disabled={ flag_DisableSentBtn }
                                    title="Send"
                                    click_Done={ () => this.click_ShareQRCode() }
                                />
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
                {/* <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } /> */ }
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
    }
} );
