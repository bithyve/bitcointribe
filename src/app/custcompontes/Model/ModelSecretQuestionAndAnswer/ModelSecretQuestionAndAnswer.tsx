import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Dimensions, Platform, Image } from 'react-native';
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


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome Model
import ModelPasscode from '../ModelCommom/ModelPasscode';

interface Props {
    data: [];
    closeModal: Function;
    click_Next: Function;
    pop: Function;
    click_Request: Function
}

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );

let wrongEnterAnswerCount = 0;



export default class ModelSecretQuestionAndAnswer extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_QuestionList: [],
            arr_SelectedList: [],
            firstQuestion: "",
            firstAnswer: "",
            secoundAnswer: "",
            answerBorderColor: "#808080",
            flag_DisableBtnNext: true
        } );
    }


    componentWillReceiveProps( nextProps: any ) {
        var data = nextProps.data;
        if ( data.length != 0 ) {
            data = data[ 0 ].data;
            console.log( { data } );
            this.setState( {
                arr_QuestionList: data.question,
                arr_SelectedList: data.seletedContactList,
                firstQuestion: data.question[ 0 ].item
            } );
        }
    }

    //TODO: Select Picker Question List change aciton
    onValueChange( value: string ) {
        this.setState( {
            firstQuestion: value
        } );
    }

    check_CorrectAnswer() {
        setTimeout( () => {
            let firstAns = this.state.firstAnswer;
            let secoundAns = this.state.secoundAnswer;
            if ( secoundAns.length >= 6 && firstAns.length >= 6 ) {
                if ( secoundAns != firstAns ) {
                    this.setState( {
                        flag_DisableBtnNext: true,
                        answerBorderColor: "#E64545",
                    } )
                } else {
                    this.setState( {
                        flag_DisableBtnNext: false,
                        answerBorderColor: "#808080",
                    } )
                }
            } else {
                this.setState( {
                    flag_DisableBtnNext: true
                } )
            }
        }, 100 );

    }

    //TODO: Next button on click
    click_Next = async () => {
        const dateTime = Date.now();
        let walletDetails = await utils.getWalletDetails();
        console.log( { walletDetails } );
        let { secoundAnswer, arr_SelectedList } = this.state;
        let secureAccount = await utils.getSecureAccountObject();
        var resSetupSecureAccount = await secureAccount.setupSecureAccount();
        console.log( { resSetupSecureAccount } );
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
        if ( resInsertSecureCreateAcc ) {
            const sss = await utils.getS3ServiceObject();
            console.log( { sss } );
            const generateShareRes = await sss.generateShares( secoundAnswer );
            console.log( { generateShareRes } );
            if ( generateShareRes.status == 200 ) {
                const { encryptedShares } = generateShareRes.data;
                const autoHealthShares = encryptedShares.slice( 0, 3 );
                const manualHealthShares = encryptedShares.slice( 3 );
                //console.log( { autoHealthShares, manualHealthShares } );
                const resInitializeHealthcheck = await sss.initializeHealthcheck( autoHealthShares );
                console.log( { resInitializeHealthcheck } );
                if ( resInitializeHealthcheck.status == 200 || 400 ) {
                    const shareIds = [];
                    console.log( { autoHealthShares } );
                    for ( const share of encryptedShares ) {
                        shareIds.push( sss.getShareId( share ) )
                    }
                    //console.log( { bhXpub, secondaryXpub } );
                    const socialStaticNonPMDD = { secondaryXpub, bhXpub: resSetupSecureAccount.setupData.bhXpub }
                    console.log( { socialStaticNonPMDD } );
                    var resEncryptSocialStaticNonPMDD = await sss.encryptStaticNonPMDD( socialStaticNonPMDD );
                    //console.log( { shareIds, resEncryptStaticNonPMDD } );
                    if ( resEncryptSocialStaticNonPMDD.status == 200 ) {
                        resEncryptSocialStaticNonPMDD = resEncryptSocialStaticNonPMDD.data.encryptedStaticNonPMDD;
                        const buddyStaticNonPMDD = { getSecoundMnemonic, twoFASecret: resSetupSecureAccount.setupData.secret, secondaryXpub, bhXpub: resSetupSecureAccount.setupData.bhXpub };
                        // console.log( { buddyStaticNonPMDD } );
                        let resEncryptBuddyStaticNonPMDD = await sss.encryptStaticNonPMDD( buddyStaticNonPMDD );
                        if ( resEncryptBuddyStaticNonPMDD.status == 200 ) {
                            resEncryptBuddyStaticNonPMDD = resEncryptBuddyStaticNonPMDD.data.encryptedStaticNonPMDD;
                            let rescreateMetaShare = await sss.createMetaShare( 1, encryptedShares[ 0 ], resEncryptSocialStaticNonPMDD, walletDetails.walletType );
                            console.log( { encpShare: encryptedShares[ 1 ], rescreateMetaShare } );
                            let rescreateMetaShare1 = await sss.createMetaShare( 2, encryptedShares[ 1 ], resEncryptSocialStaticNonPMDD, walletDetails.walletType );
                            console.log( { encpShare: encryptedShares[ 2 ], rescreateMetaShare1 } );
                            let rescreateMetaShare2 = await sss.createMetaShare( 3, encryptedShares[ 2 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
                            console.log( { rescreateMetaShare2 } );

                            //for pdf 
                            let rescreateMetaShare3 = await sss.createMetaShare( 4, encryptedShares[ 3 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
                            console.log( { rescreateMetaShare3 } );
                            if ( rescreateMetaShare3.status == 200 ) {
                                var qrcode4share = await sss.createQR( rescreateMetaShare3.data.metaShare, 4 );
                                if ( qrcode4share.status == 200 ) {
                                    qrcode4share = qrcode4share.data.qrData
                                    console.log( { qrcode4share } );
                                } else {
                                    alert.simpleOk( "Oops", qrcode4share.err );
                                }
                            } else {
                                alert.simpleOk( "Oops", rescreateMetaShare3.err );
                            }
                            let rescreateMetaShare4 = await sss.createMetaShare( 5, encryptedShares[ 4 ], resEncryptBuddyStaticNonPMDD, walletDetails.walletType );
                            console.log( { rescreateMetaShare4 } );
                            if ( rescreateMetaShare4.status == 200 ) {
                                var qrcode5share = await sss.createQR( rescreateMetaShare4.data.metaShare, 5 );
                                if ( qrcode5share.status == 200 ) {
                                    qrcode5share = qrcode5share.data.qrData
                                    console.log( { qrcode5share } );
                                } else {
                                    alert.simpleOk( "Oops", qrcode4share.err );
                                }
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

    render() {
        //array
        let { arr_QuestionList } = this.state;
        //values
        let { firstQuestion, firstAnswer, secoundAnswer, answerBorderColor } = this.state;
        //flag
        let { flag_DisableBtnNext } = this.state;
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
                    contentContainerStyle={ { flexGrow: 0.7 } }
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }></Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                                <Image source={ images.backupSecretQuestion.icon } style={ { width: 80, height: 80, marginTop: -30 } } />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20 } ] }>Security Questions</Text>
                                <Text note style={ { textAlign: "center" } }>Setup your question and answer.</Text>
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
                                        autoCapitalize='none'
                                        value={ firstAnswer }
                                        placeholder='Enter answer to the secret question'
                                        style={ [ globalStyle.ffFiraSansMedium, answerBorderColor == "#E64545" ? { borderColor: answerBorderColor, borderWidth: 1.5, marginTop: -1, borderRadius: 8 } : null ] }
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
                                        secureTextEntry
                                        keyboardType="default"
                                        autoCapitalize='none'
                                        value={ secoundAnswer }
                                        placeholder='Confirm answer to the secret question'
                                        style={ [ globalStyle.ffFiraSansMedium, answerBorderColor == "#E64545" ? { borderColor: answerBorderColor, borderWidth: 1.5, marginTop: -1, borderRadius: 8 } : null ] }
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
                                { renderIf( answerBorderColor == "#E64545" )(
                                    <Text style={ { color: "red", fontSize: 12, alignSelf: "flex-end", marginRight: 8 } }>Invalid Answer!</Text>
                                ) }
                            </View>
                            <View style={ { flex: 0.1, justifyContent: "flex-end" } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", fontSize: 12, marginBottom: 20 } ] }>These answers will be required in case you need to restore your wallet</Text>
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
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </Modal >
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