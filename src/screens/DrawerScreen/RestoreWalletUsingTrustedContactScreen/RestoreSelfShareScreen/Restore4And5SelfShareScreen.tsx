import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert, AsyncStorage, Image } from "react-native";
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
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import ModelTrustedContactEmailAndPhoneShare from "HexaWallet/src/app/custcompontes/Model/ModelTrustedContactEmailAndPhoneShare/ModelTrustedContactEmailAndPhoneShare";


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

export default class Restore4And5SelfShareScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            title: "Share",
            type: "",
            arr_History: [],
            flag_ScanBtnDisable: true
        } )
    }


    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let title = this.props.navigation.getParam( "title" );
        let type = this.props.navigation.getParam( "type" );

        console.log( { data } );
        // let flag_History = utils.isJson( data.sssDetails.history );
        // var arr_History = [];
        // if ( flag_History ) {
        //     arr_History = JSON.parse( data.sssDetails.history );
        // }
        // let acceptedDate = data.sssDetails.acceptedDate;
        let flag_ScanBtnDisable = true;
        // if ( acceptedDate != "" ) {
        //     flag_ScanBtnDisable = false;
        // } else {
        //     flag_ScanBtnDisable = true;
        // }
        console.log( { data } );
        this.setState( {
            title,
            type,
            flag_ScanBtnDisable,
            data
        } )
    }



    //TODO: Sharing    
    click_QRCode( data: any ) {
        let { type } = this.state;
        this.props.navigation.push( "Restore4And5SelfShareQRCodeScanner", { data: data, type: type } );
        // let { title } = this.state;
        // let email4shareFilePath = data.sssDetails.encryptedMetaShare.split( '"' ).join( "" );
        // if ( title != "Email Share" ) {
        //     let shareOptions = {
        //         title: "For 5 share",
        //         message: "For 5 share.Pdf password is your answer.",
        //         urls: [ email4shareFilePath ],
        //         subject: "For 5 share "
        //     };
        //     Share.open( shareOptions )
        //         .then( ( res: any ) => {
        //             this.updateHistory( data, "Shared.", "" );
        //             this.setState( {
        //                 flag_ShareBtnDisable: false,
        //                 flag_ReShareBtnDisable: true,
        //                 flag_ConfrimBtnDisable: true
        //             } );
        //         } );
        // } else {
        //     console.log( { email4shareFilePath } );
        //     Mailer.mail( {
        //         subject: 'For 4 Share.',
        //         recipients: [ 'appasahebl@bithyve.com' ],
        //         body: '<b>For 4 share.Pdf password is your answer.</b>',
        //         isHTML: true,
        //         attachment: {
        //             path: email4shareFilePath,  // The absolute path of the file from which to read data.
        //             type: 'pdf',      // Mime Type: jpg, png, doc, ppt, html, pdf, csv
        //             name: 'For4Share',   // Optional: Custom filename for attachment
        //         }
        //     }, ( error, event ) => {
        //         if ( event == "sent" ) {
        //             alert.simpleOk( "Success", "Email sent success." );
        //             this.updateHistory( data, "Shared.", "" );
        //             this.setState( {
        //                 flag_ShareBtnDisable: false,
        //                 flag_ReShareBtnDisable: true,
        //                 flag_ConfrimBtnDisable: true
        //             } )
        //         } else {
        //             alert.simpleOk( "Oops", error );
        //         }
        //     } );
        // }
    }

    //TODO: Re-Share Share

    click_ReShare( data: any ) {
        alert.simpleOk( "Oops", "Working" );
    }


    onSelect = async ( returnValue: any ) => {
        // if ( returnValue.data == returnValue.result ) {
        //     let { data } = this.state;
        //     let filePath = JSON.parse( data.sssDetails.encryptedMetaShare );
        //     console.log( { filePath } );
        //     this.updateHistory( data, "Confirmed.", filePath );
        //     let walletDetails = await utils.getWalletDetails();
        //     let sssDetails = await utils.getSSSDetails();
        //     let encrShares = [];
        //     for ( let i = 0; i < sssDetails.length; i++ ) {
        //         let data = {};
        //         data.shareId = sssDetails[ i ].shareId;
        //         data.updatedAt = sssDetails[ i ].sharedDate == "" ? 0 : parseInt( sssDetails[ i ].sharedDate );
        //         encrShares.push( data );
        //     }
        //     console.log( { encrShares } );
        //     let updateShareIdStatus = await comAppHealth.connection_AppHealthForAllShare( parseInt( walletDetails.lastUpdated ), encrShares );
        //     console.log( { updateShareIdStatus } );
        //     this.setState( {
        //         flag_ConfrimBtnDisable: false
        //     } )
        // } else {
        //     alert.simpleOk( "Oops", "Try again." );
        // }

    }



    //TODO: Share or Reshare button on click
    click_SentRequest( type: string, data: any ) {
        console.log( { type, data } );

    }

    render() {
        //array     
        let { data, arr_History } = this.state;
        //Value
        let { title } = this.state;
        //flag
        let { flag_ScanBtnDisable } = this.state;
        return (
            <Container>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <View style={ { marginLeft: 10 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>{ title }</Text>
                            </Button>
                        </View>
                        <View style={ { flex: 0.1, padding: 20 } }>
                            <Text numberOfLines={ 2 } note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Please sacn 8 qrcode.</Text>
                        </View>
                        <View style={ { flex: 2, alignItems: "center", justifyContent: "center" } }>
                            <Image style={ [ styles.imgAppLogo, { borderRadius: 10 } ] } source={ images.RestoreWalletUsingTrustedContact.share4and5SelfShareInfo } />
                        </View>
                        { renderIf( flag_ScanBtnDisable == true )(
                            <View style={ { flex: 0.3 } }>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.click_QRCode( data )
                                    } }
                                    title="Scan QRCode"
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
    },
    imgAppLogo: {
        width: "90%",
        height: "95%",

    },
} );
