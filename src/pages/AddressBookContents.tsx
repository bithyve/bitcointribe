import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Image,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { trustedChannelsSync } from '../store/actions/trustedContacts';
import RegularAccount from '../bitcoin/services/accounts/RegularAccount';
import {
  REGULAR_ACCOUNT,
  TRUSTED_CONTACTS,
} from '../common/constants/serviceTypes';
import { TrustedContactDerivativeAccountElements } from '../bitcoin/utilities/Interface';
import { nameToInitials } from '../common/CommonFunctions';
import TrustedContactsService from '../bitcoin/services/TrustedContactsService';
import BottomInfoBox from '../components/BottomInfoBox';
import AddContactAddressBook from './Contacts/AddContactAddressBook';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import ModalHeader from '../components/ModalHeader';
import config from '../bitcoin/HexaConfig';

export default function AddressBookContents(props) {
  const [onRefresh, setOnRefresh] = useState(false);
  const [
    AddContactAddressBookBookBottomSheet,
    setAddContactAddressBookBottomSheet,
  ] = useState(React.createRef<BottomSheet>());
  const [isLoadContacts, setIsLoadContacts] = useState(false);
  const [SelectedContact, setSelectedContact] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [trustedContact, setTrustedContact] = useState([]);
  let [MyKeeper, setMyKeeper] = useState([]);
  let [IMKeeper, setIMKeeper] = useState([]);
  let [OtherTrustedContact, setOtherTrustedContact] = useState([]);
  const regularAccount: RegularAccount = useSelector(
    (state) => state.accounts[REGULAR_ACCOUNT].service,
  );
  const trustedContactsService: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service,
  );

  const trustedChannelsSyncing = useSelector(
    (state) => state.trustedContacts.loading.trustedChannelsSync,
  );
  useEffect(() => {
    setOnRefresh(trustedChannelsSyncing);
  }, [trustedChannelsSyncing]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [trustedContact]);

  const updateAddressBook = async () => {
    let trustedContactsInfo: any = await AsyncStorage.getItem(
      'TrustedContactsInfo',
    );
    let myKeepers = [];
    let imKeepers = [];
    let otherTrustedContact = [];
    if (trustedContactsInfo) {
      trustedContactsInfo = JSON.parse(trustedContactsInfo);
      if (trustedContactsInfo.length) {
        const trustedContacts = [];
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
          const accountNumber =
            trustedContactToDA[contactName.toLowerCase().trim()];
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
            trustedContactsService.tc.trustedContacts[
              contactName.toLowerCase().trim()
            ].isWard;

          const isGuardian = index < 3 ? true : false;
          let shareIndex;
          if (isGuardian) {
            shareIndex = index;
          }

          const initiatedAt =
            trustedContactsService.tc.trustedContacts[
              contactName.toLowerCase().trim()
            ].ephemeralChannel.initiatedAt;

          const hasTrustedChannel = trustedContactsService.tc.trustedContacts[
            contactName.toLowerCase().trim()
          ].symmetricKey
            ? true
            : false;

          const element = {
            contactName,
            connectedVia,
            hasXpub,
            isGuardian,
            isWard,
            initiatedAt,
            shareIndex,
            hasTrustedChannel,
            ...contactInfo,
          };
          trustedContacts.push(element);
          if (element.isGuardian) {
            myKeepers.push(element);
          }
          if (element.isWard) {
            imKeepers.push(element);
          }
          if (!element.isWard && !element.isGuardian) {
            otherTrustedContact.push(element);
          }
        }
        setMyKeeper(myKeepers);
        setIMKeeper(imKeepers);
        setOtherTrustedContact(otherTrustedContact);
        setTrustedContact(trustedContacts);
      }
    }
  };

  useEffect(() => {
    updateAddressBook();
  }, [regularAccount.hdWallet.derivativeAccounts]);

  const dispatch = useDispatch();
  useEffect(() => {
    let focusListener = props.navigation.addListener('didFocus', () => {
      dispatch(trustedChannelsSync());
    });
    return () => {
      focusListener.remove();
    };
  }, []);

  const getImageIcon = (item) => {
    if (item) {
      if (item.image && item.image.uri) {
        return (
          <Image
            source={item.image}
            style={{
              width: wp('12%'),
              height: wp('12%'),
              borderRadius: wp('12%') / 2,
              resizeMode: 'contain',
            }}
          />
        );
      } else {
        return (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: Colors.shadowBlue,
              width: wp('12%'),
              height: wp('12%'),
              borderRadius: wp('12%') / 2,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 13,
                lineHeight: 13,
              }}
            >
              {item
                ? nameToInitials(
                    item.firstName == 'Secondary' && item.lastName == 'Device'
                      ? 'Keeper Device'
                      : item.firstName && item.lastName
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

  const getElement = (contact, index, contactsType) => {
    return (
      <TouchableOpacity
        key={contact.id}
        onPress={() => {
          props.navigation.navigate('ContactDetails', {
            contactsType,
            contact,
            index,
            shareIndex: contact.shareIndex,
          });
        }}
        style={styles.selectedContactsView}
      >
        {getImageIcon(contact)}
        <View>
          <Text style={styles.contactText}>
            {contact.contactName &&
            contact.contactName.split(' ')[0] &&
            contact.contactName != 'Secondary Device'
              ? contact.contactName.split(' ')[0]
              : contact.contactName && contact.contactName == 'Secondary Device'
              ? 'Keeper'
              : ''}{' '}
            <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
              {contact.contactName &&
              contact.contactName.split(' ')[1] &&
              contact.contactName != 'Secondary Device'
                ? contact.contactName.split(' ')[1]
                : contact.contactName &&
                  contact.contactName == 'Secondary Device'
                ? 'Device'
                : ''}
            </Text>
          </Text>
          {contact.connectedVia ? (
            <Text style={styles.phoneText}>{contact.connectedVia}</Text>
          ) : null}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 'auto',
          }}
        >
          {!contact.hasXpub && (
            <View
              style={{
                width: wp('15%'),
                height: wp('6%'),
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colors.borderColor,
                marginRight: 10,
                borderRadius: 5,
              }}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                {Date.now() - contact.initiatedAt > config.TC_REQUEST_EXPIRY &&
                !contact.hasTrustedChannel
                  ? 'Expired'
                  : 'Pending'}
              </Text>
            </View>
          )}
          <View
            style={{
              width: 10,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 'auto',
              marginRight: 10,
            }}
          >
            <Ionicons
              name="ios-arrow-forward"
              color={Colors.borderColor}
              size={RFValue(15)}
              style={{
                marginLeft: 'auto',
                alignSelf: 'center',
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getWaterMark = () => {
    return (
      <View
        style={{
          marginBottom: 15,
          marginLeft: wp('5%'),
          marginRight: wp('5%'),
        }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}
        >
          <View>
            <View style={styles.watermarkViewBigText} />
            <View style={styles.watermarkViewSmallText} />
          </View>
          <View style={styles.watermarkViewButton} />
          <View style={styles.watermarkViewArrow} />
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: Colors.borderColor,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
          }}
        >
          <View>
            <View style={styles.watermarkViewBigText} />
            <View style={styles.watermarkViewSmallText} />
          </View>
          <View style={styles.watermarkViewButton} />
          <View style={styles.watermarkViewArrow} />
        </View>
      </View>
    );
  };

  const renderAddContactAddressBookContents = () => {
    return (
      <AddContactAddressBook
        isLoadContacts={isLoadContacts}
        modalRef={AddContactAddressBookBookBottomSheet}
        proceedButtonText={'Confirm & Proceed'}
        onPressContinue={() => {
          props.navigation.navigate('AddContactSendRequest', {
            SelectedContact: SelectedContact,
          });
          (AddContactAddressBookBookBottomSheet as any).current.snapTo(0);
        }}
        onSelectContact={(selectedContact) => {
          setSelectedContact(selectedContact);
        }}
        onPressBack={() => {
          (AddContactAddressBookBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  const renderAddContactAddressBookHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (AddContactAddressBookBookBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{ height: 30, width: 30, justifyContent: 'center' }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitleText}>
              {'Friends and Family'}
            </Text>
          </View>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={onRefresh}
              onRefresh={() => {
                dispatch(trustedChannelsSync());
              }}
            />
          }
          style={{ flex: 1 }}
        >
          <View style={{ marginTop: wp('2%') }}>
            <Text style={styles.pageTitle}>My Keepers</Text>
            <Text style={styles.pageInfoText}>
              Contacts who can help me restore my wallet
            </Text>
            {!Loading ? (
              <View style={{ marginBottom: 15 }}>
                <View style={{ height: 'auto' }}>
                  {MyKeeper.length > 0 ? (
                    MyKeeper.map((item, index) => {
                      return getElement(item, index, 'My Keepers');
                    })
                  ) : (
                    <View style={{ height: wp('22%') + 30 }} />
                  )}
                </View>
              </View>
            ) : (
              getWaterMark()
            )}
          </View>
          <View style={{ marginTop: wp('5%') }}>
            <Text style={styles.pageTitle}>I am the Keeper of</Text>
            <Text style={styles.pageInfoText}>
              Contacts who I can help restore their wallets
            </Text>

            {!Loading ? (
              <View style={{ marginBottom: 15 }}>
                <View style={{ height: 'auto' }}>
                  {IMKeeper.length > 0 ? (
                    IMKeeper.map((item, index) => {
                      return getElement(item, index, "I'm Keeper of");
                    })
                  ) : (
                    <View style={{ height: wp('22%') + 30 }} />
                  )}
                </View>
              </View>
            ) : (
              getWaterMark()
            )}
          </View>
          <View style={{ marginTop: wp('5%') }}>
            <Text style={styles.pageTitle}>Other Trusted Contacts</Text>
            <Text style={styles.pageInfoText}>
              Contacts who I can pay directly
            </Text>
            {!Loading ? (
              <View style={{ marginBottom: 15 }}>
                <View style={{ height: 'auto' }}>
                  {OtherTrustedContact.length > 0 ? (
                    OtherTrustedContact.map((item, index) => {
                      return getElement(item, index, 'Other Contacts');
                    })
                  ) : (
                    <View style={{ height: wp('22%') + 30 }} />
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setTimeout(() => {
                        setIsLoadContacts(true);
                      }, 2);
                      AddContactAddressBookBookBottomSheet.current.snapTo(1);
                    }}
                    style={{
                      ...styles.selectedContactsView,
                      paddingBottom: 7,
                      paddingTop: 7,
                      marginTop: 0,
                    }}
                  >
                    <Image
                      style={{
                        width: wp('10%'),
                        height: wp('10%'),
                        marginLeft: 5,
                      }}
                      source={require('../assets/images/icons/icon_add_grey.png')}
                    />
                    <View>
                      <Text style={styles.contactText}>
                        Add Trusted Contact
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              getWaterMark()
            )}
          </View>
          {OtherTrustedContact.length == 0 &&
            IMKeeper.length == 0 &&
            MyKeeper.length == 0 && (
              <BottomInfoBox
                title={'Note'}
                infoText={
                  'All your contacts appear here when added to Hexa wallet'
                }
              />
            )}
        </ScrollView>
      </View>
      <BottomSheet
        enabledInnerScrolling={true}
        ref={AddContactAddressBookBookBottomSheet as any}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('82%') : hp('82%'),
        ]}
        renderContent={renderAddContactAddressBookContents}
        renderHeader={renderAddContactAddressBookHeader}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 15,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  phoneText: {
    marginTop: 3,
    marginLeft: 10,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginTop: 5,
    paddingBottom: 15,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
  },
  shareButtonView: {
    height: wp('7%'),
    width: wp('18%'),
    backgroundColor: Colors.backgroundColor,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 5,
    marginLeft: 'auto',
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pageTitle: {
    marginLeft: 30,
    color: Colors.blue,
    fontSize: RFValue(14),
    fontFamily: Fonts.FiraSansRegular,
  },
  pageInfoText: {
    marginLeft: 30,
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 3,
  },
  watermarkViewBigText: {
    backgroundColor: Colors.backgroundColor,
    height: wp('5%'),
    width: wp('35%'),
    borderRadius: 10,
  },
  watermarkViewSmallText: {
    backgroundColor: Colors.backgroundColor,
    height: wp('3%'),
    width: wp('25%'),
    marginTop: 3,
    borderRadius: 10,
  },
  watermarkViewButton: {
    marginLeft: 'auto',
    backgroundColor: Colors.backgroundColor,
    height: wp('7%'),
    width: wp('18%'),
    borderRadius: 10,
  },
  watermarkViewArrow: {
    marginLeft: 20,
    backgroundColor: Colors.backgroundColor,
    height: wp('3%'),
    width: wp('3%'),
    borderRadius: wp('3%') / 2,
  },
});
