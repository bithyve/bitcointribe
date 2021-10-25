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
  contentContainerStyle
}: Props ) => {
  if ( recipient.avatarImageSource || recipient.image ) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          ...contentContainerStyle,
        }}
      >
        <Image
          source={recipient.avatarImageSource ? recipient.avatarImageSource : recipient.image}
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
            fontWeight: '500'
          }}
        >
          {nameToInitials(
            recipient.kind == RecipientKind.ADDRESS ? '@' : ( recipient.displayedName ? recipient.displayedName : recipient.contactName || '' )
          )}
        </Text>
      </View>
    )
  }
}

export default RecipientAvatar
