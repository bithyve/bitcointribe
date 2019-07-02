import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert, AsyncStorage } from "react-native";
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
import IconFontAwe from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Contacts from 'react-native-contacts';
import { Avatar } from 'react-native-elements';
import SendSMS from 'react-native-sms';
import Permissions from 'react-native-permissions'


//import Mailer from 'react-native-mail';
var Mailer = require( 'NativeModules' ).RNMail;
import Share from "react-native-share";
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


//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";

export default class TrustedContactScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_TrustedContactEmailAndPhoneShare: [],
            arr_ConstactDetailsList: [],
            arr_History: [],
            arr_resSSSDetails: [],
            messageId: "",
            otpCode: "",
            flag_OtpCodeShowStatus: false,
            flag_Loading: false,
            msg_Loading: "Loading"
        } )
    }

    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        console.log( { data } );
        let temp = [];
        let arr_Emails = data.emailAddresses;
        let arr_PhoneNumbers = data.phoneNumbers;
        for ( let i = 0; i < arr_PhoneNumbers.length; i++ ) {
            let dataJson = {};
            dataJson.label = arr_PhoneNumbers[ i ].label;
            dataJson.value = arr_PhoneNumbers[ i ].number;
            temp.push( dataJson );
        }
        for ( let i = 0; i < arr_Emails.length; i++ ) {
            let dataJson = {};
            dataJson.label = arr_Emails[ i ].label;
            dataJson.value = arr_Emails[ i ].email;
            temp.push( dataJson );
        }
        var resSSSDetails = await dbOpration.readSSSTableData(
            localDB.tableName.tblSSSDetails,
            data.recordID
        );
        resSSSDetails = resSSSDetails.temp[ 0 ];
        await utils.setSSSDetailsRecordIDWise( resSSSDetails )
        this.setState( {
            data: data,
            arr_ConstactDetailsList: temp,
            arr_History: data.history,
            arr_resSSSDetails: resSSSDetails
        } )
    }

    componentDidMount() {
        if ( Platform.OS == "android" ) {
            Permissions.request( 'readSms' ).then( ( response: any ) => {
                console.log( response );
            } );
        }
    }

    load_data = async () => {
        this.setState( {
            flag_Loading: true,
            msg_Loading: "Message id genreating"
        } )
        let data = this.props.navigation.getParam( "data" );
        let encryptedMetaShare = data.encryptedMetaShare;
        //console.log( { resSSSDetails } );
        let walletDetails = utils.getWalletDetails();
        //console.log( { walletDetails } );   
        const sss = await utils.getS3ServiceObject();
        const resEncryptViaOTP = sss.encryptViaOTP( encryptedMetaShare.key );
        console.log( { resEncryptViaOTP } );
        if ( resEncryptViaOTP.status == 200 ) {
            const resUploadShare = await sss.uploadShare( encryptedMetaShare.encryptedMetaShare, encryptedMetaShare.messageId );
            console.log( { resUploadShare } );
            if ( resUploadShare.status == 200 || 400 ) {
                this.setState( {
                    messageId: encryptedMetaShare.messageId,
                    otpCode: resEncryptViaOTP.data.otp,
                    flag_Loading: false,
                    arr_TrustedContactEmailAndPhoneShare: [ {
                        modalVisible: true,
                        contactDetails: data,
                        arr_ConstactDetailsList: this.state.arr_ConstactDetailsList
                    } ]
                } );
            } else {
                alert.simpleOk( "Oops", resUploadShare.err );
            }
        } else {
            alert.simpleOk( "Oops", resEncryptViaOTP.err );
        }
    }

    componentWillUnmount() {
        AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
    }


    //TODO: click on model confirm button 
    click_SentURLSmsOrEmail( item: any ) {
        AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( false ) );
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        let walletDetails = utils.getWalletDetails();
        let script = {};
        script.wn = walletDetails.walletType;
        script.mi = this.state.messageId;
        var encpScript = utils.encrypt( JSON.stringify( script ), "122334" )
        encpScript = encpScript.split( "/" ).join( "_+_" );
        console.log( { encpScript } );
        if ( reg.test( item.value ) == false ) {
            SendSMS.send( {
                body: 'https://prime-sign-230407.appspot.com/sss/bk/' + encpScript,
                recipients: [ item.value ],
                successTypes: [ 'sent', 'queued' ]
            }, ( completed, cancelled, error ) => {
                if ( completed ) {
                    console.log( 'SMS Sent Completed' );
                    this.setState( {
                        arr_TrustedContactEmailAndPhoneShare: [ {
                            modalVisible: false,
                            contactDetails: ""
                        } ]
                    } )
                    setTimeout( () => {
                        this.connection_UpdateSSSDetails( "SMS" );
                        Alert.alert( 'SMS Sent Completed' );
                        this.setState( {
                            flag_OtpCodeShowStatus: true
                        } )
                    }, 1000 );

                } else if ( cancelled ) {
                    console.log( 'SMS Sent Cancelled' );
                } else if ( error ) {
                    console.log( 'Some error occured' );
                }
            } );
        } else {
            this.connection_UpdateSSSDetails( "EMAIL" );
            if ( Platform.OS == "android" ) {
                Mailer.mail( {
                    subject: 'Hexa Wallet SSS Recovery',
                    recipients: [ item.value ],
                    body: 'https://prime-sign-230407.appspot.com/sss/bk/' + encpScript,
                    isHTML: true,
                }, ( error, event ) => {
                    if ( event == "sent" ) {
                        console.log( { event } );
                    }
                } );
                this.setState( {
                    arr_TrustedContactEmailAndPhoneShare: [ {
                        modalVisible: false,
                        contactDetails: ""
                    } ]
                } )
                setTimeout( () => {
                    Alert.alert( 'Email Sent Completed' );
                    this.setState( {
                        flag_OtpCodeShowStatus: true
                    } )
                }, 1000 );
            } else {
                Mailer.mail( {
                    subject: 'Hexa Wallet SSS Backup',
                    recipients: [ item.value ],
                    body: 'https://prime-sign-230407.appspot.com/sss/bk/' + encpScript,
                    isHTML: true,
                }, ( error, event ) => {
                    if ( event == "sent" ) {
                        this.setState( {
                            arr_TrustedContactEmailAndPhoneShare: [ {
                                modalVisible: false,
                                contactDetails: ""
                            } ]
                        } )
                        setTimeout( () => {
                            Alert.alert( 'Email Sent Completed' );
                            this.setState( {
                                flag_OtpCodeShowStatus: true
                            } )
                        }, 1000 );
                    }
                } );
            }
        }
    }



    //TODO: func backQrCodeScreen
    onSelect = ( data: any ) => {
        this.connection_UpdateSSSDetails( "QR" );
    };

    //TODO: func SSS Details table update data 
    connection_UpdateSSSDetails = async ( type: string ) => {
        const dateTime = Date.now();
        let history = this.state.arr_History;
        let state_data = this.state.data;
        state_data.statusMsgColor = "#C07710";
        state_data.statusMsg = "Shared";
        let temp = history;
        let jsondata = {};
        if ( type != "QR" ) {
            jsondata.otp = this.state.otpCode
        }
        jsondata.title = "Secret Share using " + type.toLowerCase();;
        jsondata.date = utils.getUnixToDateFormat( dateTime );
        temp.push( jsondata );
        let data = this.props.navigation.getParam( "data" );
        let resupdateSSSTransferMehtodDetails = await dbOpration.updateSSSTransferMehtodDetails(
            localDB.tableName.tblSSSDetails,
            type,
            dateTime,
            temp,
            data.recordID
        )
        this.setState( {
            arr_History: temp,
            data: state_data
        } )
        console.log( { resupdateSSSTransferMehtodDetails } );
    }

    goBack() {
        const { navigation } = this.props;
        navigation.pop();
        // navigation.state.params.onSelect( { selected: true } );
    }

    render() {
        //array
        let { data } = this.state;
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.goBack() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Trusted Contact</Text>
                            </Button>
                        </View>
                        <View style={ { flex: 0.1, margin: 20 } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Some information about the importance of trust with these contacts</Text>
                        </View>
                        <View style={ Platform.OS == "ios" ? { flex: 0.4 } : { flex: 0.5 } }>
                            <View style={ { flex: 1, flexDirection: 'row' } }>
                                <View style={ { flex: 5, alignItems: "flex-end" } }>
                                    { renderIf( data.thumbnailPath != "" )(
                                        <Avatar medium rounded source={ { uri: data.thumbnailPath } } />
                                    ) }
                                    { renderIf( data.thumbnailPath == "" )(
                                        <Avatar medium rounded title={ data.givenName != null && data.givenName.charAt( 0 ) } />
                                    ) }
                                </View>
                                <View style={ { flex: 4.4 } }>
                                    <Button bordered style={ { marginLeft: 10, height: "70%", borderColor: "#D0D0D0" } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#838383" } ] }>Change Contact</Text>
                                    </Button>
                                </View>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", marginRight: 20 } }>
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 17 } ] }>{ data.givenName }{ " " }{ data.familyName }</Text>
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 14, color: data.statusMsgColor } ] }>{ data.statusMsg }</Text>
                            </View>
                        </View>
                        <View style={ { flex: 1 } }>
                            <FlatList
                                data={
                                    this.state.arr_History
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
                        { renderIf( this.state.flag_OtpCodeShowStatus == true )(
                            <View style={ [ Platform.OS == "ios" ? { flex: 0.6 } : { flex: 0.8 }, { marginLeft: 5, marginRight: 5 } ] }>
                                <Text note style={ { textAlign: "center" } }>Some information about the OTP and how it works comes in this space</Text>
                                <View style={ { flex: 0.8, backgroundColor: "#ffffff", borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "center", margin: 10 } }>
                                    <Text note style={ [ globalStyle.ffFiraSansMedium, { flex: 2, marginLeft: 10 } ] }>OTP</Text>
                                    <Text style={ [ globalStyle.ffOpenSansBold, { flex: 8, letterSpacing: 30, alignSelf: "center", textAlign: "center" } ] }>{ this.state.otpCode }</Text>
                                </View>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        let shareOptions = {
                                            title: "OTP",
                                            message: "sss opt:" + this.state.otpCode,
                                            url: "\nhttps://bithyve.com/",
                                            subject: "sss opt " //  for email
                                        };
                                        Share.open( shareOptions )
                                            .then( res => {
                                                console.log( res );
                                            } )
                                    } }
                                    title="Share OTP with Trusted Contact"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10 } ] } />
                            </View>
                        ) }
                        { renderIf( this.state.flag_OtpCodeShowStatus != true )(
                            <View style={ Platform.OS == "ios" ? { flex: 0.6 } : { flex: 0.8 } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Select how you want to share secret with the selected trusted contact</Text>
                                <Button
                                    onPress={ () => {
                                        this.props.navigation.push( "ShareSecretViaQRScreen", { data: data, onSelect: this.onSelect } );
                                    } }
                                    style={ [ globalStyle.ffFiraSansSemiBold, {
                                        backgroundColor: "#838383", borderRadius: 10, margin: 5,
                                        height: 50,
                                    } ] }
                                    full
                                >
                                    <Text>Share secret via QR code</Text>
                                </Button>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.load_data();

                                    } }
                                    title="Share secret email/phone"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10 } ] } />
                            </View>
                        ) }
                        <ModelTrustedContactEmailAndPhoneShare
                            data={ this.state.arr_TrustedContactEmailAndPhoneShare }
                            click_Confirm={ ( val: any ) => {
                                AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( false ) );
                                var messageId = this.state.messageId;
                                if ( messageId != "" ) {
                                    this.click_SentURLSmsOrEmail( val )
                                } else {
                                    this.setState( {
                                        flag_Loading: true
                                    } )
                                    setTimeout( () => {
                                        messageId = this.state.messageId;
                                        if ( messageId != "" ) {
                                            this.setState( {
                                                flag_Loading: false
                                            } );
                                            this.click_SentURLSmsOrEmail( val )
                                        } else {
                                            this.setState( {
                                                flag_Loading: true
                                            } )
                                        }
                                    }, 6000 );
                                }
                            } }
                            closeModal={ () => {
                                this.setState( {
                                    arr_TrustedContactEmailAndPhoneShare: [ {
                                        modalVisible: false,
                                        contactDetails: ""
                                    } ]
                                } )
                            } }
                        />
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
    }
} );
