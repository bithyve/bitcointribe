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
import ImageSVG from 'react-native-remote-svg';
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
import { colors, images, localDB, svgIcon } from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Bitcoin Class
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";

export default class TrustedContactScreen extends React.Component<any, any> {

    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_TrustedContactEmailAndPhoneShare: [],
            arr_History: [],
            arr_resSSSDetails: [],
            arr_EncryptedMetaShare: [],
            key: "",
            otpCode: "",
            flag_OtpCodeShowStatus: false,
            flag_Loading: false,
            msg_Loading: "Loading"
        } )
    }

    async componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        console.log( { data } );

        //otp history
        let arrHistory = data.history;
        let eachHistoryLength = arrHistory.length;
        var otp;
        if ( arrHistory[ eachHistoryLength - 1 ] != undefined ) {
            otp = arrHistory[ eachHistoryLength - 1 ].otp;
        } else {
            otp = undefined;
        }
        if ( otp != undefined ) {
            let dateTime = Date.now();
            let sharedDate = parseInt( data.sssDetails.sharedDate );
            var startDate = new Date( dateTime );
            var endDate = new Date( sharedDate );
            console.warn( 'sart date =' + startDate.toString() + "end date = " + endDate.toString() )
            var diff = Math.abs( startDate.getTime() - endDate.getTime() );
            //console.warn( 'diff' + diff.toString() );  
            const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
            const seconds: any = Math.floor( diff / 1000 % 60 );
            //console.log( { minutes, seconds } );
            //console.warn( minutes.toString() )
            const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
            console.log( { totalSec } );
            if ( totalSec < 540 && data.sssDetails.shareStage == "Ugly" || data.sssDetails.shareStage == "Bad" ) {
                this.setState( {
                    flag_OtpCodeShowStatus: true,
                    otpCode: otp
                } )
            }
        }
        console.log( { otp } );

        //tempOpt.push( otp );


        var resSSSDetails = await dbOpration.readSSSTableData(
            localDB.tableName.tblSSSDetails,
            data.recordID
        );
        resSSSDetails = resSSSDetails.temp[ 0 ];
        await utils.setSSSDetailsRecordIDWise( resSSSDetails )
        this.setState( {
            data: data,
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
            msg_Loading: "Key id genreating"
        } );
        let flag_Loading = true;
        let data = this.props.navigation.getParam( "data" );
        console.log( { data } );
        let encryptedMetaShare = data.decryptedShare;
        const sss = await bitcoinClassState.getS3ServiceClassState();
        var resGenerateEncryptedMetaShare = await sss.generateEncryptedMetaShare( data.decryptedShare );
        if ( resGenerateEncryptedMetaShare.status == 200 ) {
            resGenerateEncryptedMetaShare = resGenerateEncryptedMetaShare.data;
        } else {
            alert.simpleOk( "Oops", resGenerateEncryptedMetaShare.err );
        }
        const resEncryptViaOTP = sss.encryptViaOTP( resGenerateEncryptedMetaShare.key );
        if ( resEncryptViaOTP.status == 200 || 400 ) {
            const resUploadShare = await sss.uploadShare( resGenerateEncryptedMetaShare.encryptedMetaShare, resGenerateEncryptedMetaShare.messageId );
            console.log( { resUploadShare } );
            if ( resUploadShare.status == 200 ) {
                await bitcoinClassState.setS3ServiceClassState( sss );
                this.setState( {
                    arr_EncryptedMetaShare: resGenerateEncryptedMetaShare,
                    messageId: resGenerateEncryptedMetaShare.messageId,
                    key: resEncryptViaOTP.data.otpEncryptedData,
                    otpCode: resEncryptViaOTP.data.otp,
                    flag_Loading: false,
                } );
                flag_Loading = false;
                this.refs.modal4.open();
            } else {
                flag_Loading = false;
                setTimeout( () => {
                    alert.simpleOk( "Oops", resUploadShare.err );
                }, 100 );
            }
        } else {
            flag_Loading = false;
            setTimeout( () => {
                alert.simpleOk( "Oops", resEncryptViaOTP.err );
            }, 100 );
        }
        this.setState( {
            flag_Loading
        } );
    }


    //TODO: click on model confirm button 
    click_SentURLSmsOrEmail( type: string, value: any ) {
        // AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( false ) );
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        let walletDetails = utils.getWalletDetails();
        let script = {};
        script.wn = walletDetails.walletType;
        script.key = this.state.key;
        var encpScript = utils.encrypt( JSON.stringify( script ), "122334" )
        encpScript = encpScript.split( "/" ).join( "_+_" );
        console.log( { encpScript } );
        if ( type == "SMS" ) {
            SendSMS.send( {
                body: 'https://prime-sign-230407.appspot.com/sss/bk/' + encpScript,
                recipients: [ value ],
                successTypes: [ 'sent', 'queued' ]
            }, ( completed, cancelled, error ) => {
                if ( completed ) {
                    console.log( 'SMS Sent Completed' );
                    setTimeout( () => {
                        this.setState( {
                            flag_OtpCodeShowStatus: true
                        } );
                        alert.simpleOkActionWithPara( "Success", "SMS Sent Successfully.", this.connection_UpdateSSSDetails( "SMS" ) );
                    }, 1000 );
                } else if ( cancelled ) {
                    console.log( 'SMS Sent Cancelled' );
                } else if ( error ) {
                    console.log( 'Some error occured' );
                }
            } );
            if ( Platform.OS == "android" ) {
                setTimeout( () => {
                    this.setState( {
                        flag_OtpCodeShowStatus: true
                    } );
                    alert.simpleOkActionWithPara( "Success", "SMS Sent Successfully.", this.connection_UpdateSSSDetails( "SMS" ) );
                }, 3000 );
            }
        } else {
            this.connection_UpdateSSSDetails( "EMAIL" );
            Mailer.mail( {
                subject: 'Hexa Wallet SSS Recovery',
                recipients: [ value ],
                body: 'https://prime-sign-230407.appspot.com/sss/bk/' + encpScript,
                isHTML: true,
            }, ( error, event ) => {
                if ( event == "sent" ) {
                    setTimeout( () => {
                        this.setState( {
                            flag_OtpCodeShowStatus: true
                        } );
                        alert.simpleOkActionWithPara( "Success", "Email Sent Completed.", this.connection_UpdateSSSDetails( "Email" ) );
                    }, 1000 );
                } else {
                    alert.simpleOk( "Oops", error );
                }
            } );
            if ( Platform.OS == "android" ) {
                setTimeout( () => {
                    this.setState( {
                        flag_OtpCodeShowStatus: true
                    } );
                    alert.simpleOkActionWithPara( "Success", "Email Sent Completed.", this.connection_UpdateSSSDetails( "Email" ) );
                }, 3000 );
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
        jsondata.date = utils.getUnixToDateFormat2();
        temp.push( jsondata );
        let data = this.props.navigation.getParam( "data" );
        await dbOpration.updateSSSTransferMehtodDetails(
            localDB.tableName.tblSSSDetails,
            type,
            dateTime,
            temp,
            data.recordID
        )
        await comFunDBRead.readTblSSSDetails();
        this.setState( {
            arr_History: temp,
            data: state_data
        } )
    }

    goBack() {
        const { navigation } = this.props;
        navigation.pop();
        navigation.state.params.onSelect( { selected: true } );
    }


    //TODO: share option click
    click_SentRequest( type: string, item: any ) {
        if ( type == "SMS" ) {
            item = item.length != 0 ? item[ 0 ].number : ""
            this.click_SentURLSmsOrEmail( "SMS", item );
        } else if ( type == "EMAIL" ) {
            item = item.length != 0 ? item[ 0 ].email : ""
            this.click_SentURLSmsOrEmail( "EMAIL", item );
        } else {
            let { arr_EncryptedMetaShare } = this.state;
            this.props.navigation.push( "ShareSecretViaQRScreen", { data: arr_EncryptedMetaShare, onSelect: this.onSelect } );
        }
        this.refs.modal4.close();
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
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Health and history of the share will be shared with </Text>
                        </View>
                        <View style={ Platform.OS == "ios" ? { flex: 0.7 } : { flex: 0.8 } }>
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
                        <View style={ { flex: 2 } }>
                            <FlatList
                                data={
                                    this.state.arr_History
                                }
                                showsVerticalScrollIndicator={ false }
                                renderItem={ ( { item } ) => (
                                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                            <View style={ { flex: 0.1 } }>
                                                {/* <ImageSVG
                                                    style={ { width: 60, height: 60 } }
                                                    source={
                                                        svgIcon.common.histroy_Hexa
                                                    }
                                                /> */}
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
                            <View style={ [ Platform.OS == "ios" ? { flex: 1 } : { flex: 1 }, { marginLeft: 5, marginRight: 5 } ] }>
                                <Text note style={ { textAlign: "center" } }>OTP and share expires in 10 minutes</Text>
                                <View style={ { flex: 0.8, backgroundColor: "#ffffff", borderRadius: 5, flexDirection: "row", alignItems: "center", justifyContent: "center", margin: 10 } }>
                                    <Text note style={ [ globalStyle.ffFiraSansMedium, { flex: 2, marginLeft: 10 } ] }>OTP</Text>
                                    <Text style={ [ globalStyle.ffOpenSansBold, { flex: 8, letterSpacing: 30, alignSelf: "center", textAlign: "center" } ] }>{ this.state.otpCode }</Text>
                                    <View style={ { flex: 1, alignItems: "center" } }>
                                        <TouchableOpacity onPress={ () => {
                                            Clipboard.setString( this.state.otpCode );
                                            Toast.show( 'OTP copied.' );
                                        } }
                                        >
                                            <IconFontAwe
                                                name="copy"
                                                size={ 20 }
                                                color="#2F2F2F"

                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.load_data();
                                    } }
                                    title="Reshare Secret"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10 } ] } />
                            </View>
                        ) }
                        { renderIf( this.state.flag_OtpCodeShowStatus != true )(
                            <View style={ Platform.OS == "ios" ? { flex: 0.6 } : { flex: 0.8 } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Select method by which you want to share secret</Text>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.load_data();
                                    } }
                                    title="Share Secret"
                                    disabled={ false }
                                    style={ [ { borderRadius: 10 } ] } />
                            </View>
                        ) }
                        <ModelTrustedContactEmailAndPhoneShare
                            data={ this.state.arr_TrustedContactEmailAndPhoneShare }
                            click_Confirm={ ( val: any ) => {
                                AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( false ) );
                                var messageId = this.state.key;
                                if ( messageId != "" ) {
                                    this.click_SentURLSmsOrEmail( val )
                                } else {
                                    this.setState( {
                                        flag_Loading: true
                                    } )
                                    setTimeout( () => {
                                        messageId = this.state.key;
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
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "SMS", data.phoneNumbers ) }>
                                            <View style={ { alignItems: "center", marginLeft: "20%", flexDirection: "column" } }>
                                                <SvgIcon
                                                    name="chat"
                                                    color="#37A0DA"
                                                    size={ 35 }
                                                />
                                                <Text style={ { marginTop: 5, fontSize: 12, color: "#006EB1" } }>Via SMS</Text>
                                            </View>
                                        </Button>
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "EMAIL", data.emailAddresses ) }>
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
