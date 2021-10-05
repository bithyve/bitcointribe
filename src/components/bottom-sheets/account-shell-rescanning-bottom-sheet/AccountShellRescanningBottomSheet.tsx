import React, { useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import SyncStatus from '../../../common/data/enums/SyncStatus'
import AccountShell from '../../../common/data/models/AccountShell'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import ListStyles from '../../../common/Styles/ListStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import { refreshAccountShells } from '../../../store/actions/accounts'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import TransactionsFoundDuringRescanList from './TransactionsFoundDuringRescanList'
import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning'
import useFoundTransactionsFromReScan from '../../../utils/hooks/state-selectors/wallet-rescanning/UseFoundTransactionsFromRescan'
import useSyncStatusForAccountShellID from '../../../utils/hooks/account-utils/UseSyncStatusForAccountShellID'

export type Props = {
  accountShell: AccountShell;
  onDismiss: () => void;
  onTransactionDataSelected: ( transactionData: RescannedTransactionData ) => void;
};

type ProgressTextProps = {
  accountShell: AccountShell;
}

const ScanningProgressText: React.FC<ProgressTextProps> = ( { accountShell, }: ProgressTextProps ) => {
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )

  const displayedTitle = useMemo( () => {
    return primarySubAccount.customDisplayName ?? primarySubAccount.defaultTitle
  }, [ primarySubAccount ] )

  const syncStatus = useSyncStatusForAccountShellID( accountShell.id )

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
        <Text style={ListStyles.infoHeaderSubtitleText}>Account synced</Text>
      )}
    </View>
  )
}

const AccountShellRescanningBottomSheet: React.FC<Props> = ( {
  accountShell,
  onDismiss,
  onTransactionDataSelected,
}: Props ) => {
  const dispatch = useDispatch()
  const syncStatus = useSyncStatusForAccountShellID( accountShell.id )

  const foundTransactions: RescannedTransactionData[] = useFoundTransactionsFromReScan()

  useEffect( () => {
    dispatch( refreshAccountShells( [ accountShell ], {
      hardRefresh: true,
    } ) )
  }, [] )

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
          {syncStatus == SyncStatus.COMPLETED ? 'Account Synced' : 'Account Sync in progress'}
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

            {foundTransactions.length > 0 && (
              <>
                <Text style={ListStyles.listItemTitle}>Transactions Found</Text>
                <TransactionsFoundDuringRescanList
                  containerStyle={{
                    marginTop: 18,
                    maxHeight: heightPercentageToDP( 30 ),
                  }}
                  transactionsDetailItems={foundTransactions}
                  onTransactionDataSelected={onTransactionDataSelected}
                />
              </>
            ) || (
              <Text
                style={ListStyles.listItemTitle}
              >
                No transactions were found during the re-scan.
              </Text>
            )}

            <View style={styles.footerSectionContainer}>
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                  onPress={onDismiss}
                  style={ButtonStyles.primaryActionButton}
                >
                  <Text style={ButtonStyles.actionButtonText}>OK</Text>
                </TouchableOpacity>
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
    // flex: 1,
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
    // flex: 1,
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
