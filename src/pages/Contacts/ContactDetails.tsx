import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  AsyncStorage,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { nameToInitials } from '../../common/CommonFunctions';
import Entypo from 'react-native-vector-icons/Entypo';
import _ from 'underscore';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { addTransferDetails } from '../../store/actions/accounts';
import { REGULAR_ACCOUNT } from '../../common/constants/serviceTypes';

export default function ContactDetails(props) {
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(true);
  const Contact = props.navigation.state.params.contact;
  const contactsType = props.navigation.state.params.contactsType;
  const index = props.navigation.state.params.index;
  const [contact, setContact] = useState(Contact ? Contact : Object);
  const [SelectedOption, setSelectedOption] = useState(0);
  const [trustedContactHistory, setTrustedContactHistory] = useState([
    {
      id: 1,
      title: 'Recovery Key created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Key in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Key accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Key not accessible',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 5,
      title: 'Sent Amount',
      date: null,
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ]);

  useEffect(() => {
    setContact(Contact);
    if (contactsType == 'My Keepers') saveInTransitHistory('inTransit');
    else getHistoryForTrustedContacts();
  }, [Contact]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [trustedContactHistory]);

  const onPressSend = () => {
    if (contactsType == 'My Keepers') {
      saveInTransitHistory('isSent');
    }
    dispatch(
      addTransferDetails(REGULAR_ACCOUNT, {
        selectedContact: Contact,
      }),
    );
    props.navigation.navigate('SendToContact', {
      selectedContact: Contact,
      serviceType: REGULAR_ACCOUNT,
      isFromAddressBook: true
    });
  };

  const getHistoryForTrustedContacts = async () => {
    let OtherTrustedContactsHistory = [];
    if (contactsType == 'Other Trusted Contacts') {
      OtherTrustedContactsHistory = JSON.parse(
        await AsyncStorage.getItem('OtherTrustedContactsHistory'),
      );
    } else {
      OtherTrustedContactsHistory = JSON.parse(
        await AsyncStorage.getItem('IMKeeperOfHistory'),
      );
    }
    if (OtherTrustedContactsHistory) {
      OtherTrustedContactsHistory = getHistoryByContactId(
        OtherTrustedContactsHistory,
      );
    }
    if (OtherTrustedContactsHistory && OtherTrustedContactsHistory.length > 0) {
      setTrustedContactHistory(sortedHistory(OtherTrustedContactsHistory));
    } else {
      setTrustedContactHistory([]);
    }
  };

  const getHistoryByContactId = (history) => {
    let array = [];
    if (history && history.length > 0) {
      for (let i = 0; i < history.length; i++) {
        const element = history[i];
        if (
          element.selectedContactInfo &&
          element.selectedContactInfo.selectedContact.id == Contact.id
        ) {
          array.push(element);
        }
      }
    }
    return array;
  };

  const sortedHistory = useCallback((history) => {
    const currentHistory = history.filter((element) => {
      if (element.date) return element;
    });
    const sortedHistory = _.sortBy(currentHistory, 'date');
    sortedHistory.forEach((element) => {
      element.date = moment(element.date)
        .utc()
        .local()
        .format('DD MMMM YYYY HH:mm');
    });
    return sortedHistory;
  }, []);

  const updateHistory = useCallback(
    (shareHistory) => {
      const updatedTrustedContactHistory = [...trustedContactHistory];
      if (shareHistory[index].createdAt)
        updatedTrustedContactHistory[0].date = shareHistory[index].createdAt;
      if (shareHistory[index].inTransit)
        updatedTrustedContactHistory[1].date = shareHistory[index].inTransit;
      if (shareHistory[index].accessible)
        updatedTrustedContactHistory[2].date = shareHistory[index].accessible;
      if (shareHistory[index].notAccessible)
        updatedTrustedContactHistory[3].date =
          shareHistory[index].notAccessible;
      if (shareHistory[index].inSent)
        updatedTrustedContactHistory[4].date = shareHistory[index].inSent;
      setTrustedContactHistory(updatedTrustedContactHistory);
    },
    [trustedContactHistory],
  );

  const saveInTransitHistory = useCallback(
    async (type) => {
      const shareHistory = JSON.parse(
        await AsyncStorage.getItem('shareHistory'),
      );
      if (shareHistory) {
        const updatedShareHistory = [...shareHistory];
        if (type == 'inTransit') {
          updatedShareHistory[index] = {
            ...updatedShareHistory[index],
            inTransit: Date.now(),
          };
        }
        if (type == 'isSent') {
          updatedShareHistory[index] = {
            ...updatedShareHistory[index],
            inSent: Date.now(),
          };
        }
        updateHistory(updatedShareHistory);
        await AsyncStorage.setItem(
          'shareHistory',
          JSON.stringify(updatedShareHistory),
        );
      }
    },
    [updateHistory],
  );

  const getImageIcon = (item) => {
    if (item) {
      if (item.imageAvailable) {
        return (
          <View style={styles.headerImageView}>
            <Image source={item.image} style={styles.headerImage} />
          </View>
        );
      } else {
        return (
          <View style={styles.headerImageView}>
            <View style={styles.headerImageInitials}>
              <Text style={styles.headerImageInitialsText}>
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
          </View>
        );
      }
    }
  };

  const SelectOption = (Id) => {
    if (Id == SelectedOption) {
      setSelectedOption(0);
    } else {
      setSelectedOption(Id);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 0, backgroundColor: Colors.backgroundColor }}
      />
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
            {getImageIcon(contact)}
            <View>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(11),
                  marginLeft: 10,
                }}
              >
                {contactsType}
              </Text>
              <Text style={styles.contactText}>
                {Contact.contactName == 'Secondary Device'
                  ? 'Keeper Device'
                  : contact.contactName}
              </Text>
              {contact.connectedVia ? (
                <Text style={styles.phoneText}>{contact.connectedVia}</Text>
              ) : null}
            </View>
            {Contact.hasXpub && Contact.contactName != 'Secondary Device' && (
              <TouchableOpacity
                onPress={() => onPressSend()}
                style={{
                  width: wp('15%'),
                  height: wp('6%'),
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: Colors.lightBlue,
                  marginLeft: 'auto',
                  marginBottom: 10,
                  borderRadius: 4,
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                }}
              >
                <Image
                  source={require('../../assets/images/icons/icon_bitcoin_light.png')}
                  style={{
                    height: wp('4%'),
                    width: wp('4%'),
                    resizeMode: 'contain',
                  }}
                />
                <Text
                  style={{
                    color: Colors.white,
                    fontFamily: Fonts.FiraSansMedium,
                    fontSize: RFValue(10),
                    marginLeft: 2,
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {!Loading ? (
          <ScrollView style={{ flex: 1 }}>
            {sortedHistory(trustedContactHistory).map((value) => {
              if (SelectedOption == value.id) {
                return (
                  <TouchableOpacity
                    key={value.id}
                    onPress={() => SelectOption(value.id)}
                    style={{
                      margin: wp('3%'),
                      backgroundColor: Colors.white,
                      borderRadius: 10,
                      height: wp('20%'),
                      width: wp('90%'),
                      justifyContent: 'center',
                      paddingLeft: wp('3%'),
                      paddingRight: wp('3%'),
                      alignSelf: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.blue,
                        fontSize: RFValue(13),
                        fontFamily: Fonts.FiraSansRegular,
                      }}
                    >
                      {value.title}
                    </Text>
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(10),
                        fontFamily: Fonts.FiraSansRegular,
                        marginTop: 5,
                      }}
                    >
                      {value.info}
                    </Text>
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(9),
                        fontFamily: Fonts.FiraSansRegular,
                        marginTop: hp('0.3%'),
                      }}
                    >
                      {value.date}
                    </Text>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    key={value.id}
                    onPress={() => SelectOption(value.id)}
                    style={{
                      margin: wp('3%'),
                      backgroundColor: Colors.white,
                      borderRadius: 10,
                      height: wp('15%'),
                      width: wp('85%'),
                      justifyContent: 'center',
                      paddingLeft: wp('3%'),
                      paddingRight: wp('3%'),
                      alignSelf: 'center',
                    }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(10),
                          fontFamily: Fonts.FiraSansRegular,
                        }}
                      >
                        {value.title}
                      </Text>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(9),
                          fontFamily: Fonts.FiraSansRegular,
                          marginLeft: 'auto',
                        }}
                      >
                        {value.date}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(8),
                        fontFamily: Fonts.FiraSansRegular,
                        marginTop: 5,
                      }}
                    >
                      {value.info}
                    </Text>
                  </TouchableOpacity>
                );
              }
            })}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            <ScrollView>
              {[1, 2, 3, 4, 5].map((value, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      margin: wp('3%'),
                      backgroundColor: Colors.white,
                      borderRadius: 10,
                      height: wp('20%'),
                      width: wp('90%'),
                      paddingLeft: wp('3%'),
                      paddingRight: wp('3%'),
                      alignSelf: 'center',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <View
                        style={{
                          backgroundColor: Colors.backgroundColor,
                          height: wp('4%'),
                          width: wp('40%'),
                          borderRadius: 10,
                        }}
                      />
                      <View
                        style={{
                          backgroundColor: Colors.backgroundColor,
                          height: wp('4%'),
                          width: wp('30%'),
                          marginTop: 5,
                          borderRadius: 10,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <View style={{ backgroundColor: Colors.backgroundColor }}>
              <View
                style={{
                  margin: 15,
                  backgroundColor: Colors.white,
                  padding: 10,
                  paddingTop: 20,
                  borderRadius: 7,
                }}
              >
                <Text
                  style={{
                    color: Colors.black,
                    fontSize: RFValue(13),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  No history
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  The history of your Recovery Key will appear here
                </Text>
              </View>
            </View>
          </View>
        )}
        {(contactsType == 'My Keepers' || contactsType == "I'm Keeper of") && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              backgroundColor: Colors.white,
              paddingTop: wp('3%'),
              paddingBottom: wp('4%'),
              height: wp('30'),
            }}
          >
            <TouchableOpacity style={styles.bottomButton}>
              <Image
                source={require('../../assets/images/icons/icon_sell.png')}
                style={styles.buttonImage}
              />
              <View>
                <Text style={styles.buttonText}>Help Restore</Text>
                <Text numberOfLines={1} style={styles.buttonInfo}>
                  Lorem ipsum dolor
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomButton}>
              <Image
                source={require('../../assets/images/icons/icon_buy.png')}
                style={styles.buttonImage}
              />
              <View>
                <Text style={styles.buttonText}>Request Key</Text>
                <Text numberOfLines={1} style={styles.buttonInfo}>
                  Lorem ipsum dolor
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.backgroundColor,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: wp('15%'),
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
  contactText: {
    marginLeft: 10,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.black,
  },
  phoneText: {
    marginTop: 3,
    marginLeft: 10,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  filterButton: {
    height: wp('8%'),
    width: wp('12%'),
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerImageView: {
    width: wp('17%'),
    height: wp('17%'),
    borderColor: 'red',
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp('17%') / 2,
  },
  headerImage: {
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('15%') / 2,
  },
  headerImageInitials: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.shadowBlue,
    width: wp('15%'),
    height: wp('15%'),
    borderRadius: wp('15%') / 2,
  },
  headerImageInitialsText: {
    textAlign: 'center',
    fontSize: RFValue(17),
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('30%'),
  },
  buttonImage: {
    width: wp('10%'),
    height: wp('10%'),
    resizeMode: 'contain',
    tintColor: Colors.blue,
  },
  buttonText: {
    color: Colors.black,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansMedium,
    marginLeft: 10,
  },
  buttonInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(9),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: 5,
    marginLeft: 10,
  },
  bottomButton: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    height: wp('17%'),
    width: wp('40%'),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.borderColor,
    alignSelf: 'center',
  },
});
