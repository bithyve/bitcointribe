import React, { Component } from "react";
import {
    StyleSheet,
    View,
    AsyncStorage,
    Platform,
    Dimensions,
    Image,
    Keyboard,
    StatusBar,
    Linking,
    ImageBackground,
    Alert
} from "react-native";
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
import { StackActions, NavigationActions } from "react-navigation";
import CodeInput from "react-native-confirmation-code-input";
import * as Keychain from "react-native-keychain";
import { SvgIcon } from "@up-shared/components";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome Object   
import {
    colors,
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
import utils from "HexaWallet/src/app/constants/Utils";
import Singleton from "HexaWallet/src/app/constants/Singleton";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//localization
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

//TODO: Bitcoin Class
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

export default class OTPBackupShareStore extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            status: false,
            otp: "000000",
            success: "Passcode does not match!",
            passcodeStyle: [
                {
                    activeColor: colors.black,
                    inactiveColor: colors.black,
                    cellBorderWidth: 0
                }
            ],
            statusConfirmBtnDisable: true,
            flag_Loading: false,
            keeperInfo: [],
            arr_ResDownShare: [],
            recordId: ""
        };
    }


    async componentWillMount() {
        // let script = utils.getDeepLinkingUrl();
        // let key = script.key;
        // console.log( { key } );
        // const resDownloadShare = await S3Service.downloadShare( key );
        // console.log( { resDownloadShare } );
        // this.setState( {
        //     arr_ResDownShare: resDownloadShare
        // } )

    }

    _onFinishCheckingCode = async ( code: string ) => {
        console.log( { code } );
        if ( code.length == 6 ) {
            this.setState( {
                otp: code,
                statusConfirmBtnDisable: false
            } )
        }
    }

    goBack = () => {
        utils.setDeepLinkingType( "" );
        utils.setDeepLinkingUrl( "" );
        this.props.navigation.navigate( "TabbarBottom" );
    }

    onSuccess = async () => {
        const dateTime = Date.now();
        console.log( { dateTime } );

        this.setState( {
            flag_Loading: true
        } )
        let flag_Loading = true;
        let enterOtp = this.state.otp;
        let script = utils.getDeepLinkingUrl();
        let messageId = script.key;
        console.log( { messageId, enterOtp } );
        //let resDownShare = this.state.arr_ResDownShare;
        //console.log( { resDownShare } );
        let urlScript = {};
        urlScript.walletName = script.wn;
        urlScript.data = script.key;
        const sss = await bitcoinClassState.getS3ServiceClassState();
        let resDecryptViaOTP = await S3Service.decryptViaOTP( script.key, enterOtp );
        console.log( { resDecryptViaOTP } );
        if ( resDecryptViaOTP.status == 200 ) {
            const resDownloadShare = await S3Service.downloadShare( resDecryptViaOTP.data.decryptedData );
            console.log( { resDownloadShare } );
            if ( resDownloadShare.status == 200 ) {
                let regularAccount = await bitcoinClassState.getRegularClassState();
                var resGetWalletId = await regularAccount.getWalletId();
                if ( resGetWalletId.status == 200 ) {
                    await bitcoinClassState.setRegularClassState( regularAccount );
                    resGetWalletId = resGetWalletId.data;
                } else {
                    alert.simpleOk( "Oops", resGetWalletId.err );
                }
                let resTrustedParty = await comFunDBRead.readTblTrustedPartySSSDetails();
                let arr_DecrShare = [];
                for ( let i = 0; i < resTrustedParty.length; i++ ) {
                    arr_DecrShare.push( JSON.parse( resTrustedParty[ i ].decrShare ) );
                }
                let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownloadShare.data.encryptedMetaShare, resDecryptViaOTP.data.decryptedData, resGetWalletId.walletId, arr_DecrShare );
                console.log( { resDecryptEncMetaShare } );
                if ( resDecryptEncMetaShare.status == 200 ) {
                    const resUpdateHealth = await sss.updateHealth( resDecryptEncMetaShare.data.decryptedMetaShare.meta.walletId, resDecryptEncMetaShare.data.decryptedMetaShare.encryptedShare );
                    console.log( { resUpdateHealth } );
                    if ( resUpdateHealth.status == 200 ) {
                        await bitcoinClassState.setS3ServiceClassState( sss );
                        const resTrustedParty = await dbOpration.insertTrustedPartyDetailWithoutAssociate(
                            localDB.tableName.tblTrustedPartySSSDetails,
                            dateTime,
                            urlScript,
                            resDecryptEncMetaShare.data.decryptedMetaShare,
                            resDecryptEncMetaShare.data.decryptedMetaShare.meta,
                            resDecryptEncMetaShare.data.decryptedMetaShare.encryptedStaticNonPMDD
                        );
                        if ( resTrustedParty ) {
                            flag_Loading = false;
                            setTimeout( () => {
                                alert.simpleOkAction( "Success", "Decrypted share stored.", this.goBack );
                            }, 100 );
                        }
                    } else {
                        flag_Loading = false;
                        setTimeout( () => {
                            alert.simpleOk( "Oops", resUpdateHealth.err );
                        }, 100 );
                    }
                } else {
                    flag_Loading = false;
                    setTimeout( () => {
                        alert.simpleOk( "Oops", resDecryptEncMetaShare.err );
                    }, 100 );
                }

            } else {
                flag_Loading = false;
                setTimeout( () => {
                    alert.simpleOk( "Oops", resDownloadShare.err );
                }, 100 );
            }
        } else {
            flag_Loading = false;
            setTimeout( () => {
                alert.simpleOk( "Oops", resDecryptViaOTP.err );
            }, 100 );
        }
        // const resDecryptOTPEncShare = await S3Service.decryptOTPEncShare( resDownShare, messageId, enterOtp );
        // let walletDetails = utils.getWalletDetails();
        // const sss = new S3Service(
        //     walletDetails.mnemonic
        // );
        // console.log( { resDecryptOTPEncShare } );
        // let resShareId = await sss.getShareId( resDecryptOTPEncShare.decryptedShare.encryptedShare )
        // console.log( { resShareId } );
        // const { data, updated } = await sss.updateHealth( resDecryptOTPEncShare.decryptedShare.meta.walletId, resDecryptOTPEncShare.decryptedShare.encryptedShare );
        // console.log( { resDecryptOTPEncShare } );
        // if ( resDecryptOTPEncShare.status == 200 ) {
        //     const resUpdateSSSRetoreDecryptedShare = await dbOpration.insertTrustedPartyDetailWithoutAssociate(
        //         localDB.tableName.tblTrustedPartySSSDetails,
        //         dateTime,
        //         urlScript,
        //         resDecryptOTPEncShare.decryptedShare,
        //         resShareId,
        //         resDecryptOTPEncShare,
        //         typeof data !== "undefined" ? data : ""
        //     );
        //     if ( resUpdateSSSRetoreDecryptedShare == true ) {
        //         this.setState( {
        //             flag_Loading: false
        //         } );
        //         setTimeout( () => {
        //             Alert.alert(
        //                 'Success',
        //                 'Decrypted share created.',
        //                 [
        //                     {
        //                         text: 'OK', onPress: () => {
        //                             utils.setDeepLinkingType( "" );
        //                             utils.setDeepLinkingUrl( "" );
        //                             this.props.navigation.navigate( 'TabbarBottom' );
        //                         }
        //                     },

        //                 ],
        //                 { cancelable: false }
        //             )
        //         }, 100 );
        //     } else {
        //         this.setState( {
        //             flag_Loading: false
        //         } )
        //         Alert.alert( resUpdateSSSRetoreDecryptedShare );
        //     }

        // }
        this.setState( {
            flag_Loading
        } )

    }

    render() {
        return (
            <View style={ styles.container }>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                    <KeyboardAwareScrollView
                        enableAutomaticScroll
                        automaticallyAdjustContentInsets={ true }
                        keyboardOpeningTime={ 0 }
                        enableOnAndroid={ true }
                        contentContainerStyle={ { flexGrow: 1 } }
                    >
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <Text style={ { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0, fontFamily: "FiraSans-Medium" } }></Text>
                            </Button>
                            <Text note style={ { textAlign: "center", marginTop: 10, marginRight: 10 } }>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                        </View>
                        <View style={ styles.viewPasscode }>
                            <Text
                                style={ { marginTop: 100, fontWeight: "bold", color: "#8B8B8B" } }
                            >
                                Enter OTP
                        </Text>
                            <CodeInput
                                ref="codeInputRef1"
                                secureTextEntry
                                keyboardType="default"
                                autoCapitalize="sentences"
                                codeLength={ 6 }
                                activeColor={ this.state.passcodeStyle[ 0 ].activeColor }
                                inactiveColor={ this.state.passcodeStyle[ 0 ].inactiveColor }
                                className="border-box"
                                cellBorderWidth={ this.state.passcodeStyle[ 0 ].cellBorderWidth }
                                autoFocus={ true }
                                inputPosition="center"
                                space={ 5 }
                                size={ 50 }
                                codeInputStyle={ { borderRadius: 5, backgroundColor: "#F1F1F1" } }
                                containerStyle={ {
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: Platform.OS == "ios" ? 0 : 40,
                                } }
                                onFulfill={ ( code ) =>
                                    this._onFinishCheckingCode( code )
                                }
                                type='characters'
                            />
                            { renderIf( this.state.passcodeStyle[ 0 ].activeColor == "red" )(
                                <Text style={ { color: "red", marginTop: 44 } }>{ this.state.success }</Text>
                            ) }
                        </View>
                        <View style={ styles.viewBtnProceed }>
                            <Text note style={ { textAlign: "center", marginBottom: 30 } }>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                            <FullLinearGradientButton
                                style={ [
                                    this.state.statusConfirmBtnDisable == true ? { opacity: 0.4 } : { opacity: 1 },
                                    { borderRadius: 5 } ] }
                                disabled={ this.state.statusConfirmBtnDisable }
                                title="Confirm & Proceed"
                                click_Done={ () => this.onSuccess() }
                            />
                        </View>
                    </KeyboardAwareScrollView>
                </ImageBackground>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } />
            </View>
        );
    }
}

let styles = StyleSheet.create( {
    container: {
        flex: 1
    },
    viewPagination: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30
    },
    viewAppLogo: {
        flex: 1,
        alignItems: "center",
        marginTop: 50
    },
    imgAppLogo: {
        height: 150,
        width: 150
    },
    viewPasscode: {
        flex: 1,
        alignItems: "center"
    },
    viewBtnProceed: {
        flex: 3,
        justifyContent: "flex-end",
        marginBottom: 20
    }
} );
