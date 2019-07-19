import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Dimensions, Platform, AsyncStorage } from 'react-native';
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
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import { Avatar } from 'react-native-elements';
import { SvgIcon } from "@up-shared/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


interface Props {
    data: [];
    closeModal: Function;
    click_Next: Function;
    pop: Function;
    click_Request: Function
}


//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();
//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    colors,
    images,
    localDB,
    asyncStorageKeys
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
import utils from "HexaWallet/src/app/constants/Utils";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );

//TODO: Bitcoin Files
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import RegularAccount from "HexaWallet/src/bitcoin/services/accounts/RegularAccount";
import SecureAccount from "HexaWallet/src/bitcoin/services/accounts/SecureAccount";

export default class ModelRestoreWalletFirstQuestion extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
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
            flag_DisableBtnNext: true,
            flag_Loading: false
        } );
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
            if ( firstAns.length >= 6 ) {
                this.setState( {
                    flag_DisableBtnNext: false
                } )
            } else {
                this.setState( {
                    flag_DisableBtnNext: true
                } )
            }
        }, 100 );

    }

    //TODO: get bal and insert accound into local db
    click_Next = async () => {
        this.setState( {
            flag_Loading: true
        } );
        let Question = this.state.firstQuestion;
        let Answer = this.state.firstAnswer

        const dateTime = Date.now();
        let walletDetail = await utils.getWalletDetails();
        let sssDetails = await utils.getSSSDetails();
        console.log( { sssDetails } );
        let decryptedShare = [];
        let arr_TableId = [];
        // let answers = [ temp[ 0 ].firstAnswer, temp[ 1 ].secoundAnswer ];
        let walletName, encryptedStaticNonPMDD;
        for ( let i = 0; i < sssDetails.length; i++ ) {
            let data = sssDetails[ i ];
            if ( data.decryptedShare != "" ) {
                let decryptedShareJson = JSON.parse( data.decryptedShare );
                console.log( { decryptedShareJson } );
                decryptedShare.push( decryptedShareJson.encryptedShare );
                walletName = decryptedShareJson.meta.tag;
                encryptedStaticNonPMDD = decryptedShareJson.encryptedStaticNonPMDD;
            }
            arr_TableId.push( data.id );
        }
        console.log( { decryptedShare, Answer } );
        var resMnemonic = await S3Service.recoverFromShares( decryptedShare, Answer );
        if ( resMnemonic.status == 200 ) {
            resMnemonic = resMnemonic.data;
            console.log( { resMnemonic } );
            let queTemp = [];
            let questionData = {};
            questionData.Question = Question;
            questionData.Answer = Answer;
            queTemp.push( questionData );
            let resInsertWallet = await dbOpration.insertWallet(
                localDB.tableName.tblWallet,
                dateTime,
                resMnemonic.mnemonic,
                "",
                "",
                "",
                walletName,
                queTemp
            );
            await comFunDBRead.readTblWallet();
            const regularAccount = new RegularAccount(
                resMnemonic.mnemonic
            );
            const sss = new S3Service( resMnemonic.mnemonic );
            var regularJson = JSON.stringify( regularAccount );
            AsyncStorage.setItem(
                asyncStorageKeys.regularClassObject,
                regularJson
            );
            await utils.setRegularAccountObject( regularAccount );
            //console.log( { secondaryMnemonic } );

            var sssJson = JSON.stringify( sss );
            AsyncStorage.setItem(
                asyncStorageKeys.s3ServiceClassObject,
                sssJson
            );
            await utils.setS3ServiceObject( sss );
            //decryptStaticNonPMDD
            console.log( { encryptedStaticNonPMDD } );
            var secureAccount;
            var resDecryptStaticNonPMDD = await sss.decryptStaticNonPMDD( encryptedStaticNonPMDD );
            console.log( { resDecryptStaticNonPMDD } );

            if ( resDecryptStaticNonPMDD.status == 200 ) {
                resDecryptStaticNonPMDD = resDecryptStaticNonPMDD.data.decryptedStaticNonPMDD;
                secureAccount = new SecureAccount( resMnemonic.mnemonic );
                var secureJson = JSON.stringify( secureAccount );
                AsyncStorage.setItem(
                    asyncStorageKeys.secureClassObject,
                    secureJson
                );
                await utils.setSecureAccountObject( secureAccount );
                var resImportSecureAccount = await secureAccount.importSecureAccount( resDecryptStaticNonPMDD.secondaryXpub, resDecryptStaticNonPMDD.bhXpub );
                console.log( { resImportSecureAccount } );

                if ( resImportSecureAccount.status == 200 ) {
                    resImportSecureAccount = resImportSecureAccount.data;


                    var getBal = await regularAccount.getBalance();
                    console.log( { getBal } );
                    if ( getBal.status == 200 ) {
                        await bitcoinClassState.setRegularClassState( regularAccount );
                        getBal = getBal.data;
                    } else {
                        alert.simpleOk( "Oops", getBal.err );
                    }

                    var getBalSecure = await secureAccount.getBalance();
                    console.log( { getBalSecure } );
                    if ( getBalSecure.status == 200 ) {
                        getBalSecure = getBalSecure.data;
                    } else {
                        alert.simpleOk( "Oops", getBalSecure.err );
                    }
                    var address = await secureAccount.getAddress();
                    if ( address.status == 200 ) {
                        await bitcoinClassState.setSecureClassState( secureAccount );
                        address = address.data.address
                    } else {
                        alert.simpleOk( "Oops", address.err );
                    }
                    let resInsertDailyAccount = await dbOpration.insertCreateAccount(
                        localDB.tableName.tblAccount,
                        dateTime,
                        "",
                        getBal.balance / 1e8,
                        "BTC",
                        "Daily Wallet",
                        "Daily Wallet",
                        ""
                    );
                    let resInsertSecureCreateAcc = await dbOpration.insertCreateAccount(
                        localDB.tableName.tblAccount,
                        dateTime,
                        address,
                        getBalSecure.balance / 1e8,
                        "BTC",
                        "Secure Account",
                        "Secure Account",
                        ""
                    );

                    let arr_SecureDetails = [];
                    let secureDetails = {};
                    secureDetails.backupDate = dateTime;
                    secureDetails.title = "Setup";
                    secureDetails.addInfo = "";
                    arr_SecureDetails.push( secureDetails );
                    let resSecureAccountUpdate = await dbOpration.updateSecureAccountAddInfo(
                        localDB.tableName.tblAccount,
                        dateTime,
                        arr_SecureDetails,
                        "2"
                    );
                    if ( resInsertDailyAccount && resInsertSecureCreateAcc && resSecureAccountUpdate ) {
                        await comFunDBRead.readTblSSSDetails();
                        await comFunDBRead.readTblAccount();
                        this.setState( {
                            flag_Loading: false
                        } );
                        setTimeout( () => {
                            let data = {};
                            data.walletName = walletName;
                            data.balR = getBal.balance / 1e8;
                            data.balS = getBalSecure.balance / 1e8;
                            this.props.click_Next( data );
                            AsyncStorage.setItem(
                                asyncStorageKeys.rootViewController,
                                "TabbarBottom"
                            );
                        }, 1000 );
                    }
                } else {
                    alert.simpleOk( "Oops", resImportSecureAccount.err );
                }
            } else {
                alert.simpleOk( "Oops", resDecryptStaticNonPMDD.err );
            }
            //const res = await comAppHealth.connection_AppHealthStatusUpdateUsingRetoreWalletTrustedContact( dateTime, 0, decryptedShare, mnemonic, arr_RecordId );
            // console.log( { res } );
        }
    }


    render() {
        //flag 
        let { flag_Loading } = this.state;
        let flag_DisableBtnNext = this.state.flag_DisableBtnNext;
        let firstQuestion = this.state.firstQuestion;
        let arr_QuestionList = this.state.arr_QuestionList != null ? this.state.arr_QuestionList : dataQuestionList;
        const itemList = arr_QuestionList.map( ( item: any, index: number ) => (
            <Picker.Item label={ item.item } value={ item.item } style={ { width: 40 } } />
        ) );
        return (
            <Modal
                transparent
                animationType={ 'fade' }
                visible={ this.props.data.length != 0 ? this.props.data[ 0 ].modalVisible : false }
                onRequestClose={ () =>
                    this.props.closeModal()
                }
            >
                <KeyboardAwareScrollView
                    enableAutomaticScroll
                    automaticallyAdjustContentInsets={ true }
                    keyboardOpeningTime={ 0 }
                    enableOnAndroid={ true }
                    contentContainerStyle={ { flexGrow: 1 } }
                >
                    <View style={ [
                        styles.modalBackground,
                        { backgroundColor: `rgba(0,0,0,0.4)` }
                    ] }
                    >
                        <View style={ styles.viewModelBody }>
                            <View style={ { flexDirection: "row", flex: 0.5 } }>
                                <Button
                                    transparent
                                    onPress={ () => this.props.pop() }
                                >
                                    <SvgIcon name="icon_back" size={ 25 } color="gray" />
                                </Button>
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }>Restore wallet using Trusted Contacts</Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                                <Text note style={ { textAlign: "center" } }>Enter the first question and answer you chose at the time of setting up the wallet</Text>
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
                                        style={ [ globalStyle.ffFiraSansMedium, ] }
                                        textStyle={ { paddingRight: 50 } }
                                        iosIcon={ <Icon name="arrow-down" style={ { fontSize: 25, marginLeft: -45, marginRight: 20 } } /> }
                                        selectedValue={ firstQuestion }
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
                            </View>
                            <View style={ { flex: 1, justifyContent: "flex-end" } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", fontSize: 12 } ] }>In case the answer does not match with the original answer, restoration process will fail</Text>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.click_Next()
                                    }
                                    }
                                    title="Next"
                                    disabled={ flag_DisableBtnNext }
                                    style={ [ flag_DisableBtnNext == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                />
                            </View>
                            <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        justifyContent: 'center'
    },
    viewModelBody: {
        flex: 0.7,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    },
    itemInputWalletName: {
        width: Dimensions.get( 'screen' ).width / 1.21,
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
        marginTop: 20,
        width: Dimensions.get( 'screen' ).width / 1.21,
        borderWidth: Platform.OS == "ios" ? 0 : 0.1,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF',
        marginBottom: 10,
        height: 50
    },
} );