import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import FormStyles from '../../../common/Styles/FormStyles'
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

  const availableBalance = useMemo( () => {
    return AccountShell.getTotalBalance( sourceAccountShell )
  }, [ sourceAccountShell ] )

  const formattedAvailableBalanceAmountText = useFormattedAmountText( availableBalance )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title} (Available to spend: ${formattedAvailableBalanceAmountText} sats)`
  }, [ formattedAvailableBalanceAmountText, sourcePrimarySubAccount ] )


  function handleConfirmationButtonPress() {
  }

  function handleBackButtonPress() {
    navigation.goBack()
  }


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
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        marginBottom: 24,
      }}>
        <Text style={{
          marginRight: 4
        }}>
          Sending From:
        </Text>

        <Text style={{
          fontFamily: Fonts.FiraSansRegular,
          fontSize: RFValue( 12 ),
          fontStyle: 'italic',
          color: Colors.blue,
        }}>
          {sourceAccountHeadlineText}
        </Text>
      </View>

      <SendConfirmationCurrentTotalHeader />

      <TransactionPriorityMenu
        sourceSubAccount={sourcePrimarySubAccount}
        // onSelect={handlePrioritySelection}
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
