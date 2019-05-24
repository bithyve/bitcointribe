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
import { SvgIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Contacts from 'react-native-contacts';
import { Avatar } from 'react-native-elements';
import GridView from 'react-native-super-grid';
import Modal from 'react-native-modalbox';
import Permissions from 'react-native-permissions'
import SendSMS from 'react-native-sms';
var Mailer = require( 'NativeModules' ).RNMail;
import TimerCountdown from "react-native-timer-countdown";

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";

export default class ContactSharedSecretList extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_OrignalDetails: [],
            SelectedFakeContactList: [],
            arr_SelectedContact: [],
            messageId: "",
            otp: "",
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
        // console.log( { resSharedSecretList } );
        const dateTime = Date.now();
        const fulldate = Math.floor( dateTime / 1000 );
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
            let otp = eachHistory[ eachHistoryLength - 1 ].otp;
            tempOpt.push( otp )
        }
        console.log( { tempOpt } );
        let temp = [];
        for ( let i = 0; i < resSharedSecretList.length; i++ ) {
            let data = {};
            let keeperInfo = JSON.parse( resSharedSecretList[ i ].keeperInfo );
            let urlScript = JSON.parse( resSharedSecretList[ i ].urlScript )
            let sharedDate = parseInt( resSharedSecretList[ i ].sharedDate );
            //  console.warn( 'sharedDate date =' + sharedDate.toString() + "and full date =" + fulldate.toString() );
            //console.log( 'sharedDate date =' + sharedDate.toString() + " and full date =" + fulldate.toString() );
            var startDate = new Date( fulldate * 1000 );
            var endDate = new Date( sharedDate * 1000 );
            var diff = Math.abs( startDate.getTime() - endDate.getTime() );
            const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
            const seconds: any = Math.floor( diff / 1000 % 60 );
            const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
            if ( totalSec < 540 ) {
                data.totalSec = 540 - totalSec;
                data.opt = tempOpt[ i ];
            }
            data.walletName = urlScript.walletName;
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
        // console.log( { temp } );
        this.setState( {
            data: temp,
            arr_OrignalDetails: temp
        } );
        //TODO: DeepLinking open person contact detail
        let urlScript = utils.getDeepLinkingUrl();
        let urlType = utils.getDeepLinkingType();
        let qrCodeString, walletNa;
        if ( urlType == "SSS Restore SMS/EMAIL" ) {
            let walletName = urlScript.wn;
            let jsonTemp = {}
            for ( let i = 0; i < temp.length; i++ ) {
                if ( temp[ i ].walletName == walletName ) {
                    let data = temp[ i ];
                    // console.log( { data } );
                    if ( flagModelOpen != false ) {
                        this.getMessageId( JSON.parse( data.metaData ) );
                        this.refs.modal4.open();
                    }
                    jsonTemp.thumbnailPath = data.keeperInfo.thumbnailPath;
                    jsonTemp.givenName = data.keeperInfo.givenName;
                    jsonTemp.familyName = data.keeperInfo.familyName;
                    let mobileNo, emial;
                    if ( data.keeperInfo.phoneNumbers.length != 0 ) {
                        mobileNo = data.keeperInfo.phoneNumbers[ 0 ].number;
                    }
                    else if ( item.keeperInfo.emailAddresses.length != 0 ) {
                        emial = item.keeperInfo.emailAddresses[ 0 ].email;
                    } else {
                        mobileNo = "";
                        emial = "";
                    }
                    jsonTemp.phoneNumbers = mobileNo;
                    jsonTemp.emailAddresses = emial;
                    jsonTemp.history = data.history;
                    jsonTemp.sharedDate = data.sharedDate;
                    jsonTemp.metaData = data.metaData;
                    jsonTemp.id = data.id;
                    qrCodeString = data.metaData;
                    walletNa = data.walletName;
                    break;
                } else {
                    Alert.alert( "This Wallet Name recoard not found!" )
                }
            }
            this.setState( {
                arr_SelectedContact: jsonTemp,
                qrCodeString,
                walletName: walletNa,
            } )

        }
    }

    componentDidMount() {
        if ( Platform.OS == "android" ) {
            Permissions.request( 'readSms' ).then( ( response: any ) => {
                console.log( response );
            } );
        }
    }




    press = ( item: any ) => {
        // console.log( { item } );
        let jsonTemp = {}
        this.getMessageId( JSON.parse( item.metaData ) );
        jsonTemp.thumbnailPath = item.keeperInfo.thumbnailPath;
        jsonTemp.givenName = item.keeperInfo.givenName;
        jsonTemp.familyName = item.keeperInfo.familyName;
        let mobileNo, emial;
        if ( item.keeperInfo.phoneNumbers.length != 0 ) {
            mobileNo = item.keeperInfo.phoneNumbers[ 0 ].number;
        }
        else if ( item.keeperInfo.emailAddresses.length != 0 ) {
            emial = item.keeperInfo.emailAddresses[ 0 ].email;
        } else {
            mobileNo = "";
            emial = "";
        }
        jsonTemp.phoneNumbers = mobileNo;
        jsonTemp.emailAddresses = emial;
        jsonTemp.history = item.history;
        jsonTemp.sharedDate = item.sharedDate;
        jsonTemp.metaData = item.metaData;

        jsonTemp.id = item.id;
        jsonTemp.qrCodeString = "Wallet";
        this.setState( {
            arr_SelectedContact: jsonTemp,
            qrCodeString: item.metaData,
            walletName: item.walletName,
        } )
        this.refs.modal4.open();
    }


    //TODO: Generate Message Id
    getMessageId = async ( metaData: any ) => {
        this.setState( {
            flag_Loading: true
        } );
        //    console.log( { metaData } );
        let walletDetails = utils.getWalletDetails();
        //      console.log( { walletDetails } );
        const sss = new S3Service(
            walletDetails.mnemonic
        );
        //        console.log( { sss } );
        const { share, otp } = sss.createTransferShare( metaData );
        //  console.log( { share, otp } );
        const { messageId, success } = await sss.uploadShare( share );

        if ( messageId != "" || messageId != null ) {
            this.setState( {
                messageId,
                otp,
                flag_Loading: false
            } );
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
        let script = {};
        script.mi = this.state.messageId;
        var encpScript = utils.encrypt( JSON.stringify( script ), "122334" )
        encpScript = encpScript.split( "/" ).join( "_+_" );
        this.refs.modal4.close();
        if ( type == "SMS" && this.state.messageId != "" ) {
            SendSMS.send( {
                body: 'https://prime-sign-230407.appspot.com/sss/rta/' + encpScript,
                recipients: [ val != "" ? val : "" ],
                successTypes: [ 'sent', 'queued' ]
            }, ( completed, cancelled, error ) => {
                if ( completed ) {
                    console.log( 'SMS Sent Completed' );
                    setTimeout( () => {
                        Alert.alert(
                            'Success',
                            'SMS Sent Completed.',
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        this.reloadList( "SMS" );
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
        } else if ( type == "EMAIL" && this.state.messageId != "" ) {
            Mailer.mail( {
                subject: 'Hexa Wallet SSS Restore',
                recipients: [ val != "" ? val : "" ],
                body: 'https://prime-sign-230407.appspot.com/sss/rta/' + encpScript,
                isHTML: true,
            }, ( error, event ) => {
                if ( event == "sent" ) {
                    setTimeout( () => {
                        Alert.alert(
                            'Success',
                            'Email Sent Completed.',
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        this.reloadList( "EMAIL" );
                                    }
                                },

                            ],
                            { cancelable: false }
                        )

                    }, 1000 );
                }
            } );
            if ( Platform.OS == "android" ) {
                setTimeout( () => {
                    Alert.alert(
                        'Success',
                        'Email Sent Completed.',
                        [
                            {
                                text: 'OK', onPress: () => {
                                    this.reloadList( "EMAIL" );
                                }
                            },

                        ],
                        { cancelable: false }
                    )
                }, 1000 );
            }
        } else if ( type == "QR" && this.state.messageId != "" ) {
            this.props.navigation.push( "QRCodeScreen", { data: this.state.qrCodeString, walletName: this.state.walletName, onSelect: this.onSelect } );
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
        const fulldate = Math.floor( dateTime / 1000 );
        let selectedItem = this.state.arr_SelectedContact;
        // console.log( { selectedItem } );
        var temp = [];
        if ( selectedItem.history != "" ) {
            temp = JSON.parse( selectedItem.history );
        }
        //  console.log( { temp } );
        let jsondata = {};
        if ( type != "QR" ) {
            jsondata.otp = this.state.otp
        }
        jsondata.title = "Secret Share using " + type.toLowerCase();;
        jsondata.date = utils.getUnixToDateFormat( dateTime );
        temp.push( jsondata );
        // console.log( { temp } );
        let resUpdateHistroyAndSharedDate = await dbOpration.updateHistroyAndSharedDate(
            localDB.tableName.tblTrustedPartySSSDetails,
            temp,
            fulldate,
            selectedItem.id
        );
        if ( resUpdateHistroyAndSharedDate ) {
            this.componentWillMount( false );

        }
    }


    render() {
        let data = this.state.data;
        let selectedContact = this.state.arr_SelectedContact;
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
                            <View style={ { alignItems: "center", justifyContent: "center" } }>
                                { renderIf( item.keeperInfo.thumbnailPath != "" )(
                                    <Avatar medium rounded source={ { uri: item.keeperInfo.thumbnailPath } } />
                                ) }
                                { renderIf( item.keeperInfo.thumbnailPath == "" )(
                                    <Avatar medium rounded title={ item.keeperInfo.givenName != null && item.keeperInfo.givenName.charAt( 0 ) } />
                                ) }
                            </View>
                            <View style={ { flexDirection: "column" } }>
                                <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10 } ] }>{ item.name }</Text>
                                <Text style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10 } ] }>{ item.mobileNo != "" ? item.mobileNo : "Not Number Found!" }</Text>
                                <Text note style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10 } ] }>{ item.walletName }</Text>
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
                                        style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14, color: "gray" } ] }
                                    />
                                ) }
                                { renderIf( typeof item.opt !== "undefined" )(
                                    <Text style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10, fontSize: 14, color: "gray" } ] }>OTP { " " }{ item.opt }</Text>
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
            <IconFontAwe name="emoticon-sad-outline" size={ 40 } color="gray" />
            <Text > No Secret Share recoard found! </Text>
        </View>
        if ( data.length > 0 ) {
            secretList = list
        } else {
            secretList = errorMsg
        }
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => {
                                    let urlScript = utils.getDeepLinkingUrl();
                                    if ( urlScript != "" ) {
                                        utils.setDeepLinkingType( "" );
                                        utils.setDeepLinkingUrl( "" );
                                        this.props.navigation.navigate( 'WalletScreen' );
                                    } else {
                                        this.props.navigation.pop()
                                    }
                                } }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 20 : 17, marginLeft: 0 } ] }>Contacts that have shared secrets</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableOnAndroid
                            extraScrollHeight={ 40 }
                        >
                            <View style={ { flex: 0.2 } }>
                                <View style={ { marginLeft: 10, marginRight: 10, backgroundColor: "#EDEDED", borderRadius: 10 } }>
                                    <Item style={ { borderColor: 'transparent', marginLeft: 10 } }>
                                        <Icon name="ios-search" color="#B7B7B7" />
                                        <Input placeholder="Enter a user name or wallet name"
                                            style={ [ globalStyle.ffFiraSansMedium ] }
                                            placeholderTextColor="#B7B7B7"
                                            onChangeText={ text => this.searchFilterFunction( text ) }
                                            autoCorrect={ false } />
                                    </Item>
                                </View>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, marginRight: 10, marginBottom: 20, textAlign: "center" } ] }>Send trusted friends wallets details.</Text>
                            </View>
                            <View style={ { flex: 1 } }>
                                { secretList }
                            </View>
                        </KeyboardAwareScrollView>
                        <Modal style={ [ styles.modal, styles.modal4 ] } position={ "bottom" } ref={ "modal4" }>
                            <View>
                                <View style={ { flexDirection: 'column', alignItems: "center", marginTop: 10, marginBottom: 15, borderBottomColor: "#EFEFEF", borderBottomWidth: 1 } }>
                                    { renderIf( selectedContact.thumbnailPath != "" )(
                                        <Avatar medium rounded source={ { uri: selectedContact.thumbnailPath } } />
                                    ) }
                                    { renderIf( selectedContact.thumbnailPath == "" )(
                                        <Avatar medium rounded title={ selectedContact.givenName != null && selectedContact.givenName.charAt( 0 ) } />
                                    ) }
                                    <Text style={ { marginBottom: 10 } }>{ selectedContact.givenName + " " + selectedContact.familyName }</Text>
                                </View>

                                <View style={ { alignItems: "center", } }>
                                    <View style={ { flexDirection: "row", marginBottom: 10 } }>
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "SMS", selectedContact.phoneNumbers ) }>
                                            <View style={ { alignItems: "center", marginLeft: "20%", flexDirection: "column" } }>
                                                <SvgIcon
                                                    name="chat"
                                                    color="#37A0DA"
                                                    size={ 35 }
                                                />
                                                <Text style={ { marginTop: 5, fontSize: 12, color: "#006EB1" } }>Via SMS</Text>
                                            </View>

                                        </Button>
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "EMAIL", selectedContact.emailAddresses ) }>
                                            <View style={ { alignItems: "center", marginLeft: "20%", flexDirection: "column" } }>
                                                <SvgIcon
                                                    name="mail-2"
                                                    color="#37A0DA"
                                                    size={ 30 }
                                                />
                                                <Text style={ { marginTop: 5, fontSize: 12, color: "#006EB1" } }>Via Email</Text>
                                            </View>
                                        </Button>
                                        <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.click_SentRequest( "QR", selectedContact.qrCodeString ) }>
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
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } message="Loading" />
            </Container >
        );
    }
}

const primaryColor = colors.appColor;
const darkGrey = "#bdc3c7";
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
