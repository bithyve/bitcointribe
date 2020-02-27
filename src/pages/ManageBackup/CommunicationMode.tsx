import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  AsyncStorage,
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
import { nameToInitials } from '../../common/CommonFunctions';
import Contacts from 'react-native-contacts';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function CommunicationMode(props) {
  const contact = props.contact;
  const index = props.index; // synching w/ share indexes in DB
  if (!contact) return <View></View>;
  const dispatch = useDispatch();

  const communicationInfo = [];
  if (contact.phoneNumbers) communicationInfo.push(...contact.phoneNumbers);
  if (contact.emails) communicationInfo.push(...contact.emails);
  const [Contact, setContact] = useState({});
  const [selectedContactMode, setSelectedContactMode] = useState();
  const [contactInfo, setContactInfo] = useState([]);
  


  useEffect(() => {
    setContact(contact);
  }, [contact]);

  const getIconByStatus = status => {
    if (status == 'Ugly') {
      return require('../../assets/images/icons/icon_error_red.png');
    } else if (status == 'Bad') {
      return require('../../assets/images/icons/icon_error_yellow.png');
    } else if (status == 'Good') {
      return require('../../assets/images/icons/icon_check.png');
    }
  };

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
    props.onPressContinue(
      SHARES_TRANSFER_DETAILS[index].OTP
        ? SHARES_TRANSFER_DETAILS[index].OTP
        : null,
      index,
      selectedContactMode,
    );
  };

  const { loading } = useSelector(state => state.sss);

  useEffect(() => {
    if (
      !SHARES_TRANSFER_DETAILS[index] ||
      Date.now() - SHARES_TRANSFER_DETAILS[index].UPLOADED_AT > 600000
    )
      dispatch(uploadEncMShare(index));
    else {
    }
  }, [SHARES_TRANSFER_DETAILS[index]]);

  const editContact = () => {
    var newPerson = {
      recordID: Contact.id ? Contact.id : '',
      emailAddresses: Contact.emails ? Contact.emails : [],
      familyName: Contact.lastName ? Contact.lastName : '',
      givenName: Contact.firstName ? Contact.firstName : '',
      middleName: Contact.middleName ? Contact.middleName : '',
      phoneNumbers: Contact.phoneNumbers ? Contact.phoneNumbers : [],
    };

    Contacts.openExistingContact(newPerson, async(err, contact) => {
      if (err) return;
      if (Contact.id && contact) {
        let ContactTemp = Contact; 
        ContactTemp.emails = contact.emailAddresses ? contact.emailAddresses : [];
        ContactTemp.lastName = contact.familyName ? contact.familyName : '';
        ContactTemp.firstName = contact.givenName ? contact.givenName : '';
        ContactTemp.middleName = contact.middleName ? contact.middleName : '';
        ContactTemp.phoneNumbers = contact.phoneNumbers ? contact.phoneNumbers : [];
        ContactTemp.imageAvailable = contact.hasThumbnail ? contact.hasThumbnail : '';
        ContactTemp.image = contact.thumbnailPath ? contact.thumbnailPath : '';
        setContact(ContactTemp);
        updateNewContactInfo();
        let selectedContactsAsync = JSON.parse(await AsyncStorage.getItem("SelectedContacts"));
        if(selectedContactsAsync){
          if(index == 1){
            selectedContactsAsync[0] = ContactTemp;
          }
          else if(index == 2){
            selectedContactsAsync[1] = ContactTemp;
          }
          await AsyncStorage.setItem("SelectedContacts", JSON.stringify(selectedContactsAsync));
        }
        props.onContactUpdate(ContactTemp);
      }
    });
  };

  useEffect(() => {
    updateNewContactInfo();
  }, [Contact]);

  const updateNewContactInfo = () => {
    let communicationInfo = [];
    if (Contact.phoneNumbers) communicationInfo.push(...Contact.phoneNumbers);
    if (Contact.emails) communicationInfo.push(...Contact.emails);
    let contactInfoTemp = communicationInfo.map(
      ({ number, email }, index) => {
        if (number || email) {
          return {
            id: index,
            info: number || email,
            isSelected: false,
            type: number ? 'number' : 'email',
          };
        }
      },
    );
    contactInfoTemp.push({
      id: contactInfoTemp.length,
      info: 'Qr code',
      isSelected: false,
      type: 'qrcode',
    });
    setContactInfo(contactInfoTemp);
  };

  return (
    <View
      style={{
        height: '100%',
        backgroundColor: Colors.white,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <View
        style={{
          ...BackupStyles.modalHeaderTitleView,
          marginLeft: 10,
          marginRight: 10,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressBack();
            }}
            style={{ height: 30, width: 30 }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View
            style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}
          >
            <Text style={BackupStyles.modalHeaderTitleText}>
              Select Mode of Communication{'\n'}for Contact
            </Text>
            <Text style={BackupStyles.modalHeaderInfoText}>
              You can choose a primary number or email
            </Text>
          </View>
        </View>
        <Image
          style={BackupStyles.cardIconImage}
          source={getIconByStatus('Ugly')}
        />
      </View>
      <TouchableOpacity
        style={{ marginLeft: 'auto', marginRight: 10 }}
        onPress={() => editContact()}
      >
        <Text
          style={{
            fontSize: RFValue(13, 812),
            fontFamily: Fonts.FiraSansRegular,
          }}
        >
          Edit contact
        </Text>
      </TouchableOpacity>
      <View style={{ height: '100%' }}>
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
              <Text style={styles.contactNameText}>{Contact.firstName && Contact.lastName ? Contact.firstName+' '+Contact.lastName : Contact.firstName && !Contact.lastName ? Contact.firstName : !Contact.firstName && Contact.lastName ? Contact.lastName : "" }</Text>
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
                      fontSize: RFValue(20),
                      lineHeight: RFValue(20), //... One for top and one for bottom alignment
                    }}
                  >
                    {nameToInitials(Contact.firstName && Contact.lastName ? Contact.firstName+' '+Contact.lastName : Contact.firstName && !Contact.lastName ? Contact.firstName : !Contact.firstName && Contact.lastName ? Contact.lastName : "")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={{ height: hp('20%') }}>
          <ScrollView>
            {contactInfo.map((item, index) => {
              return (
                <AppBottomSheetTouchableWrapper
                  key={index}
                  onPress={() => onContactSelect(index)}
                  style={styles.contactInfo}
                >
                  <RadioButton
                    isOnModal={true}
                    size={15}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={item.isSelected}
                    onpress={() => onContactSelect(index)}
                  />
                  <Text style={styles.contactInfoText}>{item.info}</Text>
                </AppBottomSheetTouchableWrapper>
              );
            })}
          </ScrollView>
        </View>
        {selectedContactMode ? (
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              communicate(selectedContactMode);
            }}
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
          </AppBottomSheetTouchableWrapper>
        ) : null}
      </View>
    </View>
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
