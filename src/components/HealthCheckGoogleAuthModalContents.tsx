import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Platform
} from 'react-native';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from "react-native-vector-icons/Ionicons";

export default function HealthCheckGoogleAuthModalContents(props) {

    const [code, setCode] = useState('');
    const [textBox1, setTextBox1] = useState(React.createRef());
    const [textBox2, setTextBox2] = useState(React.createRef());
    const [textBox3, setTextBox3] = useState(React.createRef());

    function onChangeCode(text) {
        let tmpcode = code;
        tmpcode += text;
        setCode(tmpcode);
    }
    return (<View style={{ ...styles.modalContentContainer, height: '100%' }}>
        <View >
            <View style={{ flexDirection: 'row', padding: wp('7%') }}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={styles.modalTitleText}>Health Check{"\n"}Google Authenticator</Text>
                    <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>Enter the first three digits of your 2FA secret{"\n"}key from secure PDF</Text>
                </View>
            </View>
            <View style={{ paddingLeft: wp('6%'), paddingRight: wp('6%'), }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TextInput
                        onChangeText={(text) => { { if (text) textBox2.focus(); } onChangeCode(text); }}
                        onKeyPress={e => {
                            if (e.nativeEvent.key === 'Backspace') {
                                textBox1.focus()
                            }
                        }}
                        maxLength={1}
                        style={styles.textBox}
                        ref={(refs) => { setTextBox1(refs); }}
                        onFocus={() => {
                            if (Platform.OS == "ios") {
                                props.modalRef.current.snapTo(2)
                            }
                        }}
                        onBlur={() => {
                            if (code.length == 0 || code.length == 3 && Platform.OS == "ios") {
                                props.modalRef.current.snapTo(1)
                            }
                        }}
                    />
                    <TextInput
                        onChangeText={(text) => { { if (text) textBox3.focus(); } onChangeCode(text); }}
                        onKeyPress={e => {
                            if (e.nativeEvent.key === 'Backspace') {
                                textBox1.focus()
                            }
                        }}
                        maxLength={1}
                        style={styles.textBox}
                        ref={(refs) => { setTextBox2(refs); }}
                        onFocus={() => {
                            if (Platform.OS == "ios") {
                                props.modalRef.current.snapTo(2)
                            }
                        }}
                    />
                    <TextInput
                        onChangeText={(text) => { { if (text) textBox3.focus(); } onChangeCode(text); }}
                        onKeyPress={e => {
                            if (e.nativeEvent.key === 'Backspace') {
                                textBox2.focus()
                            }
                        }}
                        maxLength={1}
                        style={styles.textBox}
                        ref={(refs) => { setTextBox3(refs); }}
                        onFocus={() => {
                            if (Platform.OS == "ios") {
                                props.modalRef.current.snapTo(2)
                            }
                        }}
                        onBlur={() => {
                            if (code.length == 0 && Platform.OS=="ios") {
                                props.modalRef.current.snapTo(1)
                            }
                        }}
                    />
                </View>
                <Text style={styles.modalInfoText}>Answer 1 + Answer 2 to your secret questions is the{"\n"}password for the PDF</Text>
                <TouchableOpacity
                    disabled={code.length < 3 ? true : false}
                    onPress={() => props.onPressConfirm()}
                    style={styles.questionConfirmButton}
                >
                    <Text style={styles.proceedButtonText}>Confirm</Text>
                </TouchableOpacity>
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
    modalTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18, 812),
        fontFamily: Fonts.FiraSansMedium,
    },
    modalInfoText: {
        marginTop: hp('6%'),
        color: Colors.textColorGrey,
        fontSize: RFValue(12, 812),
        fontFamily: Fonts.FiraSansRegular,
    },
    dropdownBoxText: {
        fontFamily: Fonts.FiraSansRegular,
        fontSize: RFValue(13, 812)
    },
    dropdownBoxModal: {
        borderRadius: 10,
        borderColor: Colors.borderColor,
        borderWidth: 0.5,
        marginTop: hp('1%'),
        width: '100%',
        height: '110%',
        elevation: 10,
        shadowColor: Colors.shadowBlue,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 10 },
        backgroundColor: Colors.white,
        position: 'absolute',
        zIndex: 9999,
        overflow: 'hidden'
    },
    dropdownBoxModalElementView: {
        height: 55,
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15,
    },
    dropdownBox: {
        marginTop: hp('2%'),
        flexDirection: 'row',
        borderWidth: 0.5,
        borderRadius: 10,
        height: 50,
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    dropdownBoxOpened: {
        marginTop: hp('2%'),
        flexDirection: 'row',
        borderWidth: 0.5,
        borderRadius: 10,
        height: 50,
        paddingLeft: 15,
        paddingRight: 15,
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 2, height: 2 },
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    questionConfirmButton: {
        height: wp('13%'),
        width: wp('35%'),
        justifyContent: 'center',
        borderRadius: 8,
        alignItems: 'center',
        elevation: 10,
        shadowColor: Colors.shadowBlue,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 10 },
        backgroundColor: Colors.blue,
        marginTop: hp('6%')
    },
    inputBox: {
        borderWidth: 0.5,
        borderRadius: 10,
        width: wp('85%'),
        height: 50,
        paddingLeft: 15,
        fontSize: RFValue(13, 812),
        color: Colors.textColorGrey,
        fontFamily: Fonts.FiraSansRegular,
    },
    inputBoxFocused: {
        borderWidth: 0.5,
        borderRadius: 10,
        width: wp('85%'),
        height: 50,
        paddingLeft: 15,
        fontSize: RFValue(13, 812),
        color: Colors.textColorGrey,
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 2, height: 2 },
        backgroundColor: Colors.white,
        fontFamily: Fonts.FiraSansRegular,
    },
    proceedButtonText: {
        color: Colors.white,
        fontSize: RFValue(13, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    textBox: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor:
            Colors.borderColor,
        height: 45,
        width: wp('27%'),
        textAlign: "center"
    }
})