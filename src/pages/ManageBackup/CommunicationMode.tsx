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
import Contacts from 'react-native-contacts';
import * as ExpoContacts from 'expo-contacts';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import {ScrollView} from "react-native-gesture-handler";

export default function CommunicationMode(props) {
  // const [selectedStatus, setSelectedStatus] = useState('Ugly'); // for preserving health of this entity
  const secretSharedTrustedContact1 = props.secretSharedTrustedContact1
    ? props.secretSharedTrustedContact1
    : null;
  const secretSharedTrustedContact2 = props.secretSharedTrustedContact2
    ? props.secretSharedTrustedContact2
    : null;

  const contact = props.contact;
  const index = props.index; // synching w/ share indexes in DB
  if (!contact) return <View></View>;
  const dispatch = useDispatch();

  const communicationInfo = [];
  if (contact.phoneNumbers) communicationInfo.push(...contact.phoneNumbers);
  if (contact.emails) communicationInfo.push(...contact.emails);
  const [Contact, setContact] = useState({});
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
    }));

  useEffect(()=>{
    setContact(contact);
  });
  
  useEffect(()=>{
    updateNewContactInfo();
  },[Contact]);

  const updateNewContactInfo = () =>{
    let communicationInfo = [];
    if (contact.phoneNumbers) communicationInfo.push(...contact.phoneNumbers);
    if (contact.emails) communicationInfo.push(...contact.emails);
    if(contactInfo.length == 0 || (contactInfo.length>0 && communicationInfo.findIndex((value)=>value.email ==contactInfo[0].info || value.number ==contactInfo[0].info)==-1 )){
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
        info: 'Qr code',
        isSelected: false,
        type: 'qrcode',
      }) 
      setTimeout(() => {
        setContactInfo(contactInfoTemp);
      }, 2);
    }
  }

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
    // contactInfo[index].isSelected would become true during the next render cycle (batched state updates)
    if (!contactInfo[index].isSelected) {
      setSelectedContactMode({ ...contactInfo[index], isSelected: true });
    } else {
      setSelectedContactMode(null);
    }
  };

  useEffect(()=>{
    if(!selectedContactMode){
      let temp = [];setTimeout(() => {
        setContactInfo(temp);
      }, 1000);
    }
  }, [selectedContactMode])

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
        break;
    }
    props.onPressContinue(
      SHARES_TRANSFER_DETAILS[index].OTP
        ? SHARES_TRANSFER_DETAILS[index].OTP
        : null,
      index,
      selectedContactMode
    );
    // props.navigation.navigate('ShareOtpWithTrustedContactContents', {
    //   OTP:'123456'
    //   // OTP: SHARES_TRANSFER_DETAILS[index].OTP,
    // });
  };

  const { loading } = useSelector(state => state.sss);

  useEffect(() => {
    // console.log({ DETAILS: SHARES_TRANSFER_DETAILS });
    if (
      !SHARES_TRANSFER_DETAILS[index] ||
      Date.now() - SHARES_TRANSFER_DETAILS[index].UPLOADED_AT > 600000
    )
      dispatch(uploadEncMShare(index));
    else {
      //  Alert.alert('OTP', SHARES_TRANSFER_DETAILS[index].OTP);
      // console.log(SHARES_TRANSFER_DETAILS[index]);
    }
  }, [SHARES_TRANSFER_DETAILS[index]]);

  const editContact = () => {
    let contactId = contact.id;
    // ExpoContacts.presentFormAsync(contactId).then(() => {
    //       console.log("DATA");
    // })
    var newPerson = {
      recordID: contact.id ? contact.id : '',
      emailAddresses: contact.emails ? contact.emails : [],
      familyName: contact.lastName ? contact.lastName : '',
      givenName: contact.firstName ? contact.firstName : '',
      middleName: contact.middleName ? contact.middleName : '',
      phoneNumbers: contact.phoneNumbers ? contact.phoneNumbers : [],
    };

    Contacts.openExistingContact(newPerson, async (err, contact) => {
      if (err) throw err;
      // console.log('contact editContact', contact);
      if (contact) {
        let contactListArray = [];
        const contactList = JSON.parse(
          await AsyncStorage.getItem('SelectedContacts'),
        );
        if (contactList) {
          contactListArray = contactList;
          for (let i = 0; i < contactListArray.length; i++) {
            if (contact.recordID == contactListArray[i].id) {
              (contactListArray[i].id = contact.recordID
                ? contact.recordID
                : ''),
                (contactListArray[i].emails = contact.emailAddresses
                  ? contact.emailAddresses
                  : ''),
                (contactListArray[i].lastName = contact.familyName
                  ? contact.familyName
                  : ''),
                (contactListArray[i].firstName = contact.givenName
                  ? contact.givenName
                  : ''),
                (contactListArray[i].middleName = contact.middleName
                  ? contact.middleName
                  : ''),
                (contactListArray[i].phoneNumbers = contact.phoneNumbers
                  ? contact.phoneNumbers
                  : ''),
                (contactListArray[i].imageAvailable = contact.hasThumbnail
                  ? contact.hasThumbnail
                  : ''),
                (contactListArray[i].image = contact.thumbnailPath
                  ? contact.thumbnailPath
                  : ''),
                (contactListArray[i].name = contact.givenName
                  ? contact.givenName
                  : '' + contact.familyName
                  ? contact.familyName
                  : ''),
                setContact(contactListArray[i]);
              //await AsyncStorage.setItem('SelectedContacts', JSON.stringify(contactListArray[i]));
            }
          }
        }
      }
    });
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
        <View style={{ height: hp('20%') }}>
          <ScrollView>
            {contactInfo.map((item, index) => {
              // console.log("contact commmunication", contact);
              return (
                <AppBottomSheetTouchableWrapper
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
            onPress={() =>{ communicate(selectedContactMode)}}
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
