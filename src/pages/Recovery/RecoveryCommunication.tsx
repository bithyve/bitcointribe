import React, { useState, useEffect } from 'react';
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

export default function RecoveryCommunication(props) {
  const contact = props.navigation.getParam('contact');
  const index = props.navigation.getParam('index');

  const communicationInfo = [];
  if (contact.phoneNumbers) communicationInfo.push(...contact.phoneNumbers);
  if (contact.emails) communicationInfo.push(...contact.emails);

  const [selectedContactMode, setSelectedContactMode] = useState();
  const [contactInfo, setContactInfo] = useState(
    communicationInfo.map(({ number, email }, index) => {
      if (number || email) {
        return {
          id: index,
          info: number || email,
          isSelected: false,
          type: number ? 'number' : 'email',
        };
      }
    }),
  );

  const onContactSelect = index => {
    setContactInfo([
      ...contactInfo.map(item => {
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
    state => state.storage.database,
  );
  const { RECOVERY_SHARES } = DECENTRALIZED_BACKUP;

  const { REQUEST_DETAILS } = RECOVERY_SHARES[index]
    ? RECOVERY_SHARES[index]
    : { REQUEST_DETAILS: null };

  const dispatch = useDispatch();
  useEffect(() => {
    if (!REQUEST_DETAILS) dispatch(requestShare(index));
  }, []);

  // REQUEST_DETAILS ? Alert.alert('OTP', REQUEST_DETAILS.OTP) : null;

  const communicate = async selectedContactMode => {
    const deepLink =
      `https://hexawallet.io/${WALLET_SETUP.walletName}/sss/rk/` + // rk: recovery key
      REQUEST_DETAILS.ENCRYPTED_KEY;

    switch (selectedContactMode.type) {
      case 'number':
        textWithoutEncoding(selectedContactMode.info, deepLink);
        break;

      case 'email':
        email(
          [selectedContactMode.info],
          null,
          null,
          'Guardian request',
          deepLink,
        );
        break;
    }

    console.log('Navigating');
    props.navigation.navigate('ShareRecoveryOTP', {
      OTP: REQUEST_DETAILS.OTP,
    });
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
                <Text style={styles.contactNameText}>{contact.name}</Text>
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
                    {contact.name ? nameToInitials(contact.name) : ''}
                  </Text>
                </View>
              )}
              </View>
            </View>
          </View>
          <View>
            <ScrollView>
              {contactInfo.map((item, index) => {
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
