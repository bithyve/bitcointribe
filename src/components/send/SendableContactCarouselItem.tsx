import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ContactAvatar from '../ContactAvatar';
import ImageStyles from '../../common/Styles/ImageStyles';
import HeadingStyles from '../../common/Styles/HeadingStyles';
import Colors from '../../common/Colors';
import { ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing';
import Entypo from 'react-native-vector-icons/Entypo';
import LastSeenActiveIndicator from '../LastSeenActiveIndicator';

export type Props = {
  contact: ContactRecipientDescribing;
  isSelected?: boolean;
  containerStyle?: Record<string, unknown>;
};

const SendableContactCarouselItem: React.FC<Props> = ({
  contact,
  isSelected = false,
  containerStyle = {},
}: Props) => {
  return (
    <View style={{ ...styles.rootContainer, ...containerStyle }}>
      <View style={styles.circledAvatarContainer}>
        <ContactAvatar contact={contact} />

        {isSelected && (
          <View style={{ ...styles.circledView, position: 'absolute' }}>
            <View style={styles.checkmarkOverlayBackground} />
            <Entypo
              style={styles.checkmarkIcon}
              size={24}
              color={Colors.white}
              name="check"
            />
          </View>
        )}

        <LastSeenActiveIndicator
          style={{ position: 'absolute', right: -4, top: -4 }}
          timeSinceActive={contact.lastSeenActive}
        />
      </View>

      <Text style={styles.contactNameText} numberOfLines={1}>
        {contact.displayedName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    alignItems: 'center',
  },

  circledAvatarContainer: {
    ...ImageStyles.thumbnailImageMedium,
    ...ImageStyles.circledAvatarContainer,
  },

  circledView: {
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contactNameText: {
    ...HeadingStyles.captionText,
    textAlign: 'center',
    marginTop: 10,
  },

  checkmarkIcon: {
    width: 24,
    height: 24,
  },

  checkmarkOverlayBackground: {
    position: 'absolute',
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.blue,
    opacity: 0.4,
    borderRadius: 9999,
  },
});

export default SendableContactCarouselItem;
