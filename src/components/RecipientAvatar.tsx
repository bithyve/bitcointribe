import React from 'react'
import { View, Text, Image } from 'react-native'
import Colors from '../common/Colors'
import ImageStyles from '../common/Styles/ImageStyles'
import { nameToInitials } from '../common/CommonFunctions'
import { RecipientDescribing } from '../common/data/models/interfaces/RecipientDescribing'
import RecipientKind from '../common/data/enums/RecipientKind'

export type Props = {
  recipient: RecipientDescribing;
  containerStyle?: Record<string, unknown>;
  contentContainerStyle?: Record<string, unknown>;
};

const RecipientAvatar: React.FC<Props> = ( {
  recipient,
  containerStyle = {
  },
  contentContainerStyle = {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageMedium,
  },
}: Props ) => {
  if ( recipient.avatarImageSource ) {
    return (
      <View style={containerStyle}>
        <Image
          source={recipient.avatarImageSource}
          style={contentContainerStyle}
          resizeMode="contain"
        />
      </View>
    )
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
          {nameToInitials(
            recipient.kind == RecipientKind.ADDRESS ? '@' : ( recipient.displayedName || '' )
          )}
        </Text>
      </View>
    )
  }
}

export default RecipientAvatar
