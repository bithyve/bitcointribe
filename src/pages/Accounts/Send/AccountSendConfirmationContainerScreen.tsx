import React, { useMemo, useEffect, useState } from 'react'
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
import { calculateCustomFee, executeAlternateSendStage2, executeSendStage2 } from '../../../store/actions/sending'
import useExitKeyForSending from '../../../utils/hooks/state-selectors/sending/UseExitKeyForSending'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'

export type NavigationParams = {
};

type NavigationProp = {
  params: NavigationParams;
} & BaseNavigationProp;

export type Props = {
  navigation: NavigationProp;
};

const AccountSendConfirmationContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const selectedRecipients = useSelectedRecipientsForSending()
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const usingExitKey = useExitKeyForSending()
  const sendingState = useSendingState()
  const availableBalance = useMemo( () => {
    return AccountShell.getSpendableBalance( sourceAccountShell )
  }, [ sourceAccountShell ] )
  const [ feeAmount, setFeeAmount ] = useState( 0 )
  const dispatch = useDispatch()

  const formattedAvailableBalanceAmountText = useFormattedAmountText( availableBalance )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title} (Available to spend: ${formattedAvailableBalanceAmountText} sats)`
  }, [ formattedAvailableBalanceAmountText, sourcePrimarySubAccount ] )


  function handleCustomFee ( feePerByte, customEstimatedBlocks ) {
    // feerate > minimum relay feerate(default: 1000 satoshis per kB or 1 sat/byte).
    if ( parseInt( feePerByte ) < 1 ) {
      // TODO: show err
      // this.setState( {
      //   customFee: '',
      //   customFeePerByteErr: 'Custom fee minimum: 1 sat/byte ',
      // } )
      return
    }

    dispatch( calculateCustomFee( {
      accountShellID: sourceAccountShell.id,
      feePerByte,
      customEstimatedBlocks,
      feeIntelAbsent: sendingState.feeIntelMissing,
    } ) )
  }

  function handleConfirmationButtonPress() {
    // TODO: populate txnPriority based on user selection
    const txnPriority = 'low'
    if( usingExitKey ){
      dispatch( executeAlternateSendStage2( {
        accountShellID: sourceAccountShell.id,
        txnPriority,
      } ) )
    } else {
      dispatch( executeSendStage2( {
        accountShellID: sourceAccountShell.id,
        txnPriority,
      } ) )
    }
  }

  function handleBackButtonPress() {
    navigation.goBack()
  }

  useEffect( ()=>{
    const { isSuccessful, txid, hasFailed, failedErrorMessage } = sendingState.sendST2
    if( isSuccessful ) {
      if( txid ){
        // TODO: show send succcesful bottomsheet


        // TODO: integrate donation send
        // if ( this.donationId ) {
        //   if ( transfer.details[ 0 ].note ) {
        //     const txNote = {
        //       txId: transfer.txid,
        //       note: transfer.details[ 0 ].note,
        //     }
        //     RelayServices.sendDonationNote( this.donationId, txNote )
        //   }
        // }

        // this.sendNotifications()
        // this.storeTrustedContactsHistory( transfer.details )
      } else navigation.navigate( 'TwoFAToken' )
    }
    else if( hasFailed ) {
      // TODO: show send failure bottomsheet w/ failedErrorMessage
    }
  }, [ sendingState.sendST2 ] )

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
        onFeeChanged={setFeeAmount}
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
