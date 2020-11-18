import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '../common/Colors';
import ImageStyles from '../common/Styles/ImageStyles';
import { nameToInitials } from '../common/CommonFunctions';
import { ContactRecipientDescribing } from '../common/data/models/interfaces/RecipientDescribing';

export type Props = {
  contact: ContactRecipientDescribing;
  containerStyle?: Record<string, unknown>;
  contentContainerStyle?: Record<string, unknown>;
};

const ContactAvatar: React.FC<Props> = ({
  contact,
  containerStyle = {},
  contentContainerStyle = {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageMedium,
  },
}: Props) => {
  if (contact.avatarImageSource) {
    return (
      <View style={containerStyle}>
        <Image
          source={contact.avatarImageSource}
          style={contentContainerStyle}
          resizeMode="contain"
        />
      </View>
    );
  } else {
    return (
      <View
        style={{
          backgroundColor: Colors.shadowBlue,
          alignItems: 'center',
          justifyContent: 'center',
          ...contentContainerStyle,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: 14,
          }}
        >
          {nameToInitials(contact.displayedName ? contact.displayedName : '')}
        </Text>
      </View>
    );
  }
};

export default ContactAvatar;
