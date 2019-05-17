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

export default class ContactSharedSecretList extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_OrignalDetails: [],
            SelectedFakeContactList: [],
            arr_SelectedContact: [],
            flag_NextBtnDisable: true,
            flag_NextBtnDisable1: false,
            flag_Loading: false,
            flag_MaxItemSeletedof3: true
        } )
    }

    async componentWillMount() {
        var resSharedSecretList = await comFunDBRead.readTblTrustedPartySSSDetails();
        // console.log( { resSharedSecretList } );
        let temp = [];
        for ( let i = 0; i < resSharedSecretList.length; i++ ) {
            let data = {};
            let allJson = JSON.parse( resSharedSecretList[ i ].allJson );
            let userDetails = JSON.parse( resSharedSecretList[ i ].userDetails )
            data.name = allJson.meta.tag;
            data.walletName = userDetails.name;
            data.m = "+91 9876543210"
            temp.push( data );
        }
        // console.log( { temp } );
        this.setState( {
            data: temp,
            arr_OrignalDetails: temp
        } )

        //TODO: DeepLinking open person contact detail
        let urlScript = utils.getDeepLinkingUrl();
        let urlType = utils.getDeepLinkingType();
        if ( urlType == "SSS Restore SMS/EMAIL" ) {
            let data = {};
            data.thumbnailPath = "";
            data.givenName = "A";
            data.familyName = "B";
            data.phoneNumbers = "+91 987654321";
            data.emailAddresses = "user@gmail.com";
            data.qrCodeString = "Wallet";
            let arr_SelectedContact = data;
            this.setState( {
                arr_SelectedContact
            } )
            this.refs.modal4.open();
        }
    }

    componentDidMount() {
        if ( Platform.OS == "android" ) {
            Permissions.request( 'readSms' ).then( ( response: any ) => {
                console.log( response );
            } );
        }
    }


    press = ( hey: any ) => {
        console.log( { hey } );

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
        script.wn = "Wallet";
        var encpScript = utils.encrypt( JSON.stringify( script ), "122334" )
        encpScript = encpScript.split( "/" ).join( "_+_" );
        this.refs.modal4.close();
        if ( type == "SMS" ) {
            SendSMS.send( {
                body: 'https://prime-sign-230407.appspot.com/sss/rta/' + encpScript,
                recipients: [ val[ 0 ].number ],
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
        } else if ( type == "EMAIL" ) {
            Mailer.mail( {
                subject: 'Hexa Wallet SSS Restore',
                recipients: [ val[ 0 ].email ],
                body: 'https://prime-sign-230407.appspot.com/sss/rta/' + encpScript,
                isHTML: true,
            }, ( error, event ) => {
                console.log( { event, error } );
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
        temp = JSON.parse( selectedItem.history );
        //console.log( { temp } );
        let jsondata = {};
        jsondata.title = "Secret Share using " + type.toLowerCase();;
        jsondata.date = utils.getUnixToDateFormat( dateTime );
        temp.push( jsondata );

        // let resupdateSSSTransferMehtodDetails = await dbOpration.updateSSSTransferMehtodDetails(
        //     localDB.tableName.tblTrustedPartySSSDetails,
        //     type,
        //     dateTime,
        //     temp,
        //     selectedItem.recordId
        // )
        // if ( resupdateSSSTransferMehtodDetails ) {
        //     this.componentWillMount();
        // }
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
                                <Avatar style={ { alignSelf: "center" } } medium rounded title={ item.name.charAt( 0 ) } />
                            </View>
                            <View style={ { flexDirection: "column" } }>
                                <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10 } ] }>{ item.name }</Text>
                                <Text style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10 } ] }>{ item.m }</Text>
                                <Text note style={ [ globalStyle.ffFiraSansRegular, { marginLeft: 10 } ] }>{ item.walletName }</Text>
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
                                onPress={ () => this.props.navigation.pop() }
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
