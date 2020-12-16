import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Input } from 'react-native-elements'
import { useDispatch } from 'react-redux'
import AccountShell from '../../../common/data/models/AccountShell'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { BaseNavigationProp } from '../../../navigation/Navigator'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useSelectedRecipientsForSending from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientsForSending'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import SelectedRecipientsCarousel from './SelectedRecipientsCarousel'

export type NavigationParams = {
};

export type NavigationProp = {
  params: NavigationParams;
} & BaseNavigationProp;

export type Props = {
  navigation: NavigationProp;
};

const SentAmountForContactFormScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const dispatch = useDispatch()
  const selectedRecipients = useSelectedRecipientsForSending()
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )

  const orderedRecipients = useMemo( () => {
    return Array.from( selectedRecipients ).reverse()
  }, [ selectedRecipients ] )


  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle
    const availableBalance = AccountShell.getTotalBalance( sourceAccountShell )

    return `${title} (Available to spend: ${useFormattedAmountText( availableBalance )} sats)`
  }, [ sourceAccountShell, sourcePrimarySubAccount ] )


  function handleRecipientRemoval( recipient: RecipientDescribing ) {
    // dispatch(removeRecipientFromSending)
  }

  return (
    <View style={styles.rootContainer}>
      <View style={styles.headerSection}>
        <SelectedRecipientsCarousel
          recipients={orderedRecipients}
          onRemoveSelected={handleRecipientRemoval}
        />

        <View style={{
          flexDirection: 'row', justifyContent: 'center'
        }}>
          <Text>Sending From: </Text>
          <Text>{sourceAccountHeadlineText}</Text>
        </View>

      </View>

      <View style={styles.formBodySection}>
        <BalanceEntryFormGroup />
        {/* <Input
          containerStyle={containerStyle}
          inputContainerStyle={[FormStyles.textInputContainer]}
          inputStyle={FormStyles.inputText}
          placeholder={placeholder}
          placeholderTextColor={FormStyles.placeholderText.color}
          value={recipientAddress}
          onChangeText={handleTextChange}
          onKeyPress={(event) => {
            if (event.nativeEvent.key === 'Backspace') {
              setIsAddressInvalid(false)
            }
          }}
          onBlur={() => {
            const isAddressValid = walletInstance.isValidAddress(recipientAddress)
            setIsAddressInvalid(!isAddressValid)
          }}
          numberOfLines={1}
        /> */}
      </View>


      <View style={styles.footerSection}>

      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  headerSection: {

  },

  formBodySection: {

  },

  footerSection: {

  }
} )

export default SentAmountForContactFormScreen

