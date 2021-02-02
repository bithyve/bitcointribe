import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import React, { useCallback, useMemo } from 'react'
import { StyleSheet, FlatList, ImageSourcePropType, Image, Alert } from 'react-native'
import { ListItem } from 'react-native-elements'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import ListStyles from '../../../common/Styles/ListStyles'
import AccountShellRescanningBottomSheet from '../../../components/bottom-sheets/account-details/sub-account-settings/AccountShellRescanningBottomSheet'
import useAccountShellForID from '../../../utils/hooks/state-selectors/accounts/UseAccountShellForID'

export type Props = {
  navigation: any;
};

export type SettingsListItem = {
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  screenName?: string;
  screenParams?: Record<string, unknown>;
  onOptionPressed?: () => void;
};

const listItemKeyExtractor = ( item: SettingsListItem ) => item.title


const AccountSettingsMainScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const accountShellID = useMemo( () => {
    return navigation.getParam( 'accountShellID' )
  }, [ navigation ] )

  const accountShell = useAccountShellForID( accountShellID )

  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  const listItems = useMemo<SettingsListItem[]>( () => {
    return [
      ...[
        {
          title: 'Name & Description',
          subtitle: 'Customize display properties',
          screenName: 'EditDisplayProperties',
          screenParams: {
            accountShellID: accountShell.id,
          },
          imageSource: require( '../../../assets/images/icons/icon_checking_blue.png' ),
        },
        {
          title: 'Full Rescan',
          subtitle: 'Completely sync the account',
          imageSource: require( '../../../assets/images/icons/icon_checking_blue.png' ),
          onOptionPressed: handleRescanListItemSelection,
        },
      ],
      ...( accountShell.primarySubAccount.isTFAEnabled ? [
        {
          title: '2FA Settings',
          subtitle: 'Reset 2FA or no server response',
          screenName: 'ResetTwoFAHelp',
          imageSource: require( '../../../assets/images/icons/icon_merge_blue.png' ),
        }
      ] : [] )

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
  }, [ accountShell ] )

  function handleListItemPress( listItem: SettingsListItem ) {
    if ( typeof listItem.onOptionPressed === 'function' ) {
      listItem.onOptionPressed()
    } else if ( listItem.screenName !== undefined ) {
      const screenParams = listItem.screenParams || {
      }

      navigation.navigate( listItem.screenName, screenParams )
    }
  }

  function handleRescanListItemSelection() {
    Alert.alert(
      'Re-scan your Account',
      'The re-scan may take some time.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: showSubAccountRescanningBottomSheet,
          style: 'default',
        },
      ]
    )
  }

  const showSubAccountRescanningBottomSheet = useCallback( () => {
    presentBottomSheet(
      <AccountShellRescanningBottomSheet
        accountShell={accountShell}
        onDismiss={dismissBottomSheet}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '67%' ],
        dismissOnScrollDown: false,
        dismissOnOverlayPress: false,
      },
    )
  }, [ presentBottomSheet, dismissBottomSheet ] )


  const renderItem = ( { item: listItem }: { item: SettingsListItem } ) => {
    return (
      <ListItem
        bottomDivider
        onPress={() => { handleListItemPress( listItem ) }}
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

export default AccountSettingsMainScreen
