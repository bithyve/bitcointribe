import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Platform,
    SafeAreaView,
    ImageBackground
} from "react-native";
import {
    Text
} from "native-base";
import CodeInput from "react-native-confirmation-code-input";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Alert 
import { AlertSimple } from "hexaCustAlert";
let alert = new AlertSimple();

//TODO: Custome Pages
import { ModelLoader } from "hexaLoader";
import { CustomeStatusBar } from "hexaCustStatusBar";
import { FullLinearGradientButton } from "hexaCustomeLinearGradientButton";
import { HeaderTitle } from "hexaCustHeader";

//TODO: Custome Object   
import {
    colors,
    images,
    localDB
} from "hexaConstants";
import utils from "hexaUtils";
var dbOpration = require( "hexaDBOpration" );
import { renderIf } from "hexaValidation";

//TODO: Bitcoin Class
var bitcoinClassState = require( "hexaClassState" );
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";

//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );

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




    _onFinishCheckingCode = async ( code: string ) => {
        //console.log( { code } );
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
        //console.log( { dateTime } );

        this.setState( {
            flag_Loading: true
        } )
        let flag_Loading = true;
        let enterOtp = this.state.otp;
        let script = utils.getDeepLinkingUrl();
        let messageId = script.key;
        //console.log( { messageId, enterOtp } );
        let urlScript = {};
        urlScript.walletName = script.wn;
        urlScript.data = script.key;
        const sss = await bitcoinClassState.getS3ServiceClassState();
        let resDecryptViaOTP = await S3Service.decryptViaOTP( script.key, enterOtp );
        //console.log( { resDecryptViaOTP } );
        if ( resDecryptViaOTP.status == 200 ) {
            const resDownloadShare = await S3Service.downloadShare( resDecryptViaOTP.data.decryptedData );
            //console.log( { resDownloadShare } );
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
                var arr_DecrShare = [];
                for ( let i = 0; i < resTrustedParty.length; i++ ) {
                    arr_DecrShare.push( JSON.parse( resTrustedParty[ i ].decrShare ) );
                }
                //console.log( { arr_DecrShare } );
                let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownloadShare.data.encryptedMetaShare, resDecryptViaOTP.data.decryptedData, resGetWalletId.walletId, arr_DecrShare );
                //console.log( { resDecryptEncMetaShare } );
                if ( resDecryptEncMetaShare.status == 200 ) {
                    //console.log( { lenght: arr_DecrShare.length } );
                    arr_DecrShare.length != 0 ? arr_DecrShare.push( resDecryptEncMetaShare.data.decryptedMetaShare ) : arr_DecrShare.push( resDecryptEncMetaShare.data.decryptedMetaShare );
                    //console.log( { nexttimearray: arr_DecrShare } );
                    const resUpdateHealth = await S3Service.updateHealth( arr_DecrShare );
                    //console.log( { resUpdateHealth } );
                    //console.log( { resUpdateHealth } );
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
                                alert.simpleOkAction( "Success", "Share stored successfully", this.goBack );
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
        this.setState( {
            flag_Loading
        } )

    }

    render() {
        return (
            <View style={ styles.container }>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <HeaderTitle title="Enter OTP"
                        pop={ () => this.props.navigation.pop() }
                    />
                    <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <View style={ styles.viewPasscode }>
                                <Text
                                    style={ { fontWeight: "bold", color: "#8B8B8B" } }
                                >
                                    Enter OTP
                        </Text>
                                <CodeInput
                                    ref="codeInputRef"
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
                                <Text note style={ { textAlign: "center", marginBottom: 30 } }></Text>
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
                    </SafeAreaView>
                </ImageBackground>
                <ModelLoader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } />
                <CustomeStatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
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
