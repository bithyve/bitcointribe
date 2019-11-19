import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Text,
    Image,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../common/Fonts';
import Colors from '../common/Colors';
import CommonStyles from "../common/Styles";
import { TextInput } from 'react-native-gesture-handler';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Feather from "react-native-vector-icons/Feather";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

export default function NewWalletQuestion(props) {
    const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false);
    const [dropdownBoxList, setDropdownBoxList] = useState([
        { id: '1', question: 'Name of your first pet?' },
        { id: '2', question: 'Name of your favourite food?' },
        { id: '3', question: 'Name of your first company?' },
        { id: '4', question: 'Name of your first employee?' },
        { id: '5', question: 'Name of your first pet?' },
        { id: '6', question: 'Name of your favourite teacher?' },
        { id: '7', question: 'Name of your favourite teacher?' }
    ]);
    const [dropdownBoxValue, setDropdownBoxValue] = useState({ id: '', question: '' });
    const [answerInputStyle, setAnswerInputStyle] = useState(styles.inputBox);
    const [confirmInputStyle, setConfirmAnswerInputStyle] = useState(styles.inputBox);
    const [confirmAnswer, setConfirmAnswer] = useState('');
    const [answer, setAnswer] = useState('');
    const [hideShowConfirmAnswer, setHideShowConfirmAnswer] = useState(true);
    const [hideShowAnswer, setHdeShowAnswer] = useState(true);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
            <View style={{ flex: 1 }}>
                <View style={CommonStyles.headerContainer}>
                    <TouchableOpacity
                        style={CommonStyles.headerLeftIconContainer}
                        onPress={() => { props.navigation.navigate('RestoreAndReoverWallet'); }}
                    >
                        <View style={CommonStyles.headerLeftIconInnerContainer}>
                            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity activeOpacity={10} style={{ flex: 1 }} onPress={() => {setDropdownBoxOpenClose(false); Keyboard.dismiss()}}>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'ios' ? 'padding' : ''} enabled>
                        <ScrollView>
                            <Text style={styles.pageTitle}>New Hexa Wallet</Text>
                            <Text style={styles.labelStyle}>Select <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>secret question</Text></Text>
                            <TouchableOpacity activeOpacity={10} style={dropdownBoxOpenClose?styles.dropdownBoxOpened:styles.dropdownBox} onPress={() => { setDropdownBoxOpenClose(!dropdownBoxOpenClose); }}>
                                <Text style={{ color: Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(13, 812) }}>{dropdownBoxValue.question ? dropdownBoxValue.question : 'Select Question'}</Text>
                                <Ionicons style={{ marginLeft: 'auto' }} name={dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'} size={20} color={Colors.textColorGrey} />
                            </TouchableOpacity>
                            {dropdownBoxOpenClose ?
                                <View style={{
                                    borderRadius: 10,
                                    margin: 15,
                                    height: 'auto',
                                    elevation: 10,
                                    shadowColor: Colors.shadowBlue,
                                    shadowOpacity: 10,
                                    shadowOffset: { width: 0, height: 10 },
                                    backgroundColor: Colors.white
                                }}>
                                    {dropdownBoxList.map((value, index) =>
                                        <TouchableOpacity onPress={() => { setDropdownBoxValue(value); setDropdownBoxOpenClose(false) }} style={{
                                            borderTopLeftRadius: index == 0 ? 10 : 0,
                                            borderTopRightRadius: index == 0 ? 10 : 0,
                                            borderBottomLeftRadius: index == dropdownBoxList.length - 1 ? 10 : 0,
                                            borderBottomRightRadius: index == dropdownBoxList.length - 1 ? 10 : 0,
                                            height: 55,
                                            justifyContent: 'center',
                                            paddingLeft: 15,
                                            paddingRight: 15,
                                            paddingTop: index == 0 ? 5 : 0,
                                            backgroundColor: dropdownBoxValue.id == value.id ? Colors.lightBlue : Colors.white,
                                        }}><Text style={{ color: dropdownBoxValue.id == value.id ? Colors.blue : Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(12, 812) }}>{value.question}</Text></TouchableOpacity>
                                    )}
                                </View>
                                : null}
                            {dropdownBoxValue.id ?
                                <View style={{ marginTop: 15 }}>
                                    <View style={{ ...answerInputStyle, flexDirection: 'row', alignItems: 'center', paddingRight: 15, }}>
                                        <TextInput
                                            style={{
                                                flex: 1,
                                                height: 50,
                                                fontSize: RFValue(13, 812),
                                                color: Colors.textColorGrey,
                                                fontFamily: Fonts.FiraSansRegular,
                                                paddingLeft: 15,
                                            }}
                                            secureTextEntry={hideShowAnswer}
                                            placeholder={'Enter your answer'}
                                            placeholderTextColor={Colors.borderColor}
                                            value={answer}
                                            onChangeText={(text) => setAnswer(text)}
                                            onFocus={() => { setDropdownBoxOpenClose(false); setAnswerInputStyle(styles.inputBoxFocused); }}
                                            onBlur={() => { setAnswerInputStyle(styles.inputBox); setDropdownBoxOpenClose(false) }}
                                        />
                                        <TouchableWithoutFeedback onPress={() => { setHdeShowAnswer(!hideShowAnswer) }}>
                                            <Feather style={{ marginLeft: 'auto' }} size={15} color={Colors.blue} name={hideShowAnswer ? 'eye-off' : 'eye'} />
                                        </TouchableWithoutFeedback>
                                    </View>
                                    <View style={{ ...confirmInputStyle, marginBottom: 15, flexDirection: 'row', alignItems: 'center', paddingRight: 15, marginTop: 15 }}>
                                        <TextInput
                                            style={{
                                                flex: 1,
                                                height: 50,
                                                fontSize: RFValue(13, 812),
                                                color: Colors.textColorGrey,
                                                fontFamily: Fonts.FiraSansRegular,
                                                paddingLeft: 15,

                                            }}
                                            secureTextEntry={hideShowConfirmAnswer}
                                            placeholder={'Confirm your answer'}
                                            placeholderTextColor={Colors.borderColor}
                                            value={confirmAnswer}
                                            onChangeText={(text) => setConfirmAnswer(text)}
                                            onFocus={() => { setDropdownBoxOpenClose(false); setConfirmAnswerInputStyle(styles.inputBoxFocused); }}
                                            onBlur={() => { setConfirmAnswerInputStyle(styles.inputBox); setDropdownBoxOpenClose(false) }}
                                        />
                                        <TouchableWithoutFeedback onPress={() => { setHideShowConfirmAnswer(!hideShowConfirmAnswer); setDropdownBoxOpenClose(false) }}>
                                            <Feather style={{ marginLeft: 'auto' }} size={15} color={Colors.blue} name={hideShowConfirmAnswer ? 'eye-off' : 'eye'} />
                                        </TouchableWithoutFeedback>
                                    </View>
                                </View> : <View style={{ marginTop: 15 }} />}
                        </ScrollView>

                        <View style={styles.bottomButtonView}>
                            {answer.trim() == confirmAnswer.trim() && confirmAnswer.trim() && answer.trim() ? (
                                <TouchableOpacity onPress={() => props.navigation.replace('Home')} style={styles.buttonView}>
                                    <Text style={styles.buttonText}>Done</Text>
                                </TouchableOpacity>
                            ) : <View style={{
                                height: wp('13%'),
                                width: wp('30%'),
                            }} />}
                            <View style={styles.statusIndicatorView}>
                                <View style={styles.statusIndicatorInactiveView} />
                                <View style={styles.statusIndicatorActiveView} />
                                <View style={styles.statusIndicatorInactiveView} />
                            </View>
                        </View>
                        {confirmAnswer.trim()=='' && answer.trim()=='' ? 
                        <View style={{ marginBottom: 25, padding: 20, backgroundColor: Colors.backgroundColor, marginLeft: 15, marginRight: 15, borderRadius: 10, justifyContent: 'center' }}>
                            <Text style={styles.bottomNoteText}>This question will serve as a hint</Text>
                            <Text style={styles.bottomNoteInfoText}>For you to remember what the answer was</Text>
                        </View>
                        :null}
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pageTitle: {
        color: Colors.blue,
        fontSize: RFValue(25, 812),
        marginLeft: 15,
        marginBottom: 5,
        fontFamily: Fonts.FiraSansRegular
    },
    labelStyle:
    {
        color: Colors.textColorGrey,
        fontSize: RFValue(12, 812),
        marginLeft: 15,
        fontFamily: Fonts.FiraSansRegular
    },
    dropdownBox: {
        flexDirection: 'row',
        borderColor: Colors.borderColor,
        borderWidth: 0.5,
        borderRadius: 10,
        marginTop: 30,
        height: 50,
        marginLeft: 15,
        marginRight: 15,
        paddingLeft: 15,
        paddingRight: 15,
        alignItems: 'center'
    },
    dropdownBoxOpened: {
        flexDirection: 'row',
        borderColor: Colors.borderColor,
        borderWidth: 0.5,
        borderRadius: 10,
        marginTop: 30,
        height: 50,
        marginLeft: 15,
        marginRight: 15,
        paddingLeft: 15,
        paddingRight: 15,
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 2, height: 2 },
        backgroundColor: Colors.white,
        alignItems: 'center',
    },
    bottomNoteText: {
        color: Colors.blue,
        fontSize: RFValue(13, 812),
        marginBottom: 2,
        fontFamily: Fonts.FiraSansRegular
    },
    bottomNoteInfoText: {
        color: Colors.textColorGrey,
        fontSize: RFValue(12, 812),
        fontFamily: Fonts.FiraSansRegular
    },
    buttonView: {
        height: wp('13%'),
        width: wp('30%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        elevation: 10,
        shadowColor: Colors.shadowBlue,
        shadowOpacity: 10,
        shadowOffset: { width: 0, height: 10 },
        backgroundColor: Colors.blue
    },
    buttonText: {
        color: Colors.white,
        fontSize: RFValue(13, 812),
        fontFamily: Fonts.FiraSansMedium
    },
    bottomButtonView: {
        flexDirection: 'row',
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 40,
        paddingTop: 30,
        alignItems: 'center'
    },
    statusIndicatorView: {
        flexDirection: 'row',
        marginLeft: 'auto',
    },
    statusIndicatorActiveView:
    {
        height: 5,
        width: 25,
        backgroundColor: Colors.blue,
        borderRadius: 10,
        marginLeft: 5
    },
    statusIndicatorInactiveView: {
        width: 5,
        backgroundColor: Colors.lightBlue,
        borderRadius: 10,
        marginLeft: 5
    },
    inputBox: {
        borderColor: Colors.borderColor,
        borderWidth: 0.5,
        borderRadius: 10,
        marginLeft: 15,
        marginRight: 15,
    },
    inputBoxFocused: {
        borderColor: Colors.borderColor,
        borderWidth: 0.5,
        borderRadius: 10,
        marginLeft: 15,
        marginRight: 15,
        elevation: 10,
        shadowColor: Colors.borderColor,
        shadowOpacity: 10,
        shadowOffset: { width: 2, height: 2 },
        backgroundColor: Colors.white,
    },
});
