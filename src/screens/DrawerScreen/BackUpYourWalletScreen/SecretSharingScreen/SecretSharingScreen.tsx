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
import IconFontAwe from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Contacts from 'react-native-contacts';
import { Avatar, SearchBar } from 'react-native-elements';
import TimerCountdown from "react-native-timer-countdown";
import moment from "moment";

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );



//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";
import HealthStatus from "HexaWallet/src/bitcoin/utilities/HealthStatus";


export default class SecretSharingScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
        } )
    }

    async componentWillMount() {
        this.willFocusSubscription = this.props.navigation.addListener(
            "willFocus",
            () => {
                setInterval( () => {
                    this.connection_Load()
                }, 10000 )
            }
        );
    }




    componentWillUnmount() {
        this.willFocusSubscription.remove();
    }

    connection_Load = async () => {
        const resultWallet = await utils.getWalletDetails();
        const resSSSDetails = await utils.getSSSDetails();
        console.log( { resSSSDetails } );

        let encrShares = [];
        for ( let i = 0; i < resSSSDetails.length; i++ ) {
            encrShares.push( resSSSDetails[ i ].share )
        }
        let updateShareIdStatus = await comAppHealth.connection_AppHealthStatus( parseInt( resultWallet.lastUpdated ), 0, encrShares, resultWallet.mnemonic );
        console.log( { updateShareIdStatus } );
        if ( updateShareIdStatus ) {
            var data = await dbOpration.readTablesData(
                localDB.tableName.tblSSSDetails
            );
            data = data.temp;
            console.log( { data } );
            const dateTime = Date.now();
            const fulldate = Math.floor( dateTime / 1000 );
            let temp = [];
            for ( let i = 0; i < data.length; i++ ) {
                let jsondata = JSON.parse( data[ i ].keeperInfo );
                jsondata.history = JSON.parse( data[ i ].history );
                let sharedDate = parseInt( data[ i ].sharedDate );
                // console.warn( 'sharedDate date =' + sharedDate.toString() + "and full date =" + fulldate.toString() );
                // var startDate = new Date( utils.getUnixToDateFormat( fulldate ) );
                // var endDate = new Date( utils.getUnixToDateFormat( sharedDate ) );
                var startDate = new Date( fulldate * 1000 );
                var endDate = new Date( sharedDate * 1000 );
                //console.warn( 'sart date =' + startDate.toString() + "end date = " + endDate.toString() )
                var diff = Math.abs( startDate.getTime() - endDate.getTime() );
                //console.warn( 'diff' + diff.toString() );  
                const minutes: any = Math.floor( ( diff / 1000 ) / 60 );
                const seconds: any = Math.floor( diff / 1000 % 60 );
                //console.log( { minutes, seconds } );
                //console.warn( minutes.toString() )
                const totalSec = parseInt( minutes * 60 ) + parseInt( seconds );
                //console.log( { totalSec } );  
                jsondata.totalSec = 540 - totalSec;
                if ( totalSec < 540 && data[ i ].shareStage == "Ugly" ) {
                    jsondata.statusMsg = "Shared";
                    jsondata.statusMsgColor = "#C07710";
                    jsondata.flag_timer = true;
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
            console.log( { data, temp } );
            this.setState( {
                data: temp
            } );
        } else {
            Alert.alert( "ShareId status not changed." )
        }
    }

    //TODO: func click_Item
    click_Item = ( item: any ) => {
        this.props.navigation.push( "TrustedContactScreen", {
            data: item
        } );
    }
    render() {
        return (
            <Container>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => {
                                    let resSSSDetails = utils.getSSSDetails();
                                    if ( resSSSDetails[ 0 ].keeperInfo != "" ) {
                                        this.props.navigation.pop();
                                    } else {
                                        this.props.navigation.navigate( "TabbarBottom" );
                                    }
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
                                                    <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 16 } ] }>{ item.givenName }{ " " }{ item.familyName }</Text>
                                                    <View style={ { flexDirection: "row" } }>
                                                        <Text style={ [ globalStyle.ffFiraSansMedium, { marginLeft: 10, fontSize: 14, color: item.statusMsgColor } ] }>{ item.statusMsg }</Text>
                                                        { renderIf( item.flag_timer )(
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
                        <View style={ { flex: 0.14, alignItems: "center" } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Some information about the importance of trust with these contacts</Text>
                        </View>
                    </ImageBackground>
                </SafeAreaView>
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
