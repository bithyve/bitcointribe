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
    ListItem
} from "native-base";
//import BarcodeScanner from "react-native-barcode-scanners";
import { QRScannerView } from 'ac-qrcode';
import { SvgIcon } from "@up-shared/components";



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


//Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";


//TODO: Custome Model
import ModelRestoreAssociateContactListForQRCodeScan from "HexaWallet/src/app/custcompontes/Model/ModelRestoreWalletUsingTrustedContact/ModelRestoreAssociateContactListForQRCodeScan";

//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

export default class QRCodeScanScreen extends React.Component {
    constructor ( props: any ) {
        super( props );

        this.state = ( {
            item: [],
            arr_ModelRestoreAssociateContactList: [],
            recordId: "",
            decryptedShare: ""
        } )

    }


    async  componentDidMount() {
        let resSSSDetails = await comFunDBRead.readTblSSSDetails();
        let arr_KeeperInfo = [];
        for ( let i = 0; i < resSSSDetails.length; i++ ) {
            let data = {};
            let fullInfo = resSSSDetails[ i ]
            if ( fullInfo.acceptedDate == "" ) {
                let keerInfo = JSON.parse( resSSSDetails[ i ].keeperInfo );
                data.thumbnailPath = keerInfo.thumbnailPath;
                data.givenName = keerInfo.givenName;
                data.familyName = keerInfo.familyName;
                data.phoneNumbers = keerInfo.phoneNumbers;
                data.emailAddresses = keerInfo.emailAddresses;
                data.recordId = fullInfo.recordId;
                arr_KeeperInfo.push( data );
            }
        }
        console.log( { arr_KeeperInfo } );
        this.setState( {
            item: arr_KeeperInfo,
        } )
    }



    _renderTitleBar() {
        return (
            <Text></Text>
        );
    }

    _renderMenu() {
        return (
            <Text></Text>
        )
    }

    barcodeReceived( e: any ) {
        try {
            var result = e.data;
            result = JSON.parse( result );
            // console.log( { result } );
            if ( result.type == "SSS Restore" ) {
                utils.setDeepLinkingType( "SSS Restore QR" );
                let item = this.state.item;
                this.setState( {
                    decryptedShare: result.data,
                    arr_ModelRestoreAssociateContactList: [
                        {
                            modalVisible: true,
                            item: item
                        }
                    ],

                } )
                //console.log( { deepLinkPara } );
                //utils.setDeepLinkingUrl( deepLinkPara );
                //this.props.navigation.navigate( 'WalletScreen' );
            }
        } catch ( error ) {
            console.log( error );
        }
    }


    //TODO: GoBack
    click_GoBack() {
        const { navigation } = this.props;
        navigation.goBack();
        navigation.state.params.onSelect( { selected: true } );
    }


    //TODO: Popup select any contact 
    click_UpdateMsg = async () => {
        const dateTime = Date.now();
        let recordId = this.state.recordId;
        let decryptedShare = this.state.decryptedShare;
        const resUpdateSSSRetoreDecryptedShare = await dbOpration.updateSSSRetoreDecryptedShare(
            localDB.tableName.tblSSSDetails,
            JSON.parse( decryptedShare ),
            dateTime,
            recordId
        );
        if ( resUpdateSSSRetoreDecryptedShare == true ) {
            this.click_GoBack();
        } else {
            Alert.alert( resUpdateSSSRetoreDecryptedShare );
        }
    }

    render() {
        return (
            <Container>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <View style={ { marginLeft: 10 } }>
                            <Button
                                transparent
                                hitSlop={{top: 5, bottom: 8, left: 10, right: 15}}
                                onPress={ () => this.click_GoBack() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 22 : 17, marginLeft: 0 } ] }>Selected Contacts</Text>
                            </Button>
                        </View>
                        < QRScannerView
                            hintText=""
                            rectHeight={ Dimensions.get( 'screen' ).height / 2.0 }
                            rectWidth={ Dimensions.get( 'screen' ).width - 20 }
                            scanBarColor={ colors.appColor }
                            cornerColor={ colors.appColor }
                            onScanResultReceived={ this.barcodeReceived.bind( this ) }
                            renderTopBarView={ () => this._renderTitleBar() }
                            renderBottomMenuView={ () => this._renderMenu() }
                        />
                    </ImageBackground>
                </SafeAreaView>
                <ModelRestoreAssociateContactListForQRCodeScan data={ this.state.arr_ModelRestoreAssociateContactList } click_Confirm={ ( recordId: string ) => {
                    this.setState( {
                        recordId,
                        arr_ModelRestoreAssociateContactList: [
                            {
                                modalVisible: false,
                                item: ""
                            }
                        ],
                    } )
                    this.click_UpdateMsg()
                }
                } />
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1
    },

} );
