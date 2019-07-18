import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, AsyncStorage } from "react-native";
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
    Text

} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { StackActions, NavigationActions } from "react-navigation";
import bip39 from 'react-native-bip39';


//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";

//TODO: Custome Alert
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

import WalletNameScreen from "./WalletNameScreen/WalletNameScreen";
import FirstSecretQuestionScreen from "./FirstSecretQuestionScreen/FirstSecretQuestionScreen";
import SecondSecretQuestion from "./SecondSecretQuestion/SecondSecretQuestion";

//TODO: Custome Object  
import { colors, images, asyncStorageKeys, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Bitcoin Files  
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";
import SecureAccount from "HexaWallet/src/bitcoin/services/accounts/SecureAccount";

export default class WalletSetupScreens extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            walletName: "",
            flag_ProceedBtnDisable: true,
            flag_Loading: false,
        } );
    }

    //TODO: Wallet Name
    ckeckWalletName( val: string ) {
        if ( val.length >= 6 ) {
            this.setState( {
                flag_ProceedBtnDisable: false
            } )
        } else {
            this.setState( {
                flag_ProceedBtnDisable: true
            } )
        }

    }


    //TODO:click_GotoPermisionScrenn
    click_Proceed = async () => {
        this.setState( {
            flag_Loading: true
        } );
        const dateTime = Date.now();
        const mnemonic = await bip39.generateMnemonic( 256 );
        let walletName = this.state.walletName;
        const regularAccount = new RegularAccount(
            mnemonic
        );
        const secureAccount = new SecureAccount( mnemonic );
        const sss = new S3Service( mnemonic );
        //regular account  
        await bitcoinClassState.setRegularClassState( regularAccount );
        //secure account  
        await bitcoinClassState.setSecureClassState( secureAccount );
        //s3serverice
        await bitcoinClassState.setS3ServiceClassState( sss )
        var getAddress = await regularAccount.getAddress();
        if ( getAddress.status == 200 ) {
            getAddress = getAddress.data.address
        } else {
            alert.simpleOk( "Oops", getAddress.err );
        }
        console.log( { getAddress } );
        let resInsertWallet = await dbOpration.insertWallet(
            localDB.tableName.tblWallet,
            dateTime,
            mnemonic,
            "",
            "",
            "",
            walletName,
            ""
        );
        await comFunDBRead.readTblWallet();
        // let shares = [
        //     { shareId: "", updatedAt: 0 },
        //     { shareId: "", updatedAt: 0 },
        //     { shareId: "", updatedAt: 0 },
        //     { shareId: "", updatedAt: 0 },
        //     { shareId: "", updatedAt: 0 }
        // ];
        // let resAppHealthStatus = await comAppHealth.connection_AppHealthStatus( 0, shares )
        // console.log( { resAppHealthStatus } );

        let resInsertCreateAcc = await dbOpration.insertCreateAccount(
            localDB.tableName.tblAccount,
            dateTime,
            getAddress,
            "0.0",
            "BTC",
            "Daily Wallet",
            "Regular Account",
            ""
        );
        let resInsertSecureCreateAcc = await dbOpration.insertCreateAccount(
            localDB.tableName.tblAccount,
            dateTime,
            "",
            "0.0",
            "BTC",
            "Secure Account",
            "Secure Account",
            ""
        );
        if ( resInsertWallet && resInsertSecureCreateAcc && resInsertCreateAcc ) {
            this.setState( {
                flag_Loading: false
            } );
            const resetAction = StackActions.reset( {
                index: 0, // <-- currect active route from actions array
                key: null,
                actions: [
                    NavigationActions.navigate( { routeName: "TabbarBottom" } )
                ]
            } );
            AsyncStorage.setItem(
                asyncStorageKeys.rootViewController,
                "TabbarBottom"
            );
            this.props.navigation.dispatch( resetAction );

        } else {
            alert.simpleOk( "Oops", "Local db update issue!" );
        }
    }

    render() {
        //array 
        //values
        //flag
        let { flag_ProceedBtnDisable, flag_Loading } = this.state;
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Set up your wallet</Text>
                            </Button>
                        </View>
                        <View style={ styles.viewPagination }>
                            <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 22, textAlign: "center" } ] }>What do you want to call your Wallet?</Text>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { marginTop: 20, textAlign: "center" } ] }>This name will display on you wallet.</Text>
                        </View>
                        <View style={ styles.viewInputFiled }>
                            <Item rounded style={ styles.itemInputWalletName }>
                                <Input
                                    keyboardType="default"
                                    autoCapitalize='sentences'
                                    placeholder='Enter a name for your wallet'
                                    style={ [ globalStyle.ffFiraSansMedium ] }
                                    placeholderTextColor="#B7B7B7"
                                    onChangeText={ ( val ) => {
                                        this.setState( {
                                            walletName: val
                                        } )
                                        this.ckeckWalletName( val )
                                    } }
                                />
                            </Item>
                        </View>
                        <View style={ styles.viewProcedBtn }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", marginLeft: 20, marginRight: 20, marginBottom: 20 } ] } numberOfLines={ 1 }>Lorem ipsum dolor sit amet, consectetur adipiscing </Text>
                            <FullLinearGradientButton title="Proceed"
                                disabled={ flag_ProceedBtnDisable }
                                style={ [ flag_ProceedBtnDisable == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                click_Done={ () => this.click_Proceed() } />
                        </View>
                    </ImageBackground>
                    <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
                </SafeAreaView>
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    },
    viewPagination: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30
    },
    viewInputFiled: {
        flex: 3,
        alignItems: "center",
        margin: 10
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    }
} );
