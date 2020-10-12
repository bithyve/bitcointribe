import React, { useEffect, useState } from 'react';
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
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService';

const ContactsListForAssociateContact = (props) => {
  const [contacts, setContacts] = useState([]);
  const postAssociation = props.navigation.getParam('postAssociation');
  const [approvingContact, setApprovingContact] = useState('');
  const isGuardian = props.navigation.getParam('isGuardian');
  const dispatch = useDispatch();

  function selectedContactsList(list) {
    if (list.length > 0) setContacts([...list]);
  }

  let trustedContactsInfo = useSelector(
    (state) => state.trustedContacts.trustedContactsInfo,
  );
  const trustedContacts: TrustedContactsService = useSelector(
    (state) => state.trustedContacts.service,
  );

  const updateTrustedContactsInfo = async (contact?) => {
    const associatedContact = contact ? contact : contacts[0];

    const selectedContactName = `${associatedContact.firstName} ${
      associatedContact.lastName ? associatedContact.lastName : ''
    }`
      .toLowerCase()
      .trim();
    setApprovingContact(selectedContactName);
    if (trustedContactsInfo) {
      if (
        trustedContactsInfo.findIndex((trustedContact) => {
          if (!trustedContact) return false;

          const presentContactName = `${trustedContact.firstName} ${
            trustedContact.lastName ? trustedContact.lastName : ''
          }`
            .toLowerCase()
            .trim();

          return presentContactName == selectedContactName;
        }) == -1
      ) {
        trustedContactsInfo.push(associatedContact);
        console.log({ con: associatedContact });
        postAssociation(associatedContact);
      } else {
        Toast('Contact already exists');
        return;
      }
    } else {
      trustedContactsInfo = [];
      trustedContactsInfo[3] = associatedContact;

      postAssociation(associatedContact);
    }
    await AsyncStorage.setItem(
      'TrustedContactsInfo',
      JSON.stringify(trustedContactsInfo),
    );
    dispatch(updateTrustedContactInfoLocally(trustedContactsInfo));
  };

  const { approvedTrustedContacts } = useSelector(
    (state) => state.trustedContacts,
  );

  useEffect(() => {
    if (
      approvingContact &&
      approvedTrustedContacts &&
      approvedTrustedContacts[approvingContact]
    )
      props.navigation.navigate('Home');
  }, [approvedTrustedContacts, approvingContact]);

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
            hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalHeaderTitleText}>
              {'Associate a contact'}
            </Text>
          </View>

          <AppBottomSheetTouchableWrapper
            onPress={() => {
              let { skippedContactsCount } = trustedContacts.tc;
              let data;
              if (!skippedContactsCount) {
                skippedContactsCount = 1;
                data = {
                  firstName: 'F&F request',
                  lastName: `awaiting ${skippedContactsCount}`,
                  name: `F&F request awaiting ${skippedContactsCount}`,
                };
              } else {
                data = {
                  firstName: 'F&F request',
                  lastName: `awaiting ${skippedContactsCount + 1}`,
                  name: `F&F request awaiting ${skippedContactsCount + 1}`,
                };
              }

              updateTrustedContactsInfo(data);
            }}
            style={{
              height: wp('8%'),
              width: wp('22%'),
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.blue,
              justifyContent: 'center',
              borderRadius: 8,
              alignSelf: 'center',
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              Skip
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <Text style={styles.modalSubheaderText}>
        Associate a contact from your address book. This will help you remember
        who the request was from
      </Text>
      <ContactList
        isTrustedContact={true}
        isShowSkipContact={true}
        style={{}}
        onPressContinue={updateTrustedContactsInfo}
        onSelectContact={selectedContactsList}
        onPressSkip={() => {
          // selectedContactsList([data]);
          // updateTrustedContactsInfo();
        }}
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
