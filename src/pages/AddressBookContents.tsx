import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  AsyncStorage,
  Image,
  Platform
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
import ModalHeader from '../components/ModalHeader';
import AddressBookFilterModalContent from './Contacts/AddressBookFilterModalContent';
import DeviceInfo from 'react-native-device-info';
import BottomSheet from 'reanimated-bottom-sheet';

export default function AddressBookContents(props) {
  let [FilterModalBottomSheet, setFilterModalBottomSheet] = useState(React.createRef());
  let [AssociatedContact, setAssociatedContact] = useState([]);
  let [SelectedContacts, setSelectedContacts] = useState([]);
  let [SecondaryDeviceAddress, setSecondaryDeviceAddress] = useState([]);
  let [TrustedContact, setTrustedContact] = useState([
    {
      name: 'Uraiah Cabe',
      phoneNumber: '+1 000 000 0000',
    },
    {
      name: 'Mike Ross',
      phoneNumber: 'miker@bithyve.com',
    },
    {
      name: 'Donna Paulsen',
      phoneNumber: '+966 0 00 000 0000',
    },
    {
      name: 'Rachel Zane',
      phoneNumber: 'zanerachel@bithyve.com',
    },
    {
      name: 'Louis Litt',
      phoneNumber: '+1 000 000 0000',
    }
  ]);
  useEffect(() => {
    getAssociatedContact();
  }, []);

  const getAssociatedContact = async () => {
    let SelectedContacts = JSON.parse(
      await AsyncStorage.getItem('SelectedContacts'),
    );
    setSelectedContacts(SelectedContacts);
    let AssociatedContact = JSON.parse(
      await AsyncStorage.getItem('AssociatedContacts'),
    );
    setAssociatedContact(AssociatedContact);
    let SecondaryDeviceAddress = JSON.parse(
      await AsyncStorage.getItem('secondaryDeviceAddress'),
    );
    setSecondaryDeviceAddress(SecondaryDeviceAddress);
  };

  function renderFilterModalContent() {
    return (
      <AddressBookFilterModalContent
        modalRef={FilterModalBottomSheet}
        onPressBack={()=>{
          FilterModalBottomSheet.current.snapTo(0);
        }}
      />
    );
  }

  const renderFilterModalHeader =()=>{
    return <ModalHeader onPressHeader={()=>{
            FilterModalBottomSheet.current.snapTo(0);
          }}
          backgroundColor={Colors.backgroundColor1}
        />
  }

  const getElement = (item, index) =>{
    return (
      <View style={styles.selectedContactsView}>
        <View>
          <Text style={styles.contactText}>
            {item.name && item.name.split(' ')[0]
              ? item.name.split(' ')[0]
              : ''}{' '}
            <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
              {item.name && item.name.split(' ')[1]
                ? item.name.split(' ')[1]
                : ''}
            </Text>
          </Text>
          {item.phoneNumber ? (
            <Text style={styles.phoneText}>
              {item.phoneNumber}
            </Text>
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
          <TouchableOpacity style={styles.shareButtonView}
          onPress={()=>props.navigation.navigate('Send',{isFromAddressBook: true})}
          >
            <Text style={styles.shareButtonText}>Send</Text>
            <Image
              style={{
                width: wp('3%'),
                height: wp('3%'),
                resizeMode: 'contain',
              }}
              source={require('../assets/images/icons/icon_bitcoin_dark_grey.png')}
            />
          </TouchableOpacity>
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
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
            <Text style={styles.modalHeaderTitleText}>{'Address Book'}</Text>
            <TouchableOpacity
              style={{
                height: wp('8%'),
                width: wp('20%'),
                backgroundColor: Colors.lightBlue,
                borderWidth: 1,
                borderColor: Colors.borderColor,
                borderRadius: 7,
                marginLeft: 'auto',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}
              onPress={() => {FilterModalBottomSheet.current.snapTo(1)}}
            >
              <Text
                onPress={() => {}}
                style={{
                  color: Colors.white,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Filter
              </Text>
              <Image
                style={{
                  width: 12,
                  height: 12,
                  resizeMode: 'contain',
                  marginLeft:5
                }}
                source={require('../assets/images/icons/filter.png')}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text style={styles.pageTitle}>Trusted Contacts</Text>
          <Text style={styles.pageInfoText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing
          </Text>
        </View>

        {TrustedContact ? (
          <View style={{ flex: 1, marginBottom: 15 }}>
            {TrustedContact && TrustedContact.length ? (
              <View style={{ height: 'auto' }}>
                <FlatList
                  data={TrustedContact}
                  extraData={TrustedContact}
                  showsVerticalScrollIndicator={true}
                  renderItem={({ item, index }) => getElement(item, index)}
                />
              </View>
            ) : null}
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              marginBottom: 15,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0.5,
            }}
          >
            <Text
              style={{
                marginLeft: 15,
                marginRight: 15,
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansMediumItalic,
                fontSize: RFValue(15),
                textAlign: 'center',
              }}
            >
              {
                'Contacts or devices for whom you are guarding\nthe Recovery Secret will appear here'
              }
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.pageTitle}>You are the Guardian of</Text>
          <Text style={styles.pageInfoText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing
          </Text>
        </View>

        {AssociatedContact || SecondaryDeviceAddress ? (
          <View style={{ flex: 1, marginBottom: 15 }}>
            {AssociatedContact && AssociatedContact.length ? (
              <View style={{ height: 'auto' }}>
                <FlatList
                  data={AssociatedContact}
                  extraData={AssociatedContact}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => getElement(item, index)}
                />
              </View>
            ) : null}
            {SecondaryDeviceAddress && SecondaryDeviceAddress.length ? (
              <View style={{ height: 'auto' }}>
                <FlatList
                  data={SecondaryDeviceAddress}
                  extraData={SecondaryDeviceAddress}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => {
                    return (
                      <View style={styles.selectedContactsView}>
                        <Text style={styles.contactText}>{item.requester}</Text>
                      </View>
                    );
                  }}
                />
              </View>
            ) : null}
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              marginBottom: 15,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0.5,
            }}
          >
            <Text
              style={{
                marginLeft: 15,
                marginRight: 15,
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansMediumItalic,
                fontSize: RFValue(15),
                textAlign: 'center',
              }}
            >
              {
                'Contacts or devices for whom you are guarding\nthe Recovery Secret will appear here'
              }
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.pageTitle}>
            Guardians of your Recovery Secret
          </Text>
          <Text style={styles.pageInfoText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing
          </Text>
        </View>

        {SelectedContacts && SelectedContacts.length ? (
          <View style={{ flex: 1, flexDirection: 'row', marginBottom: 15 }}>
            <FlatList
              data={SelectedContacts}
              extraData={SelectedContacts}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => getElement(item, index)}
            />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              marginBottom: 15,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 0.5,
            }}
          >
            <Text
              style={{
                marginLeft: 15,
                marginRight: 15,
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansMediumItalic,
                fontSize: RFValue(15),
                textAlign: 'center',
              }}
            >
              {
                'Contacts or devices who are guarding your\nRecovery Secret will appear here'
              }
            </Text>
          </View>
        )}
        <BottomSheet
          enabledInnerScrolling={true}
          ref={FilterModalBottomSheet as any}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('84%') : hp('83%'),
          ]}
          renderContent={renderFilterModalContent}
          renderHeader={renderFilterModalHeader}
        />
      </View>
    </SafeAreaView>
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
    paddingTop: 10,
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
  shareButtonText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
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
  },
});
