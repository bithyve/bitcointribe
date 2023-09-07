import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  RefreshControl,
  SectionList,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import NavHeader from '../../../components/account-details/AccountDetailsNavHeader'
import AccountDetailsCard from '../../../components/account-details/AccountDetailsCard'
import SendAndReceiveButtonsFooter from './SendAndReceiveButtonsFooter'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import KnowMoreBottomSheet, {
  KnowMoreBottomSheetHandle,
} from '../../../components/account-details/AccountDetailsKnowMoreBottomSheet'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import useAccountShellFromRoute from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useTransactionReassignmentCompletedEffect from '../../../utils/hooks/account-effects/UseTransactionReassignmentCompletedEffect'
import TransactionReassignmentSuccessBottomSheet from '../../../components/bottom-sheets/account-management/TransactionReassignmentSuccessBottomSheet'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import useAccountShellMergeCompletionEffect from '../../../utils/hooks/account-effects/UseAccountShellMergeCompletionEffect'
import AccountShellMergeSuccessBottomSheet from '../../../components/bottom-sheets/account-management/AccountShellMergeSuccessBottomSheet'
import AccountShell from '../../../common/data/models/AccountShell'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import { fetchExchangeRates, fetchFeeRates, refreshAccountShells } from '../../../store/actions/accounts'
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
import ModalContainer from '../../../components/home/ModalContainer'
import { RootSiblingParent } from 'react-native-root-siblings'
import ErrorModalContents from '../../../components/ErrorModalContents'
import SavingAccountAlertBeforeLevel2 from '../../../components/know-more-sheets/SavingAccountAlertBeforeLevel2'
import { AccountType } from '../../../bitcoin/utilities/Interface'
import { translations } from '../../../common/content/LocContext'
import { markReadTx } from '../../../store/actions/accounts'
import ButtonBlue from '../../../components/ButtonBlue'
import BorderWalletKnowMore from '../../../components/know-more-sheets/BorderWalletKnowMore'

export type Props = {
  route: any;
  navigation: any;
};

enum SectionKind {
  ACCOUNT_CARD,
  TRANSACTIONS_LIST_PREVIEW,
  SEND_AND_RECEIVE_FOOTER,
}

const sectionListItemKeyExtractor = ( index ) => String( index )


const AccountDetailsContainerScreen: React.FC<Props> = ({route, navigation}) => {
  const dispatch = useDispatch()

  const accountShellID = useMemo(() => {
    return route.params?.accountShellID;
  }, [route.params]);

  const onBackPressed = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  navigation.setOptions({
    header: () => (
      <NavHeader accountShellID={accountShellID} onBackPressed={onBackPressed} />
    ),
  });

  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]

  const [ webView, showWebView ] = useState( false )
  const swanDeepLinkContent = route.params?.swanDeepLinkContent
  const accountShell = useAccountShellFromRoute(route)
  const accountsState = useAccountsState()
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const account = useAccountByAccountShell( accountShell )
  const { averageTxFees, exchangeRates } = accountsState

  const [ showMore, setShowMore ] = useState( false )
  const [ bwShowMore, setBWShowMore ] = useState( false )

  const isRefreshing = useMemo( () => {
    return ( accountShell.syncStatus===SyncStatus.IN_PROGRESS )
  }, [ accountShell.syncStatus ] )

  const isShowingDonationButton = useMemo( () => {
    return primarySubAccount.kind === SubAccountKind.DONATION_ACCOUNT
  }, [ primarySubAccount.kind ] )

  const [ secureAccountAlert, setSecureAccountAlert ] = useState( false )
  const [ secureAccountKnowMore, setSecureAccountKnowMore ] = useState( false )
  const AllowSecureAccount = useSelector(
    ( state ) => state.bhr.AllowSecureAccount,
  )
  const isBorderWallet = primarySubAccount.type === AccountType.BORDER_WALLET
  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  useEffect( ()=>{
    if( !AllowSecureAccount && primarySubAccount.type == AccountType.SAVINGS_ACCOUNT ){
      setSecureAccountAlert( true )
    }
  }, [] )

  useEffect( () => {
    return () => {
      const unread = accountShell.primarySubAccount.transactions.filter( tx => tx.isNew ).map( tx => tx.txid )
      if( unread.length > 0 ) dispatch( markReadTx( unread, accountShell.id ) )
    }
  }, [] )

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
    dispatch( refreshAccountShells( [ accountShell ], {
      hardRefresh: true,
    } ) )
  }

  useEffect( () => {
    return () => {
      dismissBottomSheet()
    }
  }, [ navigation ] )

  const showKnowMoreSheet = () => {
    return(
      <KnowMoreBottomSheet
        primarySubAccount={primarySubAccount}
        accountKind={primarySubAccount.kind}
        onClose={() => setShowMore( false )}
      />
    )
  }

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

  const showDonationWebViewSheet = () => {
    return(
      <DonationWebPageBottomSheet
        account={account}
        onClickSetting={() => {
          showWebView( false )
          navigateToDonationAccountWebViewSettings( account )
        }}
        closeModal={() => showWebView( false )}
      />
    )
  }

  const renderSecureAccountAlertContent = useCallback( () => {
    return (
      <ErrorModalContents
        title={strings.CompleteLevel2}
        info={strings.Level2}
        isIgnoreButton={true}
        onPressProceed={() => {
          setSecureAccountAlert( false )
          navigation.goBack()
        }}
        onPressIgnore={() => {
          setSecureAccountKnowMore( true )
          setSecureAccountAlert( false )
        }}
        proceedButtonText={common.ok}
        cancelButtonText={common.learnMore}
        isBottomImage={true}
        bottomImage={require( '../../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ secureAccountAlert ] )

  const renderSecureAccountKnowMoreContent = () => {
    return (
      <SavingAccountAlertBeforeLevel2
        titleClicked={()=>{
          setSecureAccountAlert( true )
          setSecureAccountKnowMore( false )
        }}
        containerStyle={{
        }}
      />
    )
  }

  useEffect( () => {
    // missing fee & exchange rates patch(restore & upgrade)
    if (
      !averageTxFees ||
      !Object.keys( averageTxFees ).length ||
      !exchangeRates ||
      !Object.keys( exchangeRates ).length
    ){
      dispatch( fetchFeeRates() )
      dispatch( fetchExchangeRates() )
    }
  }, [] )

  const onSendBittonPress = () => {
    dispatch( sourceAccountSelectedForSending( accountShell ) )

    navigation.navigate( 'Send', {
      subAccountKind: primarySubAccount.kind,
    } )
  }

  const sections = useMemo( () => {
    return [
      {
        kind: SectionKind.ACCOUNT_CARD,
        data: [ null ],
        renderItem: () => {
          return (
            <View style={styles.viewAccountDetailsCard}>
              <AccountDetailsCard
                accountShell={accountShell}
                onKnowMorePressed={() => isBorderWallet ? setBWShowMore( true ): setShowMore( true )}
                onSettingsPressed={navigateToAccountSettings}
                swanDeepLinkContent={swanDeepLinkContent}
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
                transactions={AccountShell.getAllTransactions( accountShell ) }
                // transactions={AccountShell.getAllTransactions( accountShell ).slice( 0, 3 )}
                availableBalance={AccountShell.getSpendableBalance( accountShell )}
                bitcoinUnit={accountShell.unit}
                isTestAccount={primarySubAccount.kind === SubAccountKind.TEST_ACCOUNT}
                onViewMorePressed={navigateToTransactionsList}
                onTransactionItemSelected={handleTransactionSelection}
                accountShellId={accountShell.id}
                kind={primarySubAccount.kind}
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
                    onSendBittonPress()
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
                  isTestAccount={primarySubAccount.sourceKind === SourceAccountKind.TEST_ACCOUNT}
                />

                {isShowingDonationButton && (
                  <View style={{
                    alignItems: 'center',
                    marginTop: 36,
                  }}>
                    <ButtonBlue
                      buttonText={'Donation Webpage'}
                      handleButtonPress={()=>showWebView( true )}
                    />
                    {/* <Button
                      raised
                      buttonStyle={ButtonStyles.floatingActionButton}
                      title="Donation Webpage"
                      titleStyle={ButtonStyles.actionButtonText}
                      onPress={() => showWebView( true )}
                    /> */}
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
    <View style={{
      backgroundColor: Colors.backgroundColor, flex: 1
    }}>


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
      <ModalContainer onBackground={()=>setShowMore( false )} visible={showMore} closeBottomSheet={() => {setShowMore( false )}}>
        {showKnowMoreSheet()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setBWShowMore( false )} visible={bwShowMore} closeBottomSheet={() => {setBWShowMore( false )}}>
        <BorderWalletKnowMore titleClicked={()=>setBWShowMore( false )}/>
      </ModalContainer>
      <ModalContainer onBackground={()=>showWebView( false )} visible={webView} closeBottomSheet={() => { showWebView( false ) }} >
        <RootSiblingParent>
          {showDonationWebViewSheet()}
        </RootSiblingParent>
      </ModalContainer>
      {
        primarySubAccount.type == AccountType.SAVINGS_ACCOUNT && (
          <ModalContainer
            onBackground={()=>{
              setSecureAccountAlert( false )
              setTimeout( () => {
                !AllowSecureAccount && primarySubAccount.type == AccountType.SAVINGS_ACCOUNT && setSecureAccountAlert( true )
              }, 200 )
            }}
            visible={secureAccountAlert} closeBottomSheet={() => {

            }} >
            {renderSecureAccountAlertContent()}
          </ModalContainer>
        )
      }

      {
        primarySubAccount.type == AccountType.SAVINGS_ACCOUNT && (
          <ModalContainer onBackground={()=>setSecureAccountKnowMore( false )} visible={secureAccountKnowMore} closeBottomSheet={() => {
            if( !AllowSecureAccount && primarySubAccount.type == AccountType.SAVINGS_ACCOUNT ){
              setSecureAccountAlert( true )
            }
            setSecureAccountKnowMore( false )
          }} >
            {renderSecureAccountKnowMoreContent()}
          </ModalContainer>
        )
      }

    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    height: '100%',
  },

  scrollViewContainer: {
    paddingTop: 10,
    // height: '100%',
    paddingHorizontal: 0,
    backgroundColor: Colors.backgroundColor,
  },

  viewSectionContainer: {
    marginBottom: 10,
  },

  viewAccountDetailsCard: {
    paddingHorizontal: 20,
  },

  footerSection: {
    paddingVertical: 15,
  },
} )

export default AccountDetailsContainerScreen
