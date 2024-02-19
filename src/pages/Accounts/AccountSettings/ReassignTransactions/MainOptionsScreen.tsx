import React, { useMemo } from 'react'
import { StyleSheet, FlatList, ImageSourcePropType, Image } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../../common/Styles/ListStyles'
import ImageStyles from '../../../../common/Styles/ImageStyles'

export type Props = {
  navigation: any;
  route: any;
};

export type OptionsListItem = {
  title: string;
  subtitle: string;
  screenName: string;
  imageSource: ImageSourcePropType;
};

const listItems: OptionsListItem[] = [
  {
    title: 'Transactions',
    subtitle: 'Reassign any of your incoming and outgoing transactions',
    screenName: 'SelectReassignableTransactions',
    imageSource: require( '../../../../assets/images/icons/icon_transactions_circle.png' ),
  },
  {
    title: 'Sources',
    subtitle: 'Reassign the entire transaction set of a source',
    screenName: 'ReassignSubAccountSourcesSelectSources',
    imageSource: require( '../../../../assets/images/icons/icon_sources.png' ),
  },
]

const listItemKeyExtractor = ( item: OptionsListItem ) => item.title


const AccountSettingsReassignTransactionsMainOptionsScreen: React.FC<Props> = ( { navigation, route }: Props ) => {
  const accountShellID = useMemo( () => {
    return route.params?.accountShellID
  }, [ route.params ] )

  function handleListItemPressed( listItem: OptionsListItem ) {
    navigation.navigate( listItem.screenName, {
      accountShellID,
    } )
  }

  const renderItem = ( { item: listItem }: { item: OptionsListItem } ) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { handleListItemPressed( listItem ) }}
      >
        <Image
          source={listItem.imageSource}
          style={ImageStyles.thumbnailImageSmall}
          resizeMode="contain"
        />

        <ListItem.Content style={ListStyles.listItemContentContainer}>
          <ListItem.Title style={ListStyles.listItemTitle}>{listItem.title}</ListItem.Title>
          <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{listItem.subtitle}</ListItem.Subtitle>
        </ListItem.Content>

        <ListItem.Chevron />
      </ListItem>
    )
  }

  return (
    <FlatList
      style={styles.rootContainer}
      contentContainerStyle={{
        paddingHorizontal: 14
      }}
      data={listItems}
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

export default AccountSettingsReassignTransactionsMainOptionsScreen
