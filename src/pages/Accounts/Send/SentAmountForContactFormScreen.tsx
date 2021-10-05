import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Keyboard, TouchableOpacity } from 'react-native'
import { Input } from 'react-native-elements'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch } from 'react-redux'
import AccountShell from '../../../common/data/models/AccountShell'
import { ContactRecipientDescribing, RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
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
import { calculateSendMaxFee, executeSendStage1, amountForRecipientUpdated, recipientRemovedFromSending } from '../../../store/actions/sending'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import useAccountSendST1CompletionEffect from '../../../utils/sending/UseAccountSendST1CompletionEffect'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import SendConfirmationContent from '../SendConfirmationContent'
import { clearTransfer } from '../../../store/actions/accounts'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import useSpendableBalanceForAccountShell from '../../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import idx from 'idx'
import { PermanentChannelsSyncKind, syncPermanentChannels } from '../../../store/actions/trustedContacts'
import RecipientKind from '../../../common/data/enums/RecipientKind'
import ModalContainer from '../../../components/home/ModalContainer'
import { translations } from '../../../common/content/LocContext'

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

  const [ sendFailureModal, setFailure ] = useState( false )
  const [ errorMessage, setError ] = useState( '' )
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]

  const selectedRecipients = useSelectedRecipientsForSending()
  const currentRecipient = useSelectedRecipientForSendingByID( navigation.getParam( 'selectedRecipientID' ) )
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const spendableBalance = useSpendableBalanceForAccountShell( sourceAccountShell )
  const currentAmount = idx( currentRecipient, ( _ ) => _.amount )
  const [ selectedAmount, setSelectedAmount ] = useState<Satoshis | null>( currentAmount ? currentAmount : 0 )
  const sendingState = useSendingState()
  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: BitcoinUnit.SATS,
  } )
  const availableBalance = useMemo( () => {
    return AccountShell.getSpendableBalance( sourceAccountShell )
  }, [ sourceAccountShell ] )

  const formattedAvailableBalanceAmountText = useFormattedAmountText( availableBalance )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`
  }, [ formattedAvailableBalanceAmountText, sourcePrimarySubAccount ] )


  const orderedRecipients = useMemo( () => {
    return Array.from( selectedRecipients || [] ).reverse()
  }, [ selectedRecipients ] )

  useEffect( () => {
    return () => {
      setFailure( false )
    }
  }, [ navigation ] )

  useEffect( ()=> {
    // refresh selected recipient's permanent channel
    if( currentRecipient && currentRecipient.kind === RecipientKind.CONTACT ){
      const channelUpdate = {
        contactInfo: {
          channelKey: ( currentRecipient as ContactRecipientDescribing ).channelKey,
        }
      }
      dispatch( syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
        channelUpdates: [ channelUpdate ]
      } ) )
    }
  }, [ ( currentRecipient as ContactRecipientDescribing )?.channelKey ] )

  function handleRecipientRemoval( recipient: RecipientDescribing ) {
    dispatch( recipientRemovedFromSending( recipient ) )
    navigation.goBack()
  }

  function updateAmountForRecipient() {
    dispatch( amountForRecipientUpdated( {
      recipient: currentRecipient,
      amount: selectedAmount
    } ) )
  }

  function handleConfirmationButtonPress() {
    updateAmountForRecipient()
    dispatch( executeSendStage1( {
      accountShell: sourceAccountShell
    } ) )
  }

  function handleAddRecipientButtonPress() {
    updateAmountForRecipient()
    navigation.goBack()
  }

  function handleSendMaxPress( ) {
    dispatch( calculateSendMaxFee( {
      numberOfRecipients: selectedRecipients.length,
      accountShell: sourceAccountShell,
    } ) )
  }

  const showSendFailureBottomSheet = useCallback( () => {
    return(
      <SendConfirmationContent
        title={strings.SendUnsuccessful}
        info={String( errorMessage )}
        isFromContact={false}
        recipients={sendingState.selectedRecipients}
        okButtonText={common.tryAgain}
        cancelButtonText={common.back}
        isCancel={true}
        onPressOk={() => setFailure( false )}
        onPressCancel={() => {
          dispatch( clearTransfer( sourcePrimarySubAccount.kind ) )
          setFailure( false )

          navigation.dispatch(
            resetStackToAccountDetails( {
              accountShellID: sourceAccountShell.id,
            } )
          )
        }}
        isUnSuccess={true}
        accountKind={sourcePrimarySubAccount.kind}
      />
    )
  }, [ errorMessage ] )


  useAccountSendST1CompletionEffect( {
    onSuccess: () => {
      navigation.navigate( 'SendConfirmation' )
    },
    onFailure: ( error ) => {
      setError( error )
      setTimeout( () => {
        setFailure( true )
      }, 200 )
    },
  } )

  useEffect( ()=> {
    if ( sendingState.feeIntelMissing ) {
      // missing fee intel: custom fee-fallback
      navigation.navigate( 'SendConfirmation' )
    }
  }, [ sendingState.feeIntelMissing ] )

  return (
    <View style={styles.rootContainer}>
      <ModalContainer visible={sendFailureModal} closeBottomSheet={() => {}} >
        {showSendFailureBottomSheet()}
      </ModalContainer>
      <View style={styles.headerSection}>
        <SelectedRecipientsCarousel
          recipients={orderedRecipients}
          subAccountKind={sourcePrimarySubAccount.kind}
          onRemoveSelected={handleRecipientRemoval}
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
          {`${strings.SendingFrom}:`}
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

      <View style={styles.formBodySection}>
        <BalanceEntryFormGroup
          currentRecipient={currentRecipient}
          subAccountKind={sourcePrimarySubAccount.kind}
          spendableBalance={spendableBalance}
          onAmountChanged={( amount: Satoshis ) => {
            setSelectedAmount( amount )
          }}
          onSendMaxPressed={handleSendMaxPress}
        />
      </View>

      <View style={styles.footerSection}>
        <TouchableOpacity
          disabled={!selectedAmount}
          onPress={handleConfirmationButtonPress}
          style={{
            ...ButtonStyles.primaryActionButton, opacity: !selectedAmount ? 0.5: 1
          }}
        >
          <Text style={ButtonStyles.actionButtonText}>{common.confirmProceed}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAddRecipientButtonPress}
          disabled={!!sendingState.sendMaxFee || !selectedAmount }
          style={{
            ...ButtonStyles.primaryActionButton,
            marginRight: 8,
            backgroundColor: 'transparent',
          }}
        >
          <Text style={{
            ...ButtonStyles.actionButtonText,
            color: sendingState.sendMaxFee || !selectedAmount ? Colors.lightBlue: Colors.blue,
          }}>
            {strings.AddRecipient}
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

