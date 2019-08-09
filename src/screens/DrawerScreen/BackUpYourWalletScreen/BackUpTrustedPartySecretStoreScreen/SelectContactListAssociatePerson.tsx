import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
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
    Thumbnail,
    Card,
    CardItem
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Contacts from 'react-native-contacts';
import { Avatar } from 'react-native-elements';
import GridView from 'react-native-super-grid';


//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome Model
import ModelAcceptOrRejectSecret from "HexaWallet/src/app/custcompontes/Model/ModelBackupTrustedContactShareStore/ModelAcceptOrRejectSecret";


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

//TODO: Bitcoin Class
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import HealthStatus from "HexaWallet/src/bitcoin/utilities/sss/HealthStatus";



//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

export default class SelectContactListAssociatePerson extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_ContactList: [],
            arr_SelectedItem: [],
            SelectedFakeContactList: [],
            arr_ModelAcceptOrRejectSecret: [],
            flag_NextBtnDisable: true,
            flag_NextBtnDisable1: false,
            flag_Loading: false,
            flag_MaxItemSeletedof3: true
        } )
    }
    componentWillMount() {
        Contacts.getAll( ( err, contacts ) => {
            if ( err ) {
                throw err;
            }
            //console.log( { contacts } );
            this.setState( {
                data: contacts,
                arr_ContactList: contacts
            } )
        } )
    }

    press = ( item: any ) => {
        // console.log( { item } );  
        let givenName = item.givenName != "" ? item.givenName : "";
        let familyName = item.familyName != "" ? item.familyName : ""
        let name = givenName + " " + familyName;
        //console.log( { name } );
        this.setState( {
            arr_SelectedItem: item,
        } );
        let urlType = utils.getDeepLinkingType();
        Alert.alert(
            'Are you sure?',
            'you want to associate ' + name + '?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log( 'Cancel Pressed' ),
                    style: 'cancel',
                },
                {
                    text: 'Confirm', onPress: () => {
                        if ( urlType == "SSS Recovery SMS/EMAIL" ) {
                            this.props.navigation.push( "TrustedContactAcceptOtpScreen", { data: this.state.arr_SelectedItem } )
                        } else {
                            this.downloadDescShare();
                        }
                    }
                },
            ],
            { cancelable: false },
        );
    }


    goBack = () => {
        utils.setDeepLinkingType( "" );
        utils.setDeepLinkingUrl( "" );
        this.props.navigation.navigate( "TabbarBottom" );
    }

    //TODO: Qrcode Scan SSS Details Download Desc Sahre
    downloadDescShare = async () => {
        this.setState( {
            flag_Loading: true
        } );
        let keeperInfo = this.state.arr_SelectedItem;
        let flag_Loading = true;
        const dateTime = Date.now();
        let urlScriptDetails = utils.getDeepLinkingUrl();
        //console.log( { urlScriptDetails } );  
        let urlScript = {};
        urlScript.walletName = urlScriptDetails.wn;
        urlScript.data = urlScriptDetails.data
        let walletDetails = utils.getWalletDetails();
        const sss = await bitcoinClassState.getS3ServiceClassState();
        let resDownlaodShare = await S3Service.downloadShare( urlScriptDetails.data );
        console.log( { resDownlaodShare } );
        if ( resDownlaodShare.status == 200 ) {
            let regularAccount = await bitcoinClassState.getRegularClassState();
            var resGetWalletId = await regularAccount.getWalletId();
            if ( resGetWalletId.status == 200 ) {
                await bitcoinClassState.setRegularClassState( regularAccount );
                resGetWalletId = resGetWalletId.data;
            } else {
                alert.simpleOk( "Oops", resGetWalletId.err );
            }
            let resTrustedParty = await comFunDBRead.readTblTrustedPartySSSDetails();
            let arr_DecrShare = [];
            for ( let i = 0; i < resTrustedParty.length; i++ ) {
                arr_DecrShare.push( JSON.parse( resTrustedParty[ i ].decrShare ) );
            }

            let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownlaodShare.data.encryptedMetaShare, urlScriptDetails.data, resGetWalletId.walletId, arr_DecrShare );
            if ( resDecryptEncMetaShare.status == 200 ) {
                console.log( { resDecryptEncMetaShare } );
                arr_DecrShare.length != 0 ? arr_DecrShare.push( resDecryptEncMetaShare.data.decryptedMetaShare ) : arr_DecrShare.push( resDecryptEncMetaShare.data.decryptedMetaShare );
                console.log( { arr_DecrShare } );
                const resUpdateHealth = await S3Service.updateHealth( arr_DecrShare );
                console.log( { resUpdateHealth } );
                if ( resUpdateHealth.status == 200 ) {
                    await bitcoinClassState.setS3ServiceClassState( sss );
                    const resTrustedParty = await dbOpration.insertTrustedPartyDetails(
                        localDB.tableName.tblTrustedPartySSSDetails,
                        dateTime,
                        keeperInfo,
                        urlScript,
                        resDecryptEncMetaShare.data.decryptedMetaShare,
                        resDecryptEncMetaShare.data.decryptedMetaShare.meta,
                        resDecryptEncMetaShare.data.decryptedMetaShare.encryptedStaticNonPMDD
                    );
                    if ( resTrustedParty ) {
                        flag_Loading = false;
                        setTimeout( () => {
                            alert.simpleOkAction( "Success", "Share stored successfully", this.goBack );
                        }, 100 );

                    }
                }
            } else {
                flag_Loading = false;
                setTimeout( () => {
                    alert.simpleOk( "Oops", resDecryptEncMetaShare.err );
                }, 100 );

            }
        } else {
            flag_Loading = false;
            setTimeout( () => {
                alert.simpleOk( "Oops", resDownlaodShare.err );
            }, 100 );

        }
        this.setState( {
            flag_Loading
        } )
    }

    //TODO: Searching Contact List
    searchFilterFunction = ( text: string ) => {
        if ( text.length > 0 ) {
            const newData = this.state.data.filter( item => {
                const itemData = `${ item.givenName != null && item.givenName.toUpperCase() }   
    ${ item.familyName != null && item.familyName.toUpperCase() }`;
                const textData = text.toUpperCase();
                return itemData.indexOf( textData ) > -1;
            } );

            this.setState( { data: newData } );
        } else {
            this.setState( {
                data: this.state.arr_ContactList
            } )
        }
    };

    render() {
        return (
            <Container>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <View style={ { marginLeft: 10 } }>
                            <Button
                                transparent
                                onPress={ () => {
                                    utils.setDeepLinkingType( "" );
                                    utils.setDeepLinkingUrl( "" );
                                    this.props.navigation.pop()
                                } }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Contacts</Text>
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
                                        <Input placeholder="Enter a name to begin search"
                                            style={ [ globalStyle.ffFiraSansMedium ] }
                                            placeholderTextColor="#B7B7B7"
                                            onChangeText={ text => this.searchFilterFunction( text ) }
                                            autoCorrect={ false } />
                                    </Item>
                                </View>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, marginRight: 10, marginBottom: 20 } ] }>Search contact</Text>
                            </View>
                            <View style={ { flex: 1 } }>
                                <FlatList
                                    data={
                                        this.state.data
                                    }
                                    showsVerticalScrollIndicator={ false }
                                    renderItem={ ( { item } ) => (
                                        <TouchableOpacity style={ {
                                        } } onPress={ () => {
                                            this.press( item )
                                        } }>
                                            <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                    { renderIf( item.thumbnailPath != "" )(
                                                        <Avatar medium rounded source={ { uri: item.thumbnailPath } } />
                                                    ) }
                                                    { renderIf( item.thumbnailPath == "" )(
                                                        <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                    ) }
                                                    <Text style={ [ globalStyle.ffFiraSansRegular, { alignSelf: "center", marginLeft: 10 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ) }
                                    keyExtractor={ item => item.recordID }
                                    extraData={ this.state }
                                />
                            </View>
                        </KeyboardAwareScrollView>

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
    }
} );
