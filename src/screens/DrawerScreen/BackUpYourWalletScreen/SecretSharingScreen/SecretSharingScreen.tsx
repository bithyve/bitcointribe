import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert, YellowBox } from "react-native";
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
import { Avatar, SearchBar } from 'react-native-elements';
import TimerCountdown from "react-native-timer-countdown";


//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );


//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import HealthStatus from "HexaWallet/src/bitcoin/utilities/HealthStatus";


export default class SecretSharingScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            arr_Histroy: [],
            flag_Loading: false
        } )
    }

    async componentWillMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {

                this.connection_Load()
            }
        );
    }

    componentWillUnmount() {
        this.willFocusSubscription.remove();
    }

    connection_Load = async () => {
        this.setState( {
            flag_Loading: true
        } );
        const resultWallet = await utils.getWalletDetails();
        const resSSSDetails = await comFunDBRead.readTblSSSDetails();
        console.log( { resSSSDetails } );
        let encrShares = [];
        let history = [];
        //for histroy
        for ( let i = 0; i <= 1; i++ ) {
            history.push( JSON.parse( resSSSDetails[ i ].history ) )
        }
        //for 
        for ( let i = 0; i <= 2; i++ ) {
            encrShares.push( resSSSDetails[ i ].shareId )
        }

        //for history get opt
        let tempOpt = [];
        for ( let i = 0; i < 2; i++ ) {
            let eachHistory = history[ i ];
            let eachHistoryLength = eachHistory.length;
            var otp;
            if ( eachHistory[ eachHistoryLength - 1 ] != undefined ) {
                otp = eachHistory[ eachHistoryLength - 1 ].otp;
            } else {
                otp = undefined;
            }
            tempOpt.push( otp );
        }
        //console.log( { tempOpt, encrShares } );
        let updateShareIdStatus = await comAppHealth.connection_AppHealthAndSSSUpdate( parseInt( resultWallet.lastUpdated ), encrShares );
        console.log( { updateShareIdStatus } );
        if ( updateShareIdStatus ) {
            var data = await utils.getSSSDetails();
            const dateTime = Date.now();
            let temp = [];
            for ( let i = 0; i <= 1; i++ ) {
                console.log( { data: data[ i ] } );
                let jsondata = JSON.parse( data[ i ].keeperInfo );
                jsondata.history = JSON.parse( data[ i ].history );
                jsondata.encryptedMetaShare = JSON.parse( data[ i ].encryptedMetaShare );
                let sharedDate = parseInt( data[ i ].sharedDate );
                var startDate = new Date( dateTime );
                var endDate = new Date( sharedDate );
                var diff = Math.abs( startDate.getTime() - endDate.getTime() );
                const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
                const seconds: any = Math.floor( diff / 1000 % 60 );
                const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
                jsondata.totalSec = 540 - totalSec;
                console.log( { jsondata } );
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
            this.setState( {
                data: temp,
                flag_Loading: false
            } );
        } else {
            alert.simpleOk( "Oops", "App Health not update in database." );
        }
    }

    //TODO: func click_Item
    click_Item = ( item: any ) => {
        this.props.navigation.push( "TrustedContactScreen", {
            data: item
        } );
    }
    render() {
        //flag 
        let { flag_Loading } = this.state;
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => {
                                    this.props.navigation.navigate( "HealthOfTheAppNavigator" );
                                } }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Secret Sharing</Text>
                            </Button>
                        </View>
                        <View style={ { flex: 0.1, margin: 20 } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Some information on the functionality of this screen and how a user can come back to this</Text>
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
                                                    <Text numberOfLines={ 1 } style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
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
                                                    <IconFontAwe name="angle-right" style={ { fontSize: 25, marginRight: 10, flex: 0.1 } } />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ) }
                                keyExtractor={ item => item.recordID }
                                extraData={ this.state }
                            />
                        </View>
                        <View style={ { flex: 0.14, alignItems: "center" } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Some information about the importance of trust with these contacts</Text>
                        </View>
                    </ImageBackground>
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
    }
} );
