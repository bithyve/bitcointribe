import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
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
} from "native-base";
import { Icon } from 'react-native-elements'
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Permissions from 'react-native-permissions';
import { Avatar } from 'react-native-elements';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder'
import TimerCountdown from "react-native-timer-countdown";
var converter = require( 'number-to-words' );
var Mailer = require( 'NativeModules' ).RNMail;
import Modal from 'react-native-modalbox';
//import SimpleShare from "react-native-simple-share";
import Share, { ShareSheet } from 'react-native-share';
import { SocialIcon } from 'react-native-elements'



//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome model  
import ModelBackupYourWallet from "HexaWallet/src/app/custcompontes/Model/ModelBackupYourWallet/ModelBackupYourWallet";
import ModelFindYourTrustedContacts from "HexaWallet/src/app/custcompontes/Model/ModelFindYourTrustedContacts/ModelFindYourTrustedContacts";



//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB, expaire } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );


//TODO: Common Funciton
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );


export default class HealthOfTheAppScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_TrustedContacts: [ {
                thumbnailPath: "user",
                givenName: "Trusted Contact 1",
                familyName: "",
                statusMsgColor: "gray",
                statusMsg: "Not Shared",
                opt: undefined,
            }, {
                thumbnailPath: "user",
                givenName: "Trusted Contact 2",
                familyName: "",
                statusMsgColor: "gray",
                statusMsg: "Not Shared",
                opt: undefined,
            } ],
            arr_SelfShare: [ {
                thumbnailPath: "bars",
                givenName: "Secondary Device",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not Shared",
                type: "Self Share 1"
            }, {
                thumbnailPath: "bars",
                givenName: "Email",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not Shared",
                type: "Self Share 2"
            }, {
                thumbnailPath: "bars",
                givenName: "Cloud",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not Shared",
                type: "Self Share 3"
            } ],
            arr_SSSDetails: [],
            arr_Mnemonic: [],
            arr_MnemonicDetails: [],
            arr_SecretQuestion: [ {
                icon: "timelockNew",
                title: "Secret Question",
                subTitle: "Not Backed up",
                color: "#ff0000",
            } ],
            arr_QuestionAndAnswerDetails: [],
            arr_2FactorAuto: [],
            arr_SecureAccountDetials: [],
            arr_ModelBackupYourWallet: [],
            arr_ModelFindYourTrustedContacts: [],
            //flag
            flag_isTrustedContacts: true,
            flag_SelfShare: true,
            flag_SelfShareActionDisable: true,
            flag_isSetupTrustedContact: true,
            flag_isMnemonic: false,
            flag_isSecretQuestions: true,
            flag_isTwoFactor: false,
            flag_Loading: false,
            //TouchableOpacity Disable
            flag_DisableSecureTwoFactor: true,
            flag_DisableSecretQuestion: true
        } )
    }

    async componentWillMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {
                this.getCheackHealth();
            }
        );
    }


    componentWillUnmount() {
        this.willFocusSubscription.remove();
    }


    getTrustedContactArray( sssDetails: any, index: number ) {
        console.log( { gett: sssDetails[ index ] } );
        let dateTime = Date.now();
        let tempOpt = [];
        let keeperInfo = JSON.parse( sssDetails[ index ].keeperInfo );
        let data = {};
        data.decryptedShare = JSON.parse( sssDetails[ index ].decryptedShare );
        data.emailAddresses = keeperInfo.emailAddresses;
        data.phoneNumbers = keeperInfo.phoneNumbers;
        data.history = JSON.parse( sssDetails[ index ].history );
        data.recordID = keeperInfo.recordID;
        data.thumbnailPath = keeperInfo.thumbnailPath
        data.givenName = keeperInfo.givenName;
        data.familyName = keeperInfo.familyName;
        let sharedDate = parseInt( sssDetails[ index ].sharedDate );
        var startDate = new Date( dateTime );
        var endDate = new Date( sharedDate );
        var diff = Math.abs( startDate.getTime() - endDate.getTime() );
        const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
        const seconds: any = Math.floor( diff / 1000 % 60 );
        const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
        data.totalSec = expaire.expaire_otptime - totalSec;
        //for history get opt     
        for ( let i = 0; i < 2; i++ ) {
            let eachHistory = JSON.parse( sssDetails[ i ].history );
            let eachHistoryLength = eachHistory.length;
            var otp;
            if ( eachHistory[ eachHistoryLength - 1 ] != undefined ) {
                otp = eachHistory[ eachHistoryLength - 1 ].otp;
            } else {
                otp = undefined;
            }
            tempOpt.push( otp );
        }
        console.log( { tempOpt } );
        if ( totalSec < expaire.expaire_otptime && sssDetails[ index ].shareStage == "Ugly" ) {
            data.statusMsg = "Not Shared or expired";
            data.statusMsgColor = "#C07710";
            data.flag_timer = true;
            data.opt = tempOpt[ index ];
        } else if ( totalSec >= 540 && sssDetails[ index ].shareStage == "Ugly" ) {
            data.statusMsg = "OTP expired.";
            data.statusMsgColor = "#C07710";
            data.flag_timer = false;
        } else if ( sssDetails[ index ].shareStage == "Good" ) {
            data.statusMsg = "Share accessible";
            data.statusMsgColor = "#008000";
            data.flag_timer = false;
        } else if ( sssDetails[ index ].shareStage == "Bad" ) {
            data.statusMsg = "Share inaccessible";
            data.statusMsgColor = "#C07710";
            data.flag_timer = false;
        } else if ( sssDetails[ index ].shareStage == "Ugly" && sssDetails[ index ].sharedDate != "" ) {
            data.statusMsg = "Share inaccessible";
            data.statusMsgColor = "#ff0000";
            data.flag_timer = false;
        }
        else {
            data.statusMsg = "Not Shared or expired";
            data.statusMsgColor = "#ff0000";
            data.flag_timer = false;
        }
        return data;
    }

    getQuestionDetails( walletDetails: any, ) {
        var appHealthStatus = JSON.parse( walletDetails.appHealthStatus );
        let data = {};
        data.icon = "timelockNew";
        data.title = "Secret Question";
        data.subTitle = this.getQuestonHealth( appHealthStatus.qaStatus )[ 0 ];
        data.color = this.getQuestonHealth( appHealthStatus.qaStatus )[ 1 ];
        data.walletDetails = walletDetails;
        return [ data ];
    }



    loaddata = async () => {
        let flag_Loading = true;
        let dateTime = Date.now();
        let walletDetails = await utils.getWalletDetails();
        let setUpWalletAnswerDetails = walletDetails.setUpWalletAnswerDetails;
        let backupType;
        if ( utils.isJson( walletDetails.appHealthStatus ) ) {
            backupType = JSON.parse( walletDetails.appHealthStatus );
            backupType = backupType.backupType;
        } else {
            backupType = "share";
        }
        console.log( { backupType } );
        let sssDetails = await utils.getSSSDetails();

        //array  
        let { arr_TrustedContacts } = this.state;
        let arr_SecretQuestion = [];

        //Trusted Contacts
        if ( sssDetails[ 0 ].keeperInfo != "null" || sssDetails[ 1 ].keeperInfo != "null" && sssDetails.length > 0 ) {
            console.log( { sssDetails } );
            //Trusted Contact Share
            if ( sssDetails[ 0 ].keeperInfo != "null" ) {
                console.log( "frist" );
                arr_TrustedContacts[ 0 ] = this.getTrustedContactArray( sssDetails, 0 );
            }
            if ( sssDetails[ 1 ].keeperInfo != "null" ) {
                console.log( "secound" );
                arr_TrustedContacts[ 1 ] = this.getTrustedContactArray( sssDetails, 1 );
            }

            //Self Share     
            let arr_SelfShare = [];
            let arrTitle = [ "", "", "Secondary Device", "Email", "Cloud" ];
            for ( let i = 0; i < sssDetails.length; i++ ) {
                if ( i > 1 ) {
                    console.log( { data: sssDetails[ i ] } );
                    let sharedDate = sssDetails[ i ].sharedDate;
                    let acceptDate = sssDetails[ i ].acceptedDate;
                    let shareStage = sssDetails[ i ].shareStage;
                    console.log( { sharedDate, acceptDate, shareStage } );
                    let statusMsg = this.getMsgAndColor( sharedDate, acceptDate, shareStage )[ 0 ];
                    let statusColor = this.getMsgAndColor( sharedDate, acceptDate, shareStage )[ 1 ];
                    console.log( { statusMsg, statusColor } );
                    let data = {};
                    data.thumbnailPath = "bars";
                    data.givenName = arrTitle[ i ];
                    data.familyName = "";
                    data.statusMsgColor = statusColor;
                    data.statusMsg = statusMsg;
                    data.sssDetails = sssDetails[ i ];
                    data.type = sssDetails[ i ].type;
                    arr_SelfShare.push( data );
                }
            }
            //Secret Question
            arr_SecretQuestion = this.getQuestionDetails( walletDetails )

            console.log( { arr_SecretQuestion } );

            flag_Loading = false
            this.setState( {
                flag_Loading,
                flag_SelfShareActionDisable: false,
                arr_TrustedContacts,
                arr_SelfShare,
                arr_SSSDetails: sssDetails,
                arr_SecretQuestion
            } )
        } else {
            flag_Loading = false
            arr_SecretQuestion = this.getQuestionDetails( walletDetails )

            console.log( { notshare: arr_SecretQuestion } );
            this.setState( {
                flag_Loading,
                flag_SelfShareActionDisable: true,
                arr_SSSDetails: sssDetails,
                arr_SecretQuestion
            } );
        }
    }


    //self share message
    getMsgAndColor( sharedDate: string, acceptDate: string, shareStage: string ) {
        if ( sharedDate == "" && acceptDate == "" && shareStage != "Good" ) {
            return [ "Not Shared", "#ff0000" ];
        } else if ( sharedDate != "" && acceptDate == "" && shareStage != "Good" ) {
            return [ "Share", "#C07710" ];
        } else {
            return [ "Share Confirmed", "#008000" ];
        }
    }

    //secret quesiton message
    getQuestonHealth( share: string ) {
        if ( share == "Good" ) {
            return [ "Backed Confirm", "#008000" ];
        }
        else if ( share == "Bad" ) {
            return [ "Backed", "#C07710" ];
        } else {
            return [ "Not Backed up", "#ff0000" ];
        }
    }


    //TODO: func click_Item
    click_Item = ( item: any ) => {
        console.log( { item } );
        if ( item.givenName == "Trusted Contact 1" || item.givenName == "Trusted Contact 2" ) {
            this.setState( {
                arr_ModelFindYourTrustedContacts: [
                    {
                        modalVisible: true
                    }
                ]
            } );
        } else {
            this.props.navigation.push( "TrustedContactNavigator", {
                data: item, onSelect: this.getCheackHealth
            } );
        }
    }

    getCheackHealth = async () => {
        this.setState( {
            flag_Loading: true
        } );
        let walletDetails = await utils.getWalletDetails();
        let sssDetails = await utils.getSSSDetails();
        console.log( { walletDetails, sssDetails } );
        let share = {};
        share.trustedContShareId1 = sssDetails[ 0 ].shareId;
        share.trustedContShareId2 = sssDetails[ 1 ].shareId;
        share.selfshareShareId1 = sssDetails[ 2 ].shareId;

        share.selfshareShareDate2 = sssDetails[ 3 ].acceptedDate != "" ? sssDetails[ 3 ].acceptedDate : 0;
        share.selfshareShareShareId2 = sssDetails[ 3 ].shareId;

        share.selfshareShareDate3 = sssDetails[ 4 ].acceptedDate != "" ? sssDetails[ 4 ].acceptedDate : 0;
        share.selfshareShareId3 = sssDetails[ 4 ].shareId;

        share.qatime = parseInt( walletDetails.lastUpdated );
        let resCheckHealthAllShare = await comAppHealth.checkHealthAllShare( share );
        if ( resCheckHealthAllShare ) {
            this.loaddata();
        } else {
            this.setState( {
                flag_Loading: false
            } );
        }
    }

    //TODO: func click_FirstMenuItem
    click_SecretQuestion( item: any ) {
        let walletDetails = item.walletDetails;
        let data = JSON.parse( walletDetails.setUpWalletAnswerDetails );
        this.props.navigation.push( "BackupSecretQuestionsScreen", { data: data, walletDetails: walletDetails } );
    }

    //TODO: click_SetupTrustedContacts
    click_SetupTrustedContacts() {
        this.setState( {
            arr_ModelBackupYourWallet: [
                {
                    modalVisible: true
                }
            ]
        } )
    }


    //TODO: Setup Two Factor 
    click_TwoFactorSetup() {
        this.props.navigation.push( "BackupSecureTwoFactorAutoScreen", { data: this.state.arr_SecureAccountDetials } );
    }

    //Mnemonic click
    click_MnemoicItem() {
        this.props.navigation.push( "HealthCheckMnemonicScreen", { data: this.state.arr_MnemonicDetails } );
    }

    onSelect = async ( returnValue: any ) => {
        let walletDetails = await utils.getWalletDetails();
        let sssDetails = await utils.getSSSDetails();
        console.log( { walletDetails, sssDetails } );
        let share = {};
        share.trustedContShareId1 = sssDetails[ 0 ].shareId;
        share.trustedContShareId2 = sssDetails[ 1 ].shareId;
        share.selfshareShareId1 = sssDetails[ 2 ].shareId;

        share.selfshareShareDate2 = sssDetails[ 3 ].acceptedDate != "" ? sssDetails[ 3 ].acceptedDate : 0;
        share.selfshareShareShareId2 = sssDetails[ 3 ].shareId;

        share.selfshareShareDate3 = sssDetails[ 4 ].acceptedDate != "" ? sssDetails[ 4 ].acceptedDate : 0;
        share.selfshareShareId3 = sssDetails[ 4 ].shareId;

        share.qatime = parseInt( walletDetails.lastUpdated );
        let resCheckHealthAllShare = await comAppHealth.checkHealthAllShare( share );
        if ( resCheckHealthAllShare ) {
            this.loaddata();
        }
    }

    //TODO: Self share
    click_SelfShare = async ( item: any ) => {
        let sssDetails = await utils.getSSSDetails();
        console.log( { sssDetails, item } );
        let data3Share = sssDetails[ 2 ];
        var email4shareFilePath = sssDetails[ 3 ].decryptedShare;
        if ( item.type == "Self Share 1" ) {
            this.props.navigation.push( "SelfShareUsingWalletQRCode", { data: data3Share, onSelect: this.onSelect } )
        } else if ( item.type == "Self Share 2" ) {
            this.props.navigation.push( "SelfShareSharingScreen", { data: item, title: "Email Share" } );
        } else {
            this.props.navigation.push( "SelfShareSharingScreen", { data: item, title: "Cloud Share" } );
        }
    }

    click_Share5Sahring( type: string ) {
        if ( type == "CLOUD" ) {

        } else if ( type == "SLACK" ) {

        } else if ( type == "WHATSAPP" ) {

        }
    }




    render() {
        //flag
        let { flag_isTrustedContacts, flag_isSetupTrustedContact, flag_isMnemonic, flag_isSecretQuestions, flag_isTwoFactor, flag_Loading, flag_SelfShare, flag_SelfShareActionDisable } = this.state;
        //TouchableOpacity
        let { flag_DisableSecureTwoFactor, flag_DisableSecretQuestion } = this.state;
        //array
        let { arr_TrustedContacts, arr_SelfShare, arr_SecretQuestion } = this.state;
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Health of the App</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >

                            { renderIf( flag_isTrustedContacts == true )(
                                <View style={ styles.viewTrustedContacts }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Trusted Contacts</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={
                                                arr_TrustedContacts
                                            }
                                            showsVerticalScrollIndicator={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity style={ {
                                                } } onPress={ () => {
                                                    this.click_Item( item )
                                                } }
                                                >
                                                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                            { renderIf( item.thumbnailPath != "" )(
                                                                flag_isSetupTrustedContact == true ? <Avatar medium rounded icon={ { name: item.thumbnailPath, type: 'font-awesome' } } /> : <Avatar medium rounded source={ { uri: item.thumbnailPath } } />

                                                            ) }
                                                            { renderIf( item.thumbnailPath == "" )(
                                                                <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                            ) }
                                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                                <Text numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                                <View style={ { flexDirection: "row" } }>
                                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>{ item.statusMsg }</Text>
                                                                    { renderIf( typeof item.opt !== "undefined" )(
                                                                        <TimerCountdown
                                                                            initialMilliseconds={ item.totalSec * 1000 }
                                                                            onExpire={ () => this.loaddata() }
                                                                            formatMilliseconds={ ( milliseconds ) => {
                                                                                const remainingSec = Math.round( milliseconds / 1000 );
                                                                                const seconds = parseInt( ( remainingSec % 60 ).toString(), 10 );
                                                                                const minutes = parseInt( ( ( remainingSec / 60 ) % 60 ).toString(), 10 );
                                                                                const hours = parseInt( ( remainingSec / 3600 ).toString(), 10 );
                                                                                const s = seconds < 10 ? '0' + seconds : seconds;
                                                                                const m = minutes < 10 ? '0' + minutes : minutes;
                                                                                let h = hours < 10 ? '0' + hours : hours;
                                                                                h = h === '00' ? '' : h + ':';
                                                                                return h + m + ':' + s;
                                                                            } }
                                                                            allowFontScaling={ true }
                                                                            style={ { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } }
                                                                        />
                                                                    ) }
                                                                </View>
                                                                { renderIf( typeof item.opt !== "undefined" )(
                                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>OTP { " " }{ item.opt }</Text>
                                                                ) }
                                                            </View>
                                                            <View style={ {
                                                                flex: 1,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexDirection: "row"
                                                            } }>
                                                                <View style={ { flexDirection: "column", flex: 1, alignItems: "center" } }>
                                                                    <Text note style={ { fontSize: 14 } }>Last assessed on</Text>
                                                                    <Text style={ { fontSize: 14 } }>4/11/2019 12:23</Text>
                                                                </View>
                                                                <IconFontAwe name="angle-right" style={ { fontSize: 25, marginRight: 10, flex: 0.1 } } />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ item => item.recordID }
                                            extraData={ this.state }
                                        />
                                    </View>
                                </View>
                            ) }

                            { renderIf( flag_SelfShare == true )(
                                <View style={ { flex: 3 } }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Self Share</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={
                                                arr_SelfShare
                                            }
                                            showsVerticalScrollIndicator={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity style={ {
                                                } } onPress={ () => {
                                                    this.click_SelfShare( item )
                                                } }
                                                    disabled={ flag_SelfShareActionDisable }
                                                >
                                                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                            <Avatar medium rounded icon={ { name: item.thumbnailPath, type: 'font-awesome' } } />
                                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                                <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                                <View style={ { flexDirection: "row" } }>
                                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>{ item.statusMsg }</Text>
                                                                </View>
                                                            </View>
                                                            <View style={ {
                                                                flex: 1,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexDirection: "row"
                                                            } }>
                                                                <View style={ { flexDirection: "column", flex: 1, alignItems: "center" } }>
                                                                    <Text note style={ { fontSize: 14 } }>Last assessed on</Text>
                                                                    <Text style={ { fontSize: 14 } }>4/11/2019 12:23</Text>
                                                                </View>
                                                                <IconFontAwe name="angle-right" style={ { fontSize: 25, marginRight: 10, flex: 0.1 } } />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ item => item.recordID }
                                            extraData={ this.state }
                                        />
                                    </View>

                                </View>
                            ) }

                            { renderIf( flag_isMnemonic == true )(
                                <View style={ styles.viewMnemonic }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Mnemonic</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={ this.state.arr_Mnemonic }
                                            showsVerticalScrollIndicator={ false }
                                            scrollEnabled={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity
                                                    onPress={ () => this.click_MnemoicItem() }
                                                >
                                                    <RkCard
                                                        rkType="shadowed"
                                                        style={ {
                                                            flex: 1,
                                                            borderRadius: 8,
                                                            marginLeft: 8,
                                                            marginRight: 8,
                                                            marginBottom: 4,
                                                        } }
                                                    >
                                                        <View
                                                            rkCardHeader
                                                            style={ {
                                                                flex: 1,
                                                            } }
                                                        >
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                                <SvgIcon
                                                                    name={ item.icon }
                                                                    color="#BABABA"
                                                                    size={ 30 }
                                                                />
                                                            </View>
                                                            <View style={ { flex: 1, flexDirection: "column" } }>
                                                                <Text
                                                                    style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                                >
                                                                    { item.title }
                                                                </Text>
                                                                <Text note numberOfLines={ 1 } style={ { fontSize: 11, color: item.color } }>{ item.subTitle }</Text>
                                                            </View>
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                                <SvgIcon
                                                                    name="icon_forword"
                                                                    color="#BABABA"
                                                                    size={ 20 }
                                                                />
                                                            </View>
                                                        </View>
                                                    </RkCard>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ ( item, index ) => index }
                                        />
                                    </View>
                                </View>
                            ) }

                            { renderIf( flag_isSecretQuestions == true )(
                                <View style={ { flex: 1 } }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Secret Questions</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={ arr_SecretQuestion }
                                            showsVerticalScrollIndicator={ false }
                                            scrollEnabled={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity
                                                    onPress={ () => this.click_SecretQuestion( item ) }
                                                >
                                                    <RkCard
                                                        rkType="shadowed"
                                                        style={ {
                                                            flex: 1,
                                                            borderRadius: 8,
                                                            marginLeft: 8,
                                                            marginRight: 8,
                                                            marginBottom: 4,
                                                        } }
                                                    >
                                                        <View
                                                            rkCardHeader
                                                            style={ {
                                                                flex: 1,
                                                            } }
                                                        >
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                                <SvgIcon
                                                                    name={ item.icon }
                                                                    color="#BABABA"
                                                                    size={ 30 }
                                                                />
                                                            </View>
                                                            <View style={ { flex: 1, flexDirection: "column" } }>
                                                                <Text
                                                                    style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                                >
                                                                    { item.title }
                                                                </Text>
                                                                <Text note numberOfLines={ 1 } style={ { fontSize: 11, color: item.color } }>{ item.subTitle }</Text>
                                                            </View>
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                                <SvgIcon
                                                                    name="icon_forword"
                                                                    color="#BABABA"
                                                                    size={ 20 }
                                                                />
                                                            </View>
                                                        </View>
                                                    </RkCard>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ ( item, index ) => index }
                                        />
                                    </View>
                                </View>
                            ) }


                            { renderIf( flag_isTwoFactor == true )(
                                <View style={ styles.view2FactorAuto }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Secure Wallet Two-Factor Autoentication</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={ this.state.arr_2FactorAuto }
                                            showsVerticalScrollIndicator={ false }
                                            scrollEnabled={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity
                                                    onPress={ () => this.click_TwoFactorSetup() }
                                                    disabled={ flag_DisableSecureTwoFactor }
                                                >
                                                    <RkCard
                                                        rkType="shadowed"
                                                        style={ {
                                                            flex: 1,
                                                            borderRadius: 8,
                                                            marginLeft: 8,
                                                            marginRight: 8,
                                                            marginBottom: 4,
                                                        } }
                                                    >
                                                        <View
                                                            rkCardHeader
                                                            style={ {
                                                                flex: 1,
                                                            } }
                                                        >
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                                <SvgIcon
                                                                    name={ item.icon }
                                                                    color="#BABABA"
                                                                    size={ 30 }
                                                                />
                                                            </View>
                                                            <View style={ { flex: 1, flexDirection: "column" } }>
                                                                <Text
                                                                    style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                                >
                                                                    { item.title }
                                                                </Text>
                                                                <Text note numberOfLines={ 1 } style={ { fontSize: 11, color: item.color } }>{ item.subTitle }</Text>
                                                            </View>
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                                <SvgIcon
                                                                    name="icon_forword"
                                                                    color="#BABABA"
                                                                    size={ 20 }
                                                                />
                                                            </View>
                                                        </View>
                                                    </RkCard>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ ( item, index ) => index }
                                        />
                                    </View>
                                </View>
                            ) }

                        </KeyboardAwareScrollView>
                    </ImageBackground>
                    <ModelFindYourTrustedContacts
                        data={ this.state.arr_ModelFindYourTrustedContacts }
                        click_Confirm={ async () => {
                            await Permissions.request( 'contacts' ).then( ( response: any ) => {
                                console.log( response );
                                if ( response == "authorized" ) {
                                    const arrSSSDetails = this.state.arr_SSSDetails.slice( 0, 2 );
                                    this.props.navigation.push( "BackUpYourWalletNavigator", { data: arrSSSDetails } )
                                } else {
                                    alert.simpleOk( "Oops", "Please add contacts permission." );
                                }
                            } );
                            this.setState( {
                                arr_ModelFindYourTrustedContacts: [
                                    {
                                        modalVisible: false
                                    }
                                ]
                            } )
                        } }
                        closeModal={ () => {
                            this.setState( {
                                arr_ModelFindYourTrustedContacts: [
                                    {
                                        modalVisible: false
                                    }
                                ]
                            } )
                        } }
                    />
                </SafeAreaView>
                <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
            </Container >
        );
    }
}
const primaryColor = colors.appColor;
const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    },
    viewTrustedContacts: {
        flex: 1,
    },
    viewMnemonic: {
        flex: 1
    },
    viewSecretQuestion: {
        flex: 1
    },
    view2FactorAuto: {
        flex: 1
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    },
    //botom model
    modal: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    modal4: {
        height: 180
    }
} );
