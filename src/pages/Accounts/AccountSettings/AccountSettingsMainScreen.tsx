import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, FlatList, ImageSourcePropType, Image, Alert, View } from 'react-native'
import { ListItem } from 'react-native-elements'
import ListStyles from '../../../common/Styles/ListStyles'
import AccountShellRescanningBottomSheet from '../../../components/bottom-sheets/account-shell-rescanning-bottom-sheet/AccountShellRescanningBottomSheet'
import AccountShellRescanningPromptBottomSheet from '../../../components/bottom-sheets/account-shell-rescanning-bottom-sheet/AccountShellRescanningPromptBottomSheet'
import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountShellForID from '../../../utils/hooks/state-selectors/accounts/UseAccountShellForID'
import AccountArchiveModal from './AccountArchiveModal'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import { useDispatch, useSelector } from 'react-redux'
import { updateAccountSettings } from '../../../store/actions/accounts'
import ModalContainer from '../../../components/home/ModalContainer'
import { Account, AccountType } from '../../../bitcoin/utilities/Interface'
import { translations } from '../../../common/content/LocContext'
import NameNDesc from '../../../assets/images/svgs/name_desc.svg'
import Archive from '../../../assets/images/svgs/icon_archive.svg'
import Xpub from '../../../assets/images/svgs/xpub.svg'
import Visibilty from '../../../assets/images/svgs/icon_visibility.svg'
import useAccountByAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'

const SELECTABLE_VISIBILITY_OPTIONS = [
  AccountVisibility.ARCHIVED,
  // AccountVisibility.DURESS,   // Disabled until duress mode is implemented later
]

export type Props = {
  navigation: any;
};

export type SettingsListItem = {
  title: string;
  subtitle: string;
  imageSource: any;
  screenName?: string;
  screenParams?: Record<string, unknown>;
  onOptionPressed?: () => void;
};

const listItemKeyExtractor = ( item: SettingsListItem ) => item.title


const AccountSettingsMainScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const accountShellID = useMemo( () => {
    return navigation.getParam( 'accountShellID' )
  }, [ navigation ] )
  const dispatch = useDispatch()
  const strings  = translations[ 'accounts' ]
  const [ showRescanning, setShowRescanning ] = useState( false )
  const [ showRescanningPrompt, setShowRescanningPrompt ] = useState( false )
  const [ showAccountArchiveModal, setShowAccountArchiveModal ] = useState( false )
  const [ checkAccountModal, setCheckAccountModal ] = useState( false )
  const accountShell = useAccountShellForID( accountShellID )
  const primarySubAccount  = usePrimarySubAccountForShell( accountShell )
  const account = useAccountByAccountShell( accountShell )
  //  const [ accountBalance, setAccountBalance ] = useState( primarySubAccount.balances )


  useEffect( () => {
    return () => {
      // dismissBottomSheet()
      setShowRescanningPrompt( false )
      setShowRescanning( false )
    }
  }, [ navigation ] )

  const listItems = useMemo<SettingsListItem[]>( () => {
    const items =  [
      ...[
        {
          title: strings.NameDescription,
          subtitle: strings.NameDescriptionSub,
          screenName: 'EditDisplayProperties',
          screenParams: {
            accountShellID: accountShell.id,
          },
          imageSource: () => <NameNDesc />,
        },
        ...( accountShell.primarySubAccount.type !== AccountType.LIGHTNING_ACCOUNT ?[
          {
            title: strings.ShowxPub,
            subtitle: strings.ShowxPubSub,
            screenName: 'ShowXPub',
            screenParams: {
              primarySubAccountName: primarySubAccount.customDisplayName || primarySubAccount.defaultTitle,
              accountShellID: accountShell.id,
            },
            imageSource: () => <Xpub />,
          }
        ] : [] ),
        // {
        //   title: 'Account Sync',
        //   subtitle: 'Manually scan the account',
        //   imageSource: require( '../../../assets/images/icons/icon_checking_blue_visibility.png' ),
        //   onOptionPressed: handleRescanListItemSelection,
        // },
      ],
      ...( accountShell.primarySubAccount.isTFAEnabled ? [
        {
          title: strings[ '2FASettings' ],
          subtitle: strings[ '2FASettingsSub' ],
          screenName: 'SubAccountTFAHelp',
          screenParams: {
            sourceAccountShell: accountShell,
          },
          imageSource: () => <Xpub />,
        }
      ] : [] ),

      // 📝 These items are being commented out until their functionality is fully implemented.
      // See: https://github.com/bithyve/hexa/issues/2243

      // {
      //   title: 'Reassign Transactions',
      //   subtitle: 'Map from this account to another',
      //   screenName: 'ReassignTransactionsMainOptions',
      //   imageSource: require('../../../assets/images/icons/icon_transactions_circle.png'),
      // },
      {
        title: strings.AccountVisibility,
        subtitle: strings.AccountVisibilitySub,
        screenName: 'EditVisibility',
        screenParams: {
          accountShellID: accountShell.id,
        },
        imageSource: () =><Visibilty />,
      },
      // {
      //   title: 'Merge Account',
      //   subtitle: `Move all transactions to another Hexa account`,
      //   screenName: 'MergeAccounts',
      //   imageSource: require('../../../assets/images/icons/icon_merge_blue.png'),
      // },
      {
        title: 'Archive Account',
        subtitle: strings.ArchiveSub,
        onOptionPressed: showArchiveModal,
        imageSource: () => <Archive />,
      },
    ]
    if( account.type === AccountType.BORDER_WALLET ) {
      items.push( {
        title: 'Backup with Border Wallet',
        subtitle: 'Check health - grid, pattern, checksum and passphrase',
        screenName: 'BackupGridMnemonic',
        screenParams: {
          borderWalletGridType: account.borderWalletGridType,
          borderWalletMnemonic: account.borderWalletMnemonic,
          borderWalletGridMnemonic: account.borderWalletGridMnemonic,
        },
        imageSource: () => <NameNDesc />,
      } )
    }
    return items
  }, [ accountShell, account ] )

  function handleListItemPress( listItem: SettingsListItem ) {
    if ( typeof listItem.onOptionPressed === 'function' ) {
      listItem.onOptionPressed()
    } else if ( listItem.screenName !== undefined ) {
      const screenParams = listItem.screenParams || {
      }
      navigation.navigate( listItem.screenName, screenParams )
    }
  }

  const renderItem = ( { item: listItem }: { item: SettingsListItem } ) => {
    if ( listItem.title === 'Archive Account' && primarySubAccount.type === AccountType.CHECKING_ACCOUNT ) {
      return null
    }
    return (
      <ListItem
        bottomDivider
        onPress={() => { handleListItemPress( listItem ) }}
        // disabled={listItem.title === 'Archive Account' && primarySubAccount.type === AccountType.CHECKING_ACCOUNT}
      >
        <View style={ListStyles.thumbnailImageSmall}>
          {listItem.imageSource()}
        </View>

        <ListItem.Content style={[ ListStyles.listItemContentContainer, {
          paddingVertical: 10,
        } ]}>
          <ListItem.Title style={ListStyles.listItemTitle}>{listItem.title}</ListItem.Title>
          <ListItem.Subtitle style={ListStyles.listItemSubtitle}>{listItem.subtitle}</ListItem.Subtitle>
        </ListItem.Content>

        <ListItem.Chevron size={22}/>
      </ListItem>
    )
  }

  const checkAccountBalance = useCallback( () => {
    return(
      <AccountArchiveModal
        isError={true}
        onProceed={() => {
          // closeArchiveModal()
          setCheckAccountModal( false )
        }}
        onBack={() => setCheckAccountModal( false )}
        onViewAccount={() => {
          setCheckAccountModal( false )
          navigation.pop()
        }
        }
        account={primarySubAccount}
      />
    )
  }, [ primarySubAccount ] )

  function handleRescanListItemSelection() {
    // showRescanningPromptBottomSheet()
    setShowRescanningPrompt( true )
  }

  function handleAccountArchive() {
    const settings = {
      visibility: AccountVisibility.ARCHIVED
    }
    dispatch( updateAccountSettings( {
      accountShell, settings
    } ) )
    navigation.navigate( 'Home' )
  }


  const showAccountArchiveBottomSheet = useCallback( () => {
    return(
      <AccountArchiveModal
        isError={false}
        onProceed={() => {
          handleAccountArchive()
          // closeArchiveModal()
          setShowAccountArchiveModal( false )
        }}
        onBack={() => setShowAccountArchiveModal( false )}
        onViewAccount={() => setShowAccountArchiveModal( false )}
        account={primarySubAccount}
      />
    )
  }, [ primarySubAccount ] )

  function showArchiveModal() {
    if ( primarySubAccount.balances.confirmed + primarySubAccount.balances.unconfirmed === 0 ) {
      setShowAccountArchiveModal( true )
    } else {
      // checkAccountBalance()
      setCheckAccountModal( true )
    }
  }

  function handleTransactionDataSelectionFromRescan( transactionData: RescannedTransactionData ) {
    // dismissBottomSheet()
    setShowRescanning( false )
    navigation.navigate( 'TransactionDetails', {
      transaction: transactionData.details,
      accountShellID: accountShell.id,
    } )
  }

  // const showRescanningPromptBottomSheet = () => {
  //   return (
  //     <AccountShellRescanningPromptBottomSheet
  //       onContinue={() => {
  //         setShowRescanningPrompt( false )
  //         setTimeout( () => {
  //           // showRescanningBottomSheet()
  //           setShowRescanning( true )
  //         }, 800 )
  //       }}
  //       onDismiss={() => setShowRescanningPrompt( false )}
  //     />
  //   )
  // }


  // const showRescanningBottomSheet = () => {
  //   return (
  //     <AccountShellRescanningBottomSheet
  //       accountShell={accountShell}
  //       onDismiss={() => setShowRescanning( false )}
  //       onTransactionDataSelected={handleTransactionDataSelectionFromRescan}
  //     />
  //   )
  // }


  return (
    <>
      <FlatList
        style={styles.rootContainer}
        contentContainerStyle={{
          paddingHorizontal: 14
        }}
        extraData={accountShell}
        data={listItems}
        keyExtractor={listItemKeyExtractor}
        renderItem={renderItem}
      />
      <ModalContainer onBackground={()=>setShowAccountArchiveModal( false )} visible={showAccountArchiveModal} closeBottomSheet={() => {}}>
        {showAccountArchiveBottomSheet()}
      </ModalContainer>

      <ModalContainer onBackground={()=>setCheckAccountModal( false )} visible={checkAccountModal} closeBottomSheet={() => {}}>
        {checkAccountBalance()}
      </ModalContainer>

      {/* <ModalContainer onBackground={()=>setShowRescanningPrompt( false )} visible={showRescanningPrompt} closeBottomSheet={() => {}}>
        {showRescanningPromptBottomSheet()}
      </ModalContainer>

      <ModalContainer onBackground={()=>setShowRescanning( false )} visible={showRescanning} closeBottomSheet={() => {}}>
        {showRescanningBottomSheet()}
      </ModalContainer> */}
    </>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingHorizontal: 10,
  },
} )

export default AccountSettingsMainScreen
