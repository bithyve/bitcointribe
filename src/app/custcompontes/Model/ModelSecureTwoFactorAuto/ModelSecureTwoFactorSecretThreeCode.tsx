import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Dimensions, Platform, Image } from 'react-native';
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
    Picker,
    Icon
} from "native-base";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import CodeInput from "react-native-confirmation-code-input";
import { SvgIcon } from "@up-shared/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Model
import ModelPasscode from '../ModelCommom/ModelPasscode';


interface Props {
    data: [];
    closeModal: Function;
    click_Next: Function;
    pop: Function;
    click_Request: Function
}

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    images,
    colors
} from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";


let wrongEnterAnswerCount = 0;

export default class ModelSecureTwoFactorSecretThreeCode extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            otp: "",
            passcodeStyle: [
                {
                    activeColor: colors.black,
                    inactiveColor: colors.black,
                    cellBorderWidth: 0
                }
            ],
            flag_DisableBtnNext: true
        } );
    }


    componentWillReceiveProps( nextProps: any ) {
        let data = nextProps.data[ 0 ];
        console.log( { data } );

    }

    //TODO: Otp enter after
    _onFinishCheckingCode( code: any ) {
        console.log( { code } );
        if ( code.length == 3 ) {
            this.setState( {
                otp: code,
                flag_DisableBtnNext: false
            } )
        }
    }

    click_Next() {
        Alert.alert( 'working' );
    }

    render() {
        let { passcodeStyle, flag_DisableBtnNext } = this.state;
        return (
            <Modal
                transparent
                animationType={ 'fade' }
                visible={ this.props.data.length != 0 ? this.props.data[ 0 ].modalVisible : false }
                onRequestClose={ () =>
                    this.props.closeModal()
                }
            >
                <KeyboardAwareScrollView
                    enableAutomaticScroll
                    automaticallyAdjustContentInsets={ true }
                    keyboardOpeningTime={ 0 }
                    enableOnAndroid={ true }
                    contentContainerStyle={ { flexGrow: 0.7 } }
                >
                    <View style={ [
                        styles.modalBackground,
                        { backgroundColor: `rgba(0,0,0,0.4)` }
                    ] }
                    >
                        <View style={ styles.viewModelBody }>
                            <View style={ { flexDirection: "row", flex: 0.5 } }>
                                <Button
                                    transparent
                                    onPress={ () => this.props.pop() }
                                >
                                    <SvgIcon name="icon_back" size={ 25 } color="gray" />
                                </Button>
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }></Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                                <Image source={ images.backupSecureTwoFactorAuto.icon } style={ { width: 80, height: 80, marginTop: -30 } } />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20 } ] }>Health Check</Text>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { fontSize: 14, margin: 10 } ] }>Google Authenticator</Text>
                                <Text note style={ { textAlign: "center" } }>Enter the first three digits of your 2FA secret key from secure PDF</Text>
                                <View style={ styles.viewCodeInput }>
                                    <CodeInput
                                        ref="codeInputRef1"
                                        secureTextEntry
                                        keyboardType="default"
                                        autoCapitalize="sentences"
                                        codeLength={ 3 }
                                        activeColor={ passcodeStyle[ 0 ].activeColor }
                                        inactiveColor={ passcodeStyle[ 0 ].inactiveColor }
                                        className="border-box"
                                        cellBorderWidth={ passcodeStyle[ 0 ].cellBorderWidth }
                                        autoFocus={ false }
                                        inputPosition="center"
                                        space={ 40 }
                                        size={ 47 }
                                        codeInputStyle={ { borderRadius: 5, backgroundColor: "#F1F1F1" } }
                                        containerStyle={ {
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: Platform.OS == "ios" ? 0 : 40,
                                        } }
                                        onFulfill={ ( code: any ) =>
                                            this._onFinishCheckingCode( code )
                                        }
                                        type='withoutcharacters'
                                    />

                                </View>
                            </View>
                            <View style={ { flex: 0.1, justifyContent: "flex-end" } }>
                                <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", fontSize: 12, marginBottom: 20 } ] }>Answer 1+Answer2 to your secret questions is the password for the PDF</Text>
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
        justifyContent: 'center'
    },
    viewModelBody: {
        flex: 0.7,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    },
    viewCodeInput: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",

    },
} );