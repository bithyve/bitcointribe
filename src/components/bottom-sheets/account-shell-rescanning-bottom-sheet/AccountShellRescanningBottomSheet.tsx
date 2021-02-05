import React, { useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, ImageBackground, Image, ActivityIndicator } from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import SyncStatus from '../../../common/data/enums/SyncStatus'
import AccountShell from '../../../common/data/models/AccountShell'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import ListStyles from '../../../common/Styles/ListStyles'
import HeadingStyles from '../../../common/Styles/HeadingStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSyncStatusForAccountShell from '../../../utils/hooks/account-utils/UseSyncStatusForAccountShell'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { refreshAccountShell } from '../../../store/actions/accounts'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import TransactionsFoundDuringRescanList from './TransactionsFoundDuringRescanList'
import { TransactionDetails } from '../../../bitcoin/utilities/Interface'

export type Props = {
  accountShell: AccountShell;
  onDismiss: () => void;
  onTransactionSelected: ( transaction: TransactionDetails ) => void;
};

type ProgressTextProps = {
  accountShell: AccountShell;
}

const ScanningProgressText: React.FC<ProgressTextProps> = ( { accountShell, }: ProgressTextProps ) => {
  const dispatch = useDispatch()
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )

  const displayedTitle = useMemo( () => {
    return primarySubAccount.customDisplayName ?? primarySubAccount.defaultTitle
  }, [ primarySubAccount ] )

  const syncStatus = useSyncStatusForAccountShell( accountShell )

  useEffect( () => {
    dispatch( refreshAccountShell( accountShell, {
      autoSync: false,
      hardRefresh: true,
    } ) )
  }, [] )

  return (
    <View style={{
      flexDirection: 'row'
    }}>
      {syncStatus == SyncStatus.IN_PROGRESS && (
        <>
          <Text style={ListStyles.infoHeaderSubtitleText}>Scanning account named </Text>
          <Text style={{
            color: Colors.blue,
            fontStyle: 'italic',
            fontWeight: '600'
          }}>
            {displayedTitle}
          </Text>
        </>
      ) || syncStatus == SyncStatus.COMPLETED && (
        <Text style={ListStyles.infoHeaderSubtitleText}>All accounts scanned</Text>
      )}
    </View>
  )
}

const AccountShellRescanningBottomSheet: React.FC<Props> = ( {
  accountShell,
  onDismiss,
  onTransactionSelected,
}: Props ) => {
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const syncStatus = useSyncStatusForAccountShell( accountShell )

  // const foundTransactions = useFoundTransactionsFromReScan()
  const foundTransactions: TransactionDetails[] = [
    {
      txid: '1',
      status: '',
      confirmations: 9,
      fee: '21',
      date: '1612486255674',
      transactionType: 'Sent',
      amount: 9,
      accountType: '',
      primaryAccType: '',
      contactName: 'Test Account',
      recipientAddresses: [ '08230af1991e01bec21108a08cu' ],
      // senderAddresses: [ '08230af1991e01bec21108a08cu' ],
      blockTime: 9,
      message: '',
      address: '08230af1991e01bec21108a08cu',
    },
    {
      txid: '2',
      status: '',
      confirmations: 9,
      fee: '21',
      date: '1612486255674',
      transactionType: 'Received',
      amount: 9,
      accountType: '',
      primaryAccType: '',
      contactName: 'Checking Account',
      recipientAddresses: [ '08230af1991e01bec21108a08cu' ],
      // senderAddresses: [ '08230af1991e01bec21108a08cu' ],
      blockTime: 9,
      message: '',
      address: '08230af1991e01bec21108a08cu',
    }
  ]

  function handleFullRescanButtonPress() {
    // TODO: How do we send an action for a "Full" rescan as opposed to a standard re-scan?
  }

  function handleBackButtonPress() {
    onDismiss()
  }

  return (
    <View style={styles.rootContainer}>
      <View style={styles.backgroundImageContainer}>
        <Image
          source={require( '../../../assets/images/loader.gif' )}
          style={{
            width: 103,
            height: 128,
          }}
        />
      </View>

      <View style={styles.mainContentContainer}>
        <Text style={BottomSheetStyles.confirmationMessageHeading}>
          Scanning your Account
        </Text>

        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
          Re-scanning your account may take some time
        </Text>

        {syncStatus == SyncStatus.IN_PROGRESS && (
          <ActivityIndicator
            style={{
              marginBottom: 18
            }}
            size="large"
            color={Colors.blue}
          />
        )}

        <ScanningProgressText accountShell={accountShell} />

        {syncStatus == SyncStatus.COMPLETED && (
          <>
            <View style={styles.sectionDivider} />
            <Text style={ListStyles.listItemTitle}>Transactions Found</Text>

            <TransactionsFoundDuringRescanList
              containerStyle={{
                marginTop: 18,
                maxHeight: heightPercentageToDP( 30 ),
              }}
              transactions={foundTransactions}
              onTransactionSelected={onTransactionSelected}
            />

            <View style={{
              marginTop: 'auto'
            }} />

            <View style={styles.footerSectionContainer}>
              {/* <Text style={HeadingStyles.sectionSubHeadingText}>Did you find the transactions you were looking for?</Text>
              <Text style={HeadingStyles.sectionSubHeadingText}>If you didn't, we recommend doing a full re-scan</Text> */}

              <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                  onPress={onDismiss}
                  style={ButtonStyles.primaryActionButton}
                >
                  <Text style={ButtonStyles.actionButtonText}>OK</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
              onPress={handleFullRescanButtonPress}
              style={ButtonStyles.primaryActionButton}
            >
              <Text style={ButtonStyles.actionButtonText}>Full Rescan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBackButtonPress}
              style={{
                ...ButtonStyles.primaryActionButton,
                marginRight: 8,
                backgroundColor: 'transparent',
              }}
            >
              <Text style={{
                ...ButtonStyles.actionButtonText,
                color: Colors.blue,
              }}>Back</Text>
            </TouchableOpacity> */}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  backgroundImageContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  mainContentContainer: {
    padding: 30,
    paddingBottom: 40,
    flex: 1,
  },

  footerSectionContainer: {
    marginTop: 'auto',
  },

  sectionDivider: {
    marginVertical: 18,
  },

  actionButtonContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
} )

export default AccountShellRescanningBottomSheet
