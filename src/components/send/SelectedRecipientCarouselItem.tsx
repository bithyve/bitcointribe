import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import ImageStyles from '../../common/Styles/ImageStyles';
import HeadingStyles from '../../common/Styles/HeadingStyles';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RecipientDescribing, ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing';
import LastSeenActiveIndicator from '../LastSeenActiveIndicator';
import RecipientKind from '../../common/data/enums/RecipientKind';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { widthPercentageToDP } from 'react-native-responsive-screen';


export type Props = {
  recipient: RecipientDescribing;
  onRemove: () => void;
  containerStyle?: Record<string, unknown>;
};

const SelectedRecipientCarouselItem: React.FC<Props> = ({
  recipient,
  onRemove,
  containerStyle = {},
}: Props) => {

  return (
    <View style={{ ...styles.rootContainer, ...containerStyle }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.circledAvatarContainer}>

          <Image
            source={recipient.avatarImageSource}
            style={{ width: '100%', height: '100%' }}
            resizeMode={'contain'}
          />

          {recipient.kind == RecipientKind.CONTACT && (
            <LastSeenActiveIndicator
              style={{ position: 'absolute', top: -4, right: -4 }}
              timeSinceActive={(recipient as ContactRecipientDescribing).lastSeenActive}
            />
          )}
        </View>

        <View>
          <Text style={styles.titleText}>{recipient.displayedName}</Text>
          <Text style={styles.amountText}>{`${recipient.availableBalance} Sats`}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onRemove}
      >
        <AntDesign
          size={16}
          color={Colors.blue}
          name={'closecircle'}
        />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({

  rootContainer: {
    width: widthPercentageToDP(40),
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    shadowOpacity: 0.12,
    shadowColor: Colors.gray5,
    elevation: 10,
  },

  circledAvatarContainer: {
    ...ImageStyles.thumbnailImageMedium,
    ...ImageStyles.circledAvatarContainer,
    marginRight: 8,
  },

  titleText: {
    ...HeadingStyles.captionText,
    color: Colors.gray4,
    marginBottom: 5,
  },

  amountText: {
    ...HeadingStyles.captionText,
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.blue,
  },

  closeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});

export default SelectedRecipientCarouselItem;
