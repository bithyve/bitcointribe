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
import BottomSheet from 'reanimated-bottom-sheet';
import LoaderModal from '../components/LoaderModal';
import {
  getTestcoins,
  calculateExchangeRate,
  accountsSynched,
} from '../store/actions/accounts';
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../common/constants/serviceTypes';

import DeviceInfo from 'react-native-device-info';

export default function NewWalletQuestion(props) {
  let [message, setMessage] = useState('Creating your wallet');
  let [subTextMessage, setSubTextMessage] = useState(
    'The Hexa wallet is non-custodial and is created locally on your phone so that you have full control of it',
  );
  const [Elevation, setElevation] = useState(10);
  const [isLoaderStart, setIsLoaderStart] = useState(false);
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
  const dispatch = useDispatch();
  const walletName = props.navigation.getParam('walletName');
  const [ansError, setAnsError] = useState('');
  let [tempAns, setTempAns] = useState('');
  const [isEditable, setIsEditable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const { isInitialized, loading } = useSelector((state) => state.setupAndAuth);
  const [loaderBottomSheet, setLoaderBottomSheet] = useState(React.createRef());
  const [confirmAnswerTextInput, setConfirmAnswerTextInput] = useState(
    React.createRef(),
  );
  const [visibleButton, setVisibleButton] = useState(false);
  const accounts = useSelector((state) => state.accounts);
  const testAccService = accounts[TEST_ACCOUNT].service;

  // const [balances, setBalances] = useState({
  //   testBalance: 0,
  //   regularBalance: 0,
  //   secureBalance: 0,
  //   accumulativeBalance: 0,
  // });
  // const [transactions, setTransactions] = useState([]);
  // useEffect(() => {
  //   const testBalance = accounts[TEST_ACCOUNT].service
  //     ? accounts[TEST_ACCOUNT].service.hdWallet.balances.balance +
  //     accounts[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
  //     : 0;
  //   const regularBalance = accounts[REGULAR_ACCOUNT].service
  //     ? accounts[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
  //     accounts[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
  //     : 0;
  //   const secureBalance = accounts[SECURE_ACCOUNT].service
  //     ? accounts[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
  //     accounts[SECURE_ACCOUNT].service.secureHDWallet.balances
  //       .unconfirmedBalance
  //     : 0;
  //   const accumulativeBalance = regularBalance + secureBalance;

  //   const testTransactions = accounts[TEST_ACCOUNT].service
  //     ? accounts[TEST_ACCOUNT].service.hdWallet.transactions.transactionDetails
  //     : [];
  //   const regularTransactions = accounts[REGULAR_ACCOUNT].service
  //     ? accounts[REGULAR_ACCOUNT].service.hdWallet.transactions
  //       .transactionDetails
  //     : [];

  //   const secureTransactions = accounts[SECURE_ACCOUNT].service
  //     ? accounts[SECURE_ACCOUNT].service.secureHDWallet.transactions
  //       .transactionDetails
  //     : [];
  //   const accumulativeTransactions = [
  //     ...testTransactions,
  //     ...regularTransactions,
  //     ...secureTransactions,
  //   ];

  //   setBalances({
  //     testBalance,
  //     regularBalance,
  //     secureBalance,
  //     accumulativeBalance,
  //   });
  //   setTransactions(accumulativeTransactions);
  // }, [accounts]);

  // useEffect(() => {
  //   (async () => {
  //     const storedExchangeRates = await AsyncStorage.getItem('exchangeRates');
  //     if (storedExchangeRates) {
  //       const exchangeRates = JSON.parse(storedExchangeRates);
  //       if (Date.now() - exchangeRates.lastFetched < 1800000) {
  //         setExchangeRates(exchangeRates);
  //         return;
  //       } // maintaining a half an hour difference b/w fetches
  //     }
  //     const res = await axios.get('https://blockchain.info/ticker');
  //     if (res.status == 200) {
  //       const exchangeRates = res.data;
  //       exchangeRates.lastFetched = Date.now();
  //       setExchangeRates(exchangeRates);
  //       await AsyncStorage.setItem(
  //         'exchangeRates',
  //         JSON.stringify(exchangeRates),
  //       );
  //     } else {
  //       console.log('Failed to retrieve exchange rates', res);
  //     }
  //   })();
  // }, []);

  // useEffect(() => {
  //   (async () => {
  //     if (testAccService && !(await AsyncStorage.getItem('walletRecovered')))
  //       if (!(await AsyncStorage.getItem('Received Testcoins'))) {
  //         const { balances } = testAccService.hdWallet;
  //         const netBalance = testAccService
  //           ? balances.balance + balances.unconfirmedBalance
  //           : 0;
  //         if (!netBalance) {
  //           console.log('Getting Testcoins');
  //           dispatch(getTestcoins(TEST_ACCOUNT));
  //         }
  //       }
  //   })();
  // }, [testAccService]);

  useEffect(() => {
    (async () => {
      if (testAccService) {
        const { balances } = testAccService.hdWallet;
        const netBalance = testAccService
          ? balances.balance + balances.unconfirmedBalance
          : 0;
        if (!netBalance) {
          dispatch(getTestcoins(TEST_ACCOUNT));
        }
      }
    })();
  }, [testAccService]);

  const exchangeRates = useSelector((state) => state.accounts.exchangeRates);
  useEffect(() => {
    if (!exchangeRates) {
      dispatch(calculateExchangeRate());
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (isLoaderStart) {
        const security = {
          question: dropdownBoxValue.question,
          answer,
        };
        dispatch(initializeSetup(walletName, security));
        const current = Date.now();
        await AsyncStorage.setItem(
          'SecurityAnsTimestamp',
          JSON.stringify(current),
        );
        const securityQuestionHistory = {
          created: current,
          confirmed: current,
        };
        await AsyncStorage.setItem(
          'securityQuestionHistory',
          JSON.stringify(securityQuestionHistory),
        );
      }
    })();
  }, [isLoaderStart]);

  useEffect(() => {
    if (
      isInitialized
      // exchangeRates &&
      // balances.testBalance &&
      // transactions.length > 0
    ) {
      (loaderBottomSheet as any).current.snapTo(0);
      // dispatch(accountsSynched(true)); // to switch the color of the amount on the account tiles at home
      props.navigation.navigate('HomeNav');
    }
  }, [isInitialized]);

  const setConfirm = () => {
    setConfirmAnswer(tempAns);
    if (answer && confirmAnswer && confirmAnswer != answer) {
      setAnsError('Answers do not match');
    } else {
      setTimeout(() => {
        setAnsError('');
      }, 2);
    }
  };

  const setBackspace = (event) => {
    if (event.nativeEvent.key == 'Backspace') {
      setTimeout(() => {
        setAnsError('');
        setConfirmAnswer('');
        setConfirmAnswerMasked('');
      }, 70);
    }
  };

  useEffect(() => {
    if (answer.trim() == confirmAnswer.trim() && answer && confirmAnswer) {
      setAnsError('');
      setVisibleButton(true);
    } else {
      setVisibleButton(false);
      if (answer && confirmAnswer && confirmAnswer != answer) {
        setTimeout(() => {
          setAnsError('Answers do not match');
        }, 2);
      }
    }
  }, [confirmAnswer]);

  const setButtonVisible = () => {
    setTimeout(() => {
      setAnsError('');
    }, 2);
    return (
      <TouchableOpacity
        onPress={() => {
          (loaderBottomSheet as any).current.snapTo(1);
          seLoaderMessages();
          setTimeout(() => {
            setElevation(0);
          }, 0.2);
          setTimeout(() => {
            setIsLoaderStart(true);
            setIsEditable(false);
            setIsDisabled(true);
          }, 2);
        }}
        style={{ ...styles.buttonView, elevation: Elevation }}
      >
        {/* {!loading.initializing ? ( */}
        <Text style={styles.buttonText}>Confirm</Text>
        {/* ) : (
          <ActivityIndicator size="small" />
        )} */}
      </TouchableOpacity>
    );
  };

  const seLoaderMessages = () => {
    setTimeout(() => {
      setMessage('Bootstrapping Accounts');
      setSubTextMessage(
        'Hexa has a multi-account model which lets you better manage your bitcoin (sats)',
      );
      setTimeout(() => {
        setMessage('Filling Test Account with test sats');
        setSubTextMessage(
          'Preloaded Test Account is the best place to start your Bitcoin journey',
        );
        setTimeout(() => {
          setMessage('Generating Recovery Keys');
          setSubTextMessage(
            'Recovery Keys help you restore your Hexa wallet in case your phone is lost',
          );
        }, 3000);
      }, 3000);
    }, 3000);
  };

  const renderLoaderModalContent = useCallback(() => {
    return <LoaderModal headerText={message} messageText={subTextMessage} />;
  }, [message, subTextMessage]);

  const renderLoaderModalHeader = () => {
    return (
      <View
        style={{
          marginTop: 'auto',
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          height: hp('75%'),
          zIndex: 9999,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
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
                infoTextBold={'Security Question and Answer'}
                infoTextNormal1={'\n(you need to remember this)'}
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
                      returnKeyType="next"
                      autoCorrect={false}
                      editable={isEditable}
                      autoCapitalize="none"
                      onSubmitEditing={() =>
                        (confirmAnswerTextInput as any).current.focus()
                      }
                      keyboardType={
                        Platform.OS == 'ios'
                          ? 'ascii-capable'
                          : 'visible-password'
                      }
                      onChangeText={(text) => {
                        
                        setAnswer(text);
                        setAnswerMasked(text);
                      }}
                      onFocus={() => {
                        setDropdownBoxOpenClose(false);
                        setAnswerInputStyle(styles.inputBoxFocused);
                        if (answer.length > 0) {
                          setAnswer('');
                          setAnswerMasked('');
                        }
                      }}
                      onBlur={() => {
                        setAnswerInputStyle(styles.inputBox);
                        setDropdownBoxOpenClose(false);
                        let temp = '';
                        for (let i = 0; i < answer.length; i++) {
                          temp += '*';
                        }
                        setAnswerMasked(temp);

                        if (
                          answer &&
                          confirmAnswer &&
                          confirmAnswer != answer
                        ) {
                          setAnsError('Answers do not match');
                        } else {
                          setTimeout(() => {
                            setAnsError('');
                          }, 2);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace') {
                          setTimeout(() => {
                            setAnswer('');
                            setAnswerMasked('');
                          }, 70);
                        }
                      }}
                    />
                    {answer ? (
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
                    ) : null}
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
                      ref={confirmAnswerTextInput}
                      placeholder={'Confirm your answer'}
                      placeholderTextColor={Colors.borderColor}
                      value={
                        hideShowConfirmAnswer ? confirmAnswerMasked : tempAns
                      }
                      keyboardType={
                        Platform.OS == 'ios'
                          ? 'ascii-capable'
                          : 'visible-password'
                      }
                      returnKeyType="done"
                      returnKeyLabel="Done"
                      textContentType="none"
                      autoCompleteType="off"
                      autoCorrect={false}
                      editable={isEditable}
                      autoCapitalize="none"
                      onKeyPress={(event) => {
                        setBackspace(event);
                      }}
                      onChangeText={(text) => {
                        
                        setTempAns(text);
                        setConfirmAnswerMasked(text);
                      }}
                      onSubmitEditing={(event) => setConfirm()}
                      onFocus={() => {
                        setDropdownBoxOpenClose(false);
                        setConfirmAnswerInputStyle(styles.inputBoxFocused);
                        if (tempAns.length > 0) {
                          setTempAns('');
                          setAnsError('');
                          setConfirmAnswer('');
                          setConfirmAnswerMasked('');
                        }
                      }}
                      onBlur={() => {
                        setConfirmAnswerInputStyle(styles.inputBox);
                        setDropdownBoxOpenClose(false);
                        let temp = '';
                        for (let i = 0; i < tempAns.length; i++) {
                          temp += '*';
                        }
                        setConfirmAnswerMasked(temp);
                        setConfirm();
                      }}
                    />
                    {tempAns ? (
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
                    ) : null}
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
            </TouchableOpacity>
            <TouchableOpacity style={{
              flexDirection: 'row',
               marginLeft: 25,
               marginRight: 25,
               paddingBottom: 10,
               paddingTop: 10,
            }}
            onPress={()=> props.navigation.navigate('NewOwnQuestions',{
              walletName,
            })}>
              <Text
                style={{
                  fontFamily: Fonts.FiraSansMediumItalic,
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  fontSize: RFValue(12),
                  color: Colors.blue,
                }}
                onPress={()=> props.navigation.navigate('NewOwnQuestions',{
                  walletName,
                })}
              >
                or choose my own Question
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={{ ...styles.bottomButtonView }}>
          {answer.trim() == confirmAnswer.trim() &&
          confirmAnswer.trim() &&
          answer.trim()
            ? setButtonVisible()
            : null}
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
        <BottomSheet
          onCloseEnd={() => {}}
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={loaderBottomSheet}
          snapPoints={[-50, hp('100%')]}
          renderContent={renderLoaderModalContent}
          renderHeader={renderLoaderModalHeader}
        />
      </KeyboardAvoidingView>
    </View>
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
