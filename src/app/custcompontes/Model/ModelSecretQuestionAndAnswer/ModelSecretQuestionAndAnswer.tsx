import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Dimensions, Platform, Image, NativeModules } from 'react-native';
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
import QRCode from 'react-native-qrcode-svg';


import PDFLib, { PDFDocument, PDFPage } from 'react-native-pdf-lib';
var RNFS = require( 'react-native-fs' );

//Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

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

//TODO: Common Funciton
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Custome Object
import {
    images,
    colors,
    localDB
} from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );

let wrongEnterAnswerCount = 0;

//Bitcoin Class
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );

export default class ModelSecretQuestionAndAnswer extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_QuestionList: [],
            arr_SelectedList: [],
            firstQuestion: "",
            firstAnswer: "",
            secoundAnswer: "",
            qrcodeImageString1: "hexa",
            qrcodeImageString2: "hexa",
            qrcodeImageString3: "hexa",
            qrcodeImageString4: "hexa",
            qrcodeImageString5: "hexa",
            qrcodeImageString6: "hexa",
            qrcodeImageString7: "hexa",
            qrcodeImageString8: "hexa",
            qrcodeImageString9: "hexa",
            qrcodeImageString10: "hexa",
            base64string1: "",
            base64string2: "",
            base64string3: "",
            base64string4: "",
            base64string5: "",
            base64string6: "",
            base64string7: "",
            base64string8: "",
            base64string9: "",
            base64string10: "",
            flag_QrcodeDisaply: false,
            arr_QrCodeBase64String: [],
            answerBorderColor: "#808080",
            flag_DisableBtnNext: true,
            flag_Loading: false
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
            if ( secoundAns.length >= 3 && firstAns.length >= 3 ) {
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
        this.setState( {
            flag_Loading: true
        } )
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

                console.log( { autoHealthShares } );
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

                                                        // let resUpdateWalletAns = await dbOpration.updateWalletAnswerDetails(
                                                        //     localDB.tableName.tblWallet,
                                                        //     queTemp
                                                        // );
                                                        // console.log( { resUpdateWalletAns } );

                                                        // if ( resUpdateWalletAns ) {
                                                        //     await bitcoinClassState.setS3ServiceClassState( sss );
                                                        //     await comFunDBRead.readTblSSSDetails();
                                                        //     await comFunDBRead.readTblWallet();
                                                        //     this.setState( {
                                                        //         flag_Loading: false
                                                        //     } );
                                                        //     this.props.click_Next();
                                                        // }
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


    base64string1 = ( base64string1: any ) => {
        this.setState( {
            base64string1
        } );
    }
    base64string2 = ( base64string2: any ) => {
        this.setState( {
            base64string2
        } );
    }
    base64string3 = ( base64string3: any ) => {
        this.setState( {
            base64string3
        } );
    }
    base64string4 = ( base64string4: any ) => {
        this.setState( {
            base64string4
        } );
    }
    base64string5 = ( base64string5: any ) => {
        this.setState( {
            base64string5
        } );
    }
    base64string6 = ( base64string6: any ) => {
        this.setState( {
            base64string6
        } );
    }
    base64string7 = ( base64string7: any ) => {
        this.setState( {
            base64string7
        } );
    }
    base64string8 = ( base64string8: any ) => {
        this.setState( {
            base64string8
        } );
    }
    base64string9 = ( base64string9: any ) => {
        this.setState( {
            base64string9
        } );
    }
    base64string10 = ( base64string10: any ) => {
        this.setState( {
            base64string10
        } );
    }

    //qrstring modify
    getCorrectFormatStirng( share1: string ) {
        share1 = share1.split( '"' ).join( "Doublequote" );
        share1 = share1.split( '{' ).join( "Leftbrace" );
        share1 = share1.split( '}' ).join( "Rightbrace" );
        share1 = share1.split( '/' ).join( "Slash" );
        share1 = share1.split( ',' ).join( "Comma" );
        share1 = share1.split( ' ' ).join( "Space" );
        return share1;
    }

    //For 4th Share
    generate4thShare = async ( data: any ) => {
        return new Promise( async ( resolve, reject ) => {
            data = data[ 0 ];
            let arrQRCodeData = data.arrQRCodeData;
            let secondaryXpub = data.secondaryXpub;
            let qrData = data.qrData;
            let secret = data.secret;
            let secondaryMnemonic = data.secondaryMnemonic;
            let bhXpub = data.bhXpub;
            let { arr_QrCodeBase64String } = this.state;

            //set state value for qrcode
            this.setState( {
                qrcodeImageString1: this.getCorrectFormatStirng( arrQRCodeData[ 0 ] ),
                qrcodeImageString2: this.getCorrectFormatStirng( arrQRCodeData[ 1 ] ),
                qrcodeImageString3: this.getCorrectFormatStirng( arrQRCodeData[ 2 ] ),
                qrcodeImageString4: this.getCorrectFormatStirng( arrQRCodeData[ 3 ] ),
                qrcodeImageString5: this.getCorrectFormatStirng( arrQRCodeData[ 4 ] ),
                qrcodeImageString6: this.getCorrectFormatStirng( arrQRCodeData[ 5 ] ),
                qrcodeImageString7: this.getCorrectFormatStirng( arrQRCodeData[ 6 ] ),
                qrcodeImageString8: this.getCorrectFormatStirng( arrQRCodeData[ 7 ] ),
                qrcodeImageString9: secondaryXpub,
                qrcodeImageString10: qrData,
            } );
            this.svg1.toDataURL( this.base64string1 );
            this.svg2.toDataURL( this.base64string2 );
            this.svg3.toDataURL( this.base64string3 );
            this.svg4.toDataURL( this.base64string4 );
            this.svg5.toDataURL( this.base64string5 );
            this.svg6.toDataURL( this.base64string6 );
            this.svg7.toDataURL( this.base64string7 );
            this.svg8.toDataURL( this.base64string8 );
            this.svg9.toDataURL( this.base64string9 );
            this.svg10.toDataURL( this.base64string10 );

            setTimeout( async () => {
                let res4thShare1Create = await this.generateSahreQRCode( this.state.base64string1, "qrcode4thSahre1.png" );
                // console.log( { res4thShare1Create } );   
                let res4thShare2Create = await this.generateSahreQRCode( this.state.base64string2, "qrcode4thSahre2.png" );
                //    console.log( { res4thShare2Create } );
                let res4thShare3Create = await this.generateSahreQRCode( this.state.base64string3, "qrcode4thSahre3.png" );
                //  console.log( { res4thShare3Create } );
                let res4thShare4Create = await this.generateSahreQRCode( this.state.base64string4, "qrcode4thSahre4.png" );
                //console.log( { res4thShare4Create } );
                let res4thShare5Create = await this.generateSahreQRCode( this.state.base64string5, "qrcode4thSahre5.png" );
                //console.log( { res4thShare5Create } );
                let res4thShare6Create = await this.generateSahreQRCode( this.state.base64string6, "qrcode4thSahre6.png" );
                //console.log( { res4thShare6Create } );
                let res4thShare7Create = await this.generateSahreQRCode( this.state.base64string7, "qrcode4thSahre7.png" );
                //console.log( { res4thShare7Create } );   
                let res4thShare8Create = await this.generateSahreQRCode( this.state.base64string8, "qrcode4thSahre8.png" );
                //console.log( { res4thShare8Create } );
                let resSecoundXpub4Share = await this.generateXpubAnd2FAQRCode( this.state.base64string9, "secoundryXpub4Share.png" );
                // console.log( { resSecoundXpub4Share } );  
                let res2FASecret4Share = await this.generateXpubAnd2FAQRCode( this.state.base64string10, "googleAuto2FASecret4Share.png" );
                // console.log( { res2FASecret4Share } );
                var create4thPdf;
                if ( Platform.OS == "android" ) {
                    create4thPdf = await this.genreatePdf( data, "/storage/emulated/0/qrcode4thSahre1.png", "/storage/emulated/0/qrcode4thSahre2.png", "/storage/emulated/0/qrcode4thSahre3.png", "/storage/emulated/0/qrcode4thSahre4.png", "/storage/emulated/0/qrcode4thSahre5.png", "/storage/emulated/0/qrcode4thSahre6.png", "/storage/emulated/0/qrcode4thSahre7.png", "/storage/emulated/0/qrcode4thSahre8.png", "/storage/emulated/0/secoundryXpub4Share.png", "/storage/emulated/0/googleAuto2FASecret4Share.png", "SecretSharing4Share.pdf", "For 4th Shares" );
                } else {
                    create4thPdf = await this.genreatePdf( data, res4thShare1Create, res4thShare2Create, res4thShare3Create, res4thShare4Create, res4thShare5Create, res4thShare6Create, res4thShare7Create, res4thShare8Create, resSecoundXpub4Share, res2FASecret4Share, "SecretSharing4Share.pdf", "For 4th Shares" );
                }
                resolve( create4thPdf );
            }, 2000 );

        } );
    }


    //for 5th share
    generate5thShare = async ( data: any ) => {
        return new Promise( async ( resolve, reject ) => {
            data = data[ 0 ];
            let arrQRCodeData = data.arrQRCodeData;
            let secondaryXpub = data.secondaryXpub;
            let qrData = data.qrData;
            let secret = data.secret;
            let secondaryMnemonic = data.secondaryMnemonic;
            let bhXpub = data.bhXpub;

            //set state value for qrcode
            this.setState( {
                qrcodeImageString1: this.getCorrectFormatStirng( arrQRCodeData[ 0 ] ),
                qrcodeImageString2: this.getCorrectFormatStirng( arrQRCodeData[ 1 ] ),
                qrcodeImageString3: this.getCorrectFormatStirng( arrQRCodeData[ 2 ] ),
                qrcodeImageString4: this.getCorrectFormatStirng( arrQRCodeData[ 3 ] ),
                qrcodeImageString5: this.getCorrectFormatStirng( arrQRCodeData[ 4 ] ),
                qrcodeImageString6: this.getCorrectFormatStirng( arrQRCodeData[ 5 ] ),
                qrcodeImageString7: this.getCorrectFormatStirng( arrQRCodeData[ 6 ] ),
                qrcodeImageString8: this.getCorrectFormatStirng( arrQRCodeData[ 7 ] ),
                qrcodeImageString9: secondaryXpub,
                qrcodeImageString10: qrData,
            } );
            this.svg1.toDataURL( this.base64string1 );
            this.svg2.toDataURL( this.base64string2 );
            this.svg3.toDataURL( this.base64string3 );
            this.svg4.toDataURL( this.base64string4 );
            this.svg5.toDataURL( this.base64string5 );
            this.svg6.toDataURL( this.base64string6 );
            this.svg7.toDataURL( this.base64string7 );
            this.svg8.toDataURL( this.base64string8 );
            this.svg9.toDataURL( this.base64string9 );
            this.svg10.toDataURL( this.base64string10 );
            setTimeout( async () => {
                let res5thShare1Create = await this.generateSahreQRCode( this.state.base64string1, "qrcode5thSahre1.png" );
                //console.log( { res5thShare1Create } );
                let res5thShare2Create = await this.generateSahreQRCode( this.state.base64string2, "qrcode5thSahre2.png" );
                //    console.log( { res4thShare2Create } );
                let res5thShare3Create = await this.generateSahreQRCode( this.state.base64string3, "qrcode5thSahre3.png" );
                //  console.log( { res4thShare3Create } );
                let res5thShare4Create = await this.generateSahreQRCode( this.state.base64string4, "qrcode5thSahre4.png" );
                //console.log( { res4thShare4Create } );
                let res5thShare5Create = await this.generateSahreQRCode( this.state.base64string5, "qrcode5thSahre5.png" );
                //console.log( { res4thShare5Create } );
                let res5thShare6Create = await this.generateSahreQRCode( this.state.base64string6, "qrcode5thSahre6.png" );
                //console.log( { res5thShare6Create } );
                let res5thShare7Create = await this.generateSahreQRCode( this.state.base64string7, "qrcode5thSahre7.png" );
                //console.log( { res5thShare7Create } );
                let res5thShare8Create = await this.generateSahreQRCode( this.state.base64string8, "qrcode5thSahre8.png" );
                //console.log( { res5thShare8Create } );   
                let resSecoundXpub5Share = await this.generateXpubAnd2FAQRCode( this.state.base64string9, "secoundryXpub5Share.png" );
                // console.log( { resSecoundXpub4Share } );
                let res2FASecret5Share = await this.generateXpubAnd2FAQRCode( this.state.base64string10, "googleAuto2FASecret5Share.png" );
                // console.log( { res2FASecret4Share } );
                var create5thPdf;
                if ( Platform.OS == "android" ) {
                    create5thPdf = await this.genreatePdf( data, "/storage/emulated/0/qrcode5thSahre1.png", "/storage/emulated/0/qrcode5thSahre2.png", "/storage/emulated/0/qrcode5thSahre3.png", "/storage/emulated/0/qrcode5thSahre4.png", "/storage/emulated/0/qrcode5thSahre5.png", "/storage/emulated/0/qrcode5thSahre6.png", "/storage/emulated/0/qrcode5thSahre7.png", "/storage/emulated/0/qrcode5thSahre8.png", "/storage/emulated/0/secoundryXpub5Share.png", "/storage/emulated/0/googleAuto2FASecret5Share.png", "SecretSharing5Share.pdf", "For 5th Shares" );
                } else {
                    create5thPdf = await this.genreatePdf( data, res5thShare1Create, res5thShare2Create, res5thShare3Create, res5thShare4Create, res5thShare5Create, res5thShare6Create, res5thShare7Create, res5thShare8Create, resSecoundXpub5Share, res2FASecret5Share, "SecretSharing5Share.pdf", "For 5th Shares" );
                }

                resolve( create5thPdf );
            }, 1000 );
        } );
    }

    generateSahreQRCode = async ( share1: any, fileName: string ) => {
        return new Promise( async ( resolve, reject ) => {
            console.log( { share1, fileName } );
            var docsDir;
            if ( Platform.OS == "android" ) {
                docsDir = await RNFS.ExternalStorageDirectoryPath //RNFS.DocumentDirectoryPath;
            } else {
                docsDir = await PDFLib.getDocumentsDirectory();
            }
            docsDir = Platform.OS === 'android' ? `file://${ docsDir }` : docsDir;
            console.log( { docsDir } );
            var path = `${ docsDir }/${ fileName }`;
            RNFS.writeFile( path, share1, "base64" )
                .then( ( success: any ) => {
                    console.log( { path } );
                    resolve( path );
                } )
                .catch( ( err: any ) => {
                    alert.simpleOk( "Oops", err );
                } )
        } );
    }

    generateXpubAnd2FAQRCode = async ( share1: string, fileName: string ) => {
        return new Promise( async ( resolve, reject ) => {
            console.log( { xpuband2fa: share1, fileName } );
            var docsDir;
            if ( Platform.OS == "android" ) {
                docsDir = await RNFS.ExternalStorageDirectoryPath //RNFS.DocumentDirectoryPath;
            } else {
                docsDir = await PDFLib.getDocumentsDirectory();
            }
            docsDir = Platform.OS === 'android' ? `file://${ docsDir }` : docsDir;
            var path = `${ docsDir }/${ fileName }`;
            RNFS.writeFile( path, share1, "base64" )
                .then( ( success: any ) => {
                    console.log( { path } );
                    resolve( path );
                } )
                .catch( ( err: any ) => {
                    alert.simpleOk( "Oops", err );
                } )
        } );
    }

    chunkArray( arr: any, n: any ) {
        var chunkLength = Math.max( arr.length / n, 1 );
        var chunks = [];
        for ( var i = 0; i < n; i++ ) {
            if ( chunkLength * ( i + 1 ) <= arr.length ) chunks.push( arr.slice( chunkLength * i, chunkLength * ( i + 1 ) ) );
        }
        return chunks;
    }

    genreatePdf = async ( data: any, pathShare1: string, pathShare2: string, pathShare3: string, pathShare4: string, pathShare5: string, pathShare6: string, pathShare7: string, pathShare8: string, pathSecoundXpub: string, path2FASecret: string, pdfFileName: string, forShare: string ) => {
        return new Promise( async ( resolve, reject ) => {

            console.log( { data, pathShare1, pathShare8, pdfFileName, forShare } );


            let arrQRCodeData = data.arrQRCodeData;
            let secret2FA = data.secret;
            let secondaryMnemonic = data.secondaryMnemonic;
            let bhXpub = data.bhXpub;

            //Share 1 
            // let arrShare1 = .split();   
            // console.log( { arrShare1 } );       
            let arrShare1 = this.chunkArray( arrQRCodeData[ 0 ], 7 );
            let arrShare2 = this.chunkArray( arrQRCodeData[ 1 ], 7 );
            let arrShare3 = this.chunkArray( arrQRCodeData[ 2 ], 7 );
            let arrShare4 = this.chunkArray( arrQRCodeData[ 3 ], 7 );
            let arrShare5 = this.chunkArray( arrQRCodeData[ 4 ], 7 );
            let arrShare6 = this.chunkArray( arrQRCodeData[ 5 ], 7 );
            let arrShare7 = this.chunkArray( arrQRCodeData[ 6 ], 7 );
            let arrShare8 = this.chunkArray( arrQRCodeData[ 7 ], 7 );


            //Secound Mnemonic
            let arrSecondaryMnemonic = secondaryMnemonic.split( ' ' );
            var firstArrSecondaryMnemonic, secoundArrSecondaryMnemonic, threeSecondaryMnemonic;
            let arrSepArray = this.chunkArray( arrSecondaryMnemonic, 3 );
            firstArrSecondaryMnemonic = arrSepArray[ 0 ].toString();
            firstArrSecondaryMnemonic = firstArrSecondaryMnemonic.split( ',' ).join( ' ' );
            secoundArrSecondaryMnemonic = arrSepArray[ 1 ].toString();
            secoundArrSecondaryMnemonic = secoundArrSecondaryMnemonic.split( ',' ).join( ' ' );
            threeSecondaryMnemonic = arrSepArray[ 2 ].toString();
            threeSecondaryMnemonic = threeSecondaryMnemonic.split( ',' ).join( ' ' );

            //bhXpub
            // console.log( { bhXpub } );
            var firstArrbhXpub, secoundArrbhXpub, threebhXpub;
            let arrSepArraybhXpub = bhXpub.match( /.{1,40}/g );
            // console.log( arrSepArraybhXpub );
            firstArrbhXpub = arrSepArraybhXpub[ 0 ].toString();
            firstArrbhXpub = firstArrbhXpub.split( ',' ).join( ' ' );
            secoundArrbhXpub = arrSepArraybhXpub[ 1 ].toString();
            secoundArrbhXpub = secoundArrbhXpub.split( ',' ).join( ' ' );
            threebhXpub = arrSepArraybhXpub[ 2 ].toString();
            threebhXpub = threebhXpub.split( ',' ).join( ' ' );


            //console.log( { secondaryMnemonic, bhXpub } );
            var docsDir;
            if ( Platform.OS == "android" ) {
                docsDir = await RNFS.ExternalStorageDirectoryPath;
            } else {
                docsDir = await PDFLib.getDocumentsDirectory();
            }
            const pdfPath = `${ docsDir }/${ pdfFileName }`;
            console.log( { pdfPath } );
            const page1 = PDFPage
                .create()
                .drawText( forShare, {
                    x: 5,
                    y: 480,
                    fontSize: 18
                } )
                .drawText( 'Share 1', {
                    x: 5,
                    y: 470,
                    fontSize: 10
                } )
                .drawImage(
                    pathShare1,
                    'png',
                    {
                        x: 40,
                        y: 310,
                        width: 180,
                        height: 160,
                        //source: 'assets'
                    }
                )
                .drawText( arrShare1[ 0 ].toString(), {
                    x: 10,
                    y: 300,
                    fontSize: 10
                } )
                .drawText( arrShare1[ 1 ].toString(), {
                    x: 10,
                    y: 290,
                    fontSize: 10
                } )
                .drawText( arrShare1[ 2 ].toString(), {
                    x: 10,
                    y: 280,
                    fontSize: 10
                } )
                .drawText( arrShare1[ 3 ].toString(), {
                    x: 10,
                    y: 270,
                    fontSize: 10
                } )
                .drawText( arrShare1[ 4 ].toString(), {
                    x: 10,
                    y: 260,
                    fontSize: 10
                } )
                .drawText( arrShare1[ 5 ].toString(), {
                    x: 10,
                    y: 250,
                    fontSize: 10
                } )
                .drawText( arrShare1[ 6 ].toString(), {
                    x: 10,
                    y: 240,
                    fontSize: 10
                } )
                .drawText( 'Share 2', {
                    x: 5,
                    y: 230,
                    fontSize: 10
                } )
                .drawImage(
                    pathShare2,
                    'png',
                    {
                        x: 40,
                        y: 70,
                        width: 180,
                        height: 160,
                        // source: 'assets'
                    }
                )
                .drawText( arrShare2[ 0 ].toString(), {
                    x: 10,
                    y: 60,
                    fontSize: 10
                } )
                .drawText( arrShare2[ 1 ].toString(), {
                    x: 10,
                    y: 50,
                    fontSize: 10
                } )
                .drawText( arrShare2[ 2 ].toString(), {
                    x: 10,
                    y: 40,
                    fontSize: 10
                } )
                .drawText( arrShare2[ 3 ].toString(), {
                    x: 10,
                    y: 30,
                    fontSize: 10
                } )
                .drawText( arrShare2[ 4 ].toString(), {
                    x: 10,
                    y: 20,
                    fontSize: 10
                } )
                .drawText( arrShare2[ 5 ].toString(), {
                    x: 10,
                    y: 10,
                    fontSize: 10
                } )
                .drawText( arrShare2[ 6 ].toString(), {
                    x: 10,
                    y: 1,
                    fontSize: 10
                } )


            const page2 = PDFPage
                .create()
                .drawText( 'Share 3', {
                    x: 5,
                    y: 470,
                    fontSize: 10
                } )
                .drawImage(
                    pathShare3,
                    'png',
                    {
                        x: 40,
                        y: 310,
                        width: 180,
                        height: 160,
                        //source: 'assets'
                    }
                )
                .drawText( arrShare3[ 0 ].toString(), {
                    x: 10,
                    y: 300,
                    fontSize: 10
                } )
                .drawText( arrShare3[ 1 ].toString(), {
                    x: 10,
                    y: 290,
                    fontSize: 10
                } )
                .drawText( arrShare3[ 2 ].toString(), {
                    x: 10,
                    y: 280,
                    fontSize: 10
                } )
                .drawText( arrShare3[ 3 ].toString(), {
                    x: 10,
                    y: 270,
                    fontSize: 10
                } )
                .drawText( arrShare3[ 4 ].toString(), {
                    x: 10,
                    y: 260,
                    fontSize: 10
                } )
                .drawText( arrShare3[ 5 ].toString(), {
                    x: 10,
                    y: 250,
                    fontSize: 10
                } )
                .drawText( arrShare3[ 6 ].toString(), {
                    x: 10,
                    y: 240,
                    fontSize: 10
                } )
                .drawText( 'Share 4', {
                    x: 5,
                    y: 230,
                    fontSize: 10
                } )
                .drawImage(
                    pathShare4,
                    'png',
                    {
                        x: 40,
                        y: 70,
                        width: 180,
                        height: 160,
                        // source: 'assets'
                    }
                )
                .drawText( arrShare4[ 0 ].toString(), {
                    x: 10,
                    y: 60,
                    fontSize: 10
                } )
                .drawText( arrShare4[ 1 ].toString(), {
                    x: 10,
                    y: 50,
                    fontSize: 10
                } )
                .drawText( arrShare4[ 2 ].toString(), {
                    x: 10,
                    y: 40,
                    fontSize: 10
                } )
                .drawText( arrShare4[ 3 ].toString(), {
                    x: 10,
                    y: 30,
                    fontSize: 10
                } )
                .drawText( arrShare4[ 4 ].toString(), {
                    x: 10,
                    y: 20,
                    fontSize: 10
                } )
                .drawText( arrShare4[ 5 ].toString(), {
                    x: 10,
                    y: 10,
                    fontSize: 10
                } )
                .drawText( arrShare4[ 6 ].toString(), {
                    x: 10,
                    y: 1,
                    fontSize: 10
                } )

            const page3 = PDFPage
                .create()
                .drawText( 'Share 5', {
                    x: 5,
                    y: 470,
                    fontSize: 10
                } )
                .drawImage(
                    pathShare5,
                    'png',
                    {
                        x: 40,
                        y: 310,
                        width: 180,
                        height: 160,
                        //source: 'assets'
                    }
                )
                .drawText( arrShare5[ 0 ].toString(), {
                    x: 10,
                    y: 300,
                    fontSize: 10
                } )
                .drawText( arrShare5[ 1 ].toString(), {
                    x: 10,
                    y: 290,
                    fontSize: 10
                } )
                .drawText( arrShare5[ 2 ].toString(), {
                    x: 10,
                    y: 280,
                    fontSize: 10
                } )
                .drawText( arrShare5[ 3 ].toString(), {
                    x: 10,
                    y: 270,
                    fontSize: 10
                } )
                .drawText( arrShare5[ 4 ].toString(), {
                    x: 10,
                    y: 260,
                    fontSize: 10
                } )
                .drawText( arrShare5[ 5 ].toString(), {
                    x: 10,
                    y: 250,
                    fontSize: 10
                } )
                .drawText( arrShare5[ 6 ].toString(), {
                    x: 10,
                    y: 240,
                    fontSize: 10
                } )
                .drawText( 'Share 6', {
                    x: 5,
                    y: 230,
                    fontSize: 10
                } )
                .drawImage(
                    pathShare6,
                    'png',
                    {
                        x: 40,
                        y: 70,
                        width: 180,
                        height: 160,
                        // source: 'assets'
                    }
                )
                .drawText( arrShare6[ 0 ].toString(), {
                    x: 10,
                    y: 60,
                    fontSize: 10
                } )
                .drawText( arrShare6[ 1 ].toString(), {
                    x: 10,
                    y: 50,
                    fontSize: 10
                } )
                .drawText( arrShare6[ 2 ].toString(), {
                    x: 10,
                    y: 40,
                    fontSize: 10
                } )
                .drawText( arrShare6[ 3 ].toString(), {
                    x: 10,
                    y: 30,
                    fontSize: 10
                } )
                .drawText( arrShare6[ 4 ].toString(), {
                    x: 10,
                    y: 20,
                    fontSize: 10
                } )
                .drawText( arrShare6[ 5 ].toString(), {
                    x: 10,
                    y: 10,
                    fontSize: 10
                } )
                .drawText( arrShare6[ 6 ].toString(), {
                    x: 10,
                    y: 1,
                    fontSize: 10
                } )
            const page4 = PDFPage
                .create()
                .drawText( 'Share 7', {
                    x: 5,
                    y: 470,
                    fontSize: 10
                } )
                .drawImage(
                    pathShare7,
                    'png',
                    {
                        x: 40,
                        y: 310,
                        width: 180,
                        height: 160,
                        //source: 'assets'
                    }
                )
                .drawText( arrShare7[ 0 ].toString(), {
                    x: 10,
                    y: 300,
                    fontSize: 10
                } )
                .drawText( arrShare7[ 1 ].toString(), {
                    x: 10,
                    y: 290,
                    fontSize: 10
                } )
                .drawText( arrShare7[ 2 ].toString(), {
                    x: 10,
                    y: 280,
                    fontSize: 10
                } )
                .drawText( arrShare7[ 3 ].toString(), {
                    x: 10,
                    y: 270,
                    fontSize: 10
                } )
                .drawText( arrShare7[ 4 ].toString(), {
                    x: 10,
                    y: 260,
                    fontSize: 10
                } )
                .drawText( arrShare7[ 5 ].toString(), {
                    x: 10,
                    y: 250,
                    fontSize: 10
                } )
                .drawText( arrShare7[ 6 ].toString(), {
                    x: 10,
                    y: 240,
                    fontSize: 10
                } )
                .drawText( 'Share 8', {
                    x: 5,
                    y: 230,
                    fontSize: 10
                } )
                .drawImage(
                    pathShare8,
                    'png',
                    {
                        x: 40,
                        y: 70,
                        width: 180,
                        height: 160,
                        // source: 'assets'
                    }
                )
                .drawText( arrShare8[ 0 ].toString(), {
                    x: 10,
                    y: 60,
                    fontSize: 10
                } )
                .drawText( arrShare8[ 1 ].toString(), {
                    x: 10,
                    y: 50,
                    fontSize: 10
                } )
                .drawText( arrShare8[ 2 ].toString(), {
                    x: 10,
                    y: 40,
                    fontSize: 10
                } )
                .drawText( arrShare8[ 3 ].toString(), {
                    x: 10,
                    y: 30,
                    fontSize: 10
                } )
                .drawText( arrShare8[ 4 ].toString(), {
                    x: 10,
                    y: 20,
                    fontSize: 10
                } )
                .drawText( arrShare8[ 5 ].toString(), {
                    x: 10,
                    y: 10,
                    fontSize: 10
                } )
                .drawText( arrShare8[ 6 ].toString(), {
                    x: 10,
                    y: 1,
                    fontSize: 10
                } )
            const page5 = PDFPage
                .create()
                .drawText( 'Secondary Xpub (Encrypted):', {
                    x: 5,
                    y: 480,
                    fontSize: 18
                } )
                .drawImage(
                    pathSecoundXpub,
                    'png',
                    {
                        x: 25,
                        y: 270,
                        width: 200,
                        height: 200,
                        //source: 'assets'
                    }
                )
                .drawText( 'Scan the above QR Code using your HEXA', {
                    x: 30,
                    y: 250,
                    fontSize: 10
                } )
                .drawText( 'wallet in order to restore your Secure Account.', {
                    x: 30,
                    y: 240,
                    fontSize: 10
                } )

            const page6 = PDFPage
                .create()
                .drawText( '2FA Secret:', {
                    x: 5,
                    y: 480,
                    fontSize: 18
                } )
                .drawImage(
                    path2FASecret,
                    'png',
                    {
                        x: 25,
                        y: 272,
                        width: 200,
                        height: 200,
                        // source: 'assets'
                    }
                )
                .drawText( secret2FA, {
                    x: 25,
                    y: 250,
                    fontSize: 10
                } )
                .drawText( 'Following assets can be used to recover your funds using', {
                    x: 5,
                    y: 230,
                    fontSize: 10
                } )
                .drawText( 'the open - sourced ga - recovery tool.', {
                    x: 5,
                    y: 220,
                    fontSize: 10
                } )
                .drawText( 'Secondary Mnemonic:', {
                    x: 5,
                    y: 190,
                    fontSize: 18
                } )
                .drawText( firstArrSecondaryMnemonic, {
                    x: 5,
                    y: 170,
                    fontSize: 10
                } )
                .drawText( secoundArrSecondaryMnemonic, {
                    x: 5,
                    y: 160,
                    fontSize: 10
                } )
                .drawText( threeSecondaryMnemonic, {
                    x: 5,
                    y: 150,
                    fontSize: 10
                } )
                .drawText( 'BitHyve Xpub:', {
                    x: 5,
                    y: 120,
                    fontSize: 18
                } )
                .drawText( firstArrbhXpub, {
                    x: 5,
                    y: 100,
                    fontSize: 10
                } )
                .drawText( secoundArrbhXpub, {
                    x: 5,
                    y: 90,
                    fontSize: 10
                } )
                .drawText( threebhXpub, {
                    x: 5,
                    y: 80,
                    fontSize: 10
                } )
            PDFDocument
                .create( pdfPath )
                .addPages( page1, page2, page3, page4, page5, page6 )
                .write()
                .then( async ( path: any ) => {
                    console.log( 'PDF created at: ' + path );
                    let pdffilePassword = this.state.secoundAnswer;
                    if ( Platform.OS == "ios" ) {
                        var PdfPassword = NativeModules.PdfPassword;
                        PdfPassword.addEvent( "/" + pdfFileName, pdffilePassword );
                    } else {
                        this.setPdfAndroidPasswrod( pdfFileName, pdffilePassword );
                    }
                    resolve( path );
                } );
        } );
    }

    // async function to call the Java native method
    async setPdfAndroidPasswrod( pdfPath: string, pdffilePassword: string ) {
        var PdfPassword = NativeModules.PdfPassword;
        module.exports = NativeModules.PdfPassword;
        console.log( { PdfPassword } );
        console.log( { pdfPath, pdffilePassword } );
        PdfPassword.setPdfPasswrod( pdfPath, pdffilePassword, ( err ) => { console.log( err ) }, ( msg ) => { console.log( msg ) } );
    }


    render() {
        //array
        let { arr_QuestionList } = this.state;
        //values
        let { firstQuestion, firstAnswer, secoundAnswer, answerBorderColor } = this.state;
        //qrcode string values
        let { qrcodeImageString1, qrcodeImageString2, qrcodeImageString3, qrcodeImageString4, qrcodeImageString5, qrcodeImageString6, qrcodeImageString7, qrcodeImageString8, qrcodeImageString9, qrcodeImageString10 } = this.state;
        //flag
        let { flag_DisableBtnNext, flag_Loading, flag_QrcodeDisaply } = this.state;
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }></Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                                <Image source={ images.backupSecretQuestion.icon } style={ { width: 80, height: 80, marginTop: -30 } } />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20 } ] }>Security Question</Text>
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
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", fontSize: 12, marginBottom: 20 } ] }>This answer will be required in case you want to restore your wallet</Text>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.click_Next()
                                    }
                                    }
                                    title="Next"
                                    disabled={ flag_DisableBtnNext }
                                    style={ [ flag_DisableBtnNext == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                />
                                <View style={ { flexDirection: "row", marginLeft: 500, height: 10 } }>
                                    <QRCode
                                        value={ qrcodeImageString1 }
                                        getRef={ ( c ) => ( this.svg1 = c ) }
                                        size={ 200 }

                                    />
                                    <QRCode
                                        value={ qrcodeImageString2 }
                                        getRef={ ( c ) => ( this.svg2 = c ) }
                                        style={ { height: 0, width: 0 } }
                                        size={ 200 }

                                    />
                                    <QRCode
                                        value={ qrcodeImageString3 }
                                        getRef={ ( c ) => ( this.svg3 = c ) }
                                        size={ 200 }

                                    />
                                    <QRCode
                                        value={ qrcodeImageString4 }
                                        getRef={ ( c ) => ( this.svg4 = c ) }
                                        size={ 200 }

                                    />
                                    <QRCode
                                        value={ qrcodeImageString5 }
                                        getRef={ ( c ) => ( this.svg5 = c ) }
                                        size={ 200 }

                                    />
                                    <QRCode
                                        value={ qrcodeImageString6 }
                                        getRef={ ( c ) => ( this.svg6 = c ) }
                                        size={ 200 }

                                    />
                                    <QRCode
                                        value={ qrcodeImageString7 }
                                        getRef={ ( c ) => ( this.svg7 = c ) }
                                        size={ 200 }

                                    />
                                    <QRCode
                                        value={ qrcodeImageString8 }
                                        getRef={ ( c ) => ( this.svg8 = c ) }
                                        size={ 200 }

                                    />
                                    <QRCode
                                        value={ qrcodeImageString9 }
                                        getRef={ ( c ) => ( this.svg9 = c ) }
                                        size={ 200 }

                                    />
                                    <QRCode
                                        value={ qrcodeImageString10 }
                                        getRef={ ( c ) => ( this.svg10 = c ) }
                                        size={ 200 }

                                    />
                                </View>
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