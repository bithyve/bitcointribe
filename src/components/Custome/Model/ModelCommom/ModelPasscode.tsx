import React, { Component } from 'react';
import { Modal, View, StyleSheet, Image, Platform } from 'react-native';
import { Button, Text } from "native-base";
import CodeInput from "react-native-confirmation-code-input";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as Keychain from "react-native-keychain";




//TODO: Custome Compontes  
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";



//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manage/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    colors,
    images
} from "HexaWallet/src/app/constants/Constants";

import renderIf from "HexaWallet/src/app/constants/validation/renderIf";


interface Props {
    data: [];
    pop: Function;
    closeModal: Function;
    click_Next: Function;
}

export default class ModelPasscode extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            pincode: "",
            success: "Passcode does not match!",
            passcodeStyle: [
                {
                    activeColor: colors.black,
                    inactiveColor: colors.black,
                    cellBorderWidth: 0
                }
            ]
        } );
    }

    componentWillMount() {
        this.componentWillReceiveProps( null )
    }

    componentWillReceiveProps = async ( nextProps: any ) => {
        const credentials = await Keychain.getGenericPassword();
        //console.log( { credentials } );
        this.setState( {
            pincode: credentials.password
        } );
    }

    onFinishCheckingCode = ( isValid: boolean, code: string ) => {
        //console.log( { isValid, code } );
        if ( isValid ) {
            this.setState( {
                status: true,
                passcodeStyle: [
                    {
                        activeColor: colors.black,
                        inactiveColor: colors.black,
                        cellBorderWidth: 0
                    }
                ]
            } );
        } else {
            this.setState( {
                status: false,
                passcodeStyle: [
                    {
                        activeColor: "red",
                        inactiveColor: "red",
                        cellBorderWidth: 1
                    }
                ]
            } );
        }
    }


    onSuccess = async () => {
        this.props.click_Next();
    };


    render() {
        let data = this.props.data.length != 0 ? this.props.data : [];
        let { pincode, passcodeStyle } = this.state;
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
                <View style={ [
                    styles.modalBackground,
                    { backgroundColor: 'rgba(0,0,0,0.7)' }
                ] }>
                    <KeyboardAwareScrollView
                        enableAutomaticScroll
                        automaticallyAdjustContentInsets={ true }
                        keyboardOpeningTime={ 0 }
                        enableOnAndroid={ true }
                        contentContainerStyle={ { flexGrow: 1, backgroundColor: "#ffffff" } }
                    >
                        <View style={ styles.viewAppLogo }>
                            <Image style={ styles.imgAppLogo } source={ images.appIcon } />
                            <Text
                                style={ [ globalStyle.ffFiraSansBold, { color: "#000000", marginTop: 20 } ] }
                            >
                                Welcome to Hexa!
            </Text>
                        </View>
                        <View style={ styles.viewPasscode }>
                            <Text
                                style={ [ globalStyle.ffFiraSansMedium, { marginTop: 10, color: "#8B8B8B" } ] }
                            >
                                Enter Pin{ " " }
                            </Text>
                            <CodeInput
                                ref="codeInputRef1"
                                secureTextEntry
                                keyboardType="numeric"
                                codeLength={ 5 }
                                compareWithCode={ pincode }
                                activeColor={ passcodeStyle[ 0 ].activeColor }
                                inactiveColor={ passcodeStyle[ 0 ].inactiveColor }
                                className="border-box"
                                cellBorderWidth={ passcodeStyle[ 0 ].cellBorderWidth }
                                autoFocus={ true }
                                inputPosition="center"
                                space={ 10 }
                                size={ 55 }
                                codeInputStyle={ { borderRadius: 5, backgroundColor: "#F1F1F1" } }
                                containerStyle={ {
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: Platform.OS == "ios" ? 0 : 40,
                                } }
                                onFulfill={ ( isValid: any, code: any ) => {
                                    //console.log( { isValid, code, pincode } );
                                    this.onFinishCheckingCode( isValid, code )
                                }

                                }
                                type='withoutcharacters'
                            />
                            { renderIf( passcodeStyle[ 0 ].activeColor == "red" )(
                                <Text style={ [ globalStyle.ffFiraSansBookItalic, { color: "red", marginTop: 44 } ] }>{ this.state.success }</Text>
                            ) }
                        </View>
                        <View style={ styles.viewBtnProceed }>
                            <FullLinearGradientButton
                                style={ [
                                    this.state.status == true ? { opacity: 1 } : { opacity: 0.4 },
                                    { borderRadius: 5 } ] }
                                disabled={ this.state.status == true ? false : true }
                                title="Next"
                                click_Done={ () => this.onSuccess() }
                            />
                            <Button
                                onPress={ () => {
                                    this.props.closeModal()
                                } }
                                style={ [ globalStyle.ffFiraSansSemiBold, {
                                    backgroundColor: "#838383", borderRadius: 10, margin: 5,
                                    height: 50,
                                } ] }
                                full>
                                <Text style={ { color: "#ffffff" } }>Close</Text>
                            </Button>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1
    },
    viewAppLogo: {
        flex: 1,
        alignItems: "center",
        marginTop: 50
    },
    imgAppLogo: {
        height: 150,
        width: 150
    },
    viewPasscode: {
        flex: 1,
        alignItems: "center"
    },
    viewBtnProceed: {
        flex: 3,
        justifyContent: "flex-end",
        marginBottom: 20
    }
} );