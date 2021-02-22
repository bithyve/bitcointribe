import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, Keyboard } from 'react-native'
import { Input } from 'react-native-elements'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch } from 'react-redux'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import AccountShell from '../../../common/data/models/AccountShell'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import { BaseNavigationProp } from '../../../navigation/Navigator'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useSelectedRecipientForSendingByID from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientForSendingByID'
import useSelectedRecipientsForSending from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientsForSending'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import BalanceEntryFormGroup from './BalanceEntryFormGroup'
import SelectedRecipientsCarousel from './SelectedRecipientsCarousel'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { calculateSendMaxFee } from '../../../store/actions/sending'
import useAverageTransactionFees from '../../../utils/hooks/state-selectors/UseAverageTransactionFees'

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
  const currentRecipient = useSelectedRecipientForSendingByID( navigation.getParam( 'selectedRecipientID' ) )
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const [ selectedAmount, setSelectedAmount ] = useState<Satoshis | null>( null )
  const [ noteText, setNoteText ] = useState( '' )
  const averageTransactionFees = useAverageTransactionFees()

  const availableBalance = useMemo( () => {
    return AccountShell.getTotalBalance( sourceAccountShell )
  }, [ sourceAccountShell ] )

  const formattedAvailableBalanceAmountText = useFormattedAmountText( availableBalance )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title} (Available to spend: ${formattedAvailableBalanceAmountText} sats)`
  }, [ formattedAvailableBalanceAmountText, sourcePrimarySubAccount ] )

  const orderedRecipients = useMemo( () => {
    return Array.from( selectedRecipients || [] ).reverse()
  }, [ selectedRecipients ] )


  function handleRecipientRemoval( recipient: RecipientDescribing ) {
    // dispatch(removeRecipientFromSending)
  }

  function handleConfirmationButtonPress() {
    navigation.navigate( 'SendConfirmation' )
  }

  function handleAddRecipientButtonPress() {
    navigation.goBack()
  }

  function handleSendMaxPress() {
    dispatch( calculateSendMaxFee( {
      numberOfRecipients: selectedRecipients.length,
      accountShellID: sourceAccountShell.id,
    } ) )
  }

  return (
    <View style={styles.rootContainer}>

      <View style={styles.headerSection}>
        <SelectedRecipientsCarousel
          recipients={orderedRecipients}
          onRemoveSelected={handleRecipientRemoval}
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

      <View style={styles.formBodySection}>
        <BalanceEntryFormGroup
          subAccountKind={sourcePrimarySubAccount.kind}
          onAmountChanged={setSelectedAmount}
          onSendMaxPressed={handleSendMaxPress}
        />

        {sourcePrimarySubAccount.kind == SubAccountKind.DONATION_ACCOUNT && (
          <View style={styles.textInputFieldWrapper}>
            <Input
              containerStyle={styles.textInputContainer}
              inputContainerStyle={{
                height: '100%',
                padding: 0,
                borderBottomColor: 'transparent',
              }}
              inputStyle={styles.textInputContent}
              placeholder={'Send a short note to the donee'}
              placeholderTextColor={FormStyles.placeholderText.color}
              value={noteText}
              returnKeyLabel="Done"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              onChangeText={setNoteText}
              autoCorrect={false}
              autoCompleteType="off"
            />
          </View>
        )}
      </View>

      <View style={styles.footerSection}>
        <TouchableOpacity
          onPress={handleConfirmationButtonPress}
          style={ButtonStyles.primaryActionButton}
        >
          <Text style={ButtonStyles.actionButtonText}>Confirm & Proceed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAddRecipientButtonPress}
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
              Add Recipient
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

  formBodySection: {
    // flex: 1,
    marginBottom: 24,
  },

  footerSection: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },

  textInputFieldWrapper: {
    ...FormStyles.textInputContainer,
    marginBottom: widthPercentageToDP( '1.5%' ),
    width: widthPercentageToDP( '70%' ),
    height: widthPercentageToDP( '13%' ),
    alignItems: 'center',
  },

  textInputContainer: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
  },

  textInputContent: {
    height: '100%',
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13 ),
  },
} )

export default SentAmountForContactFormScreen

