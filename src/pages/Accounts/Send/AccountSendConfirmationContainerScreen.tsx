import React, { useMemo, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import AccountShell from '../../../common/data/models/AccountShell'
import { BaseNavigationProp } from '../../../navigation/Navigator'
import { useDispatch } from 'react-redux'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useSelectedRecipientsForSending from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientsForSending'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import SelectedRecipientsCarousel from './SelectedRecipientsCarousel'
import SendConfirmationCurrentTotalHeader from '../../../components/send/SendConfirmationCurrentTotalHeader'
import TransactionPriorityMenu from './TransactionPriorityMenu'
import { executeAlternateSendStage2, executeSendStage2, resetSendState, sendTxNotification } from '../../../store/actions/sending'
import useExitKeyForSending from '../../../utils/hooks/state-selectors/sending/UseExitKeyForSending'
import TransactionPriority from '../../../common/data/enums/TransactionPriority'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import SendConfirmationContent from '../SendConfirmationContent'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import { clearTransfer, refreshAccountShell } from '../../../store/actions/accounts'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import useAccountSendST2CompletionEffect from '../../../utils/sending/UseAccountSendST2CompletionEffect'

export type NavigationParams = {
};

type NavigationProp = {
  params: NavigationParams;
} & BaseNavigationProp;

export type Props = {
  navigation: NavigationProp;
};

const AccountSendConfirmationContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const dispatch = useDispatch()

  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  const selectedRecipients = useSelectedRecipientsForSending()
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const usingExitKey = useExitKeyForSending()
  const availableBalance = useMemo( () => {
    return AccountShell.getSpendableBalance( sourceAccountShell )
  }, [ sourceAccountShell ] )

  const [ transactionPriority, setTransactionPriority ] = useState( TransactionPriority.LOW )

  const formattedAvailableBalanceAmountText = useFormattedAmountText( availableBalance )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title} (Available to spend: ${formattedAvailableBalanceAmountText} sats)`
  }, [ formattedAvailableBalanceAmountText, sourcePrimarySubAccount ] )

  const showSendSuccessBottomSheet = useCallback( () => {
    presentBottomSheet(
      <SendConfirmationContent
        title={'Sent Successfully to Contact'}
        info={'Transaction(s) successfully submitted'}
        userInfo={[]}
        infoText={'Bitcoins successfully sent to Contact'}
        isFromContact={false}
        okButtonText={'View Account'}
        cancelButtonText={'Back'}
        isCancel={false}
        onPressOk={() => {
          dismissBottomSheet()
          dispatch( resetSendState() )
          dispatch( refreshAccountShell( sourceAccountShell, {
            autoSync: false,
            hardRefresh: false,
          } ) )
          navigation.dispatch(
            resetStackToAccountDetails( {
              accountShellID: sourceAccountShell.id,
            } )
          )
        }}
        onPressCancel={dismissBottomSheet}
        isSuccess={true}
        accountKind={sourcePrimarySubAccount.kind}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '67%' ],
      },
    )
  },
  [ presentBottomSheet, dismissBottomSheet ] )

  const showSendFailureBottomSheet = useCallback( ( errorMessage: string | null ) => {
    presentBottomSheet(
      <SendConfirmationContent
        title={'Send Unsuccessful'}
        info={String( errorMessage )}
        userInfo={[]}
        isFromContact={false}
        okButtonText={'Try Again'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={dismissBottomSheet}
        onPressCancel={() => {
          dispatch( clearTransfer( sourcePrimarySubAccount.kind ) )
          dismissBottomSheet()

          navigation.dispatch(
            resetStackToAccountDetails( {
              accountShellID: sourceAccountShell.id,
            } )
          )
        }}
        isUnSuccess={true}
        accountKind={sourcePrimarySubAccount.kind}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '67%' ],
      },
    )
  },
  [ presentBottomSheet, dismissBottomSheet ] )

  function handleConfirmationButtonPress() {
    if( usingExitKey ){
      dispatch( executeAlternateSendStage2( {
        accountShellID: sourceAccountShell.id,
        txnPriority: String( transactionPriority ),
      } ) )
    } else {
      dispatch( executeSendStage2( {
        accountShellID: sourceAccountShell.id,
        txnPriority: String( transactionPriority ),
      } ) )
    }
  }

  function handleBackButtonPress() {
    navigation.goBack()
  }

  useAccountSendST2CompletionEffect( {
    onSuccess: ( txid: string | null ) => {
      if ( txid ) {
        showSendSuccessBottomSheet()

        // TODO: integrate donation send
        // if ( sourcePrimarySubAccount.kind == SubAccountKind.DONATION_ACCOUNT ) {
        //   if ( transfer.details[ 0 ].note ) {
        //     const txNote = {
        //       txId: transfer.txid,
        //       note: transfer.details[ 0 ].note,
        //     }
        //     RelayServices.sendDonationNote( this.donationId, txNote )
        //   }
        // }

        dispatch( sendTxNotification() )
        // this.storeTrustedContactsHistory( transfer.details )
      } else {
        navigation.navigate( 'TwoFAToken' )
      }
    },
    onFailure: showSendFailureBottomSheet,
  } )


  return (
    <View style={styles.rootContainer}>

      <View style={styles.headerSection}>
        <SelectedRecipientsCarousel
          recipients={selectedRecipients}
        />
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
      }}>
        <Text style={{
          marginRight: RFValue( 4 )
        }}>
          Sending From:
        </Text>

        <Text style={{
          fontFamily: Fonts.FiraSansRegular,
          fontSize: RFValue( 11 ),
          fontStyle: 'italic',
          color: Colors.blue,
        }}>
          {sourceAccountHeadlineText}
        </Text>
      </View>

      <SendConfirmationCurrentTotalHeader />

      <TransactionPriorityMenu
        sourceSubAccount={sourcePrimarySubAccount}
        onTransactionPriorityChanged={setTransactionPriority}
      />

      <View style={styles.footerSection}>
        <TouchableOpacity
          onPress={handleConfirmationButtonPress}
          style={ButtonStyles.primaryActionButton}
        >
          <Text style={ButtonStyles.actionButtonText}>Confirm & Send</Text>
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
          }}>
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  headerSection: {
    paddingVertical: 24,
  },

  footerSection: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },

} )

export default AccountSendConfirmationContainerScreen
