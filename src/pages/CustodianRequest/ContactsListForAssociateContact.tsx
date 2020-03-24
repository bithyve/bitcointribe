import React, { useState } from 'react';
import { View, StyleSheet, AsyncStorage } from 'react-native';
import ContactList from '../../components/ContactList';
import Toast from '../../components/Toast';

const ContactsListForAssociateContact = props => {
  const [contacts, setContacts] = useState([]);

  function selectedContactsList(list) {
    if (list.length > 0) setContacts([...list]);
  }

  const continueNProceed = async () => {
    let AssociatedContact = JSON.parse(
      await AsyncStorage.getItem('AssociatedContacts'),
    );
    // console.log("AssociatedContact", AssociatedContact);
    if (!AssociatedContact) {
      AssociatedContact = [];
    }
    if (
      AssociatedContact.findIndex(value => value.id == contacts[0].id) == -1
    ) {
      AssociatedContact.push(contacts[0]);
      Toast('Contact associated successfully');
      props.navigation.navigate('Home');
    } else {
      Toast('Contact already Associated.');
    }
    await AsyncStorage.setItem(
      'AssociatedContacts',
      JSON.stringify(AssociatedContact),
    );
  };

  return (
    <View style={{ flex: 1 }}>
        <ContactList
            isTrustedContact ={true}
            style={{}}
            onPressContinue={continueNProceed}
            onSelectContact={selectedContactsList}
        />
    </View>
  );
};

const styles = StyleSheet.create({});
export default ContactsListForAssociateContact;
