import React, { Component } from 'react';
import { Modal, View, StyleSheet, Platform, Image } from 'react-native';
import {
    Button,
    Text
} from "native-base";
import CodeInput from "react-native-confirmation-code-input";
import { SvgIcon } from "@up-shared/components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";



import { FullLinearGradientButton } from "hexaCustomeLinearGradientButton";
//TODO: Custome StyleSheet Files       
import FontFamily from "hexaStyles";

//TODO: Custome Object
import {
    images,
    colors
} from "hexaConstants";
import { renderIf } from "hexaValidation";



interface Props {
    data: [];
    closeModal: Function;
    click_Next: Function;
    pop: Function;
    click_Request: Function
}
export default class ModelSecureTwoFactorSecretThreeCode extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            secret: "",
            enterSecret: "",
            otp: "",
            message: "First three letter your secure account secret for the PDF",
            passcodeStyle: [
                {
                    activeColor: colors.black,
                    inactiveColor: colors.black,
                    cellBorderWidth: 0
                }
            ],
            success: "Secret does not match!",
            flag_DisableBtnNext: true
        } );
    }

    componentWillReceiveProps( nextProps: any ) {
        let date = Date.now();
        var data = nextProps.data[ 0 ];
        data = data.data[ 0 ];
        if ( data != null ) {
            let secret = data.secret;
            let secretCount = secret.length;
            let secretCode, message;
            //console.log( { secret, secretCount } );
            if ( date % 2 == 0 ) {
                secretCode = secret.substring( 0, 3 );
                message = "First three letter your secure account secret for the PDF";
            } else {
                secretCode = secret.slice( -3 );
                message = "Last three letter your secure account secret for the PDF";
            }
            //console.log( { secretCode } );
            this.setState( {
                secret: secret,
                otp: secretCode,
                message
            } )
        }
    }

    //TODO: Otp enter after
    _onFinishCheckingCode( isValid: boolean, code: any ) {
        if ( isValid ) {
            this.setState( {
                passcodeStyle: [
                    {
                        activeColor: colors.black,
                        inactiveColor: colors.black,
                        cellBorderWidth: 0
                    }
                ],
                flag_DisableBtnNext: false
            } );
        } else {
            this.setState( {
                passcodeStyle: [
                    {
                        activeColor: "red",
                        inactiveColor: "red",
                        cellBorderWidth: 1
                    }
                ],
                flag_DisableBtnNext: true
            } );
        }
    }

    click_Next() {
        this.props.click_Next();
    }

    render() {
        let { passcodeStyle, flag_DisableBtnNext, message, otp } = this.state;
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
                    contentContainerStyle={ { flexGrow: 1 } }
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
                                    hitSlop={ { top: 5, bottom: 8, left: 10, right: 15 } }
                                    onPress={ () => this.props.pop() }
                                >
                                    <SvgIcon name="icon_back" size={ 25 } color="gray" />
                                </Button>
                                <Text style={ [ FontFamily.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }></Text>
                            </View>
                            <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                                <Image source={ images.backupSecureTwoFactorAuto.icon } style={ { width: 80, height: 80, marginTop: -30 } } />
                                <Text style={ [ FontFamily.ffFiraSansMedium, { fontSize: 20 } ] }>Health Check</Text>
                                <Text note style={ [ FontFamily.ffFiraSansMedium, { fontSize: 14, margin: 10 } ] }>Google Authenticator</Text>
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
                                        compareWithCode={ otp }
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
                                        onFulfill={ ( isValid: any, code: any ) =>
                                            this._onFinishCheckingCode( isValid, code )
                                        }
                                        type='withoutcharacters'
                                    />
                                    { renderIf( passcodeStyle[ 0 ].activeColor == "red" )(
                                        <Text style={ [ FontFamily.ffFiraSansBookItalic, { color: "red", marginTop: 5 } ] }>{ this.state.success }</Text>
                                    ) }

                                </View>
                            </View>
                            <View style={ { flex: 0.1, justifyContent: "flex-end" } }>
                                <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center", fontSize: 12, marginBottom: 20 } ] }>{ message }</Text>
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