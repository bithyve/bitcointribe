import React from "react";
import { StyleSheet, ImageBackground, View, Platform, Dimensions, AsyncStorage } from "react-native";
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
    Picker,
    Icon
} from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import bip39 from 'react-native-bip39';
//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";


//TODO: Custome Alert
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";



//TODO: Custome Object  
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );


//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );


//TODO: Bitcoin Files  
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";
import SecureAccount from "HexaWallet/src/bitcoin/services/accounts/SecureAccount";
export default class FirstSecretQuestionScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_QuestionList: [
                {
                    "item": "To what city did you go the first time you flew on a plane?"
                },
                {
                    "item": "What is the first name of the person you first kissed?"
                },
                {
                    "item": "What is the first name of your best friend in high school?"
                },
                {
                    "item": "What is the first name of your oldest nephew?"
                },
                {
                    "item": "What is the first name of your oldest niece?"
                },
                {
                    "item": "What was the first name of your favourite childhood friend?"
                },
                {
                    "item": "What was the last name of your third grade teacher?"
                },
                {
                    "item": "What was the street name where your best friend in high school lived (street name only)?"
                },
                {
                    "item": "In what city or town was your first job?"
                },
                {
                    "item": "What was the last name of your favorite childhood teacher?"
                },
                {
                    "item": "What was the name of the company where you had your first job?"
                },
                {
                    "item": "What was the name of the street where you were living when you were 10 years old?"
                }
            ],
            firstQuestion: "To what city did you go the first time you flew on a plane?",
            firstAnswer: "",
            secoundAnswer: "",
            flag_ConfirmDisableBtn: true
        };
    }

    //TODO: Select Picker Question List change aciton
    onValueChange( value: string ) {
        this.setState( {
            firstQuestion: value
        } );
    }

    //TODO: func check_CorrectAnswer
    check_CorrectAnswer() {
        setTimeout( () => {
            let firstAns = this.state.firstAnswer;
            let secoundAns = this.state.secoundAnswer;
            if ( firstAns == secoundAns && firstAns.length >= 6 ) {
                this.setState( {
                    flag_ConfirmDisableBtn: false
                } )
            } else {
                this.setState( {
                    flag_ConfirmDisableBtn: true
                } )
            }
        }, 100 );
    }




    //TODO: func click_FirstQuestion
    async click_FirstQuestion() {
        this.setState( {
            flag_Loading: true
        } );
        let question = this.state.firstQuestion;
        let answer = this.state.secoundAnswer;
        let resWalletData = await utils.getSetupWallet();
        const dateTime = Date.now();
        const mnemonic = await bip39.generateMnemonic( 256 );
        let walletName = resWalletData.walletName;
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
        var secureAddress = await secureAccount.getAddress();
        if ( secureAddress.status == 200 ) {
            await bitcoinClassState.setSecureClassState( secureAccount );
            secureAddress = secureAddress.data.address
        } else {
            alert.simpleOk( "Oops", secureAddress.err );
        }
        console.log( { getAddress, secureAddress } );
        let arrQustionList = [];
        let questionData = {};
        questionData.Question = question;
        questionData.Answer = answer;
        arrQustionList.push( questionData );
        let resInsertWallet = await dbOpration.insertWallet(
            localDB.tableName.tblWallet,
            dateTime,
            mnemonic,
            "",
            "",
            "",
            walletName,
            arrQustionList
        );
        await comFunDBRead.readTblWallet();
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
            secureAddress,
            "0.0",
            "BTC",
            "Secure Account",
            "Secure Account",
            ""
        );
        if ( resInsertWallet && resInsertSecureCreateAcc && resInsertCreateAcc ) {
            const dateTime = Date.now();
            let walletDetails = await utils.getWalletDetails();
            //console.log( { walletDetails } );
            let { secoundAnswer, arr_SelectedList } = this.state;
            //console.log( { arr_SelectedList } );
            let secureAccount = await bitcoinClassState.getSecureClassState();

            var resSetupSecureAccount = await secureAccount.setupSecureAccount();
            // console.log( { resSetupSecureAccount } );
            if ( resSetupSecureAccount.status == 200 ) {
                resSetupSecureAccount = resSetupSecureAccount.data;
            } else {
                alert.simpleOk( "Oops", resSetupSecureAccount.err );
            }
            var secondaryXpub = await secureAccount.getSecondaryXpub();
            if ( secondaryXpub.status == 200 ) {
                secondaryXpub = secondaryXpub.data.secondaryXpub;
            } else {
                alert.simpleOk( "Oops", secondaryXpub.err );
            }

            var getSecoundMnemonic = await secureAccount.getRecoveryMnemonic();
            if ( getSecoundMnemonic.status == 200 ) {
                await bitcoinClassState.setSecureClassState( secureAccount );
                getSecoundMnemonic = getSecoundMnemonic.data.secondaryMnemonic;
            } else {
                alert.simpleOk( "Oops", getSecoundMnemonic.err );
            }

            let arr_SecureDetails = [];
            let secureDetails = {};
            // secureDetails.setupData = resSetupSecureAccount.setupData;
            // secureDetails.secondaryMnemonic = secondaryMnemonic.secondaryMnemonic;
            secureDetails.backupDate = dateTime;
            secureDetails.title = "Setup";
            secureDetails.addInfo = "";
            arr_SecureDetails.push( secureDetails );
            let resInsertSecureCreateAcc = await dbOpration.updateSecureAccountAddInfo(
                localDB.tableName.tblAccount,
                dateTime,
                arr_SecureDetails,
                "2"
            );
            console.log( { resInsertSecureCreateAcc } );
            if ( resInsertSecureCreateAcc ) {
                const sss = await bitcoinClassState.getS3ServiceClassState();
                // console.log( { sss } );   
                const generateShareRes = await sss.generateShares( secoundAnswer );
                console.log( { generateShareRes } );
                if ( generateShareRes.status == 200 ) {
                    const { encryptedShares } = generateShareRes.data;
                    const autoHealthShares = encryptedShares.slice( 0, 3 );
                    //console.log( { autoHealthShares, manualHealthShares } );
                    const resInitializeHealthcheck = await sss.initializeHealthcheck( autoHealthShares );
                    console.log( { resInitializeHealthcheck } );
                    if ( resInitializeHealthcheck.status == 200 || resInitializeHealthcheck.status == 400 ) {
                        const shareIds = [];
                        // console.log( { autoHealthShares } );
                        for ( const share of encryptedShares ) {
                            shareIds.push( sss.getShareId( share ) )
                        }
                        const socialStaticNonPMDD = { secondaryXpub, bhXpub: resSetupSecureAccount.setupData.bhXpub, xIndex: resSetupSecureAccount.setupData.xIndex }
                        console.log( { socialStaticNonPMDD } );
                        var resEncryptSocialStaticNonPMDD = await sss.encryptStaticNonPMDD( socialStaticNonPMDD );
                        console.log( { shareIds, resEncryptSocialStaticNonPMDD } );
                        if ( resEncryptSocialStaticNonPMDD.status == 200 ) {
                            resEncryptSocialStaticNonPMDD = resEncryptSocialStaticNonPMDD.data.encryptedStaticNonPMDD;
                            const buddyStaticNonPMDD = { getSecoundMnemonic, twoFASecret: resSetupSecureAccount.setupData.secret, secondaryXpub, bhXpub: resSetupSecureAccount.setupData.bhXpub, xIndex: resSetupSecureAccount.setupData.xIndex };
                            console.log( { buddyStaticNonPMDD } );
                            let resEncryptBuddyStaticNonPMDD = await sss.encryptStaticNonPMDD( buddyStaticNonPMDD );
                            if ( resEncryptBuddyStaticNonPMDD.status == 200 ) {
                                resEncryptBuddyStaticNonPMDD = resEncryptBuddyStaticNonPMDD.data.encryptedStaticNonPMDD;
                                let rescreateMetaShare = await sss.createMetaShare( 1, encryptedShares[ 0 ], resEncryptSocialStaticNonPMDD, walletDetails.walletType );
                                console.log( { encpShare: encryptedShares[ 1 ], rescreateMetaShare } );
                                let resGenerateEncryptedMetaShare1 = await sss.generateEncryptedMetaShare( rescreateMetaShare.data.metaShare );
                                let rescreateMetaShare1 = await sss.createMetaShare( 2, encryptedShares[ 1 ], resEncryptSocialStaticNonPMDD, walletDetails.walletType );
                                console.log( { encpShare: encryptedShares[ 2 ], rescreateMetaShare1 } );
                                let resGenerateEncryptedMetaShare2 = await sss.generateEncryptedMetaShare( rescreateMetaShare1.data.metaShare );
                                let rescreateMetaShare2 = await sss.createMetaShare( 3, encryptedShares[ 2 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
                                let resGenerateEncryptedMetaShare3 = await sss.generateEncryptedMetaShare( rescreateMetaShare2.data.metaShare );
                                console.log( { rescreateMetaShare2 } );
                                //for pdf                      
                                let rescreateMetaShare3 = await sss.createMetaShare( 4, encryptedShares[ 3 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
                                console.log( { rescreateMetaShare3 } );
                                if ( rescreateMetaShare3.status == 200 ) {
                                    var qrcode4share = await sss.createQR( rescreateMetaShare3.data.metaShare, 4 );
                                    console.log( { qrcode4share } );
                                    if ( qrcode4share.status == 200 ) {
                                        qrcode4share = qrcode4share.data.qrData
                                        // console.log( { qrcode4share } );
                                        //creating 4th share pdf
                                        let temp = [];
                                        temp.push( { arrQRCodeData: qrcode4share, secondaryXpub: secondaryXpub, qrData: resSetupSecureAccount.setupData.qrData, secret: resSetupSecureAccount.setupData.secret, secondaryMnemonic: getSecoundMnemonic, bhXpub: resSetupSecureAccount.setupData.bhXpub } )
                                        let resGenerate4thsharepdf = await this.generate4thShare( temp );
                                        console.log( { resGenerate4thsharepdf } );
                                        if ( resGenerate4thsharepdf != "" ) {

                                            let rescreateMetaShare4 = await sss.createMetaShare( 5, encryptedShares[ 4 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
                                            console.log( { rescreateMetaShare4 } );
                                            if ( rescreateMetaShare4.status == 200 ) {
                                                var qrcode5share = await sss.createQR( rescreateMetaShare4.data.metaShare, 5 );
                                                console.log( { qrcode5share } );
                                                if ( qrcode5share.status == 200 ) {
                                                    qrcode5share = qrcode5share.data.qrData
                                                    let temp = [];
                                                    temp.push( { arrQRCodeData: qrcode5share, secondaryXpub: secondaryXpub, qrData: resSetupSecureAccount.setupData.qrData, secret: resSetupSecureAccount.setupData.secret, secondaryMnemonic: getSecoundMnemonic, bhXpub: resSetupSecureAccount.setupData.bhXpub } )
                                                    let resGenerate5thsharepdf = await this.generate5thShare( temp );
                                                    console.log( { resGenerate5thsharepdf } );
                                                    if ( resGenerate5thsharepdf != "" ) {
                                                        let resAppHealthStatus = await comAppHealth.connection_AppHealthStatus( dateTime, shareIds )
                                                        let keeperInfo = [ { info: arr_SelectedList[ 0 ] }, { info: arr_SelectedList[ 1 ] }, { info: rescreateMetaShare2.data }, { info: qrcode4share[ 0 ] }, { info: qrcode5share[ 0 ] } ];
                                                        let recoardInfo = [ { id: arr_SelectedList[ 0 ].recordID }, { id: arr_SelectedList[ 1 ].recordID }, { id: "" }, { id: "" }, { id: "" } ];
                                                        let arrTypes = [ { type: "Trusted Contacts 1" }, { type: "Trusted Contacts 2" }, { type: "Self Share 1" }, { type: "Self Share 2" }, { type: "Self Share 3" } ];
                                                        let encryptedMetaShare = [ { metaShare: rescreateMetaShare.data.metaShare }, { metaShare: rescreateMetaShare1.data.metaShare }, { metaShare: rescreateMetaShare2.data.metaShare }, { metaShare: resGenerate4thsharepdf }, { metaShare: resGenerate5thsharepdf } ]
                                                        let temp = [ { date: dateTime, share: encryptedShares, shareId: shareIds, keeperInfo: keeperInfo, recordId: recoardInfo, encryptedMetaShare: encryptedMetaShare, shareStage: resAppHealthStatus, type: arrTypes } ]
                                                        console.log( { temp } );
                                                        let resInsertSSSShare = await dbOpration.insertSSSShareDetails(
                                                            localDB.tableName.tblSSSDetails,
                                                            temp
                                                        );
                                                        console.log( { resInsertSSSShare } );

                                                        if ( resInsertSSSShare ) {
                                                            let queTemp = [];
                                                            let questionData = {};
                                                            questionData.Question = this.state.firstQuestion;
                                                            questionData.Answer = this.state.secoundAnswer;
                                                            queTemp.push( questionData );
                                                            let resUpdateWalletAns = await dbOpration.updateWalletAnswerDetails(
                                                                localDB.tableName.tblWallet,
                                                                queTemp
                                                            );
                                                            console.log( { resUpdateWalletAns } );

                                                            if ( resUpdateWalletAns ) {
                                                                await bitcoinClassState.setS3ServiceClassState( sss );
                                                                await comFunDBRead.readTblSSSDetails();
                                                                await comFunDBRead.readTblWallet();
                                                                this.setState( {
                                                                    flag_Loading: false
                                                                } );
                                                                this.props.click_Next();
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    alert.simpleOk( "Oops", qrcode4share.err );
                                                }
                                            }
                                        }
                                    } else {
                                        alert.simpleOk( "Oops", qrcode4share.err );
                                    }
                                } else {
                                    alert.simpleOk( "Oops", rescreateMetaShare3.err );
                                }

                            } else {
                                alert.simpleOk( "Oops", resEncryptBuddyStaticNonPMDD.err );
                            }

                        } else {
                            alert.simpleOk( "Oops", resEncryptSocialStaticNonPMDD.err );
                        }
                    } else {
                        alert.simpleOk( "Oops", resInitializeHealthcheck.err );
                    }
                } else {
                    alert.simpleOk( "Oops", generateShareRes.err );
                }
            } else {
                alert.simpleOk( "Oops", "Secure Account creating issue." );
            }
        }
        // window.EventBus.trigger( "swipeScreen", "optional event info" );
    }
    render() {
        //flag
        let { flag_Loading } = this.state;

        const itemList = this.state.arr_QuestionList.map( ( item: any, index: number ) => (
            <Picker.Item label={ item.item } value={ item.item } />
        ) );
        return (
            <View style={ styles.container }>

                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={ 40 }
                    contentContainerStyle={ { flexGrow: 1, } }
                >
                    <View style={ styles.viewPagination }>
                        <Text style={ [ globalStyle.ffFiraSansMedium, { fontWeight: "bold", fontSize: 22, textAlign: "center" } ] }>Step 2: Select  secret question</Text>
                        <Text note style={ [ globalStyle.ffFiraSansMedium, { marginTop: 20, textAlign: "center" } ] }>To Set up you need to select secret questions</Text>
                    </View>
                    <View style={ styles.viewInputFiled }>

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
                                            <Title style={ [ globalStyle.ffFiraSansMedium, { color: "#000" } ] }>Select Question</Title>
                                        </Body>
                                        <Right />
                                    </Header> }
                                mode="dropdown"
                                style={ [ globalStyle.ffFiraSansMedium ] }
                                iosIcon={ <Icon name="arrow-down" style={ { fontSize: 25, marginLeft: -10 } } /> }
                                selectedValue={ this.state.firstQuestion }
                                onValueChange={ this.onValueChange.bind( this ) }
                            >
                                { itemList }
                            </Picker>
                        </View>


                        <Item rounded style={ styles.itemInputWalletName }>
                            <Input
                                secureTextEntry
                                keyboardType="default"
                                autoCapitalize='sentences'
                                placeholder='Write your answer here'
                                style={ [ globalStyle.ffFiraSansMedium ] }
                                placeholderTextColor="#B7B7B7"
                                onChangeText={ ( val ) => {
                                    this.setState( {
                                        firstAnswer: val
                                    } )
                                } }
                                onKeyPress={ () =>
                                    this.check_CorrectAnswer()
                                }

                            />
                        </Item>
                        <Item rounded style={ styles.itemInputWalletName }>
                            <Input
                                keyboardType="default"
                                autoCapitalize='none'
                                placeholder='Confirm answer'
                                style={ [ globalStyle.ffFiraSansMedium ] }
                                placeholderTextColor="#B7B7B7"
                                onChangeText={ ( val ) => {
                                    this.setState( {
                                        secoundAnswer: val
                                    } )
                                } }
                                onKeyPress={ () =>
                                    this.check_CorrectAnswer()
                                }

                            />
                        </Item>
                    </View>
                    <View style={ styles.viewProcedBtn }>
                        <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", marginLeft: 20, marginRight: 20, marginBottom: 20 } ] } numberOfLines={ 1 }>Make sure you don’t select questions, answers to </Text>
                        <FullLinearGradientButton title="Go To Wallet" disabled={ this.state.flag_ConfirmDisableBtn } style={ [ this.state.flag_ConfirmDisableBtn == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] } click_Done={ () => this.click_FirstQuestion() } />
                    </View>
                </KeyboardAwareScrollView>
                <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
            </View>

        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "transparent",
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
        width: Dimensions.get( 'screen' ).width / 1.07,
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 50
    },
    itemQuestionPicker: {
        width: Dimensions.get( 'screen' ).width / 1.07,
        borderWidth: Platform.OS == "ios" ? 0 : 0.1,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 50
    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    }
} );
