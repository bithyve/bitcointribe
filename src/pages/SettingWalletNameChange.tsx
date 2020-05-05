import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import CommonStyles from '../common/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import ContactList from '../components/ContactList';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QuestionList from '../common/QuestionList';
import BottomInfoBox from '../components/BottomInfoBox';

export default function SettingWalletNameChange(props) {
  const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false);
  const [dropdownBoxList, setDropdownBoxList] = useState(QuestionList);
  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: '',
    question: '',
  });
  const [answerInputStyle, setAnswerInputStyle] = useState(styles.inputBox);
  
  const [answer, setAnswer] = useState('');
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitleText}>{'Change Wallet Name'}</Text>
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.headerInfoText}>
                To change wallet name,{'\n'}conform secret question and answer
        </Text>
         

         <TouchableOpacity
                activeOpacity={10}
                style={
                  dropdownBoxOpenClose
                    ? styles.dropdownBoxOpened
                    : styles.dropdownBox
                }
                onPress={() => {
                  setDropdownBoxOpenClose(!dropdownBoxOpenClose);
                }}
              >
                <Text style={styles.dropdownBoxText}>
                  {dropdownBoxValue.question
                    ? dropdownBoxValue.question
                    : 'Select Question'}
                </Text>
                <Ionicons
                  style={{ marginLeft: 'auto' }}
                  name={
                    dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'
                  }
                  size={20}
                  color={Colors.textColorGrey}
                />
              </TouchableOpacity>

              {dropdownBoxOpenClose ? (
                <View style={styles.dropdownBoxModal}>
                  <ScrollView
                    nestedScrollEnabled={true}
                    style={{ height: hp('40%') }}
                  >
                    {dropdownBoxList.map((value, index) => (
                      <TouchableOpacity
                        onPress={() => {
                          setTimeout(() => {
                            setDropdownBoxValue(value);
                            setDropdownBoxOpenClose(false);
                          }, 70);
                        }}
                        style={{
                          ...styles.dropdownBoxModalElementView,
                          borderTopLeftRadius: index == 0 ? 10 : 0,
                          borderTopRightRadius: index == 0 ? 10 : 0,
                          borderBottomLeftRadius:
                            index == dropdownBoxList.length - 1 ? 10 : 0,
                          borderBottomRightRadius:
                            index == dropdownBoxList.length - 1 ? 10 : 0,
                          paddingTop: index == 0 ? 5 : 0,
                          backgroundColor: dropdownBoxValue
                            ? dropdownBoxValue.id == value.id
                              ? Colors.lightBlue
                              : Colors.white
                            : Colors.white,
                        }}
                      >
                        <Text
                          style={{
                            color:
                              dropdownBoxValue.id == value.id
                                ? Colors.blue
                                : Colors.black,
                            fontFamily: Fonts.FiraSansRegular,
                            fontSize: RFValue(12),
                          }}
                        >
                          {value.question}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
                <View style={{ marginTop: 15 }}>
                  <View
                    style={{
                      ...answerInputStyle,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingRight: 15,
                      borderColor: Colors.borderColor,
                    }}
                  >
                    <TextInput
                      style={styles.modalInputBox}
                      placeholder={'Enter your answer'}
                      placeholderTextColor={Colors.borderColor}
                      value={answer}
                      autoCompleteType="off"
                      textContentType="none"
                      autoCorrect={false}
                      autoCapitalize="none"
                      keyboardType={
                        Platform.OS == 'ios'
                          ? 'ascii-capable'
                          : 'visible-password'
                      }
                      onChangeText={text => {
                        text = text.replace(/[^a-z]/g, '');
                        setAnswer(text);
                      }}
                      onFocus={() => {
                        setDropdownBoxOpenClose(false);
                        setAnswerInputStyle(styles.inputBoxFocused);
                        
                      }}
                      
                      onKeyPress={e => {
                        if (e.nativeEvent.key === 'Backspace') {
                          setTimeout(() => {
                            setAnswer('');
                           
                          }, 70);
                        }
                      }}
                    />
                  </View>
                  </View>
      </View>
      <View >
        <BottomInfoBox
        backgroundColor={Colors.white}
          title={'Note'}
          infoText={
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
          }
        />
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("SettingNewWalletName");
          }}
          style={{
            backgroundColor: Colors.blue,
            width: wp('35%'),
            height: wp('13%'),
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft:30,
            marginRight: 20,
            marginBottom: hp('3%')
          }}
        >
          <Text
            style={{
              fontSize: RFValue(13),
              color: Colors.white,
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Confirm & Proceed
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  keyPadRow: {
    flexDirection: 'row',
    height: hp('8%'),
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11, 812),
    fontStyle: 'italic',
  },
  keyPadElementTouchable: {
    flex: 1,
    height: hp('8%'),
    fontSize: RFValue(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyPadElementText: {
    color: Colors.blue,
    fontSize: RFValue(25),
    fontFamily: Fonts.FiraSansRegular,
    fontStyle: 'normal',
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
    marginBottom: hp('5%'),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: 'bold',
    fontSize: RFValue(13),
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
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
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.white,
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    marginTop: hp('1%'),
    marginBottom: hp('4.5%'),
  },
  boldItalicText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue(25),
    marginLeft: 20,
    marginTop: hp('10%'),
    fontFamily: Fonts.FiraSansRegular,
  },
  headerInfoText: {
    marginTop: hp('1.5%'),
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    marginLeft: 20,
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    width: '100%',
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
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
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
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexView: {
    flex: 0.5,
    height: '100%',
    justifyContent: 'space-evenly',
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },
  infoText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    marginTop: 5,
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
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  pageTitle: {
    marginLeft: 30,
    color: Colors.blue,
    fontSize: RFValue(14),
    fontFamily: Fonts.FiraSansRegular,
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(14),
  },
  dropdownBox: {
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 25,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
  },
  dropdownBoxOpened: {
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 25,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  buttonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bottomButtonView1: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
  },
  dropdownBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    marginRight: 15,
  },
  dropdownBoxModal: {
    borderRadius: 10,
    margin: 15,
    height: 'auto',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.white,
  },
  dropdownBoxModalElementView: {
    height: 55,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },
});
