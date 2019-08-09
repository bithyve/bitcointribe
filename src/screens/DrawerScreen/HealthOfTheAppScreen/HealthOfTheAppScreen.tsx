import React from "react";
import { StyleSheet, ImageBackground, View, RefreshControl, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
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
} from "native-base";
import { Card, ListItem } from 'react-native-elements'
import { Icon } from 'react-native-elements'
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import ImageSVG from 'react-native-remote-svg';
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

//TODO: Custome View
import ViewErrorMessage from "HexaWallet/src/app/custcompontes/View/ViewErrorMessage/ViewErrorMessage";

//TODO: Custome model  
import ModelBackupYourWallet from "HexaWallet/src/app/custcompontes/Model/ModelBackupYourWallet/ModelBackupYourWallet";
import ModelFindYourTrustedContacts from "HexaWallet/src/app/custcompontes/Model/ModelFindYourTrustedContacts/ModelFindYourTrustedContacts";



//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, svgIcon, localDB, expaire } from "HexaWallet/src/app/constants/Constants";
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
                givenName: "Trusted Contacts 1",
                familyName: "",
                statusMsgColor: "gray",
                statusMsg: "Not Shared",
                flagAction: false,
            }, {
                thumbnailPath: "user",
                givenName: "Trusted Contacts 2",
                familyName: "",
                statusMsgColor: "gray",
                statusMsg: "Not Shared",
                flagAction: false,
            } ],
            arr_SelfShare: [ {
                thumbnailPath: "wallet",
                givenName: "Secondary Device",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not Shared",
                type: "Self Share 1",
                flagAction: true,
            }, {
                thumbnailPath: "email",
                givenName: "Email",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not Shared",
                type: "Self Share 2",
                flagAction: true,
            }, {
                thumbnailPath: "cloudstorage",
                givenName: "Cloud",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not Shared",
                type: "Self Share 3",
                flagAction: true,
            } ],
            arrSelectedItem: [],
            arr_SSSDetails: [],
            arr_Mnemonic: [],
            arr_MnemonicDetails: [],
            arr_SecretQuestion: [ {
                icon: "timelockNew",
                title: "Secret Question",
                subTitle: "Not Backed up",
                color: "#ff0000",
            } ],
            //values
            backupType: "",
            backupMethod: "",
            arr_QuestionAndAnswerDetails: [],
            arr_2FactorAuto: [],
            arr_SecureAccountDetials: [],
            arr_ModelBackupYourWallet: [],
            arr_ModelFindYourTrustedContacts: [],
            arrErrorMessage: [],
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
            flag_DisableSecretQuestion: true,
            flag_SSSAndPdfFileCreate: false,
            flag_ShareAction: true
        } );
    }

    async componentWillMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {
                this.getCheackHealthWithoutServer();
            }
        );
    }

    componentWillUnmount() {
        this.willFocusSubscription.remove();
    }

    getCheackHealthWithoutServer = async () => {
        let sssDetails = await utils.getSSSDetails();
        if ( sssDetails.length > 0 ) {
            this.setState( {
                flag_ShareAction: false,
            } );
            let walletDetails = await utils.getWalletDetails();
            let backupInfo = JSON.parse( walletDetails.backupInfo );
            let backupType = backupInfo[ 0 ].backupType;
            let backupMethod = backupInfo[ 0 ].backupMethod;
            let sssDetails = await utils.getSSSDetails();
            console.log( { walletDetails, sssDetails } );
            let share = {};
            share.trustedContShareId1 = sssDetails[ 0 ].shareId != "" ? sssDetails[ 0 ].shareId : null;
            share.trustedContDate1 = sssDetails[ 0 ].acceptedDate != "" ? parseInt( sssDetails[ 0 ].acceptedDate ) : 0;

            share.trustedContShareId2 = sssDetails[ 1 ].shareId != "" ? sssDetails[ 1 ].shareId : null;
            share.trustedContDate2 = sssDetails[ 1 ].acceptedDate != "" ? parseInt( sssDetails[ 1 ].acceptedDate ) : 0;

            share.selfshareShareId1 = sssDetails[ 2 ].shareId != "" ? sssDetails[ 2 ].shareId : null;
            share.selfshareDate1 = sssDetails[ 2 ].acceptedDate != "" ? parseInt( sssDetails[ 2 ].acceptedDate ) : 0;

            share.selfshareShareDate2 = sssDetails[ 3 ].acceptedDate != "" ? sssDetails[ 3 ].acceptedDate : 0;
            share.selfshareShareShareId2 = sssDetails[ 3 ].shareId != "" ? sssDetails[ 3 ].shareId : "";

            share.selfshareShareDate3 = sssDetails[ 4 ].acceptedDate != "" ? sssDetails[ 4 ].acceptedDate : 0;
            share.selfshareShareId3 = sssDetails[ 4 ].shareId != "" ? sssDetails[ 4 ].shareId : "";

            share.qatime = parseInt( walletDetails.lastUpdated );

            let resCheckHealthAllShare = await comAppHealth.checkHealthWithServerAllShare( share );
            if ( resCheckHealthAllShare != "" ) {
                this.loaddata( backupType, backupMethod );
            } else {
                Alert.alert( "Check health not working." )
            }
        }
        else {   
            this.setState( {
                flag_SSSAndPdfFileCreate: true,
                flag_ShareAction: true
            } );
        }
    }




    getCheackHealth = async () => {
        let sssDetails = await utils.getSSSDetails();
        if ( sssDetails.length > 0 ) {
            this.setState( {
                flag_ShareAction: false,
                flag_Loading: true
            } );
            let walletDetails = await utils.getWalletDetails();
            let backupInfo = JSON.parse( walletDetails.backupInfo );
            let backupType = backupInfo[ 0 ].backupType;
            let backupMethod = backupInfo[ 0 ].backupMethod;
            let sssDetails = await utils.getSSSDetails();
            console.log( { walletDetails, sssDetails } );
            let share = {};
            share.trustedContShareId1 = sssDetails[ 0 ].shareId != "" ? sssDetails[ 0 ].shareId : null;
            share.trustedContShareId2 = sssDetails[ 1 ].shareId != "" ? sssDetails[ 1 ].shareId : null;
            share.selfshareShareId1 = sssDetails[ 2 ].shareId != "" ? sssDetails[ 2 ].shareId : null;
            share.selfshareShareDate2 = sssDetails[ 3 ].acceptedDate != "" ? sssDetails[ 3 ].acceptedDate : 0;
            share.selfshareShareShareId2 = sssDetails[ 3 ].shareId != "" ? sssDetails[ 3 ].shareId : "";
            share.selfshareShareDate3 = sssDetails[ 4 ].acceptedDate != "" ? sssDetails[ 4 ].acceptedDate : 0;
            share.selfshareShareId3 = sssDetails[ 4 ].shareId != "" ? sssDetails[ 4 ].shareId : "";
            share.qatime = parseInt( walletDetails.lastUpdated );
            let resCheckHealthAllShare = await comAppHealth.checkHealthAllShare( share );
            if ( resCheckHealthAllShare != "" ) {
                this.loaddata( backupType, backupMethod );
            } else {
                Alert.alert( "Check health not working." )
            }
        }
        else {
            this.setState( {
                flag_SSSAndPdfFileCreate: true,
                flag_ShareAction: true
            } );
        }
    }

    getActionTrustedCont( backupType: string, decryptedShare: string ) {
        if ( backupType != "new" && decryptedShare == "" ) {
            return true
        } else {
            return false
        }
    }


    getTrustedContactArray( sssDetails: any, backupType: string ) {
        console.log( { sssDetails, backupType } );
        let keeperInfo = JSON.parse( sssDetails.keeperInfo );
        let data = {};
        let decryptedShare = JSON.parse( sssDetails.decryptedShare );
        data.decryptedShare = decryptedShare;
        data.emailAddresses = keeperInfo.emailAddresses;
        data.phoneNumbers = keeperInfo.phoneNumbers;
        data.history = JSON.parse( sssDetails.history );
        data.recordID = keeperInfo.recordID;
        data.thumbnailPath = keeperInfo.thumbnailPath
        data.givenName = keeperInfo.givenName;
        data.familyName = keeperInfo.familyName;
        data.backupType = backupType;
        data.sssDetails = sssDetails;
        data.flagAction = this.getActionTrustedCont( backupType, decryptedShare );
        if ( sssDetails.sharedDate == "" && sssDetails.shareStage == "Ugly" ) {
            data.statusMsg = "Not Shared";
            data.statusMsgColor = "#ff0000";
            data.flag_timer = false;
        } else if ( sssDetails.sharedDate != "" && sssDetails.shareStage == "Ugly" ) {
            data.statusMsg = "Shared";
            data.statusMsgColor = "#C07710";
            data.flag_timer = false;
        }
        else if ( sssDetails.sharedDate != "" && sssDetails.shareStage == "Good" ) {
            data.statusMsg = "Share accessible";
            data.statusMsgColor = "#008000";
            data.flag_timer = false;
        } else if ( sssDetails.sharedDate != "" && sssDetails.shareStage == "Bad" ) {
            data.statusMsg = "Share inaccessible";
            data.statusMsgColor = "#C07710";
            data.flag_timer = false;
        } else {
            data.statusMsg = "Share inaccessible";
            data.statusMsgColor = "#C07710";
            data.flag_timer = false;
        }
        return [ data ];
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





    loaddata = async ( backupType: string, backupMethod: string ) => {
        let walletDetails = await utils.getWalletDetails();
        let sssDetails = await utils.getSSSDetails();
        let { arr_TrustedContacts, arr_SelfShare } = this.state;
        let arr_SecretQuestion = [];
        var len = sssDetails.length;
        for ( let i = 0; i < len; i++ ) {
            //Trusted Contacts
            if ( sssDetails[ i ].type === 'Trusted Contacts 1' && sssDetails[ i ].keeperInfo != "" ) {
                let data = await this.getTrustedContactArray( sssDetails[ i ], backupType );
                arr_TrustedContacts[ 0 ] = data[ 0 ];
            }
            else if ( sssDetails[ i ].type === 'Trusted Contacts 2' && sssDetails[ i ].keeperInfo != "" ) {
                let data = await this.getTrustedContactArray( sssDetails[ i ], backupType );
                arr_TrustedContacts[ 1 ] = data[ 0 ];
            }
            //Self Share  
            else if ( sssDetails[ i ].type === 'Self Share 1' && sssDetails[ i ].decryptedShare != "" ) {
                let sharedDate = sssDetails[ i ].sharedDate;
                let acceptDate = sssDetails[ i ].acceptedDate;
                let shareStage = sssDetails[ i ].shareStage;
                console.log( { sharedDate, acceptDate, shareStage } );
                let statusMsg = this.getMsgAndColor( sharedDate, acceptDate, shareStage )[ 0 ];
                let statusColor = this.getMsgAndColor( sharedDate, acceptDate, shareStage )[ 1 ];
                console.log( { statusMsg, statusColor } );
                let data = {};
                data.thumbnailPath = "wallet";
                data.givenName = "Secondary Device";
                data.familyName = "";
                data.statusMsgColor = statusColor;
                data.statusMsg = statusMsg;
                data.sssDetails = sssDetails[ i ];
                data.type = sssDetails[ i ].type;
                data.backupType = backupType;
                data.flagAction = sssDetails[ i ].decryptedShare != "" ? false : true;
                arr_SelfShare[ 0 ] = data;
            }
            else if ( sssDetails[ i ].type === 'Self Share 2' && sssDetails[ i ].decryptedShare != "" ) {
                let sharedDate = sssDetails[ i ].sharedDate;
                let acceptDate = sssDetails[ i ].acceptedDate;
                let shareStage = sssDetails[ i ].shareStage;
                console.log( { sharedDate, acceptDate, shareStage } );
                let statusMsg = this.getMsgAndColor( sharedDate, acceptDate, shareStage )[ 0 ];
                let statusColor = this.getMsgAndColor( sharedDate, acceptDate, shareStage )[ 1 ];
                console.log( { statusMsg, statusColor } );
                let data = {};
                data.thumbnailPath = "email";
                data.givenName = "Email";
                data.familyName = "";
                data.statusMsgColor = statusColor;
                data.statusMsg = statusMsg;
                data.sssDetails = sssDetails[ i ];
                data.type = sssDetails[ i ].type;
                data.backupType = backupType;
                data.flagAction = sssDetails[ i ].decryptedShare != "" ? false : true;
                arr_SelfShare[ 1 ] = data;
            }
            else {
                let sharedDate = sssDetails[ i ].sharedDate;
                let acceptDate = sssDetails[ i ].acceptedDate;
                let shareStage = sssDetails[ i ].shareStage;
                console.log( { sharedDate, acceptDate, shareStage } );
                let statusMsg = this.getMsgAndColor( sharedDate, acceptDate, shareStage )[ 0 ];
                let statusColor = this.getMsgAndColor( sharedDate, acceptDate, shareStage )[ 1 ];
                console.log( { statusMsg, statusColor } );
                let data = {};
                data.thumbnailPath = "cloudstorage";
                data.givenName = "Cloud";
                data.familyName = "";
                data.statusMsgColor = statusColor;
                data.statusMsg = statusMsg;
                data.sssDetails = sssDetails[ i ];
                data.type = sssDetails[ i ].type;
                data.backupType = backupType;
                data.flagAction = sssDetails[ i ].decryptedShare != "" ? false : true;
                arr_SelfShare[ 2 ] = data;
            }
            //Secret Question  
            arr_SecretQuestion = this.getQuestionDetails( walletDetails )
            this.setState( {
                flag_Loading: false,
                flag_SelfShareActionDisable: false,
                arr_TrustedContacts,
                arr_SelfShare,
                arr_SSSDetails: sssDetails,
                arr_SecretQuestion
            } )
        }
    }

    //self share message
    getMsgAndColor( sharedDate: string, acceptDate: string, shareStage: string ) {
        if ( sharedDate == "" && shareStage == "Ugly" ) {
            return [ "Not Shared", "#ff0000" ];
        }
        else if ( sharedDate != "" && shareStage == "Ugly" ) {
            return [ "Shared", "#C07710" ];
        }
        else if ( sharedDate != "" && shareStage == "Good" ) {
            return [ "Share Accessible", "#008000" ];
        } else {
            return [ "Not Shared", "#ff0000" ];
        }
    }
    //secret quesiton message
    getQuestonHealth( share: string ) {
        if ( share == "Good" ) {
            return [ "Accessible", "#008000" ];
        }
        else if ( share == "Bad" ) {
            return [ "Inaccessible", "#C07710" ];
        } else {
            return [ "Inaccessible", "#ff0000" ];
        }
    }

    //TODO: func click_Item
    click_Item = ( item: any ) => {
        console.log( { item } );
        if ( item.givenName == "Trusted Contacts 1" || item.givenName == "Trusted Contacts 2" ) {
            this.setState( {
                arrSelectedItem: item,
                arr_ModelFindYourTrustedContacts: [
                    {
                        modalVisible: true
                    }
                ]
            } );
        } else {
            this.props.navigation.push( "TrustedContactNavigator", {
                data: item, onSelect: this.getCheackHealthWithoutServer
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
        this.getCheackHealthWithoutServer();
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

    render() {
        //flag
        let { flag_isTrustedContacts, flag_isMnemonic, flag_isSecretQuestions, flag_isTwoFactor, flag_Loading, flag_SelfShare, flag_SSSAndPdfFileCreate, flag_ShareAction } = this.state;
        //TouchableOpacity
        let { flag_DisableSecureTwoFactor, flag_DisableSecretQuestion } = this.state;
        //array
        let { arr_TrustedContacts, arr_SelfShare, arr_SecretQuestion, arrErrorMessage } = this.state;
        return (
            <Container>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        { renderIf( flag_SSSAndPdfFileCreate == true )(
                            <View>
                                <View style={ { backgroundColor: "#262A2E", flexDirection: "row", alignItems: "center", padding: 10 } }>
                                    <Text style={ { textAlign: "center", flex: 1, color: "#ffffff" } }>Hexa is creating your shares</Text>
                                    <ActivityIndicator size="small" color="#ffffff" />
                                </View>
                            </View>
                        ) }
                        <View style={ { marginLeft: 10 } }>
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
                            refreshControl={
                                <RefreshControl
                                    refreshing={ false }
                                    onRefresh={ () => {
                                        this.getCheackHealth()
                                    } }
                                />
                            }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            { renderIf( flag_isTrustedContacts == true )(
                                <View style={ styles.viewTrustedContacts }>
                                    <RkCard
                                        rkType="shadowed"
                                        style={ {
                                            flex: 1,
                                            margin: 5,
                                            borderRadius: 10
                                        } }
                                    >
                                        <View
                                            style={ {
                                                flex: 1,
                                                backgroundColor: "#ffffff",
                                                marginLeft: 10,
                                                marginRight: 10,
                                                marginBottom: 15,
                                                borderRadius: 10,
                                                borderBottomColor: "#F5F5F5",
                                                borderBottomWidth: 1
                                            } }>
                                            <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, marginLeft: -3, borderRadius: 10 } } >
                                                <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                    <Text numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>Trusted Contacts</Text>
                                                    <View style={ { flexDirection: "row" } }>
                                                        <Text note numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14 } ] }>Shares with your friends and family</Text>
                                                    </View>
                                                </View>
                                            </View>
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
                                                        disabled={ item.flagAction && flag_ShareAction }
                                                    >
                                                        <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                            <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                                { renderIf( item.givenName == "Trusted Contacts 1" || item.givenName == "Trusted Contacts 2" )(
                                                                    <ImageSVG
                                                                        style={ { width: 55, height: 55 } }
                                                                        source={
                                                                            svgIcon.healthoftheapp.selectcontacts
                                                                        }
                                                                    />
                                                                ) }
                                                                { renderIf( item.givenName != "Trusted Contacts 1" && item.givenName != "Trusted Contacts 2" )(
                                                                    <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } titleStyle={ { color: colors.appColor } } />
                                                                ) }
                                                                <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                                    <Text numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                                    <View style={ { flexDirection: "row" } }>
                                                                        <Text style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>{ item.statusMsg }</Text>
                                                                    </View>
                                                                </View>
                                                                <View style={ {
                                                                    flex: 0.1,
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexDirection: "row"
                                                                } }>
                                                                    <IconFontAwe name="angle-right" style={ { fontSize: 25 } } />
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                ) }
                                                keyExtractor={ item => item.recordID }
                                                extraData={ this.state }
                                            />
                                        </View>
                                    </RkCard>
                                </View>
                            ) }

                            { renderIf( flag_SelfShare == true )(
                                <RkCard
                                    rkType="shadowed"
                                    style={ {
                                        flex: 3,
                                        margin: 5,
                                        borderRadius: 10
                                    } }
                                >
                                    <View
                                        style={ {
                                            flex: 1, backgroundColor: "#ffffff",
                                            marginLeft: 10,
                                            marginRight: 10,
                                            marginBottom: 16,
                                            borderRadius: 10,
                                            borderBottomColor: "#F5F5F5",
                                            borderBottomWidth: 1
                                        } }>
                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, marginLeft: -3, borderRadius: 10 } } >
                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                <Text numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>Self Share</Text>
                                                <View style={ { flexDirection: "row" } }>
                                                    <Text note numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14 } ] }>Shares you self guard</Text>
                                                </View>
                                            </View>
                                        </View>
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
                                                    disabled={ item.flagAction && flag_ShareAction }
                                                >
                                                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                            <ImageSVG
                                                                style={ { width: 55, height: 55 } }
                                                                source={
                                                                    svgIcon.healthoftheapp[ item.thumbnailPath ]
                                                                }
                                                            />
                                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                                <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                                <View style={ { flexDirection: "row" } }>
                                                                    <Text style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>{ item.statusMsg }</Text>
                                                                </View>
                                                            </View>
                                                            <View style={ {
                                                                flex: 0.1,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexDirection: "row"
                                                            } }>
                                                                <IconFontAwe name="angle-right" style={ { fontSize: 25 } } />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ item => item.recordID }
                                            extraData={ this.state }
                                        />
                                    </View>


                                </RkCard>
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
                                <RkCard
                                    rkType="shadowed"
                                    style={ {
                                        flex: 1,
                                        margin: 5,
                                        borderRadius: 10
                                    } }
                                >
                                    <View
                                        style={ {
                                            flex: 1,
                                            backgroundColor: "#ffffff",
                                            marginLeft: 10,
                                            marginRight: 10,
                                            marginBottom: 15,
                                            borderRadius: 10,
                                            borderBottomColor: "#F5F5F5",
                                            borderBottomWidth: 1
                                        } }>
                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, marginLeft: -3, borderRadius: 10 } } >
                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                <Text numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>Security Question</Text>
                                                <View style={ { flexDirection: "row" } }>
                                                    <Text note numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14 } ] }>Answer is used to protect your shares and PDF</Text>
                                                </View>
                                            </View>
                                        </View>
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
                                                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                            <ImageSVG
                                                                style={ { width: 55, height: 55 } }
                                                                source={
                                                                    svgIcon.healthoftheapp.question
                                                                }
                                                            />
                                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                                <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14 } ] }>{ item.title }</Text>
                                                                <View style={ { flexDirection: "row" } }>
                                                                    <Text style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14, color: item.color } ] }>{ item.subTitle }</Text>
                                                                </View>
                                                            </View>
                                                            <View style={ {
                                                                flex: 0.1,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexDirection: "row"
                                                            } }>
                                                                <IconFontAwe name="angle-right" style={ { fontSize: 25 } } />
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ ( item, index ) => index }
                                        />
                                    </View>
                                </RkCard>
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
                                    const { arrSelectedItem } = this.state;
                                    this.props.navigation.push( "BackUpYourWalletNavigator", { arrSelectedItem } )
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
                        }
                        }
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
