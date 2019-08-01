import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert, AsyncStorage, Clipboard } from "react-native";
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
    Icon,
    List,
    ListItem,
    Thumbnail
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Contacts from 'react-native-contacts';
import { Avatar } from 'react-native-elements';
import SendSMS from 'react-native-sms';
import Permissions from 'react-native-permissions'
import Modal from 'react-native-modalbox';
import Toast from 'react-native-simple-toast';


//import Mailer from 'react-native-mail';
var Mailer = require( 'NativeModules' ).RNMail;
import Share from "react-native-share";
var RNFS = require( 'react-native-fs' );
import BackgroundFetch from "react-native-background-fetch";

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientSelfShareShareButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientSelfShareShareButton";

//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );


//TODO: Common Funciton
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";

export default class SelfShareSharingScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            title: "Share",
            arr_History: [],
            flag_ShareBtnDisable: true,
            flag_ReShareBtnDisable: false,
            flag_ConfrimBtnDisable: false
        } )
    }


    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let title = this.props.navigation.getParam( "title" );
        console.log( { data } );
        let arr_History = JSON.parse( data.sssDetails.history )
        let shareStage = data.sssDetails.shareStage;
        let sharedDate = data.sssDetails.sharedDate;
        console.log( { shareStage, sharedDate } );
        let flag_ShareBtnDisable, flag_ReShareBtnDisable, flag_ConfrimBtnDisable;
        if ( sharedDate == "" && shareStage != "Good" ) {
            flag_ReShareBtnDisable = false;
            flag_ConfrimBtnDisable = false;
            flag_ShareBtnDisable = true;
        }
        else if ( shareStage != "Good" && sharedDate != "" ) {
            flag_ConfrimBtnDisable = true;
            flag_ReShareBtnDisable = true;
            flag_ShareBtnDisable = false;
        }
        else if ( sharedDate != "" && shareStage == "Good" ) {
            flag_ReShareBtnDisable = true;
            flag_ConfrimBtnDisable = false;
            flag_ShareBtnDisable = false;
        } else {
            flag_ShareBtnDisable = true;
            flag_ReShareBtnDisable = false;
            flag_ConfrimBtnDisable = false;
        }
        console.log( { data } );
        this.setState( {
            title,
            flag_ShareBtnDisable,
            flag_ReShareBtnDisable,
            flag_ConfrimBtnDisable,
            data,
            arr_History
        } )
    }



    //TODO: Sharing PDF
    click_ShareEmail( data: any ) {
        console.log( { data } );
        let { title } = this.state;
        var email4shareFilePath = data.sssDetails.decryptedShare.split( '"' ).join( "" );
        console.log( { email4shareFilePath } );
        if ( title != "Email Share" ) {
            if ( Platform.OS == "android" ) {
                email4shareFilePath = "file:/" + email4shareFilePath;
            }
            console.log( { email4shareFilePath } );
            let shareOptions = {
                title: "For 5 share",
                message: "For 5 share.Pdf password is your answer.",
                urls: [ email4shareFilePath ],
                subject: "For 5 share "
            };
            Share.open( shareOptions )
                .then( ( res: any ) => {
                    this.updateHistory( data, "Shared.", "" );
                    this.setState( {
                        flag_ShareBtnDisable: false,
                        flag_ReShareBtnDisable: true,
                        flag_ConfrimBtnDisable: true
                    } );
                } );
        } else {
            console.log( { email4shareFilePath } );
            Mailer.mail( {
                subject: 'For 4 Share.',
                recipients: [ 'appasahebl@bithyve.com' ],
                body: '<b>For 4 share.Pdf password is your answer.</b>',
                isHTML: true,
                attachment: {
                    path: email4shareFilePath,  // The absolute path of the file from which to read data.
                    type: 'pdf',      // Mime Type: jpg, png, doc, ppt, html, pdf, csv
                    name: 'For4Share',   // Optional: Custom filename for attachment
                }
            }, ( error, event ) => {
                if ( event == "sent" ) {
                    alert.simpleOkActionWithPara( "Success", "Email Sent Successfully.", this.updateHistory( data, "Shared.", "" ) );
                    this.setState( {
                        flag_ShareBtnDisable: false,
                        flag_ReShareBtnDisable: true,
                        flag_ConfrimBtnDisable: true
                    } )
                } else {
                    alert.simpleOk( "Oops", error );
                }
            } );
            if ( Platform.OS == "android" ) {
                setTimeout( () => {
                    alert.simpleOkActionWithPara( "Success", "Email Sent Successfully.", this.updateHistory( data, "Shared.", "" ) );
                    this.setState( {
                        flag_ShareBtnDisable: false,
                        flag_ReShareBtnDisable: true,
                        flag_ConfrimBtnDisable: true
                    } )
                }, 3000 );
            }
        }
    }

    //TODO: Re-Share Share
    click_ReShare( data: any ) {
        alert.simpleOk( "Oops", "Working" );
    }

    //TODO:  Confirm
    click_Confirm( data: any ) {
        console.log( { data } );
        let value = JSON.parse( data.sssDetails.keeperInfo );
        this.props.navigation.push( "ConfirmSelfShareQRScannerScreen", { data: value, onSelect: this.onSelect } );
    }

    onSelect = async ( returnValue: any ) => {
        if ( returnValue.data == returnValue.result ) {
            let { data } = this.state;
            let filePath = JSON.parse( data.sssDetails.decryptedShare );
            console.log( { filePath } );
            this.updateHistory( data, "Confirmed.", filePath );
            let walletDetails = await utils.getWalletDetails();
            let sssDetails = await utils.getSSSDetails();
            let encrShares = [];
            for ( let i = 0; i < sssDetails.length; i++ ) {
                let data = {};
                data.shareId = sssDetails[ i ].shareId;
                data.updatedAt = sssDetails[ i ].sharedDate == "" ? 0 : parseInt( sssDetails[ i ].sharedDate );
                encrShares.push( data );
            }
            this.setState( {
                flag_ConfrimBtnDisable: false
            } )
        } else {
            alert.simpleOk( "Oops", "Try again." );
        }
    }

    //TODO: update histroy
    updateHistory = async ( data: any, title: string, filePath: any ) => {
        let arr_History = JSON.parse( data.sssDetails.history );
        const dateTime = Date.now();
        let JsonData = {};
        JsonData.title = title;
        JsonData.date = utils.getUnixToDateFormat2();
        let temp = [ JsonData ];
        arr_History.push.apply( arr_History, temp );
        console.log( { arr_History } );
        var resUpdateHistroyAndSharedDate;
        if ( title == "Shared." ) {
            resUpdateHistroyAndSharedDate = await dbOpration.updateHistroyAndSharedDate(
                localDB.tableName.tblSSSDetails,
                arr_History,
                dateTime,
                data.sssDetails.id
            );
        } else {
            resUpdateHistroyAndSharedDate = await dbOpration.updateHistroyAndAcceptDate(
                localDB.tableName.tblSSSDetails,
                arr_History,
                dateTime,
                data.sssDetails.id
            );
        }
        console.log( resUpdateHistroyAndSharedDate );
        if ( resUpdateHistroyAndSharedDate ) {
            await comFunDBRead.readTblSSSDetails();
            this.setState( {
                arr_History
            } );
            await RNFS.unlink( filePath );
        }
        console.log( { resUpdateHistroyAndSharedDate } );
    }

    render() {
        //array     
        let { data, arr_History } = this.state;
        //Value
        let { title } = this.state;
        //flag
        let { flag_ShareBtnDisable, flag_ReShareBtnDisable, flag_ConfrimBtnDisable } = this.state;
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>{ title }</Text>
                            </Button>
                        </View>
                        <View style={ { flex: 0.1, margin: 20 } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Share this pdf to an email/cloud which you can</Text>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>access if required to hold this secret for safekeeping </Text>

                        </View>
                        <View style={ { flex: 2 } }>
                            <FlatList
                                data={
                                    arr_History
                                }
                                showsVerticalScrollIndicator={ false }
                                renderItem={ ( { item } ) => (
                                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                            <View style={ { flex: 0.1 } }>
                                                <SvgIcon name="image_hexa" size={ 30 } color={ primaryColor } style={ { alignSelf: "center" } } />
                                            </View>
                                            <View style={ { flex: 1, flexDirection: "column", justifyContent: "center" } }>
                                                <View style={ { flexDirection: "row", flex: 1, } }>
                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16, flex: 1, alignSelf: "center", } ] }>{ item.title }</Text>
                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { alignSelf: "center", flex: 1 } ] }>{ item.date }</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ) }
                                keyExtractor={ item => item.recordID }
                                extraData={ this.state }
                            />
                        </View>
                        { renderIf( flag_ShareBtnDisable == true )(
                            <View style={ { flex: Platform.OS == "ios" ? 0.5 : 0.6 } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Do not share this pdf with anyone other than your email/cloud</Text>
                                <FullLinearGradientSelfShareShareButton
                                    click_Done={ () => {
                                        this.click_ShareEmail( data )
                                    } }
                                    title="Share"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10, marginBottom: 5 } ] } />
                            </View>
                        ) }
                        { renderIf( flag_ReShareBtnDisable == true )(
                            <View style={ { flex: Platform.OS == "ios" ? 0.5 : 0.6 } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Do not share this pdf with anyone other than your email/cloud</Text>
                                <FullLinearGradientSelfShareShareButton
                                    click_Done={ () => {
                                        this.click_ShareEmail( data )
                                    } }
                                    title="Reshare"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10 } ] } />
                            </View>
                        ) }
                        { renderIf( flag_ConfrimBtnDisable == true )(
                            <View style={ { flex: Platform.OS == "ios" ? 0.5 : 0.6 } }>
                                <FullLinearGradientSelfShareShareButton
                                    click_Done={ () => {
                                        this.click_Confirm( data )
                                    } }
                                    title="Confirm"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10 } ] } />
                            </View>
                        ) }
                    </ImageBackground>
                </SafeAreaView>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } message={ this.state.msg_Loading } />
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
    //botom model
    modal: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    modal4: {
        height: 180
    }
} );
