import React, { useState } from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import CommonStyles from "../common/Styles";
import { RFValue } from "react-native-responsive-fontsize";
import ContactList from "../components/ContactList";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import ToggleSwitch from '../components/ToggleSwitch';
import Ionicons from "react-native-vector-icons/Ionicons";

export default function SettingManagePin(props) {
    const [pin, setPin] = useState('');
    const [pinFlag, setPinFlag] = useState(true);
    function onPressNumber(text) {
        let tmpPasscode = pin;
        if (pin.length < 4) {
            if (text != 'x') {
                tmpPasscode += text;
                setPin(tmpPasscode);
            }
        }
        if (pin && text == 'x') {
            setPin(pin.slice(0, -1));
        }
    }

    const [switchOn, setSwitchOn] = useState(false);
    return (<SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        {/* <View style={CommonStyle.headerContainer}>
          <TouchableOpacity
            style={CommonStyle.headerLeftIconContainer}
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <View style={CommonStyle.headerLeftIconInnerContainer}>
              <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
            </View>
          </TouchableOpacity>
        </View> */}
        <View style={styles.modalContainer}>
            <View style={styles.modalHeaderTitleView}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ height: 30, width: 30, justifyContent: 'center', }}>
                        <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                    </TouchableOpacity>
                    <Text style={styles.modalHeaderTitleText}>{"Manage Pin"}</Text>
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <View style={{}}>
                    <View>
                        <Text style={styles.headerInfoText}>Please enter your <Text style={styles.boldItalicText}>existing pin</Text></Text>
                        <View style={styles.passcodeTextInputView}>
                            <View
                                style={[pin.length == 0 && pinFlag == true ? styles.textBoxActive : styles.textBoxStyles]}>
                                <Text style={[pin.length == 0 && pinFlag == true ? styles.textFocused : styles.textStyles]}>{pin.length >= 1 ? <Text style={{ fontSize: RFValue(10, 812), textAlignVertical: 'center', justifyContent: 'center', alignItems: 'center' }}><FontAwesome size={8} name={'circle'} color={Colors.black} /></Text> : pin.length == 0 && pinFlag == true ? <Text style={styles.passcodeTextInputText}>{"|"}</Text> : ''}</Text>
                            </View>
                            <View
                                style={[pin.length == 1 ? styles.textBoxActive : styles.textBoxStyles]}>
                                <Text style={[pin.length == 1 ? styles.textFocused : styles.textStyles]}>{pin.length >= 2 ? <Text style={{ fontSize: RFValue(10, 812) }}><FontAwesome size={8} name={'circle'} color={Colors.black} /></Text> : pin.length == 1 ? <Text style={styles.passcodeTextInputText}>{"|"}</Text> : ''}</Text>
                            </View>
                            <View
                                style={[pin.length == 2 ? styles.textBoxActive : styles.textBoxStyles]}>
                                <Text style={[pin.length == 2 ? styles.textFocused : styles.textStyles]}>{pin.length >= 3 ? <Text style={{ fontSize: RFValue(10, 812) }}><FontAwesome size={8} name={'circle'} color={Colors.black} /></Text> : pin.length == 2 ? <Text style={styles.passcodeTextInputText}>{"|"}</Text> : ''}</Text>
                            </View>
                            <View
                                style={[pin.length == 3 ? styles.textBoxActive : styles.textBoxStyles]}>
                                <Text style={[pin.length == 3 ? styles.textFocused : styles.textStyles]}>{pin.length >= 4 ? <Text style={{ fontSize: RFValue(10, 812) }}><FontAwesome size={8} name={'circle'} color={Colors.black} /></Text> : pin.length == 3 ? <Text style={styles.passcodeTextInputText}>{"|"}</Text> : ''}</Text>
                            </View>
                        </View>
                    </View>

                </View>
                {
                    pin.length == 4 ? <View style={{ marginTop: 'auto' }}>
                        <TouchableOpacity
                            disabled={pin.length == 4 ? false : true}
                            onPress={() => {
                                props.navigation.state.params._managePinProceed(pin);
                                props.navigation.goBack();
                            }}
                            style={{ ...styles.proceedButtonView, backgroundColor: pin.length == 4 ? Colors.blue : Colors.lightBlue, }}
                        >
                            <Text style={styles.proceedButtonText}>Proceed</Text>
                        </TouchableOpacity></View> : <View style={{ marginTop: 'auto' }}></View>}

                <View style={{}}>
                    <View style={styles.keyPadRow}>
                        <TouchableOpacity
                            onPress={() => onPressNumber('1')}
                            style={styles.keyPadElementTouchable}>
                            <Text style={styles.keyPadElementText}
                                onPress={() => onPressNumber('1')}>1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onPressNumber('2')}
                            style={styles.keyPadElementTouchable}
                        >
                            <Text
                                style={styles.keyPadElementText}
                                onPress={() => onPressNumber('2')}>2</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onPressNumber('3')}
                            style={styles.keyPadElementTouchable}>
                            <Text style={styles.keyPadElementText}
                                onPress={() => onPressNumber('3')}>3</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.keyPadRow}>
                        <TouchableOpacity
                            onPress={() => onPressNumber('4')}
                            style={styles.keyPadElementTouchable}><Text style={styles.keyPadElementText}
                                onPress={() => onPressNumber('4')}>4</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onPressNumber('5')}
                            style={styles.keyPadElementTouchable}>
                            <Text style={styles.keyPadElementText}
                                onPress={() => onPressNumber('5')}>5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onPressNumber('6')}
                            style={styles.keyPadElementTouchable}>
                            <Text style={styles.keyPadElementText}
                                onPress={() => onPressNumber('6')}>6</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.keyPadRow}>
                        <TouchableOpacity
                            onPress={() => onPressNumber('7')}
                            style={styles.keyPadElementTouchable}>
                            <Text style={styles.keyPadElementText}
                                onPress={() => onPressNumber('7')}>7</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onPressNumber('8')}
                            style={styles.keyPadElementTouchable}>
                            <Text style={styles.keyPadElementText}
                                onPress={() => onPressNumber('8')}>8</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onPressNumber('9')}
                            style={styles.keyPadElementTouchable}>
                            <Text style={styles.keyPadElementText}
                                onPress={() => onPressNumber('9')}>9</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.keyPadRow}>
                        <View style={styles.keyPadElementTouchable}><Text style={{ flex: 1, padding: 15, }}></Text></View>
                        <TouchableOpacity
                            onPress={() => onPressNumber('0')}
                            style={styles.keyPadElementTouchable}>
                            <Text style={styles.keyPadElementText}
                                onPress={() => onPressNumber('0')}>0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onPressNumber('x')}
                            style={styles.keyPadElementTouchable}>
                            <Text
                                style={styles.keyPadElementText}
                                onPress={() => onPressNumber('x')}><Ionicons name="ios-backspace" size={30} color={Colors.blue} /></Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View >
        </View>
    </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    keyPadRow: {
        flexDirection: 'row',
        height: hp('8%')
    },
    keyPadElementTouchable: {
        flex: 1,
        height: hp('8%'),
        fontSize: RFValue(18, 812),
        justifyContent: 'center',
        alignItems: 'center'
    },
    keyPadElementText: {
        color: Colors.blue,
        fontSize: RFValue(25, 812),
        fontFamily: Fonts.FiraSansRegular,
        fontStyle: 'normal'
    },
    proceedButtonView: {
        marginLeft: 20,
        marginTop: hp('4%'),
        height: wp('13%'),
        width: wp('30%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        elevation: 10,
        shadowColor: Colors.shadowBlue,
        shadowOpacity: 1,
        shadowOffset: { width: 15, height: 15 },
        marginBottom: hp('5%')
    },
    proceedButtonText: {
        color: Colors.white,
        fontSize: RFValue(13, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    passcodeTextInputText: {
        color: Colors.blue,
        fontWeight: 'bold',
        fontSize: RFValue(13, 812)
    },
    textStyles: {
        color: Colors.black,
        fontSize: RFValue(13, 812),
        textAlign: 'center',
        lineHeight: 18,
    },
    textFocused: {
        color: Colors.black,
        fontSize: RFValue(13, 812),
        textAlign: 'center',
        lineHeight: 18
    },
    textBoxStyles: {
        borderWidth: 0.5,
        height: wp('13%'),
        width: wp('13%'),
        borderRadius: 7,
        marginLeft: 20,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white
    },
    textBoxActive: {
        borderWidth: 0.5,
        height: wp('13%'),
        width: wp('13%'),
        borderRadius: 7,
        marginLeft: 20,
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 3 },
        borderColor: Colors.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white
    },
    passcodeTextInputView: {
        flexDirection: 'row',
        marginTop: hp('1%'),
        marginBottom: hp('4.5%')
    },
    boldItalicText: {
        fontFamily: Fonts.FiraSansMediumItalic,
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    headerTitleText: {
        color: Colors.blue,
        fontSize: RFValue(25, 812),
        marginLeft: 20,
        marginTop: hp('10%'),
        fontFamily: Fonts.FiraSansRegular
    },
    headerInfoText: {
        marginTop: hp('2%'),
        color: Colors.textColorGrey,
        fontSize: RFValue(12, 812),
        marginLeft: 20,
        fontFamily: Fonts.FiraSansRegular
    },
    modalContainer: {
        height: '100%',
        backgroundColor: Colors.white,
        width: '100%'
    },
    modalHeaderTitleView: {
        borderBottomWidth: 1,
        borderColor: Colors.borderColor,
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 10,
        paddingBottom: 15,
        paddingTop: 10,
        marginLeft: 20,
        marginBottom: 15,
    },
    modalHeaderTitleText: {
        color: Colors.blue,
        fontSize: RFValue(18, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    modalContentView: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactView: {
        height: 50,
        alignItems: 'center',
        flexDirection: 'row',
        marginLeft: 20,
    },
    contactText: {
        marginLeft: 10,
        fontSize: RFValue(13, 812),
        fontFamily: Fonts.FiraSansRegular
    },
    contactIndexText: {
        fontSize: RFValue(10, 812),
        fontFamily: Fonts.FiraSansRegular
    },
    contactIndexView: {
        flex: 0.5,
        height: '100%',
        justifyContent: 'space-evenly'
    },
    selectedContactsView: {
        marginLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 20,
        borderBottomColor: Colors.borderColor,
        borderBottomWidth: 1
    },
    titleText: {
        fontSize: RFValue(13, 812),
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.blue
    },
    infoText: {
        fontSize: RFValue(13, 812),
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.textColorGrey,
        marginTop: 5
    },
    shareButtonView: {
        height: wp('8%'),
        width: wp('15%'),
        backgroundColor: Colors.backgroundColor,
        borderWidth: 1,
        borderColor: Colors.borderColor,
        borderRadius: 5,
        marginLeft: 'auto',
        justifyContent: 'center',
        alignItems: 'center'
    },
    shareButtonText: {
        fontSize: RFValue(10, 812),
        fontFamily: Fonts.FiraSansRegular,
        color: Colors.textColorGrey
    },
    pageTitle: {
        marginLeft: 30,
        color: Colors.blue,
        fontSize: RFValue(14, 812),
        fontFamily: Fonts.FiraSansRegular
    },
    pageInfoText: {
        marginLeft: 30,
        color: Colors.textColorGrey,
        fontSize: RFValue(10, 812),
        fontFamily: Fonts.FiraSansRegular
    },
    addModalTitleText: {
        color: Colors.blue,
        fontSize: RFValue(14, 812),
    },
})