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
            arr_WalletDetails: []
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
        console.log( { arr_WalletDetails } );
        let arr_KeeperInfo = [];
        for ( let i = 0; i < resSSSDetails.length; i++ ) {
            arr_KeeperInfo.push( JSON.parse( resSSSDetails[ i ].keeperInfo ) )
        }
        this.setState( {
            arr_KeeperInfo,
            arr_WalletDetails
        } )
    }



    //TODO: model  in request click
    click_Request = async ( item: any ) => {
        console.log( { item } );
        this.setState( {
            arr_SelectedContact: item
        } )
        // this.setState( {
        //     arr_ModelSelectedPersonRequestSent: [
        //         {
        //             modalVisible: true,
        //             item: {
        //                 name: item.givenName + " " + item.familyName,
        //                 thumbnailPath: item.thumbnailPath,
        //                 url: "http://bithyve.com"
        //             }
        //         }
        //     ]
        // } )  
        this.refs.modal4.open();
    }

    click_Next() {
        console.log( 'next' );
    }

    click_SentRequest( type: string, val: any ) {
        let script = {};
        script.mo = "hello"
        var encpScript = utils.encrypt( JSON.stringify( script ), "122334" )
        encpScript = encpScript.split( "/" ).join( "_+_" );
        if ( type == "SMS" ) {
            SendSMS.send( {
                body: 'https://prime-sign-230407.appspot.com/sss/rt/' + encpScript,
                recipients: [ val[ 0 ].number ],
                successTypes: [ 'sent', 'queued' ]
            }, ( completed, cancelled, error ) => {
                if ( completed ) {
                    console.log( 'SMS Sent Completed' );
                    setTimeout( () => {
                        Alert.alert( 'SMS Sent Completed' );
                        this.refs.modal4.close();
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
                if ( event == "sent" ) {
                    setTimeout( () => {
                        Alert.alert( 'Email Sent Completed' );
                        this.refs.modal4.close();
                    }, 1000 );
                }
            } );
        } else {
            this.props.navigation.push( "QRCodeScreen", { data: "newmodelsize", onSelect: this.onSelect } );
            this.refs.modal4.close();
        }
    }

    //TODO: func backQrCodeScreen
    onSelect = ( data: any ) => {
        console.log( { data } );

    };



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
                                renderItem={ ( { item } ) => (
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
                                                    <Button small transparent dark style={ { backgroundColor: "#D0D0D0" } } onPress={ () => this.click_Request( item ) }>
                                                        <Text style={ { fontSize: 12, color: "#000000" } }>Request</Text>
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
