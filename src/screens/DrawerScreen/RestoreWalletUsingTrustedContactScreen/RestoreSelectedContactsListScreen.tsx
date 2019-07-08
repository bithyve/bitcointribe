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
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome model  

//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );

//TODO: Common Funciton   
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );


export default class RestoreSelectedContactsListScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_TrustedContacts: [ {
                thumbnailPath: "user",
                givenName: "Select Contact 1",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not confirmed",
                opt: undefined,
            }, {
                thumbnailPath: "user",
                givenName: "Select Contact 2",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not confirmed",
                opt: undefined,
            } ],
            arr_SelfShare: [ {
                thumbnailPath: "bars",
                givenName: "Wallet",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not confirmed",
            }, {
                thumbnailPath: "bars",
                givenName: "Email",
                familyName: "",
                statusMsgColor: "#ff0000",
                statusMsg: "Not confirmed",
            }, {
                thumbnailPath: "bars",
                givenName: "iCloud Share",
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
                this.loaddata();
            }
        );
    }

    componentWillUnmount() {
        this.willFocusSubscription.remove();
    }

    loaddata = async () => {
        this.setState( {
            flag_Loading: true
        } )
        let flag_Loading = true;
        let dateTime = Date.now();
        let walletDetails = await utils.getWalletDetails();
        let sssDetails = await utils.getSSSDetails();
        console.log( { sssDetails } );
        console.log( { walletDetails, sssDetails } );
        //flag   
        let flag_isSetupTrustedContact, flag_isSecretQuestions;
        //array  
        let arr_TrustedContacts = [];
        let history = [];
        let tempOpt = [];
        let temp = [];
        //Trusted Contacts
        if ( sssDetails.length > 0 ) {
            for ( let i = 0; i <= 1; i++ ) {
                let keeperInfo = JSON.parse( sssDetails[ i ].keeperInfo );
                let data = {};
                data.emailAddresses = keeperInfo.emailAddresses;
                data.phoneNumbers = keeperInfo.phoneNumbers;
                data.history = JSON.parse( sssDetails[ i ].history );
                data.recordID = keeperInfo.recordID;
                data.thumbnailPath = keeperInfo.thumbnailPath
                data.givenName = keeperInfo.givenName;
                data.familyName = keeperInfo.familyName;
                data.sssDetails = sssDetails[ i ];
                let sharedDate = parseInt( sssDetails[ i ].sharedDate );
                console.warn( 'sharedDate date =' + sharedDate.toString() );
                var startDate = new Date( dateTime );
                var endDate = new Date( sharedDate );
                //console.warn( 'sart date =' + startDate.toString() + "end date = " + endDate.toString() )
                var diff = Math.abs( startDate.getTime() - endDate.getTime() );
                //console.warn( 'diff' + diff.toString() );  
                const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
                const seconds: any = Math.floor( diff / 1000 % 60 );
                //console.log( { minutes, seconds } );
                //console.warn( minutes.toString() )
                const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
                data.totalSec = 540 - totalSec;
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

                if ( totalSec < 540 && sssDetails[ i ].shareStage == "Ugly" ) {
                    data.statusMsg = "Shared";
                    data.statusMsgColor = "#C07710";
                    data.flag_timer = true;
                    data.opt = tempOpt[ i ];
                } else if ( totalSec >= 540 && sssDetails[ i ].shareStage == "Ugly" ) {
                    data.statusMsg = "Shared OTP expired.";
                    data.statusMsgColor = "#C07710";
                    data.flag_timer = false;
                } else if ( sssDetails[ i ].shareStage == "Good" ) {
                    data.statusMsg = "Share accessible";
                    data.statusMsgColor = "#008000";
                    data.flag_timer = false;
                } else if ( sssDetails[ i ].shareStage == "Bad" ) {
                    data.statusMsg = "Share not accessible";
                    data.statusMsgColor = "#ff0000";
                    data.flag_timer = false;
                } else if ( sssDetails[ i ].shareStage == "Ugly" && sssDetails[ i ].sharedDate != "" ) {
                    data.statusMsg = "Share not accessible";
                    data.statusMsgColor = "#ff0000";
                    data.flag_timer = false;
                }
                else {
                    data.statusMsg = "Not Confirmed";
                    data.statusMsgColor = "#ff0000";
                    data.flag_timer = false;
                }
                arr_TrustedContacts.push( data );
            }

            //Self Share  
            let arr_SelfShare = [];
            let arrTitle = [ "", "", "Wallet", "Email", "iCloud" ];
            for ( let i = 0; i < sssDetails.length; i++ ) {
                if ( i > 1 ) {
                    console.log( { data: sssDetails[ i ] } );
                    let sharedDate = sssDetails[ i ].sharedDate;
                    let shareStage = sssDetails[ i ].shareStage;
                    let statusMsg = this.getMsgAndColor( sharedDate, shareStage )[ 0 ];
                    let statusColor = this.getMsgAndColor( sharedDate, shareStage )[ 1 ];
                    console.log( { statusMsg, statusColor } );
                    let data = {};
                    data.thumbnailPath = "bars";
                    data.givenName = arrTitle[ i ];
                    data.familyName = "";
                    data.statusMsgColor = statusColor;
                    data.statusMsg = statusMsg;
                    data.sssDetails = sssDetails[ i ];
                    arr_SelfShare.push( data );
                }
            }

            flag_Loading = false
            this.setState( {
                flag_isSetupTrustedContact,
                arr_TrustedContacts,
                flag_isSecretQuestions,
                arr_SelfShare,
            } )
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
        if ( item.givenName == "Select Contact 1" || item.givenName == "Select Contact 2" ) {
            this.props.navigation.push( "RestoreAllContactListScreen" );
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
        console.log( { item } );
        this.props.navigation.push( "RestoreSelfShareScreen", { data: item, title: item.givenName + " Share" } );
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

    click_Share5Sahring( type: string ) {
        // if ( type == "iCLOUD" ) {

        // } else if ( type == "SLACK" ) {

        // } else if ( type == "WHATSAPP" ) {

        // }
    }



    //TODO: click next button all or 3 share conrimed
    click_Next() {
        console.log( 'next' );
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
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
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
                            <View style={ styles.viewTrustedContacts }>
                                <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                    <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Trusted contacts</Text>
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
