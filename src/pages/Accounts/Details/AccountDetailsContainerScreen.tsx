import React, { useCallback, useEffect, useMemo } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native'
import { useDispatch } from 'react-redux'
import NavHeader from '../../../components/account-details/AccountDetailsNavHeader'
import AccountDetailsCard from '../../../components/account-details/AccountDetailsCard'
import TransactionsList from '../../../components/account-details/AccountDetailsTransactionsList'
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
import { DerivativeAccounts, DerivativeAccountTypes } from '../../../bitcoin/utilities/Interface'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'
import TransactionPreviewHeader from './TransactionPreviewHeader'
import useSpendableBalanceForAccountShell from '../../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import { Button } from 'react-native-elements'
import DonationWebPageBottomSheet from '../../../components/bottom-sheets/DonationWebPageBottomSheet'
import { DONATION_ACCOUNT } from '../../../common/constants/serviceTypes'

export type Props = {
  navigation: any;
};

const AccountDetailsContainerScreen: React.FC<Props> = ( { navigation } ) => {
  const dispatch = useDispatch()

  const accountShellID = useMemo( () => {
    return navigation.getParam( 'accountShellID' )
  }, [ navigation ] )

  const accountShell = useAccountShellFromNavigation( navigation )
  const accountsState = useAccountsState()
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const accountTransactions = AccountShell.getAllTransactions( accountShell )
  const spendableBalance = useSpendableBalanceForAccountShell( accountShell )
  const {averageTxFees, exchangeRates} = accountsState
  let derivativeAccountKind: any = primarySubAccount.kind

  if (
    primarySubAccount.kind === SubAccountKind.REGULAR_ACCOUNT ||
    primarySubAccount.kind === SubAccountKind.SECURE_ACCOUNT
  ) {
    if ( primarySubAccount.instanceNumber ) {
      derivativeAccountKind = DerivativeAccountTypes.SUB_PRIMARY_ACCOUNT
    }
  }

  const derivativeAccountDetails: {
    type: string;
    number: number;
  } = config.EJECTED_ACCOUNTS.includes( derivativeAccountKind ) ?
    {
      type: derivativeAccountKind,
      number: primarySubAccount.instanceNumber,
    }
    : null


  const isRefreshing = useMemo( () => {
    return accountShell.isSyncInProgress
  }, [ accountShell.isSyncInProgress ] )

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

  function navigateToDonationAccountWebViewSettings(donationAccount, accountNumber, serviceType) {
    
    navigation.navigate( 'DonationAccountWebViewSettings', {
      account: donationAccount,
      accountNumber,
      serviceType,
    } )
  }

  function performRefreshOnPullDown() {
    dispatch( refreshAccountShell( accountShell, {
      autoSync: false
    } ) )
  }

  const showKnowMoreSheet = useCallback( () => {
    presentBottomSheet(
      <KnowMoreBottomSheet
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
     const accountNumber = primarySubAccount.instanceNumber
    const serviceType = primarySubAccount.sourceKind

    let derivativeAccounts: DerivativeAccounts

    if ( serviceType === SourceAccountKind.REGULAR_ACCOUNT ) {
      derivativeAccounts = accountsState[ serviceType ].service.hdWallet.derivativeAccounts
    } else if ( serviceType === SourceAccountKind.SECURE_ACCOUNT ) {
      derivativeAccounts = accountsState[ serviceType ].service.secureHDWallet.derivativeAccounts
    }

    const donationAccount = derivativeAccounts[ DONATION_ACCOUNT ][ accountNumber ]

    presentBottomSheet(
      <DonationWebPageBottomSheet
        account={donationAccount}
        onClickSetting={() => {
          dismissBottomSheet()
          navigateToDonationAccountWebViewSettings(donationAccount, accountNumber, serviceType)
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '65%' ],
      },
    )
  }, [ presentBottomSheet, dismissBottomSheet ] )

  useEffect( () => {
    dispatch( refreshAccountShell( accountShell, {
      autoSync: true
    } ) )
  }, [] )

  
  useEffect(() => {
    // missing fee & exchange rates patch(restore & upgrade)
    if (
      !averageTxFees ||
      !Object.keys(averageTxFees).length ||
      !exchangeRates ||
      !Object.keys(exchangeRates).length
    )
      dispatch(fetchFeeAndExchangeRates());
  }, []);

  return (

    <View style={styles.rootContainer}>
      <ScrollView
        style={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl
            onRefresh={performRefreshOnPullDown}
            refreshing={isRefreshing}
          />
        }
      >
        <AccountDetailsCard
          accountShell={accountShell}
          onKnowMorePressed={showKnowMoreSheet}
          onSettingsPressed={navigateToAccountSettings}
        />


        <View
          style={{
            paddingVertical: 20,
          }}
        >
          <TransactionPreviewHeader
            availableBalance={spendableBalance}
            bitcoinUnit={accountShell.unit}
            isTestAccount={
              primarySubAccount.kind === SubAccountKind.TEST_ACCOUNT
            }
            onViewMorePressed={navigateToTransactionsList}
          />

        </View>

        {primarySubAccount.kind === SubAccountKind.DONATION_ACCOUNT && (
          <View style={{
            alignItems: 'center',
          }}>
            <Button
              raised
              buttonStyle={ButtonStyles.primaryActionButton}
              title="Donation Webpage"
              titleStyle={ButtonStyles.actionButtonText}
              onPress={showDonationWebViewSheet}
            />
          </View>
        )}

        {/* <TransactionPreviewTabs  */}

        {/* /> */}


        <View
          style={{
            marginBottom: 20,
          }}
        >
          <TransactionsList
            transactions={accountTransactions.slice( 0, 3 )}
            onTransactionSelected={handleTransactionSelection}
          />
        </View>

        <View style={styles.footerSection}>
          <SendAndReceiveButtonsFooter
            onSendPressed={() => {
              navigation.navigate( 'Send', {
                serviceType: primarySubAccount.sourceKind,
                averageTxFees,
                spendableBalance: AccountShell.getSpendableBalance( accountShell ),
                derivativeAccountDetails,
                accountShellID,
              } )
            }}
            onReceivePressed={() => {
              navigation.navigate( 'Receive', {
                serviceType: primarySubAccount.sourceKind,
                derivativeAccountDetails,
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
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingTop: 20,
    flex: 1,
  },

  scrollViewContainer: {
    paddingHorizontal: 24,
  },

  footerSection: {
    paddingVertical: 38,
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
