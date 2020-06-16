import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import DeviceInfo from 'react-native-device-info';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import RadioButton from '../../components/RadioButton';
import { useDispatch, useSelector } from 'react-redux';
import { textWithoutEncoding, email } from 'react-native-communications';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import commonStyle from '../../common/Styles';
import { requestShare } from '../../store/actions/sss';
import { nameToInitials } from '../../common/CommonFunctions';
import BottomSheet from 'reanimated-bottom-sheet';
import ModalHeader from '../../components/ModalHeader';
import RecoveryTrustedQR from './RecoveryTrustedQR';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';
import config from '../../bitcoin/HexaConfig';

export default function RecoveryCommunication(props) {
  const contact = props.navigation.getParam('contact');
  const index = props.navigation.getParam('index');
  const [
    trustedContactQrBottomSheet,
    setTrustedContactQrBottomSheet,
  ] = useState(React.createRef());
  const communicationInfo = [];
  if (contact.phoneNumbers) communicationInfo.push(...contact.phoneNumbers);
  if (contact.emails) communicationInfo.push(...contact.emails);

  const [selectedContactMode, setSelectedContactMode] = useState();
  const [contactInfo, setContactInfo] = useState([]);
  const [trustedQR, setTrustedQR] = useState('');

  const onContactSelect = (index) => {
    setContactInfo([
      ...contactInfo.map((item) => {
        if (item !== contactInfo[index]) {
          return {
            ...item,
            isSelected: false,
          };
        } else {
          return {
            ...item,
            isSelected: !item.isSelected,
          };
        }
      }),
    ]);
    // contactInfo[index].isSelected would become true during the next render cycle (batched state updates)
    if (!contactInfo[index].isSelected) {
      setSelectedContactMode({ ...contactInfo[index], isSelected: true });
    } else {
      setSelectedContactMode(null);
    }
  };

  const { DECENTRALIZED_BACKUP, WALLET_SETUP } = useSelector(
    (state) => state.storage.database,
  );
  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;

  const { REQUEST_DETAILS } = RECOVERY_SHARES[index]
    ? RECOVERY_SHARES[index]
    : { REQUEST_DETAILS: null };

  const dispatch = useDispatch();
  useEffect(() => {
    if (!REQUEST_DETAILS) dispatch(requestShare(index));

    let contactInfoTemp = communicationInfo.map(({ number, email }, index) => {
      if (number || email) {
        return {
          id: index,
          info: number || email,
          isSelected: false,
          type: number ? 'number' : 'email',
        };
      }
    });
    contactInfoTemp.push({
      id: contactInfoTemp.length,
      info: 'QR code',
      isSelected: false,
      type: 'qrcode',
    });
    setContactInfo(contactInfoTemp);
  }, []);

  // REQUEST_DETAILS ? Alert.alert('OTP', REQUEST_DETAILS.OTP) : null;
  REQUEST_DETAILS && !trustedQR
    ? setTrustedQR(
        JSON.stringify({
          ...REQUEST_DETAILS,
          requester: WALLET_SETUP.walletName,
          type: 'recoveryQR',
          ver: DeviceInfo.getVersion(),
        }),
      )
    : null;

  const communicate = async (selectedContactMode) => {
    const requester = WALLET_SETUP.walletName;
    const appVersion = DeviceInfo.getVersion();
    switch (selectedContactMode.type) {
      case 'number':
        const number = selectedContactMode.info.replace(/[^0-9]/g, ''); // removing non-numeric characters
        const numHintType = 'num';
        const numHint = number.slice(number.length - 3);
        const numberEncKey = TrustedContactsService.encryptPub(
          // using TCs encryption mech
          REQUEST_DETAILS.KEY,
          number,
        ).encryptedPub;

        const numberDL =
          `https://hexawallet.io/${config.APP_STAGE}/rk` +
          `/${requester}` +
          `/${numberEncKey}` +
          `/${numHintType}` +
          `/${numHint}` +
          `/v${appVersion}`;

        textWithoutEncoding(selectedContactMode.info, numberDL);
        // props.navigation.navigate('ShareRecoveryOTP', {
        //   OTP: REQUEST_DETAILS.OTP,
        // });
        setTimeout(() => {
          props.navigation.navigate('RestoreSelectedContactsList');
        }, 1000);
        break;

      case 'email':
        const emailInitials: string = selectedContactMode.info.split('@')[0];
        const emailHintType = 'eml';
        const emailHint = emailInitials.slice(emailInitials.length - 3);
        const emailEncPubKey = TrustedContactsService.encryptPub(
          REQUEST_DETAILS.KEY,
          emailInitials,
        ).encryptedPub;
        const emailDL =
          `https://hexawallet.io/${config.APP_STAGE}/rk` +
          `/${requester}` +
          `/${emailEncPubKey}` +
          `/${emailHintType}` +
          `/${emailHint}` +
          `/v${appVersion}`;

        email(
          [selectedContactMode.info],
          null,
          null,
          'Keeper request',
          emailDL,
        );
        // props.navigation.navigate('ShareRecoveryOTP', {
        //   OTP: REQUEST_DETAILS.OTP,
        // });
        setTimeout(() => {
          props.navigation.navigate('RestoreSelectedContactsList');
        }, 1000);
        break;
      case 'qrcode':
        (trustedContactQrBottomSheet as any).current.snapTo(1);
        break;
    }
  };

  const renderTrustedContactQrContents = () => {
    return (
      <RecoveryTrustedQR
        trustedQR={trustedQR}
        onPressOk={() => (trustedContactQrBottomSheet as any).current.snapTo(0)}
        onPressBack={() => {
          (trustedContactQrBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderTrustedContactQrHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (trustedContactQrBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={commonStyle.headerContainer}>
        <TouchableOpacity
          style={commonStyle.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
        >
          <View style={commonStyle.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.modalContentContainer}>
        <View style={{ height: '100%' }}>
          <View style={{ marginTop: hp('2%'), marginBottom: hp('2%') }}>
            <Text style={styles.commModeModalHeaderText}>
              Select Mode of Communication{'\n'}for Contact
            </Text>
            <Text style={styles.commModeModalInfoText}>
              You can choose a primary number or email
            </Text>
          </View>
          <View style={styles.contactProfileView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: Colors.backgroundColor,
                  flex: 1,
                  height: 80,
                  justifyContent: 'center',
                  marginLeft: 60,
                  overflow: 'hidden',
                  position: 'relative',
                  borderRadius: 10,
                }}
              >
                <Text style={styles.contactNameText}>
                  {contact.firstName && contact.lastName
                    ? contact.firstName + ' ' + contact.lastName
                    : contact.firstName && !contact.lastName
                    ? contact.firstName
                    : !contact.firstName && contact.lastName
                    ? contact.lastName
                    : ''}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: Colors.white,
                  width: 80,
                  height: 80,
                  borderRadius: 80 / 2,
                  position: 'absolute',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {contact.imageAvailable ? (
                  <Image
                    source={contact.image}
                    style={{ ...styles.contactProfileImage }}
                  />
                ) : (
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: Colors.shadowBlue,
                      width: 70,
                      height: 70,
                      borderRadius: 70 / 2,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 13,
                        lineHeight: 13, //... One for top and one for bottom alignment
                      }}
                    >
                      {nameToInitials(
                        contact.firstName && contact.lastName
                          ? contact.firstName + ' ' + contact.lastName
                          : contact.firstName && !contact.lastName
                          ? contact.firstName
                          : !contact.firstName && contact.lastName
                          ? contact.lastName
                          : '',
                      )}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View>
            <ScrollView>
              {contactInfo &&
                contactInfo.map((item, index) => {
                  return (
                    <TouchableOpacity
                      onPress={() => onContactSelect(index)}
                      style={styles.contactInfo}
                    >
                      <RadioButton
                        size={15}
                        color={Colors.lightBlue}
                        borderColor={Colors.borderColor}
                        isChecked={item.isSelected}
                        onpress={() => onContactSelect(index)}
                      />
                      <Text style={styles.contactInfoText}>{item.info}</Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
          {selectedContactMode ? (
            <TouchableOpacity
              onPress={() => {
                communicate(selectedContactMode);
                // setTimeout(() => props.navigation.goBack(), 5);
              }}
              disabled={!REQUEST_DETAILS}
              style={{
                ...styles.proceedButtonView,
                backgroundColor: Colors.blue,
              }}
            >
              {!REQUEST_DETAILS ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.proceedButtonText}>Proceed</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <BottomSheet
        onCloseStart={() => {}}
        enabledInnerScrolling={true}
        ref={trustedContactQrBottomSheet as any}
        snapPoints={[-30, hp('85%')]}
        renderContent={renderTrustedContactQrContents}
        renderHeader={renderTrustedContactQrHeader}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  commModeModalHeaderText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(18),
    marginLeft: 20,
    marginRight: 20,
  },
  commModeModalInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginLeft: 20,
    marginRight: 20,
    marginTop: hp('0.7%'),
  },
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('3%'),
    marginTop: hp('3.5%'),
  },
  contactProfileImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
    borderRadius: 70 / 2,
  },
  contactNameText: {
    color: Colors.black,
    fontSize: RFValue(25),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  contactInfo: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
  },
  contactInfoText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    marginLeft: 10,
  },
  proceedButtonView: {
    marginLeft: 20,
    marginTop: hp('3.5%'),
    height: wp('13%'),
    width: wp('30%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
