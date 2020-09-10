import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  AsyncStorage,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
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
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { withNavigation } from 'react-navigation';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';

function HealthCheckSecurityQuestion(props) {
  const { security } = useSelector(
    (state) => state.storage.database.WALLET_SETUP,
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
  const [showAnswer, setShowAnswer] = useState(false);
  const [answer, setAnswer] = useState('');
  const [dropdownBoxList, setDropdownBoxList] = useState(QuestionList);
  const [errorText, setErrorText] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const [KnowMoreBottomSheet, setKnowMoreBottomSheet] = useState(
    React.createRef<BottomSheet>(),
  );

  const setConfirm = () => {
    if (answer.length > 0 && answer != securityAnswer) {
      if (AnswerCounter < 2) {
        AnswerCounter++;
        setAnswerCounter(AnswerCounter);
      } else {
        props.navigation.navigate('ReLogin', {isPasscodeCheck: true});
        setShowAnswer(true);
        setErrorText('');
        return;
      }
      setErrorText('Answer is incorrect');
    } else {
      setErrorText('');
    }
  };

  const setBackspace = (event) => {
    if (event.nativeEvent.key == 'Backspace') {
      setErrorText('');
    }
  };

  useEffect(() => {
    if (answer.trim() == securityAnswer.trim()) {
      setErrorText('');
    }
  }, [answer]);

  useEffect(() => {
    if ((!errorText && !answer && answer) || answer) setIsDisabled(false);
    else setIsDisabled(true);
  }, [answer, errorText]);

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
            <TouchableOpacity
              onPress={() => {
                KnowMoreBottomSheet.current.snapTo(1);
              }}
              style={{ marginLeft: 'auto' }}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  // marginLeft: 'auto',
                }}
              >
                Know more
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ paddingLeft: wp('6%'), paddingRight: wp('6%') }}>
            <View style={styles.dropdownBox}>
              <Text style={styles.dropdownBoxText}>{securityQuestion}</Text>
            </View>
            <View style={{}}>
              <TextInput
                style={{
                  ...styles.inputBox,
                  width: '100%',
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
                onKeyPress={(event) => {
                  setBackspace(event);
                }}
                onChangeText={(text) => {
                  setAnswer(text);
                }}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                onSubmitEditing={(event) => setConfirm()}
                onFocus={() => {
                  if (Platform.OS == 'ios') {
                    props.bottomSheetRef.current.snapTo(2);
                  }
                }}
                onBlur={() => {
                  if (Platform.OS == 'ios') {
                    props.bottomSheetRef.current.snapTo(1);
                  }
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
            </View>
            {showAnswer && (
              <View
                style={{
                  ...styles.inputBox,
                  width: '100%',
                  marginBottom: hp('1%'),
                  borderColor: Colors.borderColor,
                  justifyContent: 'center'
                }}
              >
                <Text
                  style={{
                    fontSize: RFValue(13),
                    color: Colors.textColorGrey,
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  {securityAnswer}
                </Text>
              </View>
            )}
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
            disabled={isDisabled}
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
              setIsDisabled(false);
            }}
            style={{
              ...styles.questionConfirmButton,
              backgroundColor: isDisabled ? Colors.lightBlue : Colors.blue,
            }}
          >
            <Text style={styles.proceedButtonText}>
              {!errorText ? 'Confirm' : 'Try Again'}
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <BottomSheet
        onCloseStart={() => {
          KnowMoreBottomSheet.current.snapTo(0);
        }}
        enabledInnerScrolling={false}
        ref={KnowMoreBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('32%') : hp('36%'),
        ]}
        renderContent={() => (
          <TestAccountHelperModalContents
            topButtonText={'Note'}
            boldPara={''}
            helperInfo={
              'Security question and answer is never stored anywhere and even your contacts don’t know this answer'
            }
          />
        )}
        renderHeader={() => (
          <SmallHeaderModal
            borderColor={Colors.blue}
            backgroundColor={Colors.blue}
            onPressHeader={() => {
              KnowMoreBottomSheet.current.snapTo(0);
            }}
          />
        )}
      />
    </View>
  );
}

export default withNavigation(HealthCheckSecurityQuestion);

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
    color: Colors.black,
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
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
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
