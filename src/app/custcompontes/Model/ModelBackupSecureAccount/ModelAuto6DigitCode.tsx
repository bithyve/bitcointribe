import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, TextInput } from 'react-native';
import { Button, Icon, Text, Textarea, Form } from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import { SvgIcon } from "@up-shared/components";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//TODO: Custome Object
var utils = require( "HexaWallet/src/app/constants/Utils" );

interface Props {
    data: [];
    closeModal: Function;
    click_Next: Function;
    pop: Function;
}

export default class ModelAuto6DigitCode extends Component<Props, any> {

    constructor ( props: any ) {
        super( props );
        this.state = ( {
            code: "",
            flag_DisableBtnNext: true
        } )
    }

    //TODO: Wallet Name
    ckeckWalletName( val: string ) {
        if ( val.length >= 6 ) {
            this.setState( {
                flag_DisableBtnNext: false,
            } )
        } else if ( val.length < 1 ) {
            this.setState( {
                flag_DisableBtnNext: true
            } )
        }
        else {
            this.setState( {
                flag_DisableBtnNext: true
            } )
        }
    }


    //TODO: Check code
    click_Next() {
        let code = this.state.code;
        if ( code == "123456" ) {
            this.props.click_Next();
        } else {
            Alert.alert(
                "Oops",
                "Please enter correct code.",
                [
                    { text: 'Ok', onPress: () => console.log( 'OK' ) },
                ],
                { cancelable: true }
            )
        }
    }

    render() {
        let data = this.props.data.length != 0 ? this.props.data : [];
        let flag_DisableBtnNext = this.state.flag_DisableBtnNext;
        return (
            <Modal
                transparent
                animationType="fade"
                visible={ data.length != 0 ? data[ 0 ].modalVisible : false }
                onRequestClose={ () =>
                    this.props.closeModal()
                }
            >
                <KeyboardAwareScrollView
                    enableAutomaticScroll
                    automaticallyAdjustContentInsets={ true }
                    keyboardOpeningTime={ 0 }
                    enableOnAndroid={ true }
                    contentContainerStyle={ { flexGrow: 1 } }
                >
                    <View style={ [
                        styles.modalBackground,
                        { backgroundColor: `rgba(0,0,0,0.4)` }
                    ] }>
                        <View style={ styles.viewModelBody }>

                            <View style={ { flexDirection: "row", flex: 0.6 } }>
                                <Button
                                    transparent
                                    onPress={ () => this.props.pop() }
                                >
                                    <SvgIcon name="icon_back" size={ 25 } color="gray" />
                                </Button>
                                <Text style={ [ globalStyle.ffFiraSansMedium, {
                                    fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10,
                                    marginLeft: 20, marginRight: 20
                                } ] }>Enter 6 digit Code</Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                                <View style={ { flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end" } }>
                                    <Text note > Scan the 2FA QR code in Google Authenticator App and enter the generated code your Hexa Wallet.</Text>
                                </View>
                            </View>
                            <View
                                style={ {
                                    flex: 1,
                                } }
                            >
                                <TextInput
                                    style={ [ globalStyle.ffFiraSansMedium, { borderRadius: 8, justifyContent: "center", borderColor: "gray", borderWidth: 0.4, height: 60, textAlign: "center" } ] }
                                    value={ this.state.code }
                                    placeholder="Enter 6 digit code"
                                    placeholderTextColor="#B7B7B7"
                                    keyboardType="default"
                                    autoCapitalize='none'
                                    onChangeText={ ( val ) => {
                                        this.setState( {
                                            code: val
                                        } )
                                        this.ckeckWalletName( val )
                                    } }
                                />
                            </View>
                            <View style={ { flex: 0.5, alignItems: "center", justifyContent: "flex-end" } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>For security reasons please setup the Google Authenticator on another device.</Text>
                            </View>
                            <View style={ { flex: 1, justifyContent: "flex-end" } }>
                                <FullLinearGradientButton
                                    click_Done={ () => {
                                        this.click_Next()
                                    }
                                    }
                                    title="Next"
                                    disabled={ flag_DisableBtnNext }
                                    style={ [ flag_DisableBtnNext == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] }
                                />
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </Modal >
        );
    }
}

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        justifyContent: 'center',

    },
    viewModelBody: {
        flex: utils.getIphoneSize() == "iphone X" ? 0.5 : 0.7,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );