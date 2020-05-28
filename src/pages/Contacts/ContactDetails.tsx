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

export default function ContactDetails(props) {
  const Contact = props.navigation.state.params.contact;
  const contactsType = props.navigation.state.params.contactsType;
  const index = props.navigation.state.params.index;
  const [contact, setContact] = useState(Contact ? Contact : Object);
  const [SelectedOption, setSelectedOption] = useState(0);
  const [trustedContactHistory, setTrustedContactHistory] = useState([
    {
      id: 1,
      title: 'Recovery Secret created',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Secret in-transit',
      date: null,
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Secret accessible',
      date: null,
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Secret not accessible',
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
    if (contactsType == 'My Keepers') saveInTransitHistory("inTransit");
    else getHistoryForTrustedContacts();
  }, [Contact]);

  const onPressSend = () =>{
    if(contactsType == "My Keepers"){
      saveInTransitHistory("isSent");
    }
    else{
      storeTrustedContactsHistory();
    }
    props.navigation.navigate('Send', { isFromAddressBook: true })
  }

  const createId = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

  const storeTrustedContactsHistory = async() =>{
    let OtherTrustedContactsHistory = [];
    if(contactsType=="Other Trusted Contacts"){
      let OtherTrustedContactsHistoryArray = JSON.parse(await AsyncStorage.getItem('OtherTrustedContactsHistory'));
      OtherTrustedContactsHistory = OtherTrustedContactsHistoryArray
    }
    else{
      let IMKeeperOfHistory = JSON.parse(await AsyncStorage.getItem('IMKeeperOfHistory'));
      OtherTrustedContactsHistory = IMKeeperOfHistory
    }
    if(!OtherTrustedContactsHistory){
      OtherTrustedContactsHistory = [];
    }
    let obj = {
      id: createId(10),
      title: 'Sent Amount',
      date: moment(Date.now()).valueOf(),
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    }
    OtherTrustedContactsHistory.push(obj);
    if(contactsType=="Other Trusted Contacts"){
      await AsyncStorage.setItem('OtherTrustedContactsHistory', JSON.stringify(OtherTrustedContactsHistory));
    }
    else{
      await AsyncStorage.setItem('IMKeeperOfHistory', JSON.stringify(OtherTrustedContactsHistory));
    }
    console.log("obj", OtherTrustedContactsHistory)
    setTrustedContactHistory(sortedHistory(OtherTrustedContactsHistory));
  }

  const getHistoryForTrustedContacts = async() =>{
    let OtherTrustedContactsHistory = [];
    if(contactsType=="Other Trusted Contacts"){
      OtherTrustedContactsHistory = JSON.parse(await AsyncStorage.getItem('OtherTrustedContactsHistory'));
    }
    else{
      OtherTrustedContactsHistory = JSON.parse(await AsyncStorage.getItem('IMKeeperOfHistory'));
    }
    if(!OtherTrustedContactsHistory){
      OtherTrustedContactsHistory = [];
    }
    if(OtherTrustedContactsHistory.length>0){
      setTrustedContactHistory(sortedHistory(OtherTrustedContactsHistory));
    }
    else{
      setTrustedContactHistory([]);
    }
  }

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
        updatedTrustedContactHistory[3].date = shareHistory[index].notAccessible;
      if (shareHistory[index].inSent)
        updatedTrustedContactHistory[4].date = shareHistory[index].inSent;
      setTrustedContactHistory(updatedTrustedContactHistory);
    },
    [trustedContactHistory],
  );

  const saveInTransitHistory = useCallback(async (type) => {
    const shareHistory = JSON.parse(await AsyncStorage.getItem('shareHistory'));
    if (shareHistory) {
      const updatedShareHistory = [...shareHistory];
      if(type=="inTransit"){
        updatedShareHistory[index] = {
          ...updatedShareHistory[index],
          inTransit: Date.now(),
        };
      }
      if(type=="isSent"){
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
  }, [updateHistory]);

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
              <Text style={styles.contactText}>{contact.contactName}</Text>
              {contact.connectedVia ? (
                <Text style={styles.phoneText}>{contact.connectedVia}</Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.filterButton} onPress={() => {}}>
              <Entypo
                name={'dots-three-horizontal'}
                size={RFValue(20)}
                color={Colors.borderColor}
              />
            </TouchableOpacity>
          </View>
        </View>
        {sortedHistory(trustedContactHistory).length > 0 ? (
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
              {[1, 2, 3, 4, 5].map((value) => {
                return (
                  <View
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
                  The history of your Recovery Secret will appear here
                </Text>
              </View>
            </View>
          </View>
        )}
        <View>
          <View style={styles.bottomButton}>
            {(contactsType == 'My Keepers' ||
              contactsType == "I'm Keeper of") && (
              <TouchableOpacity style={styles.buttonInnerView}>
                <Image
                  source={require('../../assets/images/icons/openlink.png')}
                  style={styles.buttonImage}
                />
                <Text style={styles.buttonText}>Help restore</Text>
              </TouchableOpacity>
            )}
            {(contactsType == 'My Keepers' ||
              contactsType == "I'm Keeper of") && (
              <View
                style={{ width: 1, height: 30, backgroundColor: Colors.white }}
              />
            )}
            {(contactsType == 'My Keepers' ||
              contactsType == "I'm Keeper of") && (
              <TouchableOpacity style={styles.buttonInnerView}>
                <Image
                  source={require('../../assets/images/icons/openlink.png')}
                  style={styles.buttonImage}
                />
                <Text style={styles.buttonText}>Reshare</Text>
              </TouchableOpacity>
            )}
            {(contactsType == 'My Keepers' ||
              contactsType == "I'm Keeper of") && (
              <View
                style={{ width: 1, height: 30, backgroundColor: Colors.white }}
              />
            )}
            <TouchableOpacity onPress={()=>onPressSend()} style={styles.buttonInnerView}>
              <Image
                source={require('../../assets/images/icons/icon_bitcoin_light.png')}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>Send BTC</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    width: wp('4%'),
    height: wp('4%'),
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  bottomButton: {
    flexDirection: 'row',
    backgroundColor: Colors.blue,
    height: 60,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: hp('4%'),
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 15, height: 15 },
  },
});
