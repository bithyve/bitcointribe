import React, { useMemo } from 'react'
import { Image, Switch, StyleSheet, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import Colors from '../../../common/Colors'

export type Props = {
  isConnectionEnabled: boolean;
  onToggle: () => void;
  containerStyle?: Record<string, unknown>;
};

const TorSettingsHeader: React.FC<Props> = ( {
  isConnectionEnabled,
  onToggle,
  containerStyle = {
  },
}: Props ) => {
  const subtitleText = useMemo( () => {
    return isConnectionEnabled ?
      'Connect over the Tor network'
      : 'Stop connecting over the Tor network and connect over plainnet'
  }, [ isConnectionEnabled ] )

  return (
    <View style={containerStyle}>
      <ListItem
        containerStyle={styles.rootContainer}
        bottomDivider
        disabled
      >
        <Image
          source={require( '../../../assets/images/icons/icon_contact.png' )}
          style={styles.thumbnailImage}
          resizeMode="contain"
        />

        <ListItem.Content style={styles.titleSection}>
          <ListItem.Title
            style={ListStyles.listItemTitle}
            numberOfLines={1}
          >
          Connect over Tor
          </ListItem.Title>

          <ListItem.Subtitle
            style={ListStyles.listItemSubtitle}
            numberOfLines={2}
          >
            {subtitleText}
          </ListItem.Subtitle>
        </ListItem.Content>

        <Switch
          value={isConnectionEnabled}
          onValueChange={onToggle}
          thumbColor={isConnectionEnabled ? Colors.blue : Colors.white}
          trackColor={{
            false: Colors.borderColor, true: Colors.lightBlue
          }}
          onTintColor={Colors.blue}
        />
      </ListItem>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingHorizontal: 24,
  },

  thumbnailImage: {
    ...ImageStyles.thumbnailImageSmall,
    marginRight: 14,
  },

  titleSection: {
    flex: 1,
  },
} )

export default TorSettingsHeader
