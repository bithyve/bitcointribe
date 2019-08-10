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
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome model  

//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, svgIcon, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );

//TODO: Common Funciton   
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );


let counterConfirm = 0;

export default class RestoreSelectedContactsListScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_TrustedContacts: [ {
                thumbnailPath: "user",
                givenName: "Trusted Contacts 1",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not confirmed",
                opt: undefined,
            }, {
                thumbnailPath: "user",
                givenName: "Trusted Contacts 2",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not confirmed",
                opt: undefined,
            } ],
            arr_SelfShare: [ {
                thumbnailPath: "wallet",
                givenName: "Wallet",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not confirmed",
            }, {
                thumbnailPath: "email",
                givenName: "Email",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not confirmed",
            }, {
                thumbnailPath: "cloudstorage",
                givenName: "iCloud",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not confirmed",
            } ],
            //flag   
            flag_isTrustedContacts: true,
            flag_SelfShare: true,
            flag_SelfShareDisable: true,
            flag_isSetupTrustedContact: true,
            flag_DisableBtnNext: true,
            flag_Loading: false,
        } )
    }

    async componentWillMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {
                counterConfirm = 0;
                this.loaddata();
            }
        );
    }

    componentWillUnmount() {
        this.willFocusSubscription.remove();
    }


    getTrustedContactInfo = async ( sssDetails: any ) => {
        let keeperInfo = JSON.parse( sssDetails.keeperInfo );
        console.log( { keeperInfo } );
        let data = {};
        data.emailAddresses = keeperInfo.emailAddresses;
        data.phoneNumbers = keeperInfo.phoneNumbers;
        data.history = JSON.parse( sssDetails.history );
        data.recordID = keeperInfo.recordID;
        data.thumbnailPath = keeperInfo.thumbnailPath
        data.givenName = keeperInfo.givenName;
        data.familyName = keeperInfo.familyName;
        data.sssDetails = sssDetails;
        let sharedDate = sssDetails.sharedDate;
        if ( sharedDate == "" && sssDetails.shareStage == "" ) {
            data.statusMsg = "Not Confirmed";
            data.statusMsgColor = "#ff0000";
        } else if ( sharedDate != "" && sssDetails.shareStage == "" ) {
            data.statusMsg = "Shared";
            data.statusMsgColor = "#C07710";
        } else {
            counterConfirm = counterConfirm + 1;
            data.statusMsg = "Confirmed";
            data.statusMsgColor = "#008000";
        }
        console.log( { data } );

        return [ data ];
    }

    loaddata = async () => {

        this.setState( {
            flag_Loading: true
        } )
        let flag_Loading = true;
        let dateTime = Date.now();
        let walletDetails = await utils.getWalletDetails();
        let sssDetails = await utils.getSSSDetails();
        console.log( sssDetails );
        console.log( { sssDetails } );
        console.log( { walletDetails, sssDetails } );
        //flag   
        let flag_isSetupTrustedContact, flag_isSecretQuestions;
        //array  
        let history = [];
        let tempOpt = [];
        let temp = [];
        //Trusted Contacts

        if ( sssDetails.length > 0 ) {
            let { arr_TrustedContacts, arr_SelfShare } = this.state;
            var len = sssDetails.length;
            for ( let i = 0; i < len; i++ ) {
                //Trusted Contacts
                if ( sssDetails[ i ].type === 'Trusted Contacts 1' && sssDetails[ i ].keeperInfo != "" ) {
                    let data = await this.getTrustedContactInfo( sssDetails[ i ] );
                    arr_TrustedContacts[ 0 ] = data[ 0 ];

                }
                else if ( sssDetails[ i ].type === 'Trusted Contacts 2' && sssDetails[ i ].keeperInfo != "" ) {
                    let data = await this.getTrustedContactInfo( sssDetails[ i ] );
                    arr_TrustedContacts[ 1 ] = data[ 0 ];
                }

                //Self Share  
                else if ( sssDetails[ i ].type === 'Self Share 1' && sssDetails[ i ].decryptedShare != "" ) {
                    let sharedDate = sssDetails[ i ].sharedDate;
                    let shareStage = sssDetails[ i ].shareStage;
                    let statusMsg = this.getMsgAndColor( sharedDate, shareStage )[ 0 ];
                    let statusColor = this.getMsgAndColor( sharedDate, shareStage )[ 1 ];
                    if ( statusMsg == "Confirmed" ) {
                        counterConfirm = counterConfirm + 1;
                    }
                    let data = {};
                    data.thumbnailPath = "wallet";
                    data.givenName = "Wallet";
                    data.familyName = "";
                    data.statusMsgColor = statusColor;
                    data.statusMsg = statusMsg;
                    data.sssDetails = sssDetails[ i ];
                    arr_SelfShare[ 0 ] = data;
                }
                else if ( sssDetails[ i ].type === 'Self Share 2' && sssDetails[ i ].decryptedShare != "" ) {
                    let sharedDate = sssDetails[ i ].sharedDate;
                    let shareStage = sssDetails[ i ].shareStage;
                    let statusMsg = this.getMsgAndColor( sharedDate, shareStage )[ 0 ];
                    let statusColor = this.getMsgAndColor( sharedDate, shareStage )[ 1 ];
                    if ( statusMsg == "Confirmed" ) {
                        counterConfirm = counterConfirm + 1;
                    }
                    let data = {};
                    data.thumbnailPath = "email";
                    data.givenName = "Email";
                    data.familyName = "";
                    data.statusMsgColor = statusColor;
                    data.statusMsg = statusMsg;
                    data.sssDetails = sssDetails[ i ];
                    arr_SelfShare[ 1 ] = data;
                }
                else {
                    let sharedDate = sssDetails[ i ].sharedDate;
                    let shareStage = sssDetails[ i ].shareStage;
                    let statusMsg = this.getMsgAndColor( sharedDate, shareStage )[ 0 ];
                    let statusColor = this.getMsgAndColor( sharedDate, shareStage )[ 1 ];
                    if ( statusMsg == "Confirmed" ) {
                        counterConfirm = counterConfirm + 1;
                    }
                    let data = {};
                    data.thumbnailPath = "cloudstorage";
                    data.givenName = "iCloud";
                    data.familyName = "";
                    data.statusMsgColor = statusColor;
                    data.statusMsg = statusMsg;
                    data.sssDetails = sssDetails[ i ];
                    arr_SelfShare[ 2 ] = data;
                }
                flag_Loading = false
                //Next Button Enable or Didable
                console.log( { counterConfirm } );
                let flag_DisableBtnNext = true;
                if ( counterConfirm >= 3 ) {
                    flag_DisableBtnNext = false
                }
                this.setState( {
                    flag_isSetupTrustedContact,
                    arr_TrustedContacts,
                    flag_isSecretQuestions,
                    arr_SelfShare,
                    flag_DisableBtnNext
                } )
            }
        } else {
            flag_Loading = false
        }
        this.setState( {
            flag_Loading
        } );
    }

    getMsgAndColor( sharedDate: string, shareStage: string ) {
        if ( sharedDate == "" && shareStage != "Good" ) {
            return [ "Not Confirmed", "#ff0000" ];
        } else if ( sharedDate != "" && shareStage != "Good" ) {
            return [ "Shared", "#C07710" ];
        } else {
            return [ "Confirmed", "#008000" ];
        }
    }

    //TODO: func click_Item
    click_AssociateContactItem = ( item: any ) => {
        if ( item.givenName == "Trusted Contacts 1" || item.givenName == "Trusted Contacts 2" ) {
            this.props.navigation.push( "RestoreAllContactListScreen", { data: item.givenName } );
        } else {
            this.props.navigation.push( "RestoreTrustedContactsShareScreen", { data: item, title: item.givenName + " Share" } )
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



    onSelect = async ( returnValue: any ) => {
        // let walletDetails = await utils.getWalletDetails();
        // var sssDetails = await utils.getSSSDetails();
        // let encrShares = [];
        // for ( let i = 0; i <= 2; i++ ) {
        //     encrShares.push( sssDetails[ i ].shareId )
        // }
        // console.log( { encrShares } );
        // let updateShareIdStatus = await comAppHealth.connection_AppHealthAndSSSUpdate( parseInt( walletDetails.lastUpdated ), encrShares );
        // if ( updateShareIdStatus ) {
        //     sssDetails = await utils.getSSSDetails();
        //     let arr_SelfShare = [];
        //     let arrTitle = [ "", "", "Wallet", "Email", "iCloud" ];
        //     for ( let i = 0; i < sssDetails.length; i++ ) {
        //         if ( i > 1 ) {
        //             console.log( { data: sssDetails[ i ] } );
        //             let sharedDate = sssDetails[ i ].sharedDate;
        //             let shareStage = sssDetails[ i ].shareStage;
        //             let statusMsg = this.getMsgAndColor( sharedDate, shareStage )[ 0 ];
        //             let statusColor = this.getMsgAndColor( sharedDate, shareStage )[ 1 ];
        //             console.log( { statusMsg, statusColor } );
        //             let data = {};
        //             data.thumbnailPath = "bars";
        //             data.givenName = arrTitle[ i ];
        //             data.familyName = "";
        //             data.statusMsgColor = statusColor;
        //             data.statusMsg = statusMsg;
        //             data.sssDetails = sssDetails[ i ];
        //             arr_SelfShare.push( data );
        //         }
        //     }
        //     this.setState( {
        //         arr_SelfShare
        //     } )
        // }
    }

    //TODO: Self share
    click_SelfShare = async ( item: any ) => {
        if ( item.givenName == "Wallet" ) {
            this.props.navigation.push( "Restore3SelfShareScreen", { data: item, title: item.givenName + " Shares Scan" } );
        } else {
            this.props.navigation.push( "Restore4And5SelfShareScreen", { data: item, title: item.givenName + " Shares Scan", type: item.givenName } );
        }

        // let sssDetails = await utils.getSSSDetails();
        // console.log( { sssDetails } );
        // let data3Share = sssDetails[ 2 ];
        // var email4shareFilePath = sssDetails[ 3 ].encryptedMetaShare;

        // console.log( { email4shareFilePath } );
        // if ( item.givenName == "Wallet" ) {
        //     this.props.navigation.push( "SelfShareUsingWalletQRCode", { data: data3Share, onSelect: this.onSelect } )
        // } else if ( item.givenName == "Email" ) {
        //     this.props.navigation.push( "SelfShareSharingScreen", { data: item, title: "Email Share" } );

        // } else {
        //     this.props.navigation.push( "SelfShareSharingScreen", { data: item, title: "iCloud Share" } );
        // }
    }

    //TODO: click next button all or 3 share conrimed
    click_Next() {
        this.props.navigation.push( "RestoreWalletUsingTrustedContactQueAndAnwScreen" );
    }



    render() {
        //flag
        let { flag_isTrustedContacts, flag_isSetupTrustedContact, flag_isMnemonic, flag_isSecretQuestions, flag_isTwoFactor, flag_Loading, flag_SelfShare, flag_SelfShareDisable, flag_DisableBtnNext } = this.state;
        //TouchableOpacity
        let { flag_DisableSecureTwoFactor, flag_DisableSecretQuestion } = this.state;
        //array
        let { arr_TrustedContacts, arr_SelfShare, arr_SecretQuestion } = this.state;
        return (
            <Container>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <View style={ { marginLeft: 10 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.navigate( "RestoreAndWalletSetupNavigator" ) }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Restore Wallet</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
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
                                    <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                        <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                            <Text numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>Trusted Contacts</Text>
                                            <View style={ { flexDirection: "row" } }>
                                                <Text note style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14 } ] }>Shares you have trusted with your friends and family</Text>
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
                                                this.click_AssociateContactItem( item )
                                            } }
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
                                    <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                        <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                            <Text numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>Self Share</Text>
                                            <View style={ { flexDirection: "row" } }>
                                                <Text note style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14 } ] }>Shares you self guard  on multiple devices and platforms.</Text>
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
                            </RkCard>

                            <View style={ { flex: 0.2, justifyContent: "flex-end" } }>
                                <FullLinearGradientButton
                                    click_Done={ () => this.click_Next() }
                                    title="Next"
                                    disabled={ flag_DisableBtnNext }
                                    style={ [ flag_DisableBtnNext == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                />
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
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
