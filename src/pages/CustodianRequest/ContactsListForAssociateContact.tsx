import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  AsyncStorage,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import ContactList from '../../components/ContactList';
import Toast from '../../components/Toast';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch, useSelector } from 'react-redux';
import { updateTrustedContactInfoLocally } from '../../store/actions/trustedContacts';

const ContactsListForAssociateContact = (props) => {
  const [contacts, setContacts] = useState([]);
  const postAssociation = props.navigation.getParam('postAssociation');
  const isGuardian = props.navigation.getParam('isGuardian');
  const dispatch = useDispatch();

  function selectedContactsList(list) {
    if (list.length > 0) setContacts([...list]);
  }

  let trustedContactsInfo = useSelector(
    (state) => state.trustedContacts.trustedContactsInfo,
  );

  const updateTrustedContactsInfo = async () => {
    if (trustedContactsInfo) {
      if (
        trustedContactsInfo.findIndex((trustedContact) => {
          if (!trustedContact) return false;

          const presentContactName = `${trustedContact.firstName} ${
            trustedContact.lastName ? trustedContact.lastName : ''
          }`
            .toLowerCase()
            .trim();

          const selectedContactName = `${contacts[0].firstName} ${
            contacts[0].lastName ? contacts[0].lastName : ''
          }`
            .toLowerCase()
            .trim();

          return presentContactName == selectedContactName;
        }) == -1
      ) {
        trustedContactsInfo.push(contacts[0]);
        Toast(
          // `Trusted Contact${isGuardian ? '(Ward)' : ''} added successfully`,
          `${
            isGuardian
              ? 'You have been successfully added as a Keeper'
              : 'Contact successfully added to Friends and Family'
          }`,
        );
        postAssociation(contacts[0]);
        props.navigation.navigate('Home');
      } else {
        Toast('Contact already exists');
        return;
      }
    } else {
      trustedContactsInfo = [];
      trustedContactsInfo[3] = contacts[0];
      // Toast(`Trusted Contact${isGuardian ? '(Ward)' : ''} added successfully`);
      Toast(
        `${
          isGuardian
            ? 'You have been successfully added as a Keeper'
            : 'Contact successfully added to Friends and Family'
        }`,
      );
      postAssociation(contacts[0]);
      props.navigation.navigate('Home');
    }
    await AsyncStorage.setItem(
      'TrustedContactsInfo',
      JSON.stringify(trustedContactsInfo),
    );
    dispatch(updateTrustedContactInfoLocally(trustedContactsInfo));
  };

  // const continueNProceed = async () => {
  //   let AssociatedContact = JSON.parse(
  //     await AsyncStorage.getItem('AssociatedContacts'),
  //   );
  //   // console.log("AssociatedContact", AssociatedContact);
  //   if (!AssociatedContact) {
  //     AssociatedContact = [];
  //   }
  //   if (
  //     AssociatedContact.findIndex((value) => value.id == contacts[0].id) == -1
  //   ) {
  //     AssociatedContact.push(contacts[0]);
  //     Toast('Contact associated successfully');
  //     props.navigation.navigate('Home');
  //   } else {
  //     Toast('Contact already Associated.');
  //   }
  //   await AsyncStorage.setItem(
  //     'AssociatedContacts',
  //     JSON.stringify(AssociatedContact),
  //   );
  // };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View>
            <Text style={styles.modalHeaderTitleText}>
              {'Associate a contact'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.modalSubheaderText}>
        Associate a contact from your address book. This will help you remember
        who the request was from
      </Text>
      <ContactList
        isTrustedContact={true}
        style={{}}
        onPressContinue={updateTrustedContactsInfo}
        onSelectContact={selectedContactsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  modalSubheaderText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 20,
  },
});
export default ContactsListForAssociateContact;
