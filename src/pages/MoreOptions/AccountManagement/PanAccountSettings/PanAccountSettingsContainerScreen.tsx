import React from 'react'
import { StyleSheet, Image, FlatList, ImageSourcePropType } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../../common/Styles/ListStyles'
import ImageStyles from '../../../../common/Styles/ImageStyles'

export type Props = {
  navigation: any;
};

interface MenuOption {
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  screenName?: string;
  onOptionPressed?: () => void;
}

const menuOptions: MenuOption[] = [
  {
    title: 'Show All Accounts',
    subtitle: 'Include Hidden, Duress, and Archived accounts in your display',
    imageSource: require( '../../../../assets/images/icons/account-visibility/icon_visible.png' ),
    onOptionPressed: () => {
      // TODO: Implement when implementing "Show All" functionality.
    },
  },
]

const listItemKeyExtractor = ( item: MenuOption ) => item.title


const PanAccountSettingsContainerScreen: React.FC<Props> = () => {

  function handleListItemPress( menuOption: MenuOption ) {
    if ( typeof menuOption.onOptionPressed === 'function' ) {
      menuOption?.onOptionPressed()
    }
  }

  const renderItem = ( { item: menuOption }: { item: MenuOption } ) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { handleListItemPress( menuOption ) }}
      >
        <Image
          source={menuOption.imageSource}
          style={ImageStyles.thumbnailImageMedium}
          resizeMode="contain"
        />

        <ListItem.Content style={ListStyles.listItemContentContainer}>
          <ListItem.Title style={ListStyles.listItemTitle}>{menuOption.title}</ListItem.Title>
          <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{menuOption.subtitle}</ListItem.Subtitle>
        </ListItem.Content>

        {menuOption.screenName !== undefined && (
          <ListItem.Chevron />
        )}

      </ListItem>
    )
  }

  return (
    <FlatList
      style={styles.rootContainer}
      data={menuOptions}
      keyExtractor={listItemKeyExtractor}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingHorizontal: 10,
  },
} )

export default PanAccountSettingsContainerScreen
