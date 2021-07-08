import React, { useCallback, useEffect, useMemo } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  RefreshControl,
  SectionList,
} from 'react-native'
import { useDispatch } from 'react-redux'
import NavHeader from '../../../components/account-details/AccountDetailsNavHeader'
import AccountDetailsCard from '../../../components/account-details/AccountDetailsCard'
import SendAndReceiveButtonsFooter from './SendAndReceiveButtonsFooter'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import KnowMoreBottomSheet, {
  KnowMoreBottomSheetHandle,
} from '../../../components/account-details/AccountDetailsKnowMoreBottomSheet'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useTransactionReassignmentCompletedEffect from '../../../utils/hooks/account-effects/UseTransactionReassignmentCompletedEffect'
import TransactionReassignmentSuccessBottomSheet from '../../../components/bottom-sheets/account-management/TransactionReassignmentSuccessBottomSheet'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import useAccountShellMergeCompletionEffect from '../../../utils/hooks/account-effects/UseAccountShellMergeCompletionEffect'
import AccountShellMergeSuccessBottomSheet from '../../../components/bottom-sheets/account-management/AccountShellMergeSuccessBottomSheet'
import AccountShell from '../../../common/data/models/AccountShell'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import { NavigationScreenConfig } from 'react-navigation'
import { NavigationStackOptions } from 'react-navigation-stack'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import { fetchFeeAndExchangeRates, refreshAccountShell } from '../../../store/actions/accounts'
import SourceAccountKind from '../../../common/data/enums/SourceAccountKind'
import NetworkKind from '../../../common/data/enums/NetworkKind'
import config from '../../../bitcoin/HexaConfig'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'
import { Button } from 'react-native-elements'
import DonationWebPageBottomSheet from '../../../components/bottom-sheets/DonationWebPageBottomSheet'
import TransactionsPreviewSection from './TransactionsPreviewSection'
import SyncStatus from '../../../common/data/enums/SyncStatus'
import { sourceAccountSelectedForSending } from '../../../store/actions/sending'
import idx from 'idx'
import Colors from '../../../common/Colors'
import useAccountByAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'

export type Props = {
  navigation: any;
};

enum SectionKind {
  ACCOUNT_CARD,
  TRANSACTIONS_LIST_PREVIEW,
  SEND_AND_RECEIVE_FOOTER,
}

const sectionListItemKeyExtractor = ( index ) => String( index )


const AccountDetailsContainerScreen: React.FC<Props> = ( { navigation } ) => {
  const dispatch = useDispatch()
  const accountShellID = useMemo( () => {
    return navigation.getParam( 'accountShellID' )
  }, [ navigation ] )

  const accountShell = useAccountShellFromNavigation( navigation )
  const accountsState = useAccountsState()
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const account = useAccountByAccountShell( accountShell )
  const { averageTxFees, exchangeRates } = accountsState

  const isRefreshing = useMemo( () => {
    return ( accountShell.syncStatus===SyncStatus.IN_PROGRESS )
  }, [ accountShell.syncStatus ] )

  const isShowingDonationButton = useMemo( () => {
    return primarySubAccount.kind === SubAccountKind.DONATION_ACCOUNT
  }, [ primarySubAccount.kind ] )

  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  function handleTransactionSelection( transaction: TransactionDescribing ) {
    navigation.navigate( 'TransactionDetails', {
      transaction,
      accountShellID: accountShell.id,
    } )
  }

  function navigateToTransactionsList() {
    navigation.navigate( 'TransactionsList', {
      accountShellID,
    } )
  }

  function navigateToAccountSettings() {
    navigation.navigate( 'SubAccountSettings', {
      accountShellID,
    } )
  }

  function navigateToDonationAccountWebViewSettings( donationAccount ) {
    navigation.navigate( 'DonationAccountWebViewSettings', {
      account: donationAccount,
    } )
  }

  function performRefreshOnPullDown() {
    dispatch( refreshAccountShell( accountShell, {
      autoSync: false
    } ) )
  }

  useEffect( () => {
    return () => {
      dismissBottomSheet()
    }
  }, [ navigation ] )

  const showKnowMoreSheet = useCallback( () => {
    presentBottomSheet(
      <KnowMoreBottomSheet
        primarySubAccount={primarySubAccount}
        accountKind={primarySubAccount.kind}
        onClose={dismissBottomSheet}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '95%' ],
        handleComponent: KnowMoreBottomSheetHandle,
      },
    )
  }, [ presentBottomSheet, dismissBottomSheet ] )

  const showReassignmentConfirmationBottomSheet = useCallback(
    ( destinationID ) => {
      presentBottomSheet(
        <TransactionReassignmentSuccessBottomSheet
          onViewAccountDetailsPressed={() => {
            dismissBottomSheet()
            navigation.dispatch(
              resetStackToAccountDetails( {
                accountShellID: destinationID,
              } ),
            )
          }}
        />,
        {
          ...defaultBottomSheetConfigs,
          snapPoints: [ 0, '40%' ],
        },
      )
    },
    [ presentBottomSheet, dismissBottomSheet ],
  )

  const showMergeConfirmationBottomSheet = useCallback(
    ( { source, destination } ) => {
      presentBottomSheet(
        <AccountShellMergeSuccessBottomSheet
          sourceAccountShell={source}
          destinationAccountShell={destination}
          onViewAccountDetailsPressed={() => {
            dismissBottomSheet()
            navigation.dispatch(
              resetStackToAccountDetails( {
                accountShellID: destination.id,
              } ),
            )
          }}
        />,
        {
          ...defaultBottomSheetConfigs,
          snapPoints: [ 0, '67%' ],
        },
      )
    },
    [ presentBottomSheet, dismissBottomSheet ],
  )

  useTransactionReassignmentCompletedEffect( {
    onSuccess: showReassignmentConfirmationBottomSheet,
    onError: () => {
      Alert.alert(
        'Transaction Reassignment Error',
        'An error occurred while attempting to reassign transactions'
      )
    },
  } )

  useAccountShellMergeCompletionEffect( {
    onSuccess: showMergeConfirmationBottomSheet,
    onError: () => {
      Alert.alert(
        'Account Merge Error',
        'An error occurred while attempting to merge accounts.'
      )
    },
  } )

  const showDonationWebViewSheet = useCallback( () => {
    presentBottomSheet(
      <DonationWebPageBottomSheet
        account={account}
        onClickSetting={() => {
          dismissBottomSheet()
          navigateToDonationAccountWebViewSettings( account )
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '65%' ],
      },
    )
  }, [ presentBottomSheet, dismissBottomSheet ] )

  useEffect( () => {
    // 📝 A slight timeout is needed here in order for the refresh control to
    // properly lay itself out above the rest of the content and become visible
    // when the loading starts
    if( accountShell.syncStatus===SyncStatus.PENDING )
    // setTimeout( () => {
    //   dispatch( refreshAccountShell( accountShell, {
    //     autoSync: true
    //   } ) )
    // }, 100 )
      requestAnimationFrame( () => {
        dispatch( refreshAccountShell( accountShell, {
          autoSync: true
        } ) )
      } )

  }, [] )

  useEffect( () => {
    // missing fee & exchange rates patch(restore & upgrade)
    if (
      !averageTxFees ||
      !Object.keys( averageTxFees ).length ||
      !exchangeRates ||
      !Object.keys( exchangeRates ).length
    )
      dispatch( fetchFeeAndExchangeRates() )
  }, [] )


  const sections = useMemo( () => {
    return [
      {
        kind: SectionKind.ACCOUNT_CARD,
        data: [ null ],
        renderItem: () => {
          return (
            <View style={styles.viewSectionContainer}>
              <AccountDetailsCard
                accountShell={accountShell}
                onKnowMorePressed={showKnowMoreSheet}
                onSettingsPressed={navigateToAccountSettings}
              />
            </View>
          )
        },
      },
      {
        kind: SectionKind.TRANSACTIONS_LIST_PREVIEW,
        data: [ null ],
        renderItem: () => {
          return (
            <View style={styles.viewSectionContainer}>
              <TransactionsPreviewSection
                transactions={AccountShell.getAllTransactions( accountShell ).slice( 0, 3 )}
                availableBalance={AccountShell.getSpendableBalance( accountShell )}
                bitcoinUnit={accountShell.unit}
                isTestAccount={primarySubAccount.kind === SubAccountKind.TEST_ACCOUNT}
                onViewMorePressed={navigateToTransactionsList}
                onTransactionItemSelected={handleTransactionSelection}
              />
            </View>
          )
        },
      },
      {
        kind: SectionKind.SEND_AND_RECEIVE_FOOTER,
        data: [ null ],
        renderItem: () => {
          return (
            <View style={styles.viewSectionContainer}>
              <View style={styles.footerSection}>
                <SendAndReceiveButtonsFooter
                  onSendPressed={() => {
                    dispatch( sourceAccountSelectedForSending( accountShell ) )

                    navigation.navigate( 'Send', {
                      subAccountKind: primarySubAccount.kind,
                    } )
                  }}
                  onReceivePressed={() => {
                    navigation.navigate( 'Receive', {
                      accountShell,
                    } )
                  }}
                  averageTxFees={averageTxFees}
                  network={
                    config.APP_STAGE === 'dev' ||
                      primarySubAccount.sourceKind === SourceAccountKind.TEST_ACCOUNT
                      ? NetworkKind.TESTNET
                      : NetworkKind.MAINNET
                  }
                />

                {isShowingDonationButton && (
                  <View style={{
                    alignItems: 'center',
                    marginTop: 36,
                  }}>
                    <Button
                      raised
                      buttonStyle={ButtonStyles.floatingActionButton}
                      title="Donation Webpage"
                      titleStyle={ButtonStyles.actionButtonText}
                      onPress={showDonationWebViewSheet}
                    />
                  </View>
                )}
              </View>
            </View>
          )
        },
      },
    ]
  }, [ accountShell ] )

  return (
    <SectionList
      contentContainerStyle={styles.scrollViewContainer}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      refreshControl={
        <RefreshControl
          onRefresh={performRefreshOnPullDown}
          refreshing={isRefreshing}
          style={{
            backgroundColor: Colors.backgroundColor,
          }}
        />
      }
      sections={sections}
      stickySectionHeadersEnabled={false}
      keyExtractor={sectionListItemKeyExtractor}
    />
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    height: '100%',
  },

  scrollViewContainer: {
    paddingTop: 20,
    height: '100%',
    paddingHorizontal: 24,
    backgroundColor: Colors.backgroundColor,
  },

  viewSectionContainer: {
    marginBottom: 10,
  },

  footerSection: {
    paddingVertical: 15,
  },
} )

AccountDetailsContainerScreen.navigationOptions = ( { navigation, } ): NavigationScreenConfig<NavigationStackOptions, any> => {
  return {
    header() {
      const { accountShellID } = navigation.state.params
      return (
        <NavHeader
          accountShellID={accountShellID}
          onBackPressed={() => navigation.pop()}
        />
      )
    },
  }
}

export default AccountDetailsContainerScreen
