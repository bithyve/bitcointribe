import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  AsyncStorage,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import Colors from '../../common/Colors';
import QuestionList from '../../common/QuestionList';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';

export default function HealthCheckSecurityQuestion(props) {
  const { security } = useSelector(
    state => state.storage.database.WALLET_SETUP,
  );
  let [QuestionCounter, setQuestionCounter] = useState(0);
  let [AnswerCounter, setAnswerCounter] = useState(0);
  const securityQuestion = security.question;
  const securityAnswer = security.answer;
  const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false);
  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: '',
    question: '',
  });
  const [answer, setAnswer] = useState('');
  const [dropdownBoxList, setDropdownBoxList] = useState(QuestionList);
  const [errorText, setErrorText] = useState('');

  const setConfirm = () => {
    if (answer.length > 0 && answer != securityAnswer) {
        if (AnswerCounter < 2) {
          AnswerCounter++;
          setAnswerCounter(AnswerCounter);
        } else {
          setAnswer(securityAnswer);
          setErrorText('');
          return;
        }
        setErrorText('Answer is incorrect');
      } else {
        setErrorText('');
      }
  }

  const setBackspace = event => {
    if (event.nativeEvent.key == 'Backspace') {
      setErrorText('');
    }
  };

  useEffect(() => {
    if (answer.trim() == securityAnswer.trim()) {
      setErrorText('');
    }
  }, [answer]);

  const onQuestionSelect = value => {
    if (securityQuestion != value.question) {
      if (QuestionCounter < 2) {
        QuestionCounter++;
        setQuestionCounter(QuestionCounter);
      } else {
        setDropdownBoxValue(
          dropdownBoxList[
            dropdownBoxList.findIndex(tmp => tmp.question == securityQuestion)
          ],
        );
        setDropdownBoxOpenClose(false);
        setErrorText('');
        return;
      }
      setErrorText('Wrong question selected');
    } else {
      setErrorText('');
    }
    setDropdownBoxValue(value);
    setDropdownBoxOpenClose(false);
  };

  return (
    <View style={{ ...styles.modalContentContainer, height: '100%' }}>
      <View style={styles.modalContentContainer}>
        <View>
          <View style={{ flexDirection: 'row', padding: wp('7%') }}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.modalTitleText}>
                Health Check{'\n'}Security Question
              </Text>
              <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>
                Select the question and specify the answer{'\n'}as you did at
                the time of setting up the wallet
              </Text>
            </View>
          </View>
          <ScrollView style={{ paddingLeft: wp('6%'), paddingRight: wp('6%') }}>
            <AppBottomSheetTouchableWrapper
              activeOpacity={10}
              style={[
                dropdownBoxOpenClose
                  ? styles.dropdownBoxOpened
                  : styles.dropdownBox,
                {
                  borderColor:
                    errorText == 'Wrong question selected'
                      ? Colors.red
                      : Colors.borderColor,
                },
              ]}
              onPress={() => {
                setDropdownBoxOpenClose(!dropdownBoxOpenClose);
              }}
            >
              <Text
                style={{
                  ...styles.dropdownBoxText,
                  color: dropdownBoxValue.question
                    ? Colors.textColorGrey
                    : Colors.borderColor,
                }}
              >
                {dropdownBoxValue.question
                  ? dropdownBoxValue.question
                  : 'Select Security Question'}
              </Text>
              <Ionicons
                style={{ marginLeft: 'auto' }}
                name={dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'}
                size={15}
                color={Colors.borderColor}
              />
            </AppBottomSheetTouchableWrapper>
            <View style={{ position: 'relative' }}>
              {dropdownBoxOpenClose && (
                <View style={styles.dropdownBoxModal}>
                  <ScrollView>
                    {dropdownBoxList.map((value, index) => (
                      <AppBottomSheetTouchableWrapper
                        onPress={() => onQuestionSelect(value)}
                        style={{
                          ...styles.dropdownBoxModalElementView,
                          borderTopLeftRadius: index == 0 ? 10 : 0,
                          borderTopRightRadius: index == 0 ? 10 : 0,
                          borderBottomLeftRadius:
                            index == dropdownBoxList.length - 1 ? 10 : 0,
                          borderBottomRightRadius:
                            index == dropdownBoxList.length - 1 ? 10 : 0,
                          paddingTop: index == 0 ? 5 : 0,
                          backgroundColor:
                            dropdownBoxValue.id == value.id
                              ? Colors.lightBlue
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
                      </AppBottomSheetTouchableWrapper>
                    ))}
                  </ScrollView>
                </View>
              )}
              <TextInput
                style={{
                  ...styles.inputBox,
                  width: '100%',
                  marginTop: 15,
                  marginBottom: hp('1%'),
                  borderColor:
                    errorText == 'Answer is incorrect'
                      ? Colors.red
                      : Colors.borderColor,
                }}
                placeholder={'Enter Answer'}
                placeholderTextColor={Colors.borderColor}
                value={answer}
                textContentType="none"
                autoCompleteType="off"
                autoCorrect={false}
                autoCapitalize="none"
                onKeyPress={event => {
                  setBackspace(event);
                }}
                onChangeText={text => {
                  setAnswer(text);
                }}
                onSubmitEditing={event => setConfirm()}
                onFocus={() => {
                  if (Platform.OS == 'ios') {
                    props.bottomSheetRef.current.snapTo(2);
                  }
                  setDropdownBoxOpenClose(false);
                }}
                onBlur={() => {
                  if (Platform.OS == 'ios') {
                    props.bottomSheetRef.current.snapTo(1);
                  }
                  setDropdownBoxOpenClose(false);
                }}
              />
              {errorText ? (
                <Text
                  style={{
                    marginLeft: 'auto',
                    color: Colors.red,
                    fontSize: RFValue(10),
                    fontFamily: Fonts.FiraSansMediumItalic,
                  }}
                >
                  {errorText}
                </Text>
              ) : null}
              <Text style={styles.modalInfoText}>
                Security question and answer is never stored anywhere{'\n'}and
                even your contacts don’t know this answer
              </Text>
            </View>
          </ScrollView>
          
        </View>
        <View
            style={{
              paddingLeft: wp('6%'),
              paddingRight: wp('6%'),
              height: hp('15%'),
              justifyContent: 'center',
            }}
          >
            <AppBottomSheetTouchableWrapper
              disabled={errorText || !answer ? true : false}
              onPress={() => {
                setConfirm();
                if (answer.trim() == securityAnswer.trim()) {
                  AsyncStorage.setItem(
                    'SecurityAnsTimestamp',
                    JSON.stringify(Date.now()),
                  ).then(() => {
                    props.onPressConfirm();
                  });
                } else {
                  setErrorText('Answer is incorrect');
                }
              }}
              style={styles.questionConfirmButton}
            >
              <Text style={styles.proceedButtonText}>
                {errorText || !answer ? 'Try Again' : 'Confirm'}
              </Text>
            </AppBottomSheetTouchableWrapper>
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    marginTop: hp('3%'),
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
  },
  dropdownBoxText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
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
    overflow: 'hidden',
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
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp('85%'),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp('85%'),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue(13),
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
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
