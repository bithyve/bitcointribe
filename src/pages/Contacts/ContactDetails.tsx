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
import moment from 'moment';
import _ from 'underscore';

export default function ContactDetails(props) {
  const Contact = props.navigation.state.params.contact;
  const contactsType = props.navigation.state.params.contactsType;
  const [contact, setContact] = useState(Contact ? Contact : Object);
  const [SelectedOption, setSelectedOption] = useState(0);
  const [trustedContactHistory, setTrustedContactHistory] = useState([
    {
      id: 1,
      title: 'Recovery Secret created',
      date: '1 June ‘19, 9:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 2,
      title: 'Recovery Secret in-transit',
      date: '1 June ‘19, 9:00am',
      info:
        'consectetur adipiscing Lorem ipsum dolor sit amet, consectetur sit amet',
    },
    {
      id: 3,
      title: 'Recovery Secret accessible',
      date: '1 June ‘19, 9:00am',
      info: 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
    },
    {
      id: 4,
      title: 'Recovery Secret not accessible',
      date: '1 June ‘19, 9:00am',
      info: 'Lorem ipsum Lorem ipsum dolor sit amet, consectetur sit amet',
    },
  ]);
  useEffect(() => {
    setContact(Contact);
  }, [Contact]);

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
                {'My Keeper'}
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
        <ScrollView style={{ flex: 1 }}>
          {trustedContactHistory.map((value) => {
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
                      marginTop: 5
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
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                      marginTop: 5
                    }}
                  >
                    {value.info}
                  </Text>
                </TouchableOpacity>
              );
            }
          })}
        </ScrollView>
        <View>
        <View
            style={styles.bottomButton}
          >
            {(contactsType=="myKeepers"||contactsType=="IMKeepers") &&
            <TouchableOpacity
              style={styles.buttonInnerView}
            >
              <Image
                source={require('../../assets/images/icons/openlink.png')}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>Help restore</Text>
            </TouchableOpacity>
            }
            {(contactsType=="myKeepers"||contactsType=="IMKeepers") &&
            <View
              style={{ width: 1, height: 30, backgroundColor: Colors.white }}
            />}
            {(contactsType=="myKeepers"||contactsType=="IMKeepers") &&
            <TouchableOpacity
              style={styles.buttonInnerView}
            >
              <Image
                source={require('../../assets/images/icons/openlink.png')}
                style={styles.buttonImage}
              />
              <Text style={styles.buttonText}>Reshare</Text>
            </TouchableOpacity>}
            {(contactsType=="myKeepers"||contactsType=="IMKeepers") &&<View
              style={{ width: 1, height: 30, backgroundColor: Colors.white }}
            />}
            <TouchableOpacity
              style={styles.buttonInnerView}
            >
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
  bottomButton:{
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
  }
});
