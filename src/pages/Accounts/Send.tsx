import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  ImageBackground,
  FlatList,
  Alert,
} from 'react-native';
import CardView from 'react-native-cardview';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useDispatch, useSelector } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../../common/constants/serviceTypes';
import TestAccountHelperModalContents from '../../components/Helper/TestAccountHelperModalContents';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import { UsNumberFormat } from '../../common/utilities';
import { nameToInitials } from '../../common/CommonFunctions';
import { RNCamera } from 'react-native-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { TrustedContactDerivativeAccountElements } from '../../bitcoin/utilities/Interface';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import {
  addTransferDetails,
  clearTransfer,
} from '../../store/actions/accounts';
import BottomInfoBox from '../../components/BottomInfoBox';
import SendHelpContents from '../../components/Helper/SendHelpContents';

export default function Send(props) {
  const dispatch = useDispatch();
  let [trustedContacts, setTrustedContacts] = useState([]);
  const [openCameraFlag, setOpenCameraFlag] = useState(false);
  const [averageTxFees, setAverageTxFees] = useState(
    props.navigation.getParam('averageTxFees'),
  );
  const [serviceType, setServiceType] = useState(
    props.navigation.getParam('serviceType')
      ? props.navigation.getParam('serviceType')
      : REGULAR_ACCOUNT,
  );
  const sweepSecure = props.navigation.getParam('sweepSecure');
  let netBalance = props.navigation.getParam('netBalance');

  const service = useSelector((state) => state.accounts[serviceType].service);
  const transfer = useSelector((state) => state.accounts[serviceType].transfer);

  const getServiceType = props.navigation.getParam('getServiceType')
    ? props.navigation.getParam('getServiceType')
    : null;
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isSendHelperDone, setIsSendHelperDone] = useState(true);
  const [isInvalidAddress, setIsInvalidAddress] = useState(false);
  const [SendHelperBottomSheet, setSendHelperBottomSheet] = useState(
    React.createRef<BottomSheet>(),
  );
  const [balances, setBalances] = useState({
    testBalance: 0,
    regularBalance: 0,
    secureBalance: 0,
  });
  const [filterContactData, setFilterContactData] = useState([]);
  const accounts = useSelector((state) => state.accounts);
  useEffect(() => {
    const testBalance = accounts[TEST_ACCOUNT].service
      ? accounts[TEST_ACCOUNT].service.hdWallet.balances.balance +
        accounts[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    const regularBalance = accounts[REGULAR_ACCOUNT].service
      ? accounts[REGULAR_ACCOUNT].service.hdWallet.balances.balance +
        accounts[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      : 0;
    const secureBalance = accounts[SECURE_ACCOUNT].service
      ? accounts[SECURE_ACCOUNT].service.secureHDWallet.balances.balance +
        accounts[SECURE_ACCOUNT].service.secureHDWallet.balances
          .unconfirmedBalance
      : 0;
    setBalances({
      testBalance,
      regularBalance,
      secureBalance,
    });
  }, [accounts]);

  const [isEditable, setIsEditable] = useState(true);
  const [accountData, setAccountData] = useState([
    {
      id: REGULAR_ACCOUNT,
      account_name: 'Checking Account',
      type: REGULAR_ACCOUNT,
      checked: false,
      image: require('../../assets/images/icons/icon_regular_account.png'),
    },
    {
      id: SECURE_ACCOUNT,
      account_name: 'Saving Account',
      type: SECURE_ACCOUNT,
      checked: false,
      image: require('../../assets/images/icons/icon_secureaccount_white.png'),
    },
    // {
    //   id: '3',
    //   account_name: 'Test Account',
    //   type: TEST_ACCOUNT,
    //   checked: false,
    //   image: require('../../assets/images/icons/icon_test_white.png'),
    // },
  ]);
  const regularAccount: RegularAccount = useSelector(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const trustedContactsService: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service,
  );

  useEffect(() => {
    if (serviceType === SECURE_ACCOUNT) twoFASetupMethod();
    checkNShowHelperModal();
    if (!averageTxFees) storeAverageTxFees();
  }, []);

  const twoFASetupMethod = async () => {
    if (
      !(await AsyncStorage.getItem('twoFASetup')) &&
      !(await AsyncStorage.getItem('walletRecovered'))
    ) {
      props.navigation.navigate('TwoFASetup', {
        twoFASetup: service.secureHDWallet.twoFASetup,
      });
      await AsyncStorage.setItem('twoFASetup', 'true');
    }
  };

  const storeAverageTxFees = async () => {
    const storedAverageTxFees = await AsyncStorage.getItem(
      'storedAverageTxFees',
    );
    if (storedAverageTxFees) {
      const { averageTxFees, lastFetched } = JSON.parse(storedAverageTxFees);
      if (Date.now() - lastFetched < 1800000) {
        setAverageTxFees(averageTxFees);
        return;
      } // maintaining a half an hour difference b/w fetches
    }
    const instance = service.hdWallet || service.secureHDWallet;
    const averageTxFees = await instance.averageTransactionFee();
    setAverageTxFees(averageTxFees);
    await AsyncStorage.setItem(
      'storedAverageTxFees',
      JSON.stringify({ averageTxFees, lastFetched: Date.now() }),
    );
  };

  const updateAddressBook = async () => {
    let trustedContactsInfo: any = await AsyncStorage.getItem(
      'TrustedContactsInfo',
    );
    if (trustedContactsInfo) {
      trustedContactsInfo = JSON.parse(trustedContactsInfo);
      if (trustedContactsInfo.length) {
        const sendableTrustedContacts = [];
        for (let index = 0; index < trustedContactsInfo.length; index++) {
          const contactInfo = trustedContactsInfo[index];
          if (!contactInfo) continue;
          const contactName = `${contactInfo.firstName} ${
            contactInfo.lastName ? contactInfo.lastName : ''
          }`;
          let connectedVia;
          if (contactInfo.phoneNumbers && contactInfo.phoneNumbers.length) {
            connectedVia = contactInfo.phoneNumbers[0].number;
          } else if (contactInfo.emails && contactInfo.emails.length) {
            connectedVia = contactInfo.emails[0].email;
          }

          let hasXpub = false;
          const {
            trustedContactToDA,
            derivativeAccounts,
          } = regularAccount.hdWallet;
          const accountNumber = trustedContactToDA[contactName.toLowerCase()];
          if (accountNumber) {
            const trustedContact: TrustedContactDerivativeAccountElements =
              derivativeAccounts[TRUSTED_CONTACTS][accountNumber];
            if (
              trustedContact.contactDetails &&
              trustedContact.contactDetails.xpub
            ) {
              hasXpub = true;
            }
          }

          const isWard =
            trustedContactsService.tc.trustedContacts[contactName.toLowerCase()]
              .isWard;

          const isGuardian = index < 3 ? true : false;
          if (hasXpub) {
            // sendable
            sendableTrustedContacts.push({
              contactName,
              connectedVia,
              hasXpub,
              isGuardian,
              isWard,
              ...contactInfo,
            });
          }
        }

        let sortedTrustedContacts = sendableTrustedContacts.sort(function (
          contactA,
          contactB,
        ) {
          if (contactA.contactName && contactB.contactName) {
            if (
              contactA.contactName.toLowerCase() <
              contactB.contactName.toLowerCase()
            )
              return -1;
            if (
              contactA.contactName.toLowerCase() >
              contactB.contactName.toLowerCase()
            )
              return 1;
          }
          return 0;
        });
        setTrustedContacts(sortedTrustedContacts);
      }
    }
  };

  useEffect(() => {
    updateAddressBook();
  }, [regularAccount.hdWallet.derivativeAccounts]);

  const checkNShowHelperModal = async () => {
    let isSendHelperDone = await AsyncStorage.getItem('isSendHelperDone');
    if (!isSendHelperDone && serviceType == TEST_ACCOUNT) {
      await AsyncStorage.setItem('isSendHelperDone', 'true');
      setTimeout(() => {
        setIsSendHelperDone(true);
      }, 10);
      setTimeout(() => {
        if (SendHelperBottomSheet.current)
          SendHelperBottomSheet.current.snapTo(1);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsSendHelperDone(false);
      }, 10);
    }
  };

  const renderSendHelperContents = () => {
    return (
      // <TestAccountHelperModalContents
      //   topButtonText={`Sending Bitcoins`}
      //   image={require('../../assets/images/icons/send.png')}
      //   helperInfo={`When you want to send bitcoins or sats, you need the recipient’s bitcoin address\n\nYou can scan this address as a QR code or copy it from the recipient`}
      //   continueButtonText={'Ok, got it'}
      //   onPressContinue={() => {
      //     if (SendHelperBottomSheet.current)
      //       (SendHelperBottomSheet as any).current.snapTo(0);
      //   }}
      // />
      <SendHelpContents />
    );
  };
  const renderSendHelperHeader = () => {
    return (
      <SmallHeaderModal
        borderColor={Colors.blue}
        backgroundColor={Colors.blue}
        onPressHeader={() => {
          if (isSendHelperDone) {
            if (SendHelperBottomSheet.current)
              (SendHelperBottomSheet as any).current.snapTo(1);
            setTimeout(() => {
              setIsSendHelperDone(false);
            }, 10);
          } else {
            if (SendHelperBottomSheet.current)
              (SendHelperBottomSheet as any).current.snapTo(0);
          }
        }}
      />
    );
  };

  useEffect(() => {
    const instance = service.hdWallet || service.secureHDWallet;
    let isAddressValid = instance.isValidAddress(recipientAddress);
    if (isAddressValid) {
      let item = {
        id: recipientAddress, // address serves as the id during manual addition
      };
      onSelectContact(item);
    }
  }, [recipientAddress]);

  const barcodeRecognized = async (barcodes) => {
    if (barcodes.data) {
      const { type } = service.addressDiff(barcodes.data);
      if (type) {
        let item;
        switch (type) {
          case 'address':
            const recipientAddress = barcodes.data;
            item = {
              id: recipientAddress,
            };
            dispatch(
              addTransferDetails(serviceType, {
                selectedContact: item,
              }),
            );

            onSelectContact(item);
            break;

          case 'paymentURI':
            const { address, options } = service.decodePaymentURI(
              barcodes.data,
            );
            item = {
              id: address,
            };

            dispatch(
              addTransferDetails(serviceType, {
                selectedContact: item,
              }),
            );

            props.navigation.navigate('SendToContact', {
              selectedContact: item,
              serviceType,
              sweepSecure,
              netBalance:
                serviceType === TEST_ACCOUNT
                  ? balances.testBalance
                  : serviceType === REGULAR_ACCOUNT
                  ? balances.regularBalance
                  : balances.secureBalance,
              bitcoinAmount: options.amount ? `${options.amount}` : '',
            });
            break;

          default:
            Alert.alert('Invalid QR');
            break;
        }

        setOpenCameraFlag(false);
      } else {
        setIsInvalidAddress(true);
      }
    }
  };

  const renderQRCodeThumbnail = () => {
    if (openCameraFlag) {
      return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.cameraView}>
            <RNCamera
              ref={(ref) => {
                this.cameraRef = ref;
              }}
              style={styles.camera}
              onBarCodeRead={barcodeRecognized}
              captureAudio={false}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.topCornerView}>
                  <View style={styles.topLeftCornerView} />
                  <View style={styles.topRightCornerView} />
                </View>
                <View style={styles.bottomCornerView}>
                  <View style={styles.bottomLeftCornerView} />
                  <View style={styles.bottomRightCornerView} />
                </View>
              </View>
            </RNCamera>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={{ justifyContent: 'center', alignItems: 'center' }}
        onPress={() => setOpenCameraFlag(true)}
      >
        <ImageBackground
          source={require('../../assets/images/icons/iPhone-QR.png')}
          style={{
            width: wp('90%'),
            height: wp('70%'),
            overflow: 'hidden',
            borderRadius: 20,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              paddingTop: 12,
              paddingRight: 12,
              paddingLeft: 12,
              width: '100%',
            }}
          >
            <View
              style={{
                borderLeftWidth: 1,
                borderTopColor: 'white',
                borderLeftColor: 'white',
                height: hp('5%'),
                width: hp('5%'),
                borderTopWidth: 1,
              }}
            />
            <View
              style={{
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderRightColor: 'white',
                borderTopColor: 'white',
                height: hp('5%'),
                width: hp('5%'),
                marginLeft: 'auto',
              }}
            />
          </View>
          <View
            style={{
              marginTop: 'auto',
              flexDirection: 'row',
              paddingBottom: 12,
              paddingRight: 12,
              paddingLeft: 12,
              width: '100%',
            }}
          >
            <View
              style={{
                borderLeftWidth: 1,
                borderBottomColor: 'white',
                borderLeftColor: 'white',
                height: hp('5%'),
                width: hp('5%'),
                borderBottomWidth: 1,
              }}
            />
            <View
              style={{
                borderBottomWidth: 1,
                borderRightWidth: 1,
                borderRightColor: 'white',
                borderBottomColor: 'white',
                height: hp('5%'),
                width: hp('5%'),
                marginLeft: 'auto',
              }}
            />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const onSelectContact = (item, bitcoinAmount?) => {
    let isNavigate = true;
    console.log({ details: transfer.details });
    if (transfer.details && transfer.details.length === 0) {
      console.log('dispatching');
      dispatch(
        addTransferDetails(serviceType, {
          selectedContact: item,
        }),
      );
      setRecipientAddress('');

      props.navigation.navigate('SendToContact', {
        selectedContact: item,
        serviceType,
        averageTxFees,
        sweepSecure,
        netBalance,
        bitcoinAmount,
      });
    } else {
      transfer.details.length &&
        transfer.details.map((contact) => {
          if (contact.selectedContact.id === item.id) {
            return (isNavigate = false);
          }
        });
      if (isNavigate) {
        dispatch(
          addTransferDetails(serviceType, {
            selectedContact: item,
          }),
        );
        setRecipientAddress('');
        props.navigation.navigate('SendToContact', {
          selectedContact: item,
          serviceType,
          averageTxFees,
          sweepSecure,
          netBalance,
          bitcoinAmount,
        });
      }
    }
  };

  const getImageIcon = (item) => {
    if (item) {
      if (item.image) {
        return <Image source={item.image} style={styles.circleShapeView} />;
      } else {
        return (
          <View
            style={{
              ...styles.circleShapeView,
              backgroundColor: Colors.shadowBlue,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 13,
                lineHeight: 13, //... One for top and one for bottom alignment
              }}
            >
              {item
                ? nameToInitials(
                    item.firstName && item.lastName
                      ? item.firstName + ' ' + item.lastName
                      : item.firstName && !item.lastName
                      ? item.firstName
                      : !item.firstName && item.lastName
                      ? item.lastName
                      : '',
                  )
                : ''}
            </Text>
          </View>
        );
      }
    }
  };

  const renderContacts = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => onSelectContact(item)}>
        <View style={{ justifyContent: 'center', marginRight: hp('4%') }}>
          {transfer.details &&
            transfer.details.length > 0 &&
            transfer.details.map((contact) => {
              if (contact.selectedContact.id === item.id) {
                return (
                  <Image
                    style={styles.checkmarkStyle}
                    source={require('../../assets/images/icons/checkmark.png')}
                    resizeMode="contain"
                  />
                );
              }
            })}
          {getImageIcon(item)}
          <Text numberOfLines={1} style={styles.contactName}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAccounts = ({ item, index }) => {
    let checked = false;
    for (let i = 0; i < transfer.details.length; i++) {
      const element = transfer.details[i].selectedContact;
      if (element.id == item.id) {
        checked = true;
      }
    }
    if (item.type != serviceType) {
      return (
        <TouchableOpacity
          style={{
            height: wp('40%'),
            justifyContent: 'center',
            shadowOffset: {
              width: 4,
              height: 4,
            },
            shadowOpacity: 0.7,
            shadowRadius: 10,
            shadowColor: Colors.borderColor,
            elevation: 10,
          }}
          onPress={() => onSelectContact(item)}
        >
          <CardView
            cornerRadius={10}
            opacity={1}
            style={{
              ...styles.card,
              backgroundColor: checked ? Colors.lightBlue : Colors.white,
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                marginLeft: 2,
                marginRight: 2,
              }}
            >
              <Image
                style={{
                  width: wp('10%'),
                  height: wp('10%'),
                  alignSelf: 'center',
                }}
                source={item.image}
              />
              <Text
                style={{
                  color: checked ? Colors.white : Colors.black,
                  fontSize: RFValue(10),
                  fontWeight: '500',
                  textAlign: 'center',
                  alignSelf: 'center',
                }}
              >
                {item.account_name}
              </Text>
              <Text
                style={{
                  color: checked ? Colors.white : Colors.borderColor,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansRegular,
                  textAlign: 'center',
                  marginTop: 5,
                  alignSelf: 'center',
                }}
              >
                {item.type === REGULAR_ACCOUNT
                  ? '$' + UsNumberFormat(balances.regularBalance)
                  : '$' + UsNumberFormat(balances.secureBalance)}
              </Text>
              <View style={{ marginTop: wp('5%'), marginBottom: 7 }}>
                <TouchableOpacity
                  onPress={() => onSelectContact(item)}
                  style={{
                    height: wp('5%'),
                    width: wp('5%'),
                    borderRadius: wp('5%') / 2,
                    borderWidth: 1,
                    borderColor: checked ? Colors.blue : Colors.borderColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: checked ? Colors.blue : Colors.white,
                  }}
                >
                  {checked && (
                    <Entypo
                      name={'check'}
                      size={RFValue(12)}
                      color={Colors.white}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </CardView>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContentContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : ''}
          enabled
        >
          <ScrollView nestedScrollEnabled={true}>
            <TouchableWithoutFeedback
              onPress={() => {
                if (SendHelperBottomSheet.current)
                  SendHelperBottomSheet.current.snapTo(0);
              }}
            >
              <View onStartShouldSetResponder={() => true}>
                <View style={styles.modalHeaderTitleView}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (getServiceType) {
                          getServiceType(serviceType);
                        }
                        dispatch(clearTransfer(serviceType));
                        props.navigation.goBack();
                      }}
                      style={{
                        height: 30,
                        width: 30,
                        justifyContent: 'center',
                      }}
                    >
                      <FontAwesome
                        name="long-arrow-left"
                        color={Colors.blue}
                        size={17}
                      />
                    </TouchableOpacity>
                    <Text style={styles.modalHeaderTitleText}>{'Send'}</Text>
                    {serviceType == TEST_ACCOUNT ? (
                      <Text
                        onPress={() => {
                          AsyncStorage.setItem('isSendHelperDone', 'true');
                          if (SendHelperBottomSheet.current)
                            SendHelperBottomSheet.current.snapTo(1);
                        }}
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(12),
                          marginLeft: 'auto',
                        }}
                      >
                        Know more
                      </Text>
                    ) : null}
                  </View>
                </View>
                {renderQRCodeThumbnail()}
                <View
                  style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingTop: wp('5%'),
                  }}
                >
                  <View style={styles.textBoxView}>
                    <TextInput
                      editable={isEditable}
                      style={styles.textBox}
                      placeholder={'Enter Address Manually'}
                      keyboardType={
                        Platform.OS == 'ios'
                          ? 'ascii-capable'
                          : 'visible-password'
                      }
                      value={recipientAddress}
                      onChangeText={setRecipientAddress}
                      placeholderTextColor={Colors.borderColor}
                      onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Backspace') {
                          setTimeout(() => {
                            setIsInvalidAddress(false);
                          }, 10);
                        }
                      }}
                      onBlur={() => {
                        const instance =
                          service.hdWallet || service.secureHDWallet;
                        let isAddressValid = instance.isValidAddress(
                          recipientAddress,
                        );
                        setIsInvalidAddress(!isAddressValid);
                      }}
                    />
                  </View>
                  {isInvalidAddress ? (
                    <View style={{ marginLeft: 'auto' }}>
                      <Text style={styles.errorText}>
                        Enter correct address
                      </Text>
                    </View>
                  ) : null}
                  {serviceType != TEST_ACCOUNT ? (
                    <View style={{ paddingTop: wp('3%') }}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text
                          style={{
                            color: Colors.blue,
                            fontSize: RFValue(13),
                            fontFamily: Fonts.FiraSansRegular,
                            marginBottom: wp('3%'),
                          }}
                        >
                          Send to Contact
                        </Text>
                        <TouchableOpacity
                          onPress={() => {}}
                          style={{
                            height: 20,
                            width: 20,
                            justifyContent: 'center',
                            marginLeft: 'auto',
                          }}
                        >
                          <SimpleLineIcons
                            name="options-vertical"
                            color={Colors.blue}
                            size={RFValue(13)}
                          />
                        </TouchableOpacity>
                      </View>
                      {trustedContacts.length ? (
                        <View
                          style={{
                            ...styles.textBoxView,
                            flexDirection: 'column',
                            height: 90,
                            justifyContent: 'center',
                            backgroundColor: Colors.backgroundColor,
                            borderColor: Colors.backgroundColor,
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                backgroundColor: Colors.white,
                                height: wp('12%'),
                                width: wp('6%'),
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                borderRadius: 5,
                                marginLeft: 10,
                                marginRight: 15,
                              }}
                            >
                              <Ionicons
                                name={'ios-arrow-back'}
                                size={RFValue(20)}
                                color={Colors.borderColor}
                              />
                            </TouchableOpacity>
                            <FlatList
                              horizontal
                              nestedScrollEnabled={true}
                              showsHorizontalScrollIndicator={false}
                              data={trustedContacts}
                              renderItem={renderContacts}
                              extraData={transfer.details}
                              keyExtractor={(item, index) => index.toString()}
                            />
                          </View>
                        </View>
                      ) : (
                        <View
                          style={{
                            marginBottom: -25,
                            padding: -20,
                            marginLeft: -20,
                            marginRight: -20,
                          }}
                        >
                          <BottomInfoBox
                            titleColor={Colors.black1}
                            title={'You have not added any Trusted Contact'}
                            infoText={
                              'Add a Trusted Contact to send them sats without having to scan an address'
                            }
                          />
                        </View>
                      )}
                    </View>
                  ) : null}
                  {serviceType != TEST_ACCOUNT ? (
                    <View style={{ paddingTop: wp('3%') }}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text
                          style={{
                            color: Colors.blue,
                            fontSize: RFValue(13),
                            fontFamily: Fonts.FiraSansRegular,
                            marginBottom: wp('3%'),
                          }}
                        >
                          Send to Account
                        </Text>
                        <TouchableOpacity
                          onPress={() => {}}
                          style={{
                            height: 20,
                            width: 20,
                            justifyContent: 'center',
                            marginLeft: 'auto',
                          }}
                        >
                          <SimpleLineIcons
                            name="options-vertical"
                            color={Colors.blue}
                            size={RFValue(13)}
                          />
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          borderRadius: 10,
                          height: wp('40%'),
                          alignItems: 'center',
                          backgroundColor: Colors.backgroundColor,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            backgroundColor: Colors.white,
                            height: wp('12%'),
                            width: wp('6%'),
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            borderRadius: 5,
                            marginLeft: 10,
                          }}
                        >
                          <Ionicons
                            name={'ios-arrow-back'}
                            size={RFValue(20)}
                            color={Colors.borderColor}
                          />
                        </TouchableOpacity>
                        <FlatList
                          data={accountData}
                          horizontal
                          nestedScrollEnabled={true}
                          showsHorizontalScrollIndicator={false}
                          showsVerticalScrollIndicator={false}
                          renderItem={renderAccounts}
                          extraData={transfer.details}
                          //keyExtractor={(item, index) => index.toString()}
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={SendHelperBottomSheet}
        snapPoints={[
          -50,
          hp('89%'),
          // Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderSendHelperContents}
        renderHeader={renderSendHelperHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    paddingBottom: wp('10%'),
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue(11),
    fontStyle: 'italic',
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 15,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: wp('13%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('1%'),
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  circleShapeView: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('14%') / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  card: {
    width: wp('30%'),
    height: wp('35%'),
    marginLeft: 15,
    flexDirection: 'row',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkStyle: {
    position: 'absolute',
    width: wp('5%'),
    height: wp('5%'),
    top: 0,
    right: 0,
    zIndex: 5,
  },
  cameraView: {
    width: wp('90%'),
    height: wp('90%'),
    overflow: 'hidden',
    borderRadius: 20,
  },
  camera: {
    width: wp('90%'),
    height: wp('90%'),
  },
  topCornerView: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%',
  },
  bottomCornerView: {
    marginTop: 'auto',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingRight: 12,
    paddingLeft: 12,
    width: '100%',
  },
  topLeftCornerView: {
    borderLeftWidth: 1,
    borderTopColor: 'white',
    borderLeftColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    borderTopWidth: 1,
  },
  topRightCornerView: {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderTopColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    marginLeft: 'auto',
  },
  bottomLeftCornerView: {
    borderLeftWidth: 1,
    borderBottomColor: 'white',
    borderLeftColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    borderBottomWidth: 1,
  },
  bottomRightCornerView: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderRightColor: 'white',
    borderBottomColor: 'white',
    height: hp('5%'),
    width: hp('5%'),
    marginLeft: 'auto',
  },
  contactName: {
    width: wp('14%'),
    color: Colors.black,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    marginTop: 5,
  },
});
