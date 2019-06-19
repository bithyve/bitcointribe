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
    List, ListItem,
    Picker,
    Icon,
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import QRCode from 'react-native-qrcode-svg';


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


export default class ReceivePaymentScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_AccountList: [],
            accountName: "",
            accountAddress: "",
            amount: "",
            qrcodeAddresWithAmount: "hexa",
        } )
    }

    async componentWillMount() {
        let walletDetails = await utils.getWalletDetails();
        let arr_AccountList = await comFunDBRead.readTblAccount();
        for ( var i = 0; i < arr_AccountList.length; i++ )
            if ( arr_AccountList[ i ].address === "" ) {
                arr_AccountList.splice( i, 1 );
            }
        let paymentQRCode = await this.getQrCode( arr_AccountList[ 0 ].address );
        //console.log( { paymentQRCode } );
        this.setState( {
            arr_AccountList,
            accountName: arr_AccountList[ 0 ].accountName,
            accountAddress: arr_AccountList[ 0 ].address,
            qrcodeAddresWithAmount: paymentQRCode.toString(),
        } )
    }

    //Dropdown select account name
    onValueChange = async ( value: string ) => {
        let arr_AccountList = this.state.arr_AccountList;
        console.log( { value } );
        let index: number = 0;
        for ( var i = 0; i < arr_AccountList.length; i++ )
            if ( arr_AccountList[ i ].accountName === value ) {
                index = i;
                break;
            }
        let paymentQRCode = await this.getQrCode( arr_AccountList[ index ].address );
        console.log( { paymentQRCode } );
        this.setState( {
            accountName: value,
            amount: "",
            accountAddress: arr_AccountList[ index ].address,
            qrcodeAddresWithAmount: paymentQRCode.toString(),
        } );
    }

    //input value change then get new code code string 
    getQrCode = async ( address: any, option?: any ) => {
        console.log( { address, option } );

        let walletDetails = await utils.getWalletDetails();
        const regularAccount = new RegularAccount(
            walletDetails.mnemonic
        );
        return await regularAccount.getPaymentURI( address, option );
    }

    render() {
        //array
        let { arr_AccountList } = this.state;
        //values
        let { accountName, qrcodeAddresWithAmount, amount } = this.state;
        //flag

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
                                            placeholder="Amount"
                                            placeholderTextColor="#D0D0D0"
                                            onChange={ ( val ) => this.getQrCode( val ) }
                                            style={ [ globalStyle.ffOpenSansBold, { flex: 1, fontSize: 18 } ] }
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={ { flex: 1, alignItems: "center" } }>
                                <QRCode
                                    value={ qrcodeAddresWithAmount }
                                    size={ Dimensions.get( 'screen' ).width - 120 }
                                />
                                <View style={ { flexDirection: "row", margin: 10 } }>
                                    <Text style={ { color: "#1378B7" } }>dsajflkdsjlkfj  </Text>
                                    <IconFontAwe
                                        name="copy"
                                        size={ 20 }
                                        color="#2F2F2F"
                                    />
                                </View>
                            </View>
                            <View style={ { flex: 1 } }>
                                <Text note style={ { textAlign: "center", margin: 5 } }>Share this address to receive founds</Text>
                                <FullLinearGradientButton
                                    style={ [ { opacity: 1 }, { borderRadius: 10 } ] }
                                    disabled={ this.state.status == true ? false : true }
                                    title="Call to Action Comes Here"
                                    click_Done={ () => console.log( 'working' ) }
                                />
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
            </Container >
        );
    }
}
const primaryColor = colors.appColor;
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
