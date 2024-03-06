import React, { useEffect, useMemo } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import Colors from '../../../common/Colors'
import SyncStatus from '../../../common/data/enums/SyncStatus'
import AccountShell from '../../../common/data/models/AccountShell'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import ListStyles from '../../../common/Styles/ListStyles'
import { blindRefresh } from '../../../store/actions/accounts'
import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSyncStatusForAccountShellID from '../../../utils/hooks/account-utils/UseSyncStatusForAccountShellID'
import useFoundTransactionsFromReScan from '../../../utils/hooks/state-selectors/wallet-rescanning/UseFoundTransactionsFromRescan'
import TransactionsFoundDuringRescanList from '../account-shell-rescanning-bottom-sheet/TransactionsFoundDuringRescanList'

export type Props = {
  onDismiss: () => void;
  onTransactionDataSelected: ( transactionData: RescannedTransactionData ) => void;
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
        <Text style={ListStyles.infoHeaderSubtitleText}>All accounts scanned</Text>
      )}
    </View>
  )
}

const WalletRescanningBottomSheet: React.FC<Props> = ( {
  onDismiss,
  onTransactionDataSelected,
}: Props ) => {
  const dispatch = useDispatch()
  const { refreshed } = useSelector( state => state.accounts )
  useEffect( () => {
    dispatch( blindRefresh() )
  }, [] )
  const foundTransactions: RescannedTransactionData[] = useFoundTransactionsFromReScan()
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

        {refreshed && (
          <ActivityIndicator
            style={{
              marginBottom: 18
            }}
            size="large"
            color={Colors.blue}
          />
        )}

        {/* <ScanningProgressText accountShell={accountShell} /> */}

        {!refreshed && (
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
    // marginTop: 'auto',
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

export default WalletRescanningBottomSheet


