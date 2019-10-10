import React from "react";
import { StyleSheet, ImageBackground, View, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
import {
    Container,
    Item,
    Input,
    Button,
    Text,
    Icon
} from "native-base";
import { SvgIcon } from "hexaComponent/Icons";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Avatar } from 'react-native-elements';
import Modal from 'react-native-modalbox';
import Permissions from 'react-native-permissions'
import SendSMS from 'react-native-sms';
var Mailer = require( 'NativeModules' ).RNMail;
import TimerCountdown from "react-native-timer-countdown";

//TODO: Custome Pages
import { StatusBar } from "hexaComponent/StatusBar";
import { HeaderTitle } from "hexaComponent/Header";
import { ModelLoader } from "hexaComponent/Loader";





//TODO: Custome StyleSheet Files       
import FontFamily from "hexaComponent/Styles/FontFamily";


//TODO: Custome Alert 
import { AlertSimple } from "hexaComponent/Alert";;
let alert = new AlertSimple();

//TODO: Custome Object
import { colors, images, localDB } from "hexaConstants";
import { renderIf } from "hexaValidation";
var dbOpration = require( "hexaDBOpration" );
var utils = require( "hexaUtils" );

//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );

//TODO: Bitcoin class  
var bitcoinClassState = require( "hexaClassState" );
import { S3Service } from "hexaBitcoin";

export default class ContactSharedSecretList extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_OrignalDetails: [],
            SelectedFakeContactList: [],
            arr_SelectedContact: [],
            arr_ItemSeleted: [],
            messageId: "",
            otp: "",
            key: "",
            arr_EncryptedMetaShare: [],
            qrCodeString: "",
            walletName: "",
            flag_NextBtnDisable: true,
            flag_NextBtnDisable1: false,
            flag_Loading: false,
            flag_MaxItemSeletedof3: true
        } )
    }

    async componentWillMount( flagModelOpen: boolean ) {
        var resSharedSecretList = await comFunDBRead.readTblTrustedPartySSSDetails();
        console.log( { resSharedSecretList } );
        const dateTime = Date.now();
        let history = [];
        for ( let i = 0; i < resSharedSecretList.length; i++ ) {
            if ( resSharedSecretList[ i ].history != "" ) {
                history.push( JSON.parse( resSharedSecretList[ i ].history ) )
            }
            else {
                history.push( [] )
            }
        }
        console.log( { history } );
        //for history get opt
        let tempOpt = [];
        for ( let i = 0; i < history.length; i++ ) {
            let eachHistory = history[ i ];
            let eachHistoryLength = eachHistory.length;
            console.log( { eachHistoryLength } );

            let otp;
            if ( eachHistory[ eachHistoryLength - 1 ] != undefined ) {
                otp = eachHistory[ eachHistoryLength - 1 ].otp;
            } else {
                otp = undefined;
            }
            tempOpt.push( otp )
        }
        console.log( { tempOpt } );
        let temp = [];
        for ( let i = 0; i < resSharedSecretList.length; i++ ) {
            let data = {};
            var keeperInfo = {};
            let decrShare = JSON.parse( resSharedSecretList[ i ].decrShare );
            console.log( { decrShare } );
            let type = resSharedSecretList[ i ].type;
            if ( resSharedSecretList[ i ].keeperInfo != "" ) {
                keeperInfo = JSON.parse( resSharedSecretList[ i ].keeperInfo );
            } else {
                keeperInfo.givenName = decrShare.meta.tag;
                keeperInfo.familyName = "";
                keeperInfo.phoneNumbers = [];
                keeperInfo.thumbnailPath = "";
                keeperInfo.emailAddresses = [];
            }
            // console.log( { keeperInfo } );
            let urlScript = JSON.parse( resSharedSecretList[ i ].urlScript )
            console.log( { urlScript } );
            let sharedDate = parseInt( resSharedSecretList[ i ].sharedDate );
            //  console.warn( 'sharedDate date =' + sharedDate.toString() + "and full date =" + fulldate.toString() );
            //console.log( 'sharedDate date =' + sharedDate.toString() + " and full date =" + fulldate.toString() );
            var startDate = new Date( dateTime );
            var endDate = new Date( sharedDate );
            var diff = Math.abs( startDate.getTime() - endDate.getTime() );
            const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
            const seconds: any = Math.floor( diff / 1000 % 60 );
            const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
            if ( totalSec < 540 ) {
                data.totalSec = 540 - totalSec;
                data.opt = tempOpt[ i ];
            }
            data.resSharedSecretList = resSharedSecretList[ i ];
            data.walletName = type == "Self Share" ? "Self Share (" + urlScript.walletName + ")" : urlScript.walletName;
            data.type = type;
            data.keeperInfo = keeperInfo;
            data.name = keeperInfo.givenName != "" ? keeperInfo.givenName : "" + " " + keeperInfo.familyName != "" ? keeperInfo.familyName : "";
            let number;
            if ( keeperInfo.phoneNumbers.length != 0 ) {
                number = keeperInfo.phoneNumbers[ 0 ].number;
            } else {
                number = "";
            }
            data.mobileNo = number;
            data.history = resSharedSecretList[ i ].history;
            data.sharedDate = resSharedSecretList[ i ].sharedDate;
            data.metaData = resSharedSecretList[ i ].metaData;
            data.id = resSharedSecretList[ i ].id;
            temp.push( data );
        }
        console.log( { temp } );
        this.setState( {
            data: temp,
            arr_OrignalDetails: temp
        } );

        //TODO: DeepLinking open person contact detail
        let urlScript = utils.getDeepLinkingUrl();
        let urlType = utils.getDeepLinkingType();
        if ( urlType == "SSS Restore SMS/EMAIL" ) {
            let message = urlScript.mg;
            alert.simpleOkAction( "Request", message, this.click_RemoveDeeplinkingData );
        }
    }

    click_RemoveDeeplinkingData = () => {
        utils.setDeepLinkingUrl( "" );
        utils.setDeepLinkingType( "" );
    }

    componentDidMount() {
        if ( Platform.OS == "android" ) {
            Permissions.request( 'readSms' ).then( ( response: any ) => {
                console.log( response );
            } );
        }
    }

    load_data = async ( data: any ) => {
        this.setState( {
            flag_Loading: true,
            msg_Loading: "Key genreating"
        } );
        let flag_Loading = true;
        const sss = await bitcoinClassState.getS3ServiceClassState();
        var resGenerateEncryptedMetaShare = await sss.generateEncryptedMetaShare( JSON.parse( data.resSharedSecretList.decrShare ) );
        if ( resGenerateEncryptedMetaShare.status == 200 ) {
            resGenerateEncryptedMetaShare = resGenerateEncryptedMetaShare.data;
        } else {
            alert.simpleOk( "Oops", resGenerateEncryptedMetaShare.err );
        }
        const resEncryptViaOTP = S3Service.encryptViaOTP( resGenerateEncryptedMetaShare.key );
        if ( resEncryptViaOTP.status == 200 || 400 ) {
            const resUploadShare = await sss.uploadShare( resGenerateEncryptedMetaShare.encryptedMetaShare, resGenerateEncryptedMetaShare.messageId );
            console.log( { resUploadShare } );
            if ( resUploadShare.status == 200 ) {
                await bitcoinClassState.setS3ServiceClassState( sss );
                this.setState( {
                    arr_EncryptedMetaShare: resGenerateEncryptedMetaShare,
                    messageId: resGenerateEncryptedMetaShare.messageId,
                    key: resEncryptViaOTP.data.otpEncryptedData,
                    otp: resEncryptViaOTP.data.otp,
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

    press = ( item: any ) => {
        console.log( { item } );
        let type = item.resSharedSecretList.type;
        if ( type == "Self Share" ) {
            this.props.navigation.push( "TrustedPartySelfShareQRCode", { data: item } );
        } else {
            this.load_data( item );
            this.setState( {
                arr_SelectedContact: item.keeperInfo,
                arr_ItemSeleted: item
            } )
            // this.refs.modal4.open();
        }
    }

    //TODO: Searching Contact List
    searchFilterFunction = ( text: string ) => {
        if ( text.length > 0 ) {
            const newData = this.state.data.filter( item => {
                const itemData = `${ item.name != null && item.name.toUpperCase() }   
    ${ item.walletName != null && item.walletName.toUpperCase() }`;
                const textData = text.toUpperCase();
                return itemData.indexOf( textData ) > -1;
            } );
            this.setState( { data: newData } );
        } else {
            this.setState( {
                data: this.state.arr_OrignalDetails
            } )
        }
    };


    //TODO: Deeplinking 
    click_SentRequest( type: string, val: any ) {
        console.log( { val } );
        let walletDetails = utils.getWalletDetails();
        let { key, arr_EncryptedMetaShare } = this.state;
        let script = {};
        script.key = key;
        var encpScript = utils.encrypt( JSON.stringify( script ), "122334" )
        encpScript = encpScript.split( "/" ).join( "_+_" );
        if ( type == "SMS" ) {
            val = val.length != 0 ? val[ 0 ].number : ""
            console.log( { val } );
            SendSMS.send( {
                body: 'https://prime-sign-230407.appspot.com/sss/res/' + encpScript,
                recipients: [ val ],
                successTypes: [ 'sent', 'queued' ]
            }, ( completed, cancelled, error ) => {
                if ( completed ) {
                    this.refs.modal4.close();
                    console.log( 'SMS Sent Completed' );
                    setTimeout( () => {
                        this.refs.modal4.close();
                        this.setState( {
                            flag_OtpCodeShowStatus: true,
                        } )
                        alert.simpleOkActionWithPara( "Success", "SMS Sent Completed.", "SMS", this.reloadList( "SMS" ) );
                    }, 1000 );
                } else if ( cancelled ) {
                    console.log( 'SMS Sent Cancelled' );
                } else if ( error ) {
                    console.log( 'Some error occured' );
                }
            } );
            if ( Platform.OS == "android" ) {
                setTimeout( () => {
                    this.refs.modal4.close();
                    this.setState( {
                        flag_OtpCodeShowStatus: true,
                    } )
                    alert.simpleOkActionWithPara( "Success", "SMS Sent Completed.", "SMS", this.reloadList( "SMS" ) );
                }, 3000 );
            }
        } else if ( type == "EMAIL" ) {
            val = val.length != 0 ? val[ 0 ].email : ""
            Mailer.mail( {
                subject: 'Hexa Wallet SSS Restore',
                recipients: [ val ],
                body: walletDetails.walletType + " hexa wallet returned your secret share. Tap on link to store your secret share back <br/> https://prime-sign-230407.appspot.com/sss/res/" + encpScript,
                isHTML: true,
            }, ( error, event ) => {
                if ( event == "sent" ) {
                    setTimeout( () => {
                        this.refs.modal4.close();
                        this.setState( {
                            flag_OtpCodeShowStatus: true,
                        } );
                        alert.simpleOkActionWithPara( "Success", "Email Sent Completed.", "Email", this.reloadList( "Email" ) );
                    }, 1000 );
                } else {
                    alert.simpleOk( "Oops", error );
                }
            } );
            if ( Platform.OS == "android" ) {
                setTimeout( () => {
                    this.refs.modal4.close();
                    this.setState( {
                        flag_OtpCodeShowStatus: true,
                    } )
                    alert.simpleOkActionWithPara( "Success", "Email Sent Completed.", "Email", this.reloadList( "Email" ) );
                }, 3000 );
            }
        } else if ( type == "QR" ) {
            this.props.navigation.push( "TrsutedPartyQRCode", { data: arr_EncryptedMetaShare } );
            this.refs.modal4.close();
        }
    }



    //TODO: func backQrCodeScreen
    onSelect = ( data: any ) => {
        this.reloadList( "QR" );
    };



    //TODO: Deep{ling sent then reload data
    reloadList = async ( type: string ) => {
        const dateTime = Date.now();
        let selectedItem = this.state.arr_ItemSeleted;
        console.log( { selectedItem } );
        var temp = [];
        if ( selectedItem.history != "" ) {
            temp = JSON.parse( selectedItem.history );
        }
        let jsondata = {};
        if ( type != "QR" ) {
            jsondata.otp = this.state.otp
        }
        jsondata.title = "Secret Share using " + type.toLowerCase();;
        jsondata.date = utils.getUnixToDateFormat( dateTime );
        temp.push( jsondata );
        let resUpdateHistroyAndSharedDate = await dbOpration.updateHistroyAndSharedDate(
            localDB.tableName.tblTrustedPartySSSDetails,
            temp,
            dateTime,
            selectedItem.id
        );
        if ( resUpdateHistroyAndSharedDate ) {
            this.componentWillMount( false );

        }
    }


    render() {
        //array
        let { data, arr_SelectedContact } = this.state;
        let secretList;
        const list = <FlatList
            data={
                data
            }
            showsVerticalScrollIndicator={ false }
            renderItem={ ( { item } ) => (
                <TouchableOpacity style={ {
                } } onPress={ () => {
                    this.press( item )
                } }>
                    <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                        <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                            <View style={ { flex: 0.2, alignItems: "center", justifyContent: "center" } }>
                                { renderIf( item.keeperInfo.thumbnailPath != "" )(
                                    <Avatar medium rounded source={ { uri: item.keeperInfo.thumbnailPath } } />
                                ) }
                                { renderIf( item.keeperInfo.thumbnailPath == "" )(
                                    <Avatar medium rounded title={ item.keeperInfo.givenName != null && item.keeperInfo.givenName.charAt( 0 ) } />
                                ) }
                            </View>
                            <View style={ { flex: 1, flexDirection: "column" } }>
                                <Text style={ [ FontFamily.ffFiraSansMedium, { marginLeft: 10 } ] }>{ item.name }</Text>
                                <Text style={ [ FontFamily.ffFiraSansRegular, { marginLeft: 10 } ] }>{ item.mobileNo != "" ? item.mobileNo : "Not Number!" }</Text>
                                <Text note style={ [ FontFamily.ffFiraSansRegular, { marginLeft: 10 } ] }>{ item.walletName }</Text>
                                { renderIf( typeof item.opt !== "undefined" )(
                                    <TimerCountdown
                                        initialMilliseconds={ item.totalSec * 1000 }
                                        onExpire={ () => this.componentWillMount( false ) }
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
                                        style={ [ FontFamily.ffFiraSansRegular, { marginLeft: 10, fontSize: 14, color: "gray" } ] }
                                    />
                                ) }
                                { renderIf( typeof item.opt !== "undefined" )(
                                    <Text style={ [ FontFamily.ffFiraSansRegular, { marginLeft: 10, fontSize: 14, color: "gray" } ] }>OTP { " " }{ item.opt }</Text>
                                ) }
                            </View>
                            <View style={ { flex: 0.1, alignItems: "center", justifyContent: "center" } } >
                                { renderIf( item.type != "Self Share" )(
                                    <IconFontAwe name="angle-down" style={ { fontSize: 25, marginRight: 10, flex: 0.1 } } />
                                ) }
                                { renderIf( item.type == "Self Share" )(
                                    <IconFontAwe name="angle-right" style={ { fontSize: 25, marginRight: 10, flex: 0.1 } } />
                                ) }
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ) }
            keyExtractor={ item => item.recordID }
            extraData={ this.state }
        />
        let errorMsg = <View style={ { flex: 1, alignItems: "center", justifyContent: "center" } } >
            <Text > No records found! </Text>
        </View>
        if ( data.length > 0 ) {
            secretList = list
        } else {
            secretList = errorMsg
        }

        return (
            <Container>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <HeaderTitle title="Contacts that have shared secrets"
                        pop={ () => {
                            let urlScript = utils.getDeepLinkingUrl();
                            if ( urlScript != "" ) {
                                utils.setDeepLinkingType( "" );
                                utils.setDeepLinkingUrl( "" );
                                this.props.navigation.navigate( 'WalletScreen' );
                            } else {
                                this.props.navigation.pop()
                            }
                        } }
                    />
                    <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                        <KeyboardAwareScrollView
                            enableOnAndroid
                            extraScrollHeight={ 40 }
                        >
                            <View style={ { flex: 0.2 } }>
                                <View style={ { marginLeft: 10, marginRight: 10, backgroundColor: "#EDEDED", borderRadius: 10 } }>
                                    <Item style={ { borderColor: 'transparent', marginLeft: 10 } }>
                                        <Icon name="ios-search" color="#B7B7B7" />
                                        <Input placeholder="Enter a user name or wallet name"
                                            style={ [ FontFamily.ffFiraSansMedium ] }
                                            placeholderTextColor="#B7B7B7"
                                            onChangeText={ text => this.searchFilterFunction( text ) }
                                            autoCorrect={ false } />
                                    </Item>
                                </View>
                                <Text note style={ [ FontFamily.ffFiraSansMedium, { marginLeft: 10, marginRight: 10, marginBottom: 20, textAlign: "center" } ] }>Click on wallet name of trusted contact to send back share</Text>
                            </View>
                            <View style={ { flex: 1 } }>
                                { secretList }
                            </View>
                        </KeyboardAwareScrollView>
                        <Modal style={ [ styles.modal, styles.modal4 ] } position={ "bottom" } ref={ "modal4" }>
                            <View>
                                <View style={ { flexDirection: 'column', alignItems: "center", marginTop: 10, marginBottom: 15, borderBottomColor: "#EFEFEF", borderBottomWidth: 1 } }>
                                    { renderIf( arr_SelectedContact.thumbnailPath != "" )(
                                        <Avatar medium rounded source={ { uri: arr_SelectedContact.thumbnailPath } } />
                                    ) }
                                    { renderIf( arr_SelectedContact.thumbnailPath == "" )(
                                        <Avatar medium rounded title={ arr_SelectedContact.givenName != null && arr_SelectedContact.givenName.charAt( 0 ) } />
                                    ) }
                                    <Text style={ { marginBottom: 10 } }>{ arr_SelectedContact.givenName + " " + arr_SelectedContact.familyName }</Text>
                                </View>

                                <View style={ { alignItems: "center", } }>
                                    <View style={ { flexDirection: "row", marginBottom: 10 } }>
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "SMS", arr_SelectedContact.phoneNumbers ) }>
                                            <View style={ { alignItems: "center", marginLeft: "20%", flexDirection: "column" } }>
                                                <SvgIcon
                                                    name="chat"
                                                    color="#37A0DA"
                                                    size={ 35 }
                                                />
                                                <Text style={ { marginTop: 5, fontSize: 12, color: "#006EB1" } }>Via SMS</Text>
                                            </View>

                                        </Button>
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "EMAIL", arr_SelectedContact.emailAddresses ) }>
                                            <View style={ { alignItems: "center", marginLeft: "20%", flexDirection: "column" } }>
                                                <SvgIcon
                                                    name="mail-2"
                                                    color="#37A0DA"
                                                    size={ 30 }
                                                />
                                                <Text style={ { marginTop: 5, fontSize: 12, color: "#006EB1" } }>Via Email</Text>
                                            </View>
                                        </Button>
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "QR", arr_SelectedContact.qrCodeString ) }>
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
                    </SafeAreaView>
                </ImageBackground>
                <ModelLoader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } message="Loading" />
                <StatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
            </Container >
        );
    }
}


const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
    },
    viewPagination: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30
    },
    viewInputFiled: {
        flex: 3,
        alignItems: "center",
        margin: 10
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    },
    btnNext: {
        position: "absolute",
        bottom: 10,
        width: "100%"

    },
    //Grid View Selected
    gridSelectedList: {
        flex: 1
    },
    modal: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    modal4: {
        height: 180
    }
} );
