import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  AsyncStorage,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import QuestionList from '../../common/QuestionList';
import CommonStyles from '../../common/Styles';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import { RFValue } from 'react-native-responsive-fontsize';
import HeaderTitle from '../../components/HeaderTitle';
import BottomInfoBox from '../../components/BottomInfoBox';

import { useDispatch, useSelector } from 'react-redux';
import { initializeRecovery, initializeSetup } from '../../store/actions/setupAndAuth';
import BottomSheet from 'reanimated-bottom-sheet';
import LoaderModal from '../../components/LoaderModal';
import {
  getTestcoins,
  calculateExchangeRate,
  accountsSynched,
} from '../../store/actions/accounts';
import {
  TEST_ACCOUNT,
} from '../../common/constants/serviceTypes';

import DeviceInfo from 'react-native-device-info';

export default function NewRecoveryOwnQuestions(props) {

  const [question, setQuestion] = useState('');
  const [questionInputStyle, setQuestionInputStyle] = useState(styles.inputBox);
  const [answerInputStyle, setAnswerInputStyle] = useState(styles.inputBox);
  const [answer, setAnswer] = useState('');
  const dispatch = useDispatch();
  const walletName = props.navigation.getParam('walletName');
  const [ansError, setAnsError] = useState('');
  const [isEditable, setIsEditable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);

  const [visibleButton, setVisibleButton] = useState(false);

  const { insertedIntoDB } = useSelector(state => state.storage);
  useEffect(() => {
    (async () => {
      if (insertedIntoDB) {
        await AsyncStorage.setItem('recoveryExists', 'true');
        props.navigation.navigate('RestoreSelectedContactsList');
      }
    })();
  }, [insertedIntoDB]);

  const setButtonVisible = () => {
    setTimeout(() => {
      setAnsError('');
    }, 2);
    return (
      <TouchableOpacity
      disabled={question && answer ? false : true}
      onPress={() => {
        const security = {
          question: question,
          answer,
        };
        dispatch(initializeRecovery(walletName, security));
      }}
        style={{ ...styles.buttonView, }}
      >
        <Text style={styles.buttonText}>{'Confirm'}</Text>
      </TouchableOpacity>
    );
  };


  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SafeAreaView style={{ flex: 0 }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : ''}
        enabled
      >
        <ScrollView>
          <View style={{ flex: 1 }}>
            <View style={CommonStyles.headerContainer}>
              <TouchableOpacity
                style={CommonStyles.headerLeftIconContainer}
                onPress={() => {
                  props.navigation.goBack();
                }}
                hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
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

            <TouchableOpacity
              activeOpacity={10}
              style={{ flex: 1 }}
              onPress={() => {
                Keyboard.dismiss();
              }}
              disabled={isDisabled}
            >
              <View style={{ flexDirection: 'row', padding: wp('7%') }}>
            <View style={{ flex: 3, justifyContent: 'center' }}>
              <Text style={styles.modalTitleText}>
                Enter Security Question{'\n'}and Answer
              </Text>
              <Text style={{ ...styles.modalInfoText, marginTop: wp('1.5%') }}>
                To recover your wallet you have to select the security question
                and enter its answer
              </Text>
            </View>
           
          </View>

              <View
                style={{
                  ...questionInputStyle,
                  marginTop: 30,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 15,
                  borderColor: Colors.borderColor,
                }}
              >
                <TextInput
                  style={styles.modalInputBox}
                  placeholder={'Enter Security Question'}
                  placeholderTextColor={Colors.borderColor}
                  value={question}
                  autoCompleteType="off"
                  textContentType="none"
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType={
                    Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                  }
                  onChangeText={(text) => {
                    setQuestion(text);
                  }}
                  onFocus={() => {
                    setQuestionInputStyle(styles.inputBoxFocused);
                  }}
                  onBlur={() => {
                    setQuestionInputStyle(styles.inputBox);
                  }}
                />
              </View>
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
                    placeholder={'Enter Security Answer'}
                    placeholderTextColor={Colors.borderColor}
                    value={answer}
                    autoCompleteType="off"
                    textContentType="none"
                    returnKeyType="next"
                    autoCorrect={false}
                    editable={isEditable}
                    autoCapitalize="none"
                    
                    keyboardType={
                      Platform.OS == 'ios'
                        ? 'ascii-capable'
                        : 'visible-password'
                    }
                    onChangeText={(text) => {
                      setAnswer(text);
                    }}
                    onFocus={() => {
                      setAnswerInputStyle(styles.inputBoxFocused);
                      if (answer.length > 0) {
                        setAnswer('');
                      }
                    }}
                    onBlur={() => {
                      setAnswerInputStyle(styles.inputBox);
                      
                    }}
                    onKeyPress={(e) => {
                      if (e.nativeEvent.key === 'Backspace') {
                        setTimeout(() => {
                          setAnswer('');
                        }, 70);
                      }
                    }}
                  />
                 
                </View>
               
              </View>
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
            </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
        <View style={{ ...styles.bottomButtonView }}>
          {setButtonVisible()}
          <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorActiveView} />
          </View>
        </View>
        {!visibleButton ? (
          <View
            style={{
              marginBottom:
                Platform.OS == 'ios' && DeviceInfo.hasNotch ? hp('1%') : 0,
            }}
          >
            <BottomInfoBox
              title={'This answer is used to encrypt your wallet'}
              infoText={'It is extremely important that only you'}
              italicText={' know and remember the answer'}
            />
          </View>
        ) : null}
      
    </View>
  );
}

const styles = StyleSheet.create({
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
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
