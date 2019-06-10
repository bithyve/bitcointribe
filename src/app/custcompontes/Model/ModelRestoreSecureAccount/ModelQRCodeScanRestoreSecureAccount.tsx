import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Image, Platform, StatusBar, Dimensions } from 'react-native';
import { Button, Icon, Text } from "native-base";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { QRScannerView } from 'ac-qrcode';
import Permissions from 'react-native-permissions'

var Mailer = require( 'NativeModules' ).RNMail;
import Share from "react-native-share";


//TODO: Custome Compontes  
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import FullLinearGradientIconButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientIconButton";
import { SvgIcon } from "@up-shared/components";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";
//TODO: Custome Object
import {
    colors,
    images
} from "HexaWallet/src/app/constants/Constants";

var utils = require( "HexaWallet/src/app/constants/Utils" );
interface Props {
    data: [];
    pop: Function;
    closeModal: Function;
    click_Next: Function;
}

export default class ModelQRCodeScanRestoreSecureAccount extends Component<Props, any> {

    constructor ( props: any ) {
        super( props )
        this.state = ( {
            flag_NextBtnDisable: true
        } )

    }

    componentDidMount() {
        Permissions.request( 'camera' ).then( ( response: any ) => {
            console.log( { response } );
        } );
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
            console.log( { result } );
            //Alert.alert( result )
            this.props.click_Next();
        } catch ( error ) {
            console.log( error );
        }
    }



    render() {
        let data = this.props.data.length != 0 ? this.props.data : [];
        return (
            <Modal
                transparent
                animationType={ 'fade' }
                visible={ data.length != 0 ? data[ 0 ].modalVisible : false }
                onRequestClose={ () =>
                    this.props.closeModal()
                }
                presentationStyle="fullScreen"
            >
                <StatusBar hidden={ true } />
                <View style={ [
                    styles.modalBackground,
                    { backgroundColor: 'rgba(0,0,0,0.7)' }
                ] }>
                    <View style={ styles.viewHeader }>
                        <Button
                            transparent
                            onPress={ () => this.props.closeModal() }
                            style={ { alignSelf: "flex-end", alignItems: "center", marginRight: 20, height: 40, width: 40 } }
                        >
                            <IconFontAwe name="close" size={ 25 } color="gray" style={ { marginLeft: 10 } } />
                        </Button>
                    </View>
                    <View style={ { flex: 0.8 } }>
                        <Text style={ [ globalStyle.ffFiraSansMedium, {
                            fontSize: 24, color: "#ffffff", textAlign: "center", margin: 20
                        } ] }>Restore { "\n" } Secure Account</Text>
                        <Text style={ { color: "#ffffff", textAlign: "center", fontSize: 14 } }>Step 1</Text>
                    </View>
                    <View style={ { flex: 2 } }>
                        <QRScannerView
                            hintText=""
                            rectHeight={ Dimensions.get( 'screen' ).height / 2.0 }
                            rectWidth={ Dimensions.get( 'screen' ).width - 20 }
                            scanBarColor={ colors.appColor }
                            cornerColor={ colors.appColor }
                            onScanResultReceived={ this.barcodeReceived.bind( this ) }
                            renderTopBarView={ () => this._renderTitleBar() }
                            renderBottomMenuView={ () => this._renderMenu() }
                        />
                    </View>
                    <View style={ { flex: 1, alignItems: "center", justifyContent: "center" } }>
                        <Text style={ { color: "#ffffff", textAlign: "center", fontSize: 18 } }>Scan Secondary xPub</Text>
                        <Text style={ { color: "#ffffff", textAlign: "center", fontSize: 12, margin: 20 } }>Open the PDF and scan the secoundary { "\n" } xPub QR Code</Text>
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1
    },
    viewHeader: {
        flex: 0.1,
        marginTop: 20

    }
} );