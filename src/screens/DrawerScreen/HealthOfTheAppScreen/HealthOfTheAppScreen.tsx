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
    List, ListItem,
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Permissions from 'react-native-permissions';
import { Avatar } from 'react-native-elements';
import TimerCountdown from "react-native-timer-countdown";
var converter = require( 'number-to-words' );


//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome model  
import ModelBackupYourWallet from "HexaWallet/src/app/custcompontes/Model/ModelBackupYourWallet/ModelBackupYourWallet";
import ModelFindYourTrustedContacts from "HexaWallet/src/app/custcompontes/Model/ModelFindYourTrustedContacts/ModelFindYourTrustedContacts";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );


//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );


export default class HealthOfTheAppScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            arr_TrustedContacts: [],
            arr_Mnemonic: [],
            arr_MnemonicDetails: [],
            arr_SecretQuestion: [],
            arr_QuestionAndAnswerDetails: [],
            arr_2FactorAuto: [],
            arr_SecureAccountDetials: [],
            arr_ModelBackupYourWallet: [],
            arr_ModelFindYourTrustedContacts: [],
            flag_isTrustedContacts: true,
            flag_isSetupTrustedContact: false,
            flag_isMnemonic: false,
            flag_isSecretQuestions: true,
            flag_isTwoFactor: true,
            flag_Loading: true
        } )
    }

    async componentWillMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {
                // this.setState( {
                //     flag_Loading: true
                // } )  
                this.loaddata();
            }
        );
    }
    componentWillUnmount() {
        this.willFocusSubscription.remove();
    }

    loaddata = async () => {
        let walletDetails = await utils.getWalletDetails();
        var resAccountDetails = await comFunDBRead.readTblAccount();
        let backupType = JSON.parse( walletDetails.appHealthStatus );
        let sssDetails = await utils.getSSSDetails();
        // console.log( { walletDetails, sssDetails } );
        let flag_isSetupTrustedContact, flag_isMnemonic;
        let encrShares = [];
        let history = [];
        let tempOpt = [];
        let temp = [];
        //Trusted Contacts
        if ( sssDetails.length > 0 ) {
            if ( sssDetails[ 0 ].keeperInfo == "" ) {
                flag_isSetupTrustedContact = true;
            } else {
                flag_isSetupTrustedContact = false;
                //Trusted Contacts list
                for ( let i = 0; i < sssDetails.length; i++ ) {
                    encrShares.push( sssDetails[ i ].share )
                    history.push( JSON.parse( sssDetails[ i ].history ) )
                }
                //for history get opt
                for ( let i = 0; i < history.length; i++ ) {
                    let eachHistory = history[ i ];
                    let eachHistoryLength = eachHistory.length;
                    let otp = eachHistory[ eachHistoryLength - 1 ].otp;
                    tempOpt.push( otp )
                }
                //console.log( parseInt( walletDetails.lastUpdated ) );
                let updateShareIdStatus = await comAppHealth.connection_AppHealthStatus( parseInt( walletDetails.lastUpdated ), 0, encrShares, walletDetails.mnemonic );
                // console.log( { updateShareIdStatus } );
                if ( updateShareIdStatus ) {
                    var data = await dbOpration.readTablesData(
                        localDB.tableName.tblSSSDetails
                    );
                    data = data.temp;
                    //console.log( { data } );
                    const dateTime = Date.now();
                    //const fulldate = Math.floor( dateTime / 1000 );
                    for ( let i = 0; i < data.length; i++ ) {
                        let jsondata = JSON.parse( data[ i ].keeperInfo );
                        jsondata.history = JSON.parse( data[ i ].history );
                        let sharedDate = parseInt( data[ i ].sharedDate );
                        // console.warn( 'sharedDate date =' + sharedDate.toString() + "and full date =" + fulldate.toString() );
                        var startDate = new Date( dateTime );
                        var endDate = new Date( sharedDate );
                        //console.warn( 'sart date =' + startDate.toString() + "end date = " + endDate.toString() )
                        var diff = Math.abs( startDate.getTime() - endDate.getTime() );
                        //console.warn( 'diff' + diff.toString() );  
                        const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
                        const seconds: any = Math.floor( diff / 1000 % 60 );
                        //console.log( { minutes, seconds } );
                        //console.warn( minutes.toString() )
                        const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
                        let mesData = data[ i ];
                        //  console.log( { totalSec, mesData } );
                        jsondata.totalSec = 540 - totalSec;
                        if ( totalSec < 540 && data[ i ].shareStage == "Ugly" ) {
                            jsondata.statusMsg = "Shared";
                            jsondata.statusMsgColor = "#C07710";
                            jsondata.flag_timer = true;
                            jsondata.opt = tempOpt[ i ];
                        } else if ( totalSec >= 540 && data[ i ].shareStage == "Ugly" ) {
                            jsondata.statusMsg = "Shared OTP expired.";
                            jsondata.statusMsgColor = "#C07710";
                            jsondata.flag_timer = false;
                        } else if ( data[ i ].shareStage == "Good" ) {
                            jsondata.statusMsg = "Share accessible";
                            jsondata.statusMsgColor = "#008000";
                            jsondata.flag_timer = false;
                        } else if ( data[ i ].shareStage == "Bad" ) {
                            jsondata.statusMsg = "Share accessible";
                            jsondata.statusMsgColor = "#C07710";
                            jsondata.flag_timer = false;
                        } else if ( data[ i ].shareStage == "Ugly" && data[ i ].sharedDate != "" ) {
                            jsondata.statusMsg = "Share not accessible";
                            jsondata.statusMsgColor = "#ff0000";
                            jsondata.flag_timer = false;
                        }
                        else {
                            jsondata.statusMsg = "Not shared";
                            jsondata.statusMsgColor = "#ff0000";
                            jsondata.flag_timer = false;
                        }
                        temp.push( jsondata )
                    }
                } else {
                    Alert.alert( "ShareId status not changed." )
                }
            }
        } else {
            flag_isMnemonic = true;
        }
        //Mnemonic
        if ( backupType.backupType != "share" ) {
            flag_isMnemonic = true;
        } else {
            flag_isMnemonic = false;
        }
        let arr_Mnemonic = [
            {
                title: "Mnemonic",
                subTitle: "Not backed up",
                color: "#ff0000",
                icon: "shield"
            }
        ];
        let dbMnemonic = walletDetails.mnemonic;
        let arr_CheckMnemonic = dbMnemonic.split( ' ' );
        let arr_randomNo = utils.getRandomBetweenNumber( 1, arr_CheckMnemonic.length );
        console.log( { arr_CheckMnemonic, arr_randomNo } );
        let arr_MnemonicNumbers = [ converter.toOrdinal( arr_randomNo[ 0 ] ), converter.toOrdinal( arr_randomNo[ 1 ] ), converter.toOrdinal( arr_randomNo[ 2 ] ) ]
        let arr_MnemoicWords = [ arr_CheckMnemonic[ arr_randomNo[ 0 ] - 1 ], arr_CheckMnemonic[ arr_randomNo[ 1 ] - 1 ], arr_CheckMnemonic[ arr_randomNo[ 2 ] - 1 ] ]
        var arr_MnemonicDetails = [];
        arr_MnemonicDetails = [ arr_MnemonicNumbers, arr_MnemoicWords ];
        console.log( { arr_MnemonicDetails } );


        //Secret Questions  
        let arr_SecretQuestion = [
            {
                title: "First Secret Question",
                subTitle: "Not backed up",
                color: "#ff0000",
                icon: "shield"
            }
        ];
        //Secure Two Factor Auto
        let arr_2FactorAuto = [
            {
                title: "2 Factor Aunthentication",
                subTitle: "Not backed up",
                color: "#ff0000",
                icon: "shield"
            }
        ];
        //Two Factor Autoentication
        let secureAdditionalInfo = JSON.parse( resAccountDetails[ 1 ].additionalInfo );
        let arr_SecureAccountDetials = [ {
            secret: secureAdditionalInfo[ 0 ].setupData.secret
        } ];
        // console.log( { arr_SecureAccountDetials } );
        let setUpWalletAnswerDetails = JSON.parse( walletDetails.setUpWalletAnswerDetails );
        // console.log( { setUpWalletAnswerDetails } );


        this.setState( {
            flag_isSetupTrustedContact,
            arr_Mnemonic,
            arr_MnemonicDetails,
            flag_isMnemonic,
            arr_TrustedContacts: temp,
            arr_SecretQuestion,
            arr_2FactorAuto,
            arr_SecureAccountDetials,
            arr_QuestionAndAnswerDetails: setUpWalletAnswerDetails[ 0 ],
            flag_Loading: false
        } )
    }

    //TODO: func click_Item
    click_Item = ( item: any ) => {
        this.props.navigation.push( "TrustedContactNavigator", {
            data: item
        } );
    }

    //TODO: func click_FirstMenuItem
    click_SecretQuestion( item: any ) {
        this.props.navigation.push( "BackupSecretQuestionsScreen", { data: this.state.arr_QuestionAndAnswerDetails } );
    }

    //TODO: click_SetupTrustedContacts
    click_SetupTrustedContacts() {
        this.setState( {
            arr_ModelBackupYourWallet: [
                {
                    modalVisible: true
                }
            ]
        } )
    }


    //TODO: Setup Two Factor 
    click_TwoFactorSetup() {
        this.props.navigation.push( "BackupSecureTwoFactorAutoScreen", { data: this.state.arr_SecureAccountDetials } );
    }


    //Mnemonic click
    click_MnemoicItem() {
        this.props.navigation.push( "HealthCheckMnemonicScreen", { data: this.state.arr_MnemonicDetails } );
    }

    render() {
        let { flag_isTrustedContacts, flag_isSetupTrustedContact, flag_isMnemonic, flag_isSecretQuestions, flag_isTwoFactor, flag_Loading } = this.state;
        let { arr_TrustedContacts } = this.state;
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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Health of the App</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            { renderIf( flag_isMnemonic != true )(
                                <View style={ styles.viewTrustedContacts }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Trusted Contacts</Text>
                                    </View>
                                    { renderIf( flag_isSetupTrustedContact != true )(
                                        <View style={ { flex: 1 } }>
                                            <FlatList
                                                data={
                                                    arr_TrustedContacts
                                                }
                                                showsVerticalScrollIndicator={ false }
                                                renderItem={ ( { item } ) => (
                                                    <TouchableOpacity style={ {
                                                    } } onPress={ () => {
                                                        this.click_Item( item )
                                                    } }>
                                                        <View style={ { flex: 1, backgroundColor: "#ffffff", marginLeft: 10, marginRight: 10, marginBottom: 10, borderRadius: 10 } }>
                                                            <View style={ { flex: 1, flexDirection: 'row', backgroundColor: "#ffffff", margin: 5, borderRadius: 10 } } >
                                                                { renderIf( item.thumbnailPath != "" )(
                                                                    <Avatar medium rounded source={ { uri: item.thumbnailPath } } />
                                                                ) }
                                                                { renderIf( item.thumbnailPath == "" )(
                                                                    <Avatar medium rounded title={ item.givenName != null && item.givenName.charAt( 0 ) } />
                                                                ) }
                                                                <View style={ { flexDirection: "column", justifyContent: "center" } }>
                                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                                    <View style={ { flexDirection: "row" } }>
                                                                        <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>{ item.statusMsg }</Text>
                                                                        { renderIf( typeof item.opt !== "undefined" )(
                                                                            <TimerCountdown
                                                                                initialMilliseconds={ item.totalSec * 1000 }
                                                                                onExpire={ () => this.connection_Load() }
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
                                                                                style={ { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } }
                                                                            />
                                                                        ) }
                                                                    </View>
                                                                    { renderIf( typeof item.opt !== "undefined" )(
                                                                        <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>OTP { " " }{ item.opt }</Text>
                                                                    ) }
                                                                </View>
                                                                <View style={ {
                                                                    flex: 1,
                                                                    alignItems: 'flex-end',
                                                                    justifyContent: 'center'
                                                                } }>
                                                                    <SvgIcon name="icon_share" size={ 25 } color={ primaryColor } />
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                ) }
                                                keyExtractor={ item => item.recordID }
                                                extraData={ this.state }
                                            />
                                        </View>
                                    ) }
                                    { renderIf( flag_isSetupTrustedContact == true )(
                                        <TouchableOpacity
                                            onPress={ () => this.click_SetupTrustedContacts() }
                                        >
                                            <View style={ { flex: 0.00 } }>
                                                <RkCard
                                                    rkType="shadowed"
                                                    style={ {
                                                        flex: 1,
                                                        borderRadius: 8,
                                                        marginLeft: 8,
                                                        marginRight: 8,
                                                        marginBottom: 4,
                                                    } }
                                                >
                                                    <View
                                                        rkCardHeader
                                                        style={ {
                                                            flex: 1,
                                                        } }
                                                    >
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                            <IconFontAwe
                                                                name="address-book"
                                                                color="#BABABA"
                                                                size={ 30 }
                                                            />
                                                        </View>
                                                        <View style={ { flex: 1, flexDirection: "column" } }>
                                                            <Text
                                                                style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                            >
                                                                Setup Trusted Contacts
                                                </Text>
                                                            <Text note numberOfLines={ 1 } style={ { fontSize: 11 } }>Please first setup trusted contacts.</Text>
                                                        </View>
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                            <SvgIcon
                                                                name="icon_forword"
                                                                color="#BABABA"
                                                                size={ 20 }
                                                            />
                                                        </View>
                                                    </View>
                                                </RkCard>
                                            </View>
                                        </TouchableOpacity>
                                    ) }
                                </View>
                            ) }
                            { renderIf( flag_isMnemonic == true )(
                                <View style={ styles.viewMnemonic }>
                                    <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                        <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Mnemonic</Text>
                                    </View>
                                    <View style={ { flex: 1 } }>
                                        <FlatList
                                            data={ this.state.arr_Mnemonic }
                                            showsVerticalScrollIndicator={ false }
                                            scrollEnabled={ false }
                                            renderItem={ ( { item } ) => (
                                                <TouchableOpacity
                                                    onPress={ () => this.click_MnemoicItem() }
                                                >
                                                    <RkCard
                                                        rkType="shadowed"
                                                        style={ {
                                                            flex: 1,
                                                            borderRadius: 8,
                                                            marginLeft: 8,
                                                            marginRight: 8,
                                                            marginBottom: 4,
                                                        } }
                                                    >
                                                        <View
                                                            rkCardHeader
                                                            style={ {
                                                                flex: 1,
                                                            } }
                                                        >
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                                <SvgIcon
                                                                    name={ item.icon }
                                                                    color="#BABABA"
                                                                    size={ 30 }
                                                                />
                                                            </View>
                                                            <View style={ { flex: 1, flexDirection: "column" } }>
                                                                <Text
                                                                    style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                                >
                                                                    { item.title }
                                                                </Text>
                                                                <Text note numberOfLines={ 1 } style={ { fontSize: 11, color: item.color } }>{ item.subTitle }</Text>
                                                            </View>
                                                            <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                                <SvgIcon
                                                                    name="icon_forword"
                                                                    color="#BABABA"
                                                                    size={ 20 }
                                                                />
                                                            </View>
                                                        </View>
                                                    </RkCard>
                                                </TouchableOpacity>
                                            ) }
                                            keyExtractor={ ( item, index ) => index }
                                        />
                                    </View>
                                </View>
                            ) }
                            <View style={ styles.viewSecretQuestion }>
                                <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                    <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Secret Questions</Text>
                                </View>
                                <View style={ { flex: 1 } }>
                                    <FlatList
                                        data={ this.state.arr_SecretQuestion }
                                        showsVerticalScrollIndicator={ false }
                                        scrollEnabled={ false }
                                        renderItem={ ( { item } ) => (
                                            <TouchableOpacity
                                                onPress={ () => this.click_SecretQuestion( item ) }
                                            >
                                                <RkCard
                                                    rkType="shadowed"
                                                    style={ {
                                                        flex: 1,
                                                        borderRadius: 8,
                                                        marginLeft: 8,
                                                        marginRight: 8,
                                                        marginBottom: 4,
                                                    } }
                                                >
                                                    <View
                                                        rkCardHeader
                                                        style={ {
                                                            flex: 1,
                                                        } }
                                                    >
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                            <SvgIcon
                                                                name={ item.icon }
                                                                color="#BABABA"
                                                                size={ 30 }
                                                            />
                                                        </View>
                                                        <View style={ { flex: 1, flexDirection: "column" } }>
                                                            <Text
                                                                style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                            >
                                                                { item.title }
                                                            </Text>
                                                            <Text note numberOfLines={ 1 } style={ { fontSize: 11, color: item.color } }>{ item.subTitle }</Text>
                                                        </View>
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                            <SvgIcon
                                                                name="icon_forword"
                                                                color="#BABABA"
                                                                size={ 20 }
                                                            />
                                                        </View>
                                                    </View>
                                                </RkCard>
                                            </TouchableOpacity>
                                        ) }
                                        keyExtractor={ ( item, index ) => index }
                                    />
                                </View>
                            </View>

                            <View style={ styles.view2FactorAuto }>
                                <View style={ { flex: 0.1, marginLeft: 10, marginTop: 10, marginBottom: 10 } }>
                                    <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, marginLeft: 0 } ] }>Secure Wallet Two-Factor Autoentication</Text>
                                </View>
                                <View style={ { flex: 1 } }>
                                    <FlatList
                                        data={ this.state.arr_2FactorAuto }
                                        showsVerticalScrollIndicator={ false }
                                        scrollEnabled={ false }
                                        renderItem={ ( { item } ) => (
                                            <TouchableOpacity
                                                onPress={ () => this.click_TwoFactorSetup() }
                                            >
                                                <RkCard
                                                    rkType="shadowed"
                                                    style={ {
                                                        flex: 1,
                                                        borderRadius: 8,
                                                        marginLeft: 8,
                                                        marginRight: 8,
                                                        marginBottom: 4,
                                                    } }
                                                >
                                                    <View
                                                        rkCardHeader
                                                        style={ {
                                                            flex: 1,
                                                        } }
                                                    >
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                                                            <SvgIcon
                                                                name={ item.icon }
                                                                color="#BABABA"
                                                                size={ 30 }
                                                            />
                                                        </View>
                                                        <View style={ { flex: 1, flexDirection: "column" } }>
                                                            <Text
                                                                style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                                                            >
                                                                { item.title }
                                                            </Text>
                                                            <Text note numberOfLines={ 1 } style={ { fontSize: 11, color: item.color } }>{ item.subTitle }</Text>
                                                        </View>
                                                        <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                                                            <SvgIcon
                                                                name="icon_forword"
                                                                color="#BABABA"
                                                                size={ 20 }
                                                            />
                                                        </View>
                                                    </View>
                                                </RkCard>
                                            </TouchableOpacity>
                                        ) }
                                        keyExtractor={ ( item, index ) => index }
                                    />
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
                    <ModelBackupYourWallet data={ this.state.arr_ModelBackupYourWallet }
                        click_UseOtherMethod={ () => alert( 'working' ) }
                        click_Confirm={ async () => {
                            await Permissions.request( 'contacts' ).then( ( response: any ) => {
                                console.log( response );
                            } );
                            this.setState( {
                                arr_ModelBackupYourWallet: [
                                    {
                                        modalVisible: false
                                    }
                                ],
                                arr_ModelFindYourTrustedContacts: [
                                    {
                                        modalVisible: true
                                    }
                                ]
                            } );
                        } }
                        closeModal={ () => {
                            this.setState( {
                                arr_ModelBackupYourWallet: [
                                    {
                                        modalVisible: false
                                    }
                                ]
                            } )
                        } }
                    />
                    <ModelFindYourTrustedContacts
                        data={ this.state.arr_ModelFindYourTrustedContacts }
                        click_Confirm={ () => {
                            this.setState( {
                                arr_ModelFindYourTrustedContacts: [
                                    {
                                        modalVisible: false
                                    }
                                ]
                            } )
                            let resSSSDetails = utils.getSSSDetails();
                            if ( resSSSDetails[ 0 ].keeperInfo != "" ) {
                                this.props.navigation.push( "BackUpYourWalletSecoundTimeNavigator" );
                            } else {
                                this.props.navigation.push( "BackUpYourWalletNavigator" )
                            }
                        } }
                        closeModal={ () => {
                            this.setState( {
                                arr_ModelFindYourTrustedContacts: [
                                    {
                                        modalVisible: false
                                    }
                                ]
                            } )
                        } }
                    />
                </SafeAreaView>
                <Loader loading={ flag_Loading } color={ colors.appColor } size={ 30 } />
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
    viewTrustedContacts: {
        flex: 1,
        justifyContent: "center",

    },
    viewMnemonic: {
        flex: 1
    },
    viewSecretQuestion: {
        flex: 1
    },
    view2FactorAuto: {
        flex: 1
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    }
} );
