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

export default class RestoreTrustedContactsShareScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            title: "Share",
            arr_History: [],
            flag_ShareBtnDisable: true,
            flag_ReShareBtnDisable: false
        } )
    }


    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let title = this.props.navigation.getParam( "title" );
        console.log( { data } );
        let arr_History = JSON.parse( data.sssDetails.history )
        let acceptedDate = data.sssDetails.acceptedDate;
        let sharedDate = data.sssDetails.sharedDate;
        console.log( { acceptedDate, sharedDate } );
        let flag_ShareBtnDisable, flag_ReShareBtnDisable, flag_ConfrimBtnDisable;
        if ( sharedDate == "" && acceptedDate == "" ) {
            flag_ReShareBtnDisable = false;
            flag_ShareBtnDisable = true;
        }
        else if ( acceptedDate != "" && sharedDate != "" ) {
            flag_ReShareBtnDisable = false;
            flag_ShareBtnDisable = false;
        }
        else {
            flag_ShareBtnDisable = false;
            flag_ReShareBtnDisable = true;
        }
        console.log( { data } );
        this.setState( {
            title,
            flag_ShareBtnDisable,
            flag_ReShareBtnDisable,
            data,
            arr_History
        } )
    }



    //TODO: Sharing    
    click_Share( data: any ) {
        this.refs.modal4.open();

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

    //TODO: update histroy
    updateHistory = async ( data: any, title: string, filePath: any ) => {
        // let arr_History = JSON.parse( data.sssDetails.history );
        // const dateTime = Date.now();
        // let JsonData = {};
        // JsonData.title = title;
        // JsonData.date = utils.getUnixToDateFormat2();
        // let temp = [ JsonData ];
        // arr_History.push.apply( arr_History, temp );
        // console.log( { arr_History } );
        // let resUpdateHistroyAndSharedDate = await dbOpration.updateHistroyAndSharedDate(
        //     localDB.tableName.tblSSSDetails,
        //     arr_History,
        //     dateTime,
        //     data.sssDetails.id
        // );
        // console.log( resUpdateHistroyAndSharedDate );
        // if ( resUpdateHistroyAndSharedDate ) {
        //     await comFunDBRead.readTblSSSDetails();
        //     this.setState( {
        //         arr_History
        //     } );
        //     await RNFS.unlink( filePath );
        // }
        // console.log( { resUpdateHistroyAndSharedDate } );
    }

    //TODO: Share or Reshare button on click
    click_SentRequest( type: string, data: any ) {
        console.log( { data } );
        let script = {};
        script.mg = "Please sent return share.";
        var encpScript = utils.encrypt( JSON.stringify( script ), "122334" )
        encpScript = encpScript.split( "/" ).join( "_+_" );
        if ( type == "SMS" ) {
            let number = data.phoneNumbers.length != 0 ? data.phoneNumbers[ 0 ].number : ""
            SendSMS.send( {
                body: 'https://prime-sign-230407.appspot.com/sss/rtb/' + encpScript,
                recipients: [ number ],
                successTypes: [ 'sent', 'queued' ]
            }, ( completed, cancelled, error ) => {
                if ( completed ) {
                    this.refs.modal4.close();
                    console.log( 'SMS Sent Completed' );
                    setTimeout( () => {
                        Alert.alert(
                            'Success',
                            'SMS Sent Completed.',
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        // this.reloadList( "SMS" );
                                    }
                                },

                            ],
                            { cancelable: false }
                        )
                    }, 1000 );
                } else if ( cancelled ) {
                    console.log( 'SMS Sent Cancelled' );
                } else if ( error ) {
                    console.log( 'Some error occured' );
                }
            } );
        } else if ( type == "EMAIL" ) {
            let email = data.emailAddresses.length != 0 ? data.emailAddresses[ 0 ].email : "";
            if ( Platform.OS == "android" ) {
                Mailer.mail( {
                    subject: 'Hexa Wallet SSS Restore',
                    recipients: [ email ],
                    body: 'https://prime-sign-230407.appspot.com/sss/rtb/' + encpScript,
                    isHTML: true,
                }, ( error, event ) => {
                    if ( event == "sent" ) {
                        //this.reloadList( "Email" );
                    } else {
                        alert.simpleOk( "Oops", error );
                    }
                } );
                setTimeout( () => {
                    this.refs.modal4.close();
                    alert.simpleOk( "Success", "Email Sent Successfully." );
                    this.setState( {
                        flag_OtpCodeShowStatus: true
                    } );
                }, 1000 );
            } else {
                Mailer.mail( {
                    subject: 'Hexa Wallet SSS Restore',
                    recipients: [ email ],
                    body: 'https://prime-sign-230407.appspot.com/sss/rtb/' + encpScript,
                    isHTML: true,
                }, ( error, event ) => {
                    if ( event == "sent" ) {
                        setTimeout( () => {
                            this.refs.modal4.close();
                            Alert.alert( 'Email Sent Completed' );
                            this.setState( {
                                flag_OtpCodeShowStatus: true,
                            } )
                            //  this.reloadList( "Email" );
                        }, 1000 );
                    } else {
                        alert.simpleOk( "Oops", error );
                    }
                } );
            }
        } else {
            this.props.navigation.push( "RestoreTrustedContactsQRCodeScanScreen", { data: data, onSelect: this.onSelect } );
        }
        this.refs.modal4.close();
    }

    render() {
        //array     
        let { data, arr_History } = this.state;
        //Value
        let { title } = this.state;
        //flag
        let { flag_ShareBtnDisable, flag_ReShareBtnDisable } = this.state;
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
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Some information about the importance of trust with these contacts</Text>
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
                            <View style={ { flex: 0.4 } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Now only sharing email.</Text>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.click_Share( data )
                                    } }
                                    title="Share"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10 } ] } />
                            </View>
                        ) }
                        { renderIf( flag_ReShareBtnDisable == true )(
                            <View style={ { flex: 0.4 } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Now only sharing email.</Text>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.click_ReShare( data )
                                    } }
                                    title="Reshare"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10 } ] } />
                            </View>
                        ) }

                        <Modal style={ [ styles.modal, styles.modal4 ] } position={ "bottom" } ref={ "modal4" }>
                            <View>
                                <View style={ { flexDirection: 'column', alignItems: "center", marginTop: 10, marginBottom: 15, borderBottomColor: "#EFEFEF", borderBottomWidth: 1 } }>
                                    { renderIf( data.thumbnailPath != "" )(
                                        <Avatar medium rounded source={ { uri: data.thumbnailPath } } />
                                    ) }
                                    { renderIf( data.thumbnailPath == "" )(
                                        <Avatar medium rounded title={ data.givenName != null && data.givenName.charAt( 0 ) } />
                                    ) }
                                    <Text style={ { marginBottom: 10 } }>{ data.givenName + " " + data.familyName }</Text>
                                </View>
                                <View style={ { alignItems: "center", } }>
                                    <View style={ { flexDirection: "row", marginBottom: 10 } }>
                                        <Button transparent
                                            style={ [ { alignItems: "center", flex: 1 } ] }
                                            onPress={ () => this.click_SentRequest( "SMS", data ) }
                                        >
                                            <View style={ { alignItems: "center", marginLeft: "20%", flexDirection: "column" } }>
                                                <SvgIcon
                                                    name="chat"
                                                    color="#37A0DA"
                                                    size={ 35 }
                                                />
                                                <Text style={ { marginTop: 5, fontSize: 12, color: "#006EB1" } }>Via SMS</Text>
                                            </View>
                                        </Button>
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "EMAIL", data ) }>
                                            <View style={ { alignItems: "center", marginLeft: "20%", flexDirection: "column" } }>
                                                <SvgIcon
                                                    name="mail-2"
                                                    color="#37A0DA"
                                                    size={ 30 }
                                                />
                                                <Text style={ { marginTop: 5, fontSize: 12, color: "#006EB1" } }>Via Email</Text>
                                            </View>
                                        </Button>
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "QR", data ) }>
                                            <View style={ { alignItems: "center", marginLeft: "20%", flexDirection: "column" } }>
                                                <SvgIcon
                                                    name="qr-code-3"
                                                    color="#37A0DA"
                                                    size={ 30 }
                                                />
                                                <Text style={ { marginTop: 5, fontSize: 12, color: "#006EB1", textAlign: "center" } }>Via QR</Text>
                                            </View>
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        </Modal>
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
