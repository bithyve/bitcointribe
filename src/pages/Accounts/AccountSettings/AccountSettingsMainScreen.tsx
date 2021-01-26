import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, FlatList, ImageSourcePropType, Image } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../common/Styles/ListStyles'
import useAccountShellForID from '../../../utils/hooks/state-selectors/accounts/UseAccountShellForID'

export type Props = {
  navigation: any;
};

export type SettingsListItem = {
  title: string;
  subtitle: string;
  screenName: string;
  imageSource: ImageSourcePropType;
};

const listItems: SettingsListItem[] = [
  {
    title: 'Name & Description',
    subtitle: 'Customize display properties',
    screenName: 'EditDisplayProperties',
    imageSource: require( '../../../assets/images/icons/icon_checking_blue.png' ),
  },

  // 📝 These items are being commented out until their functionality is fully implemented.
  // See: https://github.com/bithyve/hexa/issues/2243

  // {
  //   title: 'Reassign Transactions',
  //   subtitle: 'Map from this account to another',
  //   screenName: 'ReassignTransactionsMainOptions',
  //   imageSource: require('../../../assets/images/icons/icon_transactions_circle.png'),
  // },
  // {
  //   title: 'Account Visibility',
  //   subtitle: `Configure for different privacy-sensitive contexts`,
  //   screenName: 'EditVisibility',
  //   imageSource: require('../../../assets/images/icons/icon_checking_blue_visibility.png'),
  // },
  // {
  //   title: 'Merge Account',
  //   subtitle: `Move all transactions to another Hexa account`,
  //   screenName: 'MergeAccounts',
  //   imageSource: require('../../../assets/images/icons/icon_merge_blue.png'),
  // },
  // {
  //   title: 'Archive Account',
  //   subtitle: 'Move this account out of sight and out of mind',
  //   screenName: '',
  //   imageSource: require('../../../assets/images/icons/icon_archive.png'),
  // },
]

const listItemKeyExtractor = ( item: SettingsListItem ) => item.title

const AccountSettingsMainScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const accountShellID = useMemo( () => {
    return navigation.getParam( 'accountShellID' )
  }, [ navigation ] )
  const accountShell = useAccountShellForID( accountShellID )
  const [ settingsList, setSettingsList ] = useState( listItems )

  function handleListItemPressed( listItem: SettingsListItem ) {
    navigation.navigate( listItem.screenName, {
      accountShellID,
    } )
  }

  useEffect( () =>{
    if( accountShell.primarySubAccount.isTFAEnabled ){
      const twoFASetting = {
        title: '2FA Settings',
        subtitle: 'Reset 2FA or no server response',
        screenName: 'ResetTwoFAHelp',
        imageSource: require( '../../../assets/images/icons/icon_merge_blue.png' ),
      }
      setSettingsList( [ ...listItems, twoFASetting ] )
    }
  }, [ accountShell ] )

  const renderItem = ( { item: listItem }: { item: SettingsListItem } ) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { handleListItemPressed( listItem ) }}
      >
        <Image
          source={listItem.imageSource}
          style={ListStyles.thumbnailImageSmall}
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
      data={settingsList}
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

export default AccountSettingsMainScreen
