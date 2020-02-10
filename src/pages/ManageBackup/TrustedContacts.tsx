import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Fonts from '../../common/Fonts';
import BackupStyles from './Styles';
import Colors from '../../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import ContactList from '../../components/ContactList';
import { getIconByStatus } from './utils';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const TrustedContacts = props => {
  const [selectedStatus, setSelectedStatus] = useState('Ugly'); // for preserving health of this entity
  const [contacts, setContacts] = useState([]);
  const index = props.index;

  const selectedContactsList = useCallback(list => {
    if (list.length > 0) setContacts([...list]);
  }, []);

  const onPressContinue = useCallback(() => {
    if (contacts.length == 2) {
      contacts[0].type = 'contact1';
      contacts[1].type = 'contact2';
    } else if (contacts.length == 1) {
      if (index == 1) {
        contacts[0].type = 'contact1';
      } else if (index == 2) {
        contacts[0].type = 'contact2';
      }
    }
    props.onPressContinue(contacts, index);
  }, [contacts, props.onPressContinue]);

  const renderContactList = useCallback(
    () => (
      <ContactList
        isTrustedContact={true}
        style={{}}
        onPressContinue={onPressContinue}
        onSelectContact={selectedContactsList}
      />
    ),
    [onPressContinue, selectedContactsList],
  );

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
          <TouchableOpacity
            onPress={() => {
              props.onPressBack();
            }}
            style={{ height: 30, width: 30 }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View
            style={{ alignSelf: 'center', flex: 1, justifyContent: 'center' }}
          >
            <Text style={BackupStyles.modalHeaderTitleText}>
              Trusted Contact
            </Text>
            <Text style={BackupStyles.modalHeaderInfoText}>
              Never backed up
            </Text>
          </View>
        </View>
        <Image
          style={BackupStyles.cardIconImage}
          source={getIconByStatus(selectedStatus)}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            marginLeft: 30,
            color: Colors.textColorGrey,
            fontFamily: Fonts.FiraSansRegular,
            fontSize: RFValue(12),
            marginTop: 5,
          }}
        >
          Select two contacts to{' '}
          <Text
            style={{
              fontFamily: Fonts.FiraSansMediumItalic,
              fontWeight: 'bold',
            }}
          >
            send Recovery Secrets
          </Text>
        </Text>
        {props.LoadContacts ? renderContactList() : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeaderContainer: {
    paddingTop: 20,
  },
  modalHeaderHandle: {
    width: 30,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
    marginBottom: 7,
  },
});

export default TrustedContacts;
