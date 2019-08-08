import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Dimensions, Clipboard, Alert } from "react-native";
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
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import QRCode from 'react-native-qrcode-svg';
//import QRCode from 'react-native-qrcode';
import Toast from 'react-native-simple-toast';
import Share from 'react-native-share';
var RNFS = require( 'react-native-fs' );

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import FullLinearGradientIconWithLoadingButton from 'HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientIconWithLoadingButton';




//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

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

//TODO: Bitcoin class
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";


export default class ReceivePaymentScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_AccountList: [],
            accountName: "",
            accountAddress: "",
            amount: "",
            base64string1: "",
            qrcodeAddresWithAmount: "hexa",
            flag_Loading: true,
            flag_LoadingShareBtn: false
        } )
    }

    async componentWillMount() {
        let selectedAccount = this.props.navigation.getParam( "selectedAccount" );
        let walletDetails = await utils.getWalletDetails();
        console.log( { walletDetails } );
        let arr_AccountList = await comFunDBRead.readTblAccount();
        console.log( { arr_AccountList } );
        let regularAccount = await bitcoinClassState.getRegularClassState();
        var address = await regularAccount.getAddress();
        if ( address.status == 200 ) {
            address = address.data;
        } else {
            alert.simpleOk( "Oops", address.err );
        }
        // var paymentQRCode = await this.getQrCode( address.address );
        console.log( { arr_AccountList } );
        this.setState( {
            flag_Loading: false,
            arr_AccountList,
            accountName: arr_AccountList[ 0 ].accountName,
            accountAddress: address.address,
            qrcodeAddresWithAmount: address.address.toString()
        } )
    }

    //Dropdown select account name
    onValueChange = async ( value: string ) => {
        this.setState( {
            flag_Loading: true
        } )
        let regularAccount = await bitcoinClassState.getRegularClassState();
        let secureAccount = await bitcoinClassState.getSecureClassState();
        var address;
        if ( value == "Daily Wallet" ) {
            address = await regularAccount.getAddress();
            if ( address.status == 200 ) {
                address = address.data;
            } else {
                alert.simpleOk( "Oops", address.err );
            }
        } else {
            address = await secureAccount.getAddress();
            if ( address.status == 200 ) {
                address = address.data;
            } else {
                alert.simpleOk( "Oops", address.err );
            }
        }
        this.setState( {
            flag_Loading: false,
            accountName: value,
            amount: "",
            accountAddress: address.address,
            qrcodeAddresWithAmount: address.address.toString(),
        } );
    }

    //get only address qrcode string
    getQrCode = async ( address: any, option?: any ) => {
        let regularAccount = await bitcoinClassState.getRegularClassState();
        console.log( regularAccount );
        let resPaymentURI = await regularAccount.getPaymentURI( address, option );
        if ( resPaymentURI.status == 200 ) {
            await bitcoinClassState.setRegularClassState( regularAccount );
            resPaymentURI = resPaymentURI.data
        } else {
            alert.simpleOk( "Oops", resPaymentURI.err );
        }
        return resPaymentURI;
    }

    //amount change then get qrcode string
    getQrCodeWithAmount = async () => {
        let address = this.state.accountAddress;
        let amount = this.state.amount;
        console.log( { amount, address } );
        let options = {
            amount
        }
        var getQRCodeString;
        if ( amount != "" ) {
            getQRCodeString = await this.getQrCode( address, options );
        } else {
            getQRCodeString = await this.getQrCode( address );
        }
        console.log( { getQRCodeString } );
        this.setState( {
            qrcodeAddresWithAmount: getQRCodeString.paymentURI.toString(),
        } )
    }

    base64string1 = ( base64string1: any ) => {
        this.setState( {
            base64string1
        } );
    }
    //share qrcode image
    click_ShareAddress = async () => {
        let { qrcodeAddresWithAmount } = this.state;
        // this.setState( {
        //     flag_LoadingShareBtn: true
        // } )
        // this.svg1.toDataURL( this.base64string1 );
        // setTimeout( async () => {
        //     let qrcodeBase64 = this.state.base64string1;
        //     console.log( { qrcodeBase64 } );
        //     let accountName = this.state.accountName;
        //     var docsDir;
        //     if ( Platform.OS == "android" ) {
        //         docsDir = await RNFS.ExternalStorageDirectoryPath //;
        //     } else {
        //         docsDir = await RNFS.DocumentDirectoryPath;
        //     }
        //     console.log( { docsDir } );
        //     docsDir = Platform.OS === 'android' ? `file://${ docsDir }` : docsDir;
        //     var path = `${ docsDir }/paymentRequestQRCode.png`;
        //     RNFS.writeFile( path, qrcodeBase64, "base64" )
        //         .then( ( success: any ) => {
        //             this.setState( {
        //                 flag_LoadingShareBtn: false
        //             } )
        //             const shareOptions = {
        //                 title: 'Hexa App',
        //                 message: "This is " + accountName + " qrcode",
        //                 url: path
        //             };
        //             Share.open( shareOptions );
        //         } )
        //         .catch( ( err: any ) => {
        //             alert.simpleOk( "Oops", err );
        //         } )
        // }, 2000 );


        const shareOptions = {
            title: 'Payment Address',
            message: qrcodeAddresWithAmount,
            url: 'https://hexawallet.io',
        };
        Share.open( shareOptions )
            .then( ( res: any ) => { Toast.show( 'address send' ); } )
            .catch( ( err: any ) => { err && console.log( err ); } );
    }

    render() {
        //array
        let { arr_AccountList } = this.state;
        //values
        let { accountName, qrcodeAddresWithAmount, amount } = this.state;
        //flag
        let { flag_Loading, flag_LoadingShareBtn } = this.state;
        const itemList = arr_AccountList.map( ( item: any, index: number ) => (
            <Picker.Item label={ item.accountName } value={ item.accountName } />
        ) );
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Receive</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <View style={ { flex: 1, alignItems: "center", marginTop: 50, marginBottom: 20 } }>
                                <View style={ styles.itemQuestionPicker }>
                                    <Picker
                                        renderHeader={ backAction =>
                                            <Header style={ { backgroundColor: "#ffffff" } }>
                                                <Left>
                                                    <Button transparent onPress={ backAction }>
                                                        <Icon name="arrow-back" style={ { color: "#000" } } />
                                                    </Button>
                                                </Left>
                                                <Body style={ { flex: 3 } }>
                                                    <Title style={ [ globalStyle.ffFiraSansMedium, { color: "#000" } ] }>Select Account</Title>
                                                </Body>
                                                <Right />
                                            </Header> }
                                        mode="dropdown"
                                        style={ [ globalStyle.ffFiraSansMedium ] }
                                        iosIcon={ <Icon name="arrow-down" style={ { fontSize: 30, marginLeft: -10 } } /> }
                                        selectedValue={ accountName }
                                        onValueChange={ ( item: any ) => this.onValueChange( item ) }
                                    >
                                        { itemList }
                                    </Picker>
                                </View>
                                <View style={ styles.itemQuestionPicker }>
                                    <View style={ { flexDirection: "row", alignItems: "center" } }>
                                        <SvgIcon
                                            name="icon_bitcoin"
                                            color="#D0D0D0"
                                            size={ 25 }
                                            style={ { flex: 0.1, marginLeft: 10 } }
                                        />
                                        <Input
                                            value={ amount }
                                            keyboardType="numeric"
                                            placeholder="Amount Sats"
                                            placeholderTextColor="#D0D0D0"
                                            returnKeyType="done"
                                            onChangeText={ ( val ) => {
                                                this.setState( {
                                                    amount: val
                                                } )
                                                setTimeout( () => {
                                                    this.getQrCodeWithAmount()
                                                }, 100 );
                                            } }
                                            style={ [ globalStyle.ffOpenSansBold, { flex: 1, fontSize: 18 } ] }
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={ { flex: 1, alignItems: "center" } }>
                                <QRCode
                                    value={ qrcodeAddresWithAmount }
                                    getRef={ ( c ) => ( this.svg1 = c ) }
                                    size={ Dimensions.get( 'screen' ).width - 120 }
                                />
                                <View style={ { flexDirection: "row", margin: 10 } }>
                                    <Text numberOfLines={ 1 } style={ { flex: 0.9, color: "#1378B7", textAlign: "center", marginLeft: 10, } }>{ qrcodeAddresWithAmount + "  " } </Text>
                                    <TouchableOpacity onPress={ () => {
                                        Clipboard.setString( qrcodeAddresWithAmount );
                                        Toast.show( 'address copied' );
                                    } }>
                                        <IconFontAwe
                                            name="copy"
                                            size={ 20 }
                                            color="#2F2F2F"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={ { flex: 1 } }>
                                <Text note style={ { textAlign: "center", margin: 5 } }>Share this address to receive founds</Text>
                                <FullLinearGradientIconWithLoadingButton
                                    click_Done={ () => this.click_ShareAddress() }
                                    title="Share"
                                    iconName="share"
                                    iconColor={ "#ffffff" }
                                    iconSize={ 20 }
                                    disabled={ flag_LoadingShareBtn }
                                    animating={ flag_LoadingShareBtn }
                                    style={ [ { borderRadius: 10, margin: 10 } ] } />
                            </View>
                        </KeyboardAwareScrollView>
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
    itemQuestionPicker: {
        width: Dimensions.get( 'screen' ).width / 1.07,
        borderWidth: Platform.OS == "ios" ? 0 : 0.1,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        justifyContent: "center",
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 60
    },
} );
