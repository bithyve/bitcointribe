import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, Dimensions } from "react-native";
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
    Segment,
    Icon,
    Tab, Tabs, TabHeading
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { StackActions, NavigationActions } from "react-navigation";
import { QRScannerView } from 'ac-qrcode';



//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import RestoreScanQrCode from "HexaWallet/src/app/custcompontes/OnBoarding/RestoreScanQrCode/RestoreScanQrCode";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";


//TODO: Custome Object
import { colors, images } from "HexaWallet/src/app/constants/Constants";

//Screen
import SelfShareQRCodeScannerScreen1 from "./Screens/SelfShareQRCodeScannerScreen1";
import SelfShareQRCodeScannerScreen2 from "./Screens/SelfShareQRCodeScannerScreen2";
import SelfShareQRCodeScannerScreen3 from "./Screens/SelfShareQRCodeScannerScreen3";
import SelfShareQRCodeScannerScreen4 from "./Screens/SelfShareQRCodeScannerScreen4";
import SelfShareQRCodeScannerScreen5 from "./Screens/SelfShareQRCodeScannerScreen5";
import SelfShareQRCodeScannerScreen6 from "./Screens/SelfShareQRCodeScannerScreen6";
import SelfShareQRCodeScannerScreen7 from "./Screens/SelfShareQRCodeScannerScreen7";
import SelfShareQRCodeScannerScreen8 from "./Screens/SelfShareQRCodeScannerScreen8";





export default class Restore4And5SelfShareQRCodeScannerScreen extends React.Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            selectedIndex: 0,
        } );
    }



    //TODO:click_GotoPermisionScrenn
    click_GotoPermisionScrenn() {
        const resetAction = StackActions.reset( {
            index: 0, // <-- currect active route from actions array
            key: null,
            actions: [
                NavigationActions.navigate( { routeName: "PermissionNavigator" } )
            ]
        } );
        this.props.navigation.dispatch( resetAction );
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

    barcodeReceived1( e: any ) {
        try {
            var result = e.data;
            console.log( { result } );

        } catch ( error ) {
            console.log( error );
        }
    }
    barcodeReceived2( e: any ) {
        try {
            var result = e.data;
            console.log( { result } );

        } catch ( error ) {
            console.log( error );
        }
    }
    barcodeReceived3( e: any ) {
        try {
            var result = e.data;
            console.log( { result } );

        } catch ( error ) {
            console.log( error );
        }
    }
    barcodeReceived4( e: any ) {
        try {
            var result = e.data;
            console.log( { result } );

        } catch ( error ) {
            console.log( error );
        }
    }
    barcodeReceived5( e: any ) {
        try {
            var result = e.data;
            console.log( { result } );

        } catch ( error ) {
            console.log( error );
        }
    }
    barcodeReceived6( e: any ) {
        try {
            var result = e.data;
            console.log( { result } );

        } catch ( error ) {
            console.log( error );
        }
    }
    barcodeReceived7( e: any ) {
        try {
            var result = e.data;
            console.log( { result } );

        } catch ( error ) {
            console.log( error );
        }
    }
    barcodeReceived8( e: any ) {
        try {
            var result = e.data;
            console.log( { result } );

        } catch ( error ) {
            console.log( error );
        }
    }


    render() {

        const scanCode1 = () => (
            <QRScannerView
                hintText=""
                scanBarColor={ colors.appColor }
                cornerColor={ colors.appColor }
                onScanResultReceived={ this.barcodeReceived1.bind( this ) }
                renderTopBarView={ () => this._renderTitleBar() }
                renderBottomMenuView={ () => this._renderMenu() }
            />
        );

        const scanCode2 = () => (
            <QRScannerView
                hintText=""
                scanBarColor={ colors.appColor }
                cornerColor={ colors.appColor }
                onScanResultReceived={ this.barcodeReceived2.bind( this ) }
                renderTopBarView={ () => this._renderTitleBar() }
                renderBottomMenuView={ () => this._renderMenu() }
            />
        );


        const scanCode3 = () => ( <QRScannerView
            hintText=""
            scanBarColor={ colors.appColor }
            cornerColor={ colors.appColor }
            onScanResultReceived={ this.barcodeReceived3.bind( this ) }
            renderTopBarView={ () => this._renderTitleBar() }
            renderBottomMenuView={ () => this._renderMenu() }
        />
        );
        const scanCode4 = () => ( <QRScannerView
            hintText=""
            scanBarColor={ colors.appColor }
            cornerColor={ colors.appColor }
            onScanResultReceived={ this.barcodeReceived4.bind( this ) }
            renderTopBarView={ () => this._renderTitleBar() }
            renderBottomMenuView={ () => this._renderMenu() }
        />
        );
        const scanCode5 = () => ( <QRScannerView
            hintText=""
            scanBarColor={ colors.appColor }
            cornerColor={ colors.appColor }
            onScanResultReceived={ this.barcodeReceived5.bind( this ) }
            renderTopBarView={ () => this._renderTitleBar() }
            renderBottomMenuView={ () => this._renderMenu() }
        />
        );
        const scanCode6 = () => ( <QRScannerView
            hintText=""
            scanBarColor={ colors.appColor }
            cornerColor={ colors.appColor }
            onScanResultReceived={ this.barcodeReceived6.bind( this ) }
            renderTopBarView={ () => this._renderTitleBar() }
            renderBottomMenuView={ () => this._renderMenu() }
        />
        );
        const scanCode7 = () => ( <QRScannerView
            hintText=""
            scanBarColor={ colors.appColor }
            cornerColor={ colors.appColor }
            onScanResultReceived={ this.barcodeReceived7.bind( this ) }
            renderTopBarView={ () => this._renderTitleBar() }
            renderBottomMenuView={ () => this._renderMenu() }
        />
        );
        const scanCode8 = () => ( <QRScannerView
            hintText=""
            scanBarColor={ colors.appColor }
            cornerColor={ colors.appColor }
            onScanResultReceived={ this.barcodeReceived8.bind( this ) }
            renderTopBarView={ () => this._renderTitleBar() }
            renderBottomMenuView={ () => this._renderMenu() }
        />
        );


        //values
        let { selectedIndex } = this.state;

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
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Scan QRCode</Text>
                            </Button>
                        </View>

                        <Tabs locked={ true } page={ selectedIndex } tabBarUnderlineStyle={ { backgroundColor: "none" } }>
                            <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                                <Item disabled={ true }>
                                    <SelfShareQRCodeScannerScreen1 key="qrcode1" />
                                </Item>

                            </Tab>
                            <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                                <SelfShareQRCodeScannerScreen2 key="qrcode2" />
                            </Tab>
                            <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                                <SelfShareQRCodeScannerScreen3 key="qrcode3" />
                            </Tab>
                            <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                                <SelfShareQRCodeScannerScreen4 key="qrcode4" />
                            </Tab>
                            <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                                <SelfShareQRCodeScannerScreen5 key="qrcode5" />
                            </Tab>
                            <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                                <SelfShareQRCodeScannerScreen6 key="qrcode6" />
                            </Tab>
                            <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                                <SelfShareQRCodeScannerScreen7 key="qrcode7" />
                            </Tab>
                            <Tab heading={ <TabHeading><Icon name="radio-button-on" /></TabHeading> }>
                                <SelfShareQRCodeScannerScreen8 key="qrcode8" />
                            </Tab>
                        </Tabs>
                    </ImageBackground>
                </SafeAreaView>
            </Container >
        );
    }
}

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
    }
} );