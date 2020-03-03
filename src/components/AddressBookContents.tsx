import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';

export default function AddressBookContents(props) {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* <TouchableOpacity
            onPress={() => props.onPressBack()}
            style={{ height: 30, width: 30, justifyContent: "center" }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity> */}
          <Text style={styles.modalHeaderTitleText}>{'Address Book'}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.pageTitle}>You are the Guardian of</Text>
        {/* <Text style={styles.pageInfoText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing
        </Text> */}
      </View>

      {props.AssociatedContact && props.AssociatedContact.length ? (
        <View style={{ flex: 1, flexDirection: 'row', marginBottom: 15 }}>
          <FlatList
            data={props.AssociatedContact}
            extraData={props.AssociatedContact}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              return (
                <View style={styles.selectedContactsView}>
                  <Text style={styles.contactText}>
                    {item.name && item.name.split(' ')[0] ?  item.name.split(' ')[0] : ""}{' '}
                    <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                      {item.name && item.name.split(' ')[1] ? item.name.split(' ')[1] : ""}
                    </Text>
                  </Text>
                  {/* <TouchableOpacity style={styles.shareButtonView}>
                    <Text style={styles.shareButtonText}>Share</Text>
                  </TouchableOpacity> */}
                </View>
              );
            }}
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
          >{"Contacts or devices for whom you are guarding\nthe Recovery Secret will appear here"}
          </Text>
        </View>
      )}

      <View>
        <Text style={styles.pageTitle}>Guardians of your Recovery Secret</Text>
        {/* <Text style={styles.pageInfoText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing
        </Text> */}
      </View>

      {props.SelectedContacts && props.SelectedContacts.length ? (
        <View style={{ flex: 1, flexDirection: 'row', marginBottom: 15 }}>
          <FlatList
            data={props.SelectedContacts}
            extraData={props.SelectedContacts}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              return (
                <View style={styles.selectedContactsView}>
                  <Text style={styles.contactText}>
                    {item.name && item.name.split(' ')[0] ? item.name.split(' ')[0]: ""}{' '}
                    <Text style={{ fontFamily: Fonts.FiraSansMedium }}>
                      {item.name && item.name.split(' ')[1] ? item.name.split(' ')[1] : ""}
                    </Text>
                  </Text>
                  {/* <TouchableOpacity style={styles.shareButtonView}>
                    <Text style={styles.shareButtonText}>Share</Text>
                  </TouchableOpacity> */}
                </View>
              );
            }}
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
          >{"Contacts or devices who are guarding your\nRecovery Secret will appear here"}
          </Text>
        </View>
      )}
      <View>
        <Text style={styles.pageTitle}>Secondary Device for</Text>
        {/* <Text style={styles.pageInfoText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing
        </Text> */}
      </View>

      {props.SecondaryDeviceAddress && props.SecondaryDeviceAddress.length ? (
        <View style={{ flex: 1, flexDirection: 'row', marginBottom: 15 }}>
          <FlatList
            data={props.SecondaryDeviceAddress}
            extraData={props.SecondaryDeviceAddress}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              return (
                <View style={styles.selectedContactsView}>
                  <Text style={styles.contactText}>
                    {item.requester}
                  </Text>
                  {/* <TouchableOpacity style={styles.shareButtonView}>
                    <Text style={styles.shareButtonText}>Share</Text>
                  </TouchableOpacity> */}
                </View>
              );
            }}
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
          >{"Contacts or devices for whom you are guarding\nthe Recovery Secret will appear here"}
          </Text>
        </View>
      )}

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
  },
  selectedContactsView: {
    marginLeft: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginTop: 15,
  },
  shareButtonView: {
    height: wp('8%'),
    width: wp('15%'),
    backgroundColor: Colors.backgroundColor,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 5,
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
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
