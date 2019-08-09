import React from "react";
import {
    View,
    ImageBackground,
    Dimensions,
    StatusBar,
    TouchableOpacity,
    TouchableHighlight,
    StyleSheet,
    RefreshControl,
    Platform,
    SafeAreaView,
    FlatList,
    ScrollView,
    Animated,
    LayoutAnimation,
    AsyncStorage,
    Alert
} from "react-native";
import {
    Container,
    Header,
    Title,
    Content,
    Button,
    Left,
    Right,
    Body,
    Text,
    List,
    ListItem,
    Tab, Tabs, TabHeading, Icon,
} from "native-base";
//import BarcodeScanner from "react-native-barcode-scanners";
import { SvgIcon } from "@up-shared/components";
//NsNotification
import BackboneEvents from "backbone-events-standalone";
// global event bus
window.EventBus = BackboneEvents.mixin( {} );



//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome object
import {
    colors,
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
import Singleton from "HexaWallet/src/app/constants/Singleton";


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import RestoreScanQrCode from "HexaWallet/src/app/custcompontes/OnBoarding/RestoreScanQrCode/RestoreScanQrCode"

//Screens
import Restore4And5SelfShareQRCodeScreen1 from "./Screens/Restore4And5SelfShareQRCodeScreen1";
import Restore4And5SelfShareQRCodeScreen2 from "./Screens/Restore4And5SelfShareQRCodeScreen2";
import Restore4And5SelfShareQRCodeScreen3 from "./Screens/Restore4And5SelfShareQRCodeScreen3";
import Restore4And5SelfShareQRCodeScreen4 from "./Screens/Restore4And5SelfShareQRCodeScreen4";
import Restore4And5SelfShareQRCodeScreen5 from "./Screens/Restore4And5SelfShareQRCodeScreen5";
import Restore4And5SelfShareQRCodeScreen6 from "./Screens/Restore4And5SelfShareQRCodeScreen6";
import Restore4And5SelfShareQRCodeScreen7 from "./Screens/Restore4And5SelfShareQRCodeScreen7";
import Restore4And5SelfShareQRCodeScreen8 from "./Screens/Restore4And5SelfShareQRCodeScreen8";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

//Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";


export default class Restore4And5SelfShareQRCodeScanner extends React.Component {
    constructor ( props: any ) {
        super( props );
        this.state = ( {
            data: [],
            title: "",
            type: "",
            arr_Shares: [],
            selectedIndex: 0,

        } )
    }

    componentWillMount() {
        let data = this.props.navigation.getParam( "data" );
        let type = this.props.navigation.getParam( "type" );
        console.log( { data, type } );

        this.setState( {
            data, type
        } )
    }

    //TODO: Click next qrcode click on 
    click_Next( index: number, data: any ) {
        let arr_Shares = this.state.arr_Shares;
        arr_Shares.push.apply( arr_Shares, data )
        this.setState( {
            selectedIndex: index,
            arr_Shares
        } )
    }

    click_Confirm = async ( type: string, data: any ) => {
        const dateTime = Date.now();
        let arr_Shares = this.state.arr_Shares;
        arr_Shares.push.apply( arr_Shares, data );
        console.log( { arr_Shares } );
        var resRecoverMetaShareFromQR = await S3Service.recoverMetaShareFromQR( arr_Shares );
        if ( resRecoverMetaShareFromQR.status == 200 ) {
            resRecoverMetaShareFromQR = resRecoverMetaShareFromQR.data;
            console.log( { resRecoverMetaShareFromQR } );
            let resInsertContactList = await dbOpration.updateRestoreUsingTrustedContactSelfShare(
                localDB.tableName.tblSSSDetails,
                dateTime,
                resRecoverMetaShareFromQR.metaShare,
                type,
                "Good"
            );
            console.log( { resInsertContactList } );
            if ( resInsertContactList ) {
                await comFunDBRead.readTblSSSDetails();
                this.props.navigation.pop( 2 );
            }

        } else {
            alert.simpleOk( "Oops", resRecoverMetaShareFromQR.err );
        }
    }

    render() {
        //values 
        let { selectedIndex, type } = this.state;
        return (
            <Container>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <View style={ { marginLeft: 10 } }>
                        <Button
                            transparent
                            onPress={ () => this.props.navigation.pop() }
                        >
                            <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#ffffff" />
                            <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#ffffff", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Scan QRCode</Text>
                        </Button>
                    </View>
                    <Tabs locked={ true } page={ selectedIndex }>
                        <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                            <Restore4And5SelfShareQRCodeScreen1 type={ type } click_Next={ ( val: number, data: any ) => this.click_Next( val, data ) } />
                        </Tab>
                        <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                            <Restore4And5SelfShareQRCodeScreen2 type={ type } click_Next={ ( val: number, data: any ) => this.click_Next( val, data ) } />
                        </Tab>
                        <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                            <Restore4And5SelfShareQRCodeScreen3 type={ type } click_Next={ ( val: number, data: any ) => this.click_Next( val, data ) } />
                        </Tab>
                        <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                            <Restore4And5SelfShareQRCodeScreen4 type={ type } click_Next={ ( val: number, data: any ) => this.click_Next( val, data ) } />
                        </Tab>
                        <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                            <Restore4And5SelfShareQRCodeScreen5 type={ type } click_Next={ ( val: number, data: any ) => this.click_Next( val, data ) } />
                        </Tab>
                        <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                            <Restore4And5SelfShareQRCodeScreen6 type={ type } click_Next={ ( val: number, data: any ) => this.click_Next( val, data ) } />
                        </Tab>
                        <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                            <Restore4And5SelfShareQRCodeScreen7 type={ type } click_Next={ ( val: number, data: any ) => this.click_Next( val, data ) } />
                        </Tab>
                        <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                            <Restore4And5SelfShareQRCodeScreen8 type={ type } click_Confirm={ ( type: string, data: any ) => this.click_Confirm( type, data ) } />
                        </Tab>
                    </Tabs>
                </SafeAreaView>
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "gray"
    },

} );
