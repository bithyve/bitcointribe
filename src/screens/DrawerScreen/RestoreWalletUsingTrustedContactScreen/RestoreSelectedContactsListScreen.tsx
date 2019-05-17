import React, { Component } from "react";
import {
    StyleSheet,
    View,
    AsyncStorage,
    Platform,
    Dimensions,
    Image,
    Keyboard,
    StatusBar,
    Linking,
    Alert,
    ImageBackground,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { RkCard } from "react-native-ui-kitten";
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text, Button, Card, CardItem } from 'native-base';
import { StackActions, NavigationActions } from "react-navigation";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { SvgIcon } from "@up-shared/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Modal from 'react-native-modalbox';
import { Avatar } from 'react-native-elements';
import Permissions from 'react-native-permissions'
import SendSMS from 'react-native-sms';
var Mailer = require( 'NativeModules' ).RNMail;


//TODO: Custome Compontes  
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import ModelSelectedContactsList from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelSelectedContactsList";




//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Compontes
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome Object
import {
    colors,
    images,
    localDB,
    asyncStorageKeys
} from "HexaWallet/src/app/constants/Constants";
import utils from "HexaWallet/src/app/constants/Utils";
import Singleton from "HexaWallet/src/app/constants/Singleton";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//localization
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

export default class RestoreSelectedContactsListScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_ModelSelectedContact: [],
            arr_ModelSelectedPersonRequestSent: [],
            arr_SelectedContact: [],
            arr_WalletDetails: [],
            arr_SSSDetails: [],
            selectedIndex: 0

        };
    }
    componentDidMount() {
        this.setState( {
            arr_KeeperInfo: [],
            flag_DisableBtnNext: true
        } )
        if ( Platform.OS == "android" ) {
            Permissions.request( 'readSms' ).then( ( response: any ) => {
                console.log( response );
            } );
        }
    }

    async  componentWillMount() {
        let resSSSDetails = await comFunDBRead.readTblSSSDetails();
        let arr_WalletDetails = await comFunDBRead.readTblWallet();
        console.log( { resSSSDetails } );
        console.log( { arr_WalletDetails } );
        let arr_KeeperInfo = [];
        for ( let i = 0; i < resSSSDetails.length; i++ ) {
            let data = {};
            let fullInfo = resSSSDetails[ i ]
            let keerInfo = JSON.parse( resSSSDetails[ i ].keeperInfo );
            data.thumbnailPath = keerInfo.thumbnailPath;
            data.givenName = keerInfo.givenName;
            data.familyName = keerInfo.familyName;
            data.phoneNumbers = keerInfo.phoneNumbers;
            data.emailAddresses = keerInfo.emailAddresses;
            data.recordID = fullInfo.recordID;
            console.log( fullInfo.sharedDate );
            if ( fullInfo.sharedDate != "" ) {
                data.btnTitle = "Re-Request";
            } else {
                data.btnTitle = "Request";
            }
            arr_KeeperInfo.push( data );
        }
        this.setState( {
            arr_KeeperInfo,
            arr_WalletDetails,
            arr_SSSDetails: resSSSDetails
        } )
    }



    //TODO: model  in request click
    click_Request = async ( item: any, index: number ) => {
        console.log( { item, index } );
        this.setState( {
            arr_SelectedContact: item,
            selectedIndex: index
        } )
        this.refs.modal4.open();
    }

    click_Next() {
        console.log( 'next' );
    }

    click_SentRequest( type: string, val: any ) {
        let walletDetails = this.state.arr_WalletDetails;
        let script = {};
        script.wn = walletDetails.walletType
        var encpScript = utils.encrypt( JSON.stringify( script ), "122334" )
        encpScript = encpScript.split( "/" ).join( "_+_" );
        if ( type == "SMS" ) {
            SendSMS.send( {
                body: 'https://prime-sign-230407.appspot.com/sss/rt/' + encpScript,
                recipients: [ val[ 0 ].number ],
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
        } else if ( type == "EMAIL" ) {
            Mailer.mail( {
                subject: 'Hexa Wallet SSS Restore',
                recipients: [ val[ 0 ].email ],
                body: 'https://prime-sign-230407.appspot.com/sss/rt/' + encpScript,
                isHTML: true,
            }, ( error, event ) => {
                console.log( { event, error } );
                if ( event == "sent" ) {
                    this.refs.modal4.close();
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
                this.refs.modal4.close();
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
        } else {
            this.props.navigation.push( "QRCodeScreen", { data: "newmodelsize", onSelect: this.onSelect } );
            this.refs.modal4.close();
        }

    }

    //TODO: func backQrCodeScreen
    onSelect = ( data: any ) => {
        Alert.alert(
            'Success',
            'Email Sent Completed.',
            [
                {
                    text: 'OK', onPress: () => {
                        this.reloadList( "QR" );
                    }
                },

            ],
            { cancelable: false }
        )
    };

    //TODO: Deep{ling sent then reload data
    reloadList = async ( type: string ) => {
        const dateTime = Date.now();
        let selectedItem = this.state.arr_SSSDetails[ this.state.selectedIndex ];
        //console.log( { selectedItem } );
        var temp = [];
        temp = selectedItem.history;
        let jsondata = {};
        jsondata.title = "Secret Share using " + type.toLowerCase();;
        jsondata.date = utils.getUnixToDateFormat( dateTime );
        temp.push( jsondata );
        let resupdateSSSTransferMehtodDetails = await dbOpration.updateSSSTransferMehtodDetails(
            localDB.tableName.tblSSSDetails,
            type,
            dateTime,
            temp,
            selectedItem.recordId
        )
        if ( resupdateSSSTransferMehtodDetails ) {
            this.componentWillMount();
        }
    }



    render() {
        let flag_DisableBtnNext = this.state.flag_DisableBtnNext;
        let selectedContact = this.state.arr_SelectedContact;
        return (
            <View style={ styles.container }>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 22 : 17, marginLeft: 0 } ] }>Selected Contacts</Text>
                            </Button>
                        </View>

                        <View style={ { flex: 0.1, alignItems: "center", justifyContent: "center" } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>You can request share from the selected contacts</Text>
                        </View>
                        <View
                            style={ {
                                flex: 1,
                                margin: 10
                            } }
                        >
                            <FlatList
                                data={
                                    this.state.arr_KeeperInfo
                                }
                                scrollEnabled={ false }
                                renderItem={ ( { item, index } ) => (
                                    <RkCard
                                        rkType="shadowed"
                                        style={ {
                                            flex: 1,
                                            borderRadius: 8,
                                            marginBottom: 10,
                                        } }
                                    >
                                        <View style={ { flex: 1, backgroundColor: "#ffffff", borderRadius: 8, margin: 10 } }>
                                            <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", borderRadius: 8, } } >
                                                { renderIf( item.thumbnailPath != "" )(
                                                    <Avatar medium rounded source={ { uri: item.thumbnailPath } } />
                                                ) }
                                                { renderIf( item.thumbnailPath == "" )(
                                                    <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                ) }
                                                <View style={ { flexDirection: "column", justifyContent: "center", flex: 2.8 } }>
                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                </View>
                                                <View style={ {
                                                    flex: 1,
                                                    alignItems: 'flex-end',
                                                    justifyContent: 'center'
                                                } }>
                                                    <Button small transparent dark style={ { backgroundColor: "#D0D0D0" } } onPress={ () => this.click_Request( item, index ) }>
                                                        <Text style={ { fontSize: 12, color: "#000000" } }>{ item.btnTitle }</Text>
                                                    </Button>
                                                </View>
                                            </View>
                                        </View>
                                    </RkCard>

                                ) }
                                keyExtractor={ item => item.recordID }
                                extraData={ this.state }
                            />
                        </View>
                        <View style={ { flex: 0.2, justifyContent: "flex-end" } }>
                            <FullLinearGradientButton
                                click_Done={ () => this.click_Next() }
                                title="Next"
                                disabled={ flag_DisableBtnNext }
                                style={ [ flag_DisableBtnNext == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                            />
                        </View>
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

            </View >
        );
    }

}

let styles = StyleSheet.create( {
    container: {
        flex: 1
    },
    viewSetupWallet: {
        flex: 4,
        margin: 10
    },
    viewAppLogo: {
        marginTop: 20,
        flex: 1,
        alignItems: "center",
    },
    imgAppLogo: {
        height: 70,
        width: 70
    },
    txtWhiteColor: {
        color: "#ffffff"
    },
    modal: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    modal4: {
        height: 180
    }

} );
