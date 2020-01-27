import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../common/Fonts';
import Colors from '../common/Colors';
import QuestionList from '../common/QuestionList';
import CommonStyles from '../common/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import { RFValue } from 'react-native-responsive-fontsize';
import HeaderTitle from '../components/HeaderTitle';
import BottomInfoBox from '../components/BottomInfoBox';

import { useDispatch, useSelector } from 'react-redux';
import { initializeSetup } from '../store/actions/setupAndAuth';
import AsyncStorage from '@react-native-community/async-storage';

export default function NewWalletQuestion(props) {
  const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false);
  const [dropdownBoxList, setDropdownBoxList] = useState(QuestionList);
  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: '',
    question: '',
  });
  const [answerInputStyle, setAnswerInputStyle] = useState(styles.inputBox);
  const [confirmInputStyle, setConfirmAnswerInputStyle] = useState(
    styles.inputBox,
  );
  let [confirmAnswer, setConfirmAnswer] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerMasked, setAnswerMasked] = useState('');
  const [confirmAnswerMasked, setConfirmAnswerMasked] = useState('');
  const [hideShowConfirmAnswer, setHideShowConfirmAnswer] = useState(true);
  const [hideShowAnswer, setHdeShowAnswer] = useState(true);
  let [counter, setCounter] = useState(0);
  const dispatch = useDispatch();
  const walletName = props.navigation.getParam('walletName');
  const [ansError, setAnsError] = useState('');
  let [tempAns, setTempAns] = useState('');
  const [isEditable, setIsEditable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const { isInitialized, loading } = useSelector(state => state.setupAndAuth);
  if (isInitialized) {
    props.navigation.navigate('HomeNav');
  }  

  const setConfirm = confirmAnswer => {
    if (confirmAnswer) {
      if (answer && confirmAnswer != answer) {
        setAnsError('Answers do not match');
        counter++;
        setCounter(counter);
        console.log('counter', counter);
        if (counter > 3) {
          console.log('global.ansCounter', counter);
          setHdeShowAnswer(!hideShowAnswer);
          counter = 0;
        }
      } else {
        setAnsError('');
      }
    } else {
      setAnsError('');
    }
  };
  const setBackspace = event => {
    console.log('event,key', event.nativeEvent.key);

    if (event.nativeEvent.key == 'Backspace') {
      setTimeout(() => {
      setAnsError('');
      setConfirmAnswer('')
      setConfirmAnswerMasked('');
    }, 70);
    }
  };


  useEffect(() => {
    if (answer.trim() == confirmAnswer.trim()) {
      setAnsError('');
    }
  }, [confirmAnswer]);

  const setButtonVisible = () => {
    //setAnsError('');
    return (
      <TouchableOpacity
        onPress={async() => {
          const security = {
            question: dropdownBoxValue.question,
            answer,
          };
          setIsEditable(false);
          setIsDisabled(true);
          dispatch(initializeSetup(walletName, security));
          await AsyncStorage.setItem('SecurityAnsTimestamp', JSON.stringify(Date.now()));
          await AsyncStorage.setItem('secondaryDeviceAutoHighlightFlags',"false");
          await AsyncStorage.setItem('contact1AutoHighlightFlags',"false");
          await AsyncStorage.setItem('contact2AutoHighlightFlags',"false");
          await AsyncStorage.setItem('personalCopy1AutoHighlightFlags',"false");
          await AsyncStorage.setItem('personalCopy2AutoHighlightFlags',"false");
          await AsyncStorage.setItem('securityAutoHighlightFlags',"true");
        }}
        style={styles.buttonView}
      >
        {!loading.initializing ? (
          <Text style={styles.buttonText}>Confirm</Text>
        ) : (
          <ActivityIndicator size="small" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.navigate('RestoreAndRecoverWallet');
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <TouchableOpacity
            activeOpacity={10}
            style={{ flex: 1 }}
            onPress={() => {
              setDropdownBoxOpenClose(false);
              Keyboard.dismiss();
            }}
            disabled={isDisabled}
                      
          >
            <HeaderTitle
              firstLineTitle={'New Hexa Wallet'}
              secondLineTitle={''}
              infoTextNormal={'Setup '}
              infoTextBold={'secret question and answer'}
            />

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
              disabled={isDisabled}
                      
            >
              <Text style={styles.dropdownBoxText}>
                {dropdownBoxValue.question
                  ? dropdownBoxValue.question
                  : 'Select Question'}
              </Text>
              <Ionicons
                style={{ marginLeft: 'auto' }}
                name={dropdownBoxOpenClose ? 'ios-arrow-up' : 'ios-arrow-down'}
                size={20}
                color={Colors.textColorGrey}
              />
            </TouchableOpacity>
            <ScrollView>
              {dropdownBoxOpenClose ? (
                <View style={styles.dropdownBoxModal}>
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
                </View>
              ) : null}
              {dropdownBoxValue.id ? (
                <View style={{ marginTop: 15 }}>
                  <View
                    style={{
                      ...answerInputStyle,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingRight: 15,
                      borderColor: ansError ? Colors.red : Colors.borderColor,
                    }}
                  >
                    <TextInput
                      style={styles.modalInputBox}
                      placeholder={'Enter your answer'}
                      placeholderTextColor={Colors.borderColor}
                      value={hideShowAnswer ? answerMasked : answer}
                      autoCompleteType="off"
                      textContentType="none"
                      autoCorrect={false}
                      editable={isEditable}
                      autoCapitalize="none"
                      onChangeText={text => {
                        setAnswer(text)
                        setAnswerMasked(text);
                      }}
                      onFocus={() => {
                        setDropdownBoxOpenClose(false);
                        setAnswerInputStyle(styles.inputBoxFocused);
                      }}
                      onBlur={() => {
                        setAnswerInputStyle(styles.inputBox);
                        setDropdownBoxOpenClose(false);
                        let temp='';
                        for(let i = 0; i<answer.length;i++){
                          temp+='*'
                        }
                        console.log("temp", temp, answer)
                        setAnswerMasked(temp);
                      }}
                      onKeyPress={e => {
                        if (e.nativeEvent.key === "Backspace") {
                          setTimeout(() => {
                        setAnswer('')
                        setAnswerMasked('');
                      }, 70);
                        }
                      }}
                    />
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setHdeShowAnswer(!hideShowAnswer);
                      }}
                    >
                      <Feather
                        style={{ marginLeft: 'auto', padding: 10 }}
                        size={15}
                        color={Colors.blue}
                        name={hideShowAnswer ? 'eye-off' : 'eye'}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                  <View
                    style={{
                      ...confirmInputStyle,
                      marginBottom: 15,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingRight: 15,
                      marginTop: 15,
                      borderColor: ansError ? Colors.red : Colors.borderColor,
                    }}
                  >
                    <TextInput
                      style={styles.modalInputBox}
                      placeholder={'Confirm your answer'}
                      placeholderTextColor={Colors.borderColor}
                      value={hideShowAnswer ? confirmAnswerMasked : confirmAnswer}
                      textContentType="none"
                      autoCompleteType="off"
                      autoCorrect={false}
                      editable={isEditable}
                      autoCapitalize="none"
                      onKeyPress={event => {
                        setBackspace(event);
                      }}
                      onChangeText={text => {
                        if (
                          answer.trim() == text.trim() &&
                          text.trim() &&
                          answer.trim()
                        ) {
                          Keyboard.dismiss();
                        }
                        //setTempAns(confirmAnswer);
                        setConfirmAnswer(text);
                        setConfirmAnswerMasked(text);
                      }}
                      onSubmitEditing={event => setConfirm(confirmAnswer)}
                      onFocus={() => {
                        setDropdownBoxOpenClose(false);
                        setConfirmAnswerInputStyle(styles.inputBoxFocused);
                      }}
                      onBlur={() => {
                        setConfirmAnswerInputStyle(styles.inputBox);
                        setDropdownBoxOpenClose(false);
                        let temp='';
                        for(let i = 0; i<confirmAnswer.length;i++){
                          temp+='*'
                        }
                        console.log("temp", temp, confirmAnswer)
                        setConfirmAnswerMasked(temp);
                      }}
                      
                    />
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setHideShowConfirmAnswer(!hideShowConfirmAnswer);
                        setDropdownBoxOpenClose(false);
                      }}
                    >
                      <Feather
                        style={{ marginLeft: 'auto', padding: 10 }}
                        size={15}
                        color={Colors.blue}
                        name={hideShowConfirmAnswer ? 'eye-off' : 'eye'}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 15 }} />
              )}
              <View
                style={{
                  marginLeft: 20,
                  marginRight: 20,
                  flexDirection: 'row',
                }}
              >
                <Text
                  style={{
                    color: Colors.red,
                    fontFamily: Fonts.FiraSansMediumItalic,
                    fontSize: RFValue(10),
                    marginLeft: 'auto',
                  }}
                >
                  {ansError}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.bottomButtonView}>
              {answer.trim() == confirmAnswer.trim() &&
              confirmAnswer.trim() &&
              answer.trim() ? (
                setButtonVisible()
              ) : (
                <View
                  style={{
                    height: wp('13%'),
                    width: wp('30%'),
                  }}
                />
              )}
              <View style={styles.statusIndicatorView}>
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorActiveView} />
              </View>
            </View>
            {dropdownBoxValue.id.trim() == '' ? (
              <BottomInfoBox
                title={'Note'}
                infoText={'Secret question and answer are very important for your wallet and it’s backup'}
              />
            ) : null}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dropdownBox: {
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 30,
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
    marginTop: 30,
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
    elevation: 10,
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
