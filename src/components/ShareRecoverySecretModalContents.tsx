import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    TextInput,
    Platform
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function ShareRecoverySecretModalContents(props) {
    const [passcode, setPasscode] = useState("");
    const correctPasscode = "aaaaaa";
    function onPressNumber(text) {
        let tmpPasscode = passcode;
        if (passcode.length < 6) {
            tmpPasscode += text;
            setPasscode(tmpPasscode);
        }
    }
    return (<View style={{ ...styles.modalContentContainer, height: '100%' }}>
        <View style={{ height: '100%' }}>
            <View style={{ marginTop: hp('3.5%'), marginBottom: hp('2%'), }}>
                <Text style={styles.commModeModalHeaderText}>{props.title}</Text>
                <Text style={styles.commModeModalInfoText}>{props.infoText}</Text>
            </View>
            <View style={styles.contactProfileView}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1, backgroundColor: Colors.backgroundColor, height: 80, marginLeft: 60, overflow: 'hidden', position: "relative", borderRadius: 10 }}>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.contactNameText}>{props.name}</Text>
                            <Text style={{
                                color: Colors.textColorGrey,
                                fontFamily: Fonts.FiraSansRegular,
                                fontSize: RFValue(13),
                                marginLeft: 25,
                            }}>{props.contactInfo}</Text>
                        </View>
                        <View style={{ marginRight: 10 }}>
                            <Image source={require('../assets/images/icons/phone-book.png')} style={styles.contactIconImage} />
                        </View>
                    </View>
                    <View style={{ backgroundColor: Colors.white, width: 80, height: 80, borderRadius: 80 / 2, position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../assets/images/icons/pexels-photo.png')} style={styles.contactProfileImage} />
                    </View>
                </View>
            </View>
            <Text style={{ ...styles.commModeModalInfoText, marginBottom: hp('3.5%') }}>{props.sunInfoText}</Text>
            <View style={{ justifyContent: "center", alignItems: 'center', marginBottom: hp('5%'), paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
                {props.shareVia == 'qr' ?
                    <TouchableOpacity onPress={() => props.onPressRequest()} style={{ backgroundColor: Colors.blue, height: wp('13%'), borderRadius: 10, width: wp('50%'), justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.buttonText}>{props.buttonText}</Text>
                    </TouchableOpacity>
                    :
                    <View style={{}}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                            <Text style={{color:Colors.textColorGrey, fontSize:RFValue(11), fontFamily:Fonts.FiraSansRegular}}>Enter OTP</Text>
                            {passcode.length==6 && passcode != correctPasscode ? 
                            <Text style={{color:Colors.red, fontSize:RFValue(10), fontFamily:Fonts.FiraSansMediumItalic}}>Incorrect OTP, Try Again</Text>: null}
                        </View>
                        <View style={styles.passcodeTextInputView}>
                            <TextInput
                                maxLength={1}
                                autoCorrect={false}
                                autoFocus={false}
                                keyboardType="email-address"
                                ref={input => { this.textInput = input; }}
                                style={[this.textInput && this.textInput.isFocused() ? styles.textBoxActive : styles.textBoxStyles
                                ]}
                                onChangeText={value => {
                                    onPressNumber(value);
                                    if (value) this.textInput2.focus();
                                }}
                                onKeyPress={e => {
                                    if (e.nativeEvent.key === "Backspace") {
                                        this.textInput.focus();
                                    }
                                }}
                                onFocus={() => {
                                    if (Platform.OS == "ios") {
                                        props.modalRef.current.snapTo(2)
                                    }
                                }}
                                onBlur={() => {
                                    if ((passcode.length == 0 || passcode.length == 6) && Platform.OS == "ios") {
                                        props.modalRef.current.snapTo(1)
                                    }
                                }}
                            />

                            <TextInput
                                maxLength={1}
                                autoCorrect={false}
                                autoFocus={false}
                                keyboardType="email-address"
                                ref={input => { this.textInput2 = input; }}
                                style={[this.textInput2 && this.textInput2.isFocused() ? styles.textBoxActive : styles.textBoxStyles
                                ]}
                                onChangeText={value => {
                                    onPressNumber(value);
                                    if (value) this.textInput3.focus();
                                }}
                                onKeyPress={e => {
                                    if (e.nativeEvent.key === "Backspace") {
                                        this.textInput.focus();
                                    }
                                }}
                                onFocus={() => {
                                    if (Platform.OS == "ios") {
                                        props.modalRef.current.snapTo(2);
                                    }
                                }}
                            />

                            <TextInput
                                maxLength={1}
                                autoCorrect={false}
                                autoFocus={false}
                                keyboardType="email-address"
                                ref={input => { this.textInput3 = input; }}
                                style={[this.textInput3 && this.textInput3.isFocused() ? styles.textBoxActive : styles.textBoxStyles
                                ]}
                                onChangeText={value => {
                                    onPressNumber(value);
                                    if (value) this.textInput4.focus();
                                }}
                                onKeyPress={e => {
                                    if (e.nativeEvent.key === "Backspace") {
                                        this.textInput2.focus();
                                    }
                                }}
                                onFocus={() => {
                                    if (Platform.OS == "ios") {
                                        props.modalRef.current.snapTo(2);
                                    }
                                }}
                            />

                            <TextInput
                                maxLength={1}
                                autoCorrect={false}
                                autoFocus={false}
                                keyboardType="email-address"
                                ref={input => { this.textInput4 = input; }}
                                style={[this.textInput4 && this.textInput4.isFocused() ? styles.textBoxActive : styles.textBoxStyles
                                ]}
                                onChangeText={value => {
                                    onPressNumber(value);
                                    if (value) this.textInput5.focus();
                                }}
                                onKeyPress={e => {
                                    if (e.nativeEvent.key === "Backspace") {
                                        this.textInput3.focus();
                                    }
                                }}
                                onFocus={() => {
                                    if (Platform.OS == "ios") {
                                        props.modalRef.current.snapTo(2);
                                    }
                                }}
                            />

                            <TextInput
                                maxLength={1}
                                autoCorrect={false}
                                autoFocus={false}
                                keyboardType="email-address"
                                ref={input => { this.textInput5 = input; }}
                                style={[this.textInput5 && this.textInput5.isFocused() ? styles.textBoxActive : styles.textBoxStyles
                                ]}
                                onChangeText={value => {
                                    onPressNumber(value);
                                    if (value) this.textInput6.focus();
                                }}
                                onKeyPress={e => {
                                    if (e.nativeEvent.key === "Backspace") {
                                        this.textInput4.focus();
                                    }
                                }}
                                onFocus={() => {
                                    if (Platform.OS == "ios") {
                                        props.modalRef.current.snapTo(2);
                                    }
                                }}
                            />
                            <TextInput
                                maxLength={1}
                                autoCorrect={false}
                                autoFocus={false}
                                keyboardType="email-address"
                                ref={input => { this.textInput6 = input; }}
                                style={[this.textInput6 && this.textInput6.isFocused() ? styles.textBoxActive : styles.textBoxStyles
                                ]}
                                onChangeText={value => {
                                    onPressNumber(value);
                                }}
                                onKeyPress={e => {
                                    if (e.nativeEvent.key === "Backspace") {
                                        this.textInput5.focus();
                                    }
                                }}
                                onFocus={() => {
                                    if (Platform.OS == "ios") {
                                        props.modalRef.current.snapTo(2);
                                    }
                                }}
                                onBlur={() => {
                                    if (Platform.OS == "ios" && passcode.length == 0) {
                                        props.modalRef.current.snapTo(1);
                                    }
                                }}
                            />
                        </View>
                    </View>
                }
            </View>
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    modalContentContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        borderTopLeftRadius: 10,
        borderLeftColor: Colors.borderColor,
        borderLeftWidth: 1,
        borderTopRightRadius: 10,
        borderRightColor: Colors.borderColor,
        borderRightWidth: 1,
        borderTopColor: Colors.borderColor,
        borderTopWidth: 1,
    },
    commModeModalHeaderText: {
        color: Colors.blue,
        fontFamily: Fonts.FiraSansMedium,
        fontSize: RFValue(18),
        marginLeft: 25,
        marginRight: 25
    },
    commModeModalInfoText: {
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(11),
        marginLeft: 25,
        marginRight: 25,
        // marginTop: hp('0.7%')
    },
    contactProfileView: {
        flexDirection: 'row',
        marginLeft: 25,
        marginRight: 25,
        alignItems: 'center',
        justifyContent: "space-between",
        marginBottom: hp('3.5%'),
        marginTop: hp('1.7%')
    },
    contactProfileImage: {
        width: 70,
        height: 70,
        resizeMode: 'cover',
        borderRadius: 70 / 2
    },
    contactNameText: {
        color: Colors.black,
        fontSize: RFValue(25),
        fontFamily: Fonts.FiraSansRegular,
        marginLeft: 25
    },
    contactIconImage: {
        width: 20,
        height: 20,
        resizeMode: 'cover',
    },
    buttonInnerView: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('30%'),
    },
    buttonImage: {
        width: 20,
        height: 20,
        resizeMode: "contain"
    },
    buttonText: {
        color: Colors.white,
        fontSize: RFValue(13),
        fontFamily: Fonts.FiraSansMedium,
    },
    passcodeTextInputView: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: hp("2.5%"),
        marginBottom: hp("2.5%")
    },
    textBoxStyles: {
        borderWidth: 0.5,
        height: wp("12%"),
        width: wp("12%"),
        borderRadius: 7,
        borderColor: Colors.borderColor,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
        marginLeft: 8,
        color: Colors.black,
        fontSize: RFValue(13),
        textAlign: "center",
        lineHeight: 18
    },
    textBoxActive: {
        borderWidth: 0.5,
        height: wp("12%"),
        width: wp("12%"),
        borderRadius: 7,
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 3 },
        borderColor: Colors.borderColor,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
        marginLeft: 8,
        color: Colors.black,
        fontSize: RFValue(13),
        textAlign: "center",
        lineHeight: 18
    },
})