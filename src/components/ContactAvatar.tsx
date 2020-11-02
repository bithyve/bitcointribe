import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '../common/Colors';
import { nameToInitials } from '../common/CommonFunctions';
import { ContactRecipientDescribing } from '../common/data/models/interfaces/RecipientDescribing';

export type Props = {
  contact: ContactRecipientDescribing;
  containerStyle: Record<string, unknown>;
};

const ContactAvatar: React.FC<Props> = ({
  contact,
  containerStyle,
}: Props) => {
  if (contact.avatarImageSource) {
    return <Image source={contact.avatarImageSource} style={containerStyle} />;
  } else {
    const displayedNameText = useMemo(() => {
      if (
        contact.displayedName === 'F&F request' &&
        contact.contactsWalletName !== undefined &&
        contact.contactsWalletName !== ''
      ) {
        return `${contact.contactsWalletName}'s wallet`;
      } else {
        return contact.displayedName;
      }
    }, [contact]);


    return (
      <View
        style={{
          backgroundColor: Colors.shadowBlue,
          alignItems: 'center',
          justifyContent: 'center',
          ...containerStyle,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: 13,
            lineHeight: 13, //... One for top and one for bottom alignment
          }}
        >
          {nameToInitials(displayedNameText)}
        </Text>
      </View>
    );
  }
};

export default ContactAvatar;
