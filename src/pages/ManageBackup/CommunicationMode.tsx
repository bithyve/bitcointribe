import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Colors from '../../common/Colors';
import BackupStyles from './Styles';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import RadioButton from '../../components/RadioButton';
import { useSelector } from 'react-redux';
import { textWithoutEncoding, email } from 'react-native-communications';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch } from 'react-redux';
import { uploadEncMShare } from '../../store/actions/sss';
import ShareOtpWithTrustedContactContents from '../../components/ShareOtpWithTrustedContactContents';
import { nameToInitials } from '../../common/CommonFunctions';

export default function CommunicationMode(props) {
  const secretSharedTrustedContact1 = props.navigation.state.params
    .secretSharedTrustedContact1
    ? props.navigation.state.params.secretSharedTrustedContact1
    : null;
  const secretSharedTrustedContact2 = props.navigation.state.params
    .secretSharedTrustedContact2
    ? props.navigation.state.params.secretSharedTrustedContact2
    : null;

  const contact = props.navigation.getParam('contact');
  console.log("CONTACT in Communication mode", contact);
  const index = props.navigation.getParam('index');
  if (!contact) return <View></View>;
  const dispatch = useDispatch();

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
  const { SHARES_TRANSFER_DETAILS } = DECENTRALIZED_BACKUP;

  const communicate = async selectedContactMode => {
    if (!SHARES_TRANSFER_DETAILS[index]) {
      Alert.alert('Failed to share');
      return;
    }
    const deepLink =
      `https://hexawallet.io/${WALLET_SETUP.walletName}/sss/ek/` +
      SHARES_TRANSFER_DETAILS[index].ENCRYPTED_KEY;

    switch (selectedContactMode.type) {
      case 'number':
        textWithoutEncoding(selectedContactMode.info, deepLink);
        if (secretSharedTrustedContact1) {
          secretSharedTrustedContact1(true);
        }
        if (secretSharedTrustedContact2) {
          secretSharedTrustedContact2(true);
        }
        // props.navigation.goBack();
        break;

      case 'email':
        email(
          [selectedContactMode.info],
          null,
          null,
          'Guardian request',
          deepLink,
        );
        if (secretSharedTrustedContact1) {
          secretSharedTrustedContact1(true);
        }
        if (secretSharedTrustedContact2) {
          secretSharedTrustedContact2(true);
        }
        // props.navigation.goBack();
        break;
    }
    props.navigation.navigate('ShareOtpWithTrustedContactContents', {
      OTP: SHARES_TRANSFER_DETAILS[index].OTP,
    });
  };

  const { loading } = useSelector(state => state.sss);

  useEffect(() => {
    console.log('Running');
    console.log({ DETAILS: SHARES_TRANSFER_DETAILS });
    if (
      !SHARES_TRANSFER_DETAILS[index] ||
      Date.now() - SHARES_TRANSFER_DETAILS[index].UPLOADED_AT > 600000
    )
      dispatch(uploadEncMShare(index));
    else {
      //  Alert.alert('OTP', SHARES_TRANSFER_DETAILS[index].OTP);
      console.log(SHARES_TRANSFER_DETAILS[index]);
    }
  }, [SHARES_TRANSFER_DETAILS[index]]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={BackupStyles.headerContainer}>
        <TouchableOpacity
          style={BackupStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
        >
          <View style={BackupStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
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
            {contact.imageAvailable ? (<Image
                  source={contact.image}
                  style={{ ...styles.contactProfileImage }}
                />) : (<View style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.shadowBlue,
                    width: 70,
                    height: 70,
                    borderRadius: 70 / 2,
                  }}><Text style={{
                    textAlign: 'center',
                    fontSize: 13,
                    lineHeight: 13, //... One for top and one for bottom alignment
                  }}>{nameToInitials(contact.name)}</Text></View>)
                }
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
            onPress={() => communicate(selectedContactMode)}
            disabled={loading.uploadMetaShare}
            style={{
              ...styles.proceedButtonView,
              backgroundColor: Colors.blue,
            }}
          >
            {loading.uploadMetaShare ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.proceedButtonText}>Proceed</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
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
