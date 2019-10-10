import React, { Component } from 'react';
import { Modal, View, Alert, StyleSheet, Dimensions, Platform, AsyncStorage } from 'react-native';
import {
    Header,
    Title,
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

import { SvgIcon } from "hexaComponent/Icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface Props {
    data: [];
    closeModal: Function;
    click_Next: Function;
    pop: Function;
    click_Request: Function
}

//TODO: Custome Pages
import { ModelLoader } from "hexaComponent/Loader";
import { FullLinearGradientLoadingButton } from "hexaComponent/LinearGradient/Buttons";


//TODO: Custome Alert 
import { AlertSimple } from "hexaComponent/Alert";;
let alert = new AlertSimple();
//TODO: Custome StyleSheet Files       
import FontFamily from "hexaComponent/Styles/FontFamily";

//TODO: Custome Object
import {
    colors,
    localDB,
    asyncStorageKeys
} from "hexaConstants";
var dbOpration = require( "hexaDBOpration" );
import utils from "hexaUtils";

//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );
var comAppHealth = require( "hexaCommonAppHealth" );


//TODO: Custome Validation
import { validationService } from "hexaValidation";

//TODO: Bitcoin Files
var bitcoinClassState = require( "hexaClassState" );
import { S3Service, RegularAccount, SecureAccount } from "hexaBitcoin";

export default class ModelRestoreWalletFirstQuestion extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            inputs: {
                answer: {
                    type: "answer",
                    value: ""
                }
            },
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
            flag_NextBtnAnimation: false,
            flag_Loading: false,
        } );
        this.onInputChange = validationService.onInputChange.bind( this );
        this.getFormValidation = validationService.getFormValidation.bind( this );
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
            if ( firstAns.length >= 3 ) {
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
        try {
            this.getFormValidation();
            this.setState( {
                flag_Loading: true,
                flag_DisableBtnNext: true,
                flag_NextBtnAnimation: true,
            } );
            let Question = this.state.firstQuestion;
            let Answer = this.state.firstAnswer;
            const dateTime = Date.now();
            let walletDetail = await utils.getWalletDetails();
            var sssDetails = await utils.getSSSDetails();
            //console.log( { sssDetails } );
            let decryptedShare = [];
            let arr_TableId = [];
            let walletName, encryptedStaticNonPMDD;
            for ( let i = 0; i < sssDetails.length; i++ ) {
                let data = sssDetails[ i ];
                if ( data.decryptedShare != "" ) {
                    let decryptedShareJson = JSON.parse( data.decryptedShare );
                    //console.log( { decryptedShareJson } );
                    decryptedShare.push( decryptedShareJson.encryptedShare );
                    walletName = decryptedShareJson.meta.tag;
                    encryptedStaticNonPMDD = decryptedShareJson.encryptedStaticNonPMDD;
                }
                arr_TableId.push( data.id );
            }
            //console.log( { decryptedShare, Answer } );
            //check wallet id and index number
            var resMnemonic = await S3Service.recoverFromShares( decryptedShare, Answer );
            //console.log( { resMnemonic } );
            if ( resMnemonic.status == 200 ) {
                resMnemonic = resMnemonic.data;
                const regularAccount = new RegularAccount(
                    resMnemonic.mnemonic
                );
                var secureAccount;
                const sss = new S3Service( resMnemonic.mnemonic );
                await bitcoinClassState.setS3ServiceClassState( sss );
                //console.log( { encryptedStaticNonPMDD } );
                const shareIds = [];
                const shareSelfShareIds = [];
                for ( let i = 0; i < sssDetails.length; i++ ) {
                    let data = sssDetails[ i ];
                    if ( data.decryptedShare != "" ) {
                        let decryptedShareJson = JSON.parse( data.decryptedShare );
                        let shareId = S3Service.getShareId( decryptedShareJson.encryptedShare );
                        await dbOpration.updateSSSShareId(
                            localDB.tableName.tblSSSDetails,
                            dateTime,
                            shareId.data.shareId,
                            data.type
                        );
                    }
                }
                sssDetails = await comFunDBRead.readTblSSSDetails();
                let share = {};
                share.trustedContShareId1 = sssDetails[ 0 ].shareId != "" ? sssDetails[ 0 ].shareId : null;
                share.trustedContShareId2 = sssDetails[ 1 ].shareId != "" ? sssDetails[ 1 ].shareId : null;
                share.selfshareShareId1 = sssDetails[ 2 ].shareId != "" ? sssDetails[ 2 ].shareId : null;

                share.selfshareShareDate2 = sssDetails[ 3 ].acceptedDate != "" ? sssDetails[ 3 ].acceptedDate : 0;
                share.selfshareShareShareId2 = sssDetails[ 3 ].shareId != "" ? sssDetails[ 3 ].shareId : "";
                share.selfshareShareDate3 = sssDetails[ 4 ].acceptedDate != "" ? sssDetails[ 4 ].acceptedDate : 0;
                share.selfshareShareId3 = sssDetails[ 4 ].shareId != "" ? sssDetails[ 4 ].shareId : "";
                share.qatime = parseInt( dateTime );
                let resCheckHealthAllShare = await comAppHealth.checkHealthAllShare( share );
                //console.log( { resCheckHealthAllShare } );
                if ( resCheckHealthAllShare != "" ) {
                    let queTemp = [];
                    let questionData = {};
                    questionData.Question = Question;
                    questionData.Answer = Answer;
                    queTemp.push( questionData );
                    let arrBackupInfo = [ { backupType: "restore" }, { backupMethod: "share" } ];
                    await dbOpration.insertWallet(
                        localDB.tableName.tblWallet,
                        dateTime,
                        resMnemonic.mnemonic,
                        "",
                        "",
                        "",
                        walletName,
                        arrBackupInfo,
                        queTemp,
                        resCheckHealthAllShare
                    );
                    var resDecryptStaticNonPMDD = await sss.decryptStaticNonPMDD( encryptedStaticNonPMDD );
                    //console.log( { resDecryptStaticNonPMDD } );
                    if ( resDecryptStaticNonPMDD.status == 200 ) {
                        resDecryptStaticNonPMDD = resDecryptStaticNonPMDD.data.decryptedStaticNonPMDD;
                        secureAccount = new SecureAccount( resMnemonic.mnemonic );
                        var resImportSecureAccount = await secureAccount.importSecureAccount( resDecryptStaticNonPMDD.secondaryXpub, resDecryptStaticNonPMDD.bhXpub );
                        //console.log( { resImportSecureAccount } );
                        if ( resImportSecureAccount.status == 200 ) {
                            resImportSecureAccount = resImportSecureAccount.data;
                            let resInsertDailyAccount = await dbOpration.insertCreateAccount(
                                localDB.tableName.tblAccount,
                                dateTime,
                                "",
                                "0",
                                "BTC",
                                "Regular Account",
                                "Regular Account",
                                ""
                            );
                            let resInsertSecureCreateAcc = await dbOpration.insertCreateAccount(
                                localDB.tableName.tblAccount,
                                dateTime,
                                "",
                                "0",
                                "BTC",
                                "Secure Account",
                                "Secure Account",
                                ""
                            );
                            if ( resInsertDailyAccount && resInsertSecureCreateAcc ) {
                                await bitcoinClassState.setRegularClassState( regularAccount );
                                await bitcoinClassState.setSecureClassState( secureAccount );
                                await bitcoinClassState.setS3ServiceClassState( sss );
                                await comFunDBRead.readTblWallet();
                                await comFunDBRead.readTblSSSDetails();
                                await comFunDBRead.readTblAccount();
                                this.setState( {
                                    flag_Loading: false,
                                    flag_DisableBtnNext: false,
                                    flag_NextBtnAnimation: false,
                                } );
                                setTimeout( () => {
                                    let data = {};
                                    data.walletName = walletName;
                                    this.props.click_Next( data );
                                    AsyncStorage.setItem(
                                        asyncStorageKeys.rootViewController,
                                        "TabbarBottom"
                                    );
                                }, 1000 );
                            }
                        }
                    } else {
                        alert.simpleOk( "Oops", resImportSecureAccount.err );
                    }
                }
            } else {
                alert.simpleOk( "Oops", resMnemonic.err );
            }
        } catch ( error ) {
            Alert.alert( error )
        }
    }


    renderError( id: any ) {
        const { inputs } = this.state;
        if ( inputs[ id ].errorLabel ) {
            return <Text style={ [ validationService.styles.error, { marginBottom: 5 } ] }>{ inputs[ id ].errorLabel }</Text>;
        }
        return null;
    }

    render() {
        //flag 
        let { flag_Loading, flag_NextBtnAnimation } = this.state;
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
                                    hitSlop={ { top: 5, bottom: 8, left: 10, right: 15 } }
                                    onPress={ () => this.props.pop() }
                                >
                                    <SvgIcon name="icon_back" size={ 25 } color="gray" />
                                </Button>
                                <Text style={ [ FontFamily.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }>Restore wallet using Trusted Contacts</Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                                <Text style={ { textAlign: "center" } }>Select the question and specify the answer as you did at the time of setting up the wallet</Text>
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
                                                    <Title style={ [ FontFamily.ffFiraSansMedium, { color: "#000" } ] }>Select Question</Title>
                                                </Body>
                                                <Right />
                                            </Header> }
                                        mode="dropdown"
                                        style={ [ FontFamily.ffFiraSansMedium, ] }
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
                                        autoCapitalize='none'
                                        autoCorrect={ false }
                                        autoFocus={ true }
                                        placeholder='Write your answer here'
                                        style={ [ FontFamily.ffFiraSansMedium ] }
                                        placeholderTextColor="#B7B7B7"
                                        onChangeText={ ( value ) => {
                                            this.setState( {
                                                firstAnswer: value
                                            } )
                                            this.onInputChange( { id: "answer", value } );
                                        } }
                                        onKeyPress={ () =>
                                            this.check_CorrectAnswer()
                                        }
                                    />
                                </Item>
                                { this.renderError( "answer" ) }
                            </View>
                            <View style={ { flex: 1, justifyContent: "flex-end" } }>
                                <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center", fontSize: 12 } ] }>In case the answer does not match with the original answer, restoration process will fail</Text>
                                <FullLinearGradientLoadingButton
                                    click_Done={ () => {
                                        this.click_Next()
                                    }
                                    }
                                    title=" Next"
                                    disabled={ flag_DisableBtnNext }
                                    animating={ flag_NextBtnAnimation }
                                    style={ [ flag_DisableBtnNext == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                />
                            </View>
                            <ModelLoader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
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