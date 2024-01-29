import { NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native'
import idx from 'idx'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import { useDispatch } from 'react-redux'
import { NetworkType } from '../../../bitcoin/utilities/Interface'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import RecipientKind from '../../../common/data/enums/RecipientKind'
import AccountShell from '../../../common/data/models/AccountShell'
import { ContactRecipientDescribing, RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import ModalContainer from '../../../components/home/ModalContainer'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import { clearTransfer } from '../../../store/actions/accounts'
import { amountForRecipientUpdated, calculateSendMaxFee, executeSendStage1, recipientRemovedFromSending } from '../../../store/actions/sending'
import { PermanentChannelsSyncKind, syncPermanentChannels } from '../../../store/actions/trustedContacts'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSpendableBalanceForAccountShell from '../../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'
import useAccountByAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import useSelectedRecipientForSendingByID from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientForSendingByID'
import useSelectedRecipientsForSending from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientsForSending'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import useAccountSendST1CompletionEffect from '../../../utils/sending/UseAccountSendST1CompletionEffect'
import SendConfirmationContent from '../SendConfirmationContent'
import BalanceEntryFormGroup from './BalanceEntryFormGroup'
import SelectedRecipientsCarousel from './SelectedRecipientsCarousel'

export type Props = {
  navigation: NavigationProp<ParamListBase>;
  route: RouteProp<{params: { selectedRecipientID: string, fromWallet: any }}>
};

const SentAmountForContactFormScreen: React.FC<Props> = ( { navigation, route }: Props ) => {
  const dispatch = useDispatch()

  const [ sendFailureModal, setFailure ] = useState( false )
  const [ errorMessage, setError ] = useState( '' )
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]

  const selectedRecipients = useSelectedRecipientsForSending()
  const currentRecipient = useSelectedRecipientForSendingByID( route.params?.selectedRecipientID )
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const sourceAccount = useAccountByAccountShell( sourceAccountShell )
  const spendableBalance = useSpendableBalanceForAccountShell( sourceAccountShell )
  const currentAmount = idx( currentRecipient, ( _ ) => _.amount )
  const [ selectedAmount, setSelectedAmount ] = useState<Satoshis | null>( currentAmount ? currentAmount : 0 )
  const sendingState = useSendingState()
  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: sourceAccount.networkType === NetworkType.TESTNET? BitcoinUnit.TSATS: BitcoinUnit.SATS,
  } )
  const availableBalance = useMemo( () => {
    return AccountShell.getSpendableBalance( sourceAccountShell )
  }, [ sourceAccountShell ] )
  const fromWallet = route.params?.fromWallet || false

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
          setTimeout(()=>{
            navigation.dispatch(
              resetStackToAccountDetails( {
                accountShellID: sourceAccountShell.id,
              } )
            )
          },100)
        }}
        isUnSuccess={true}
        accountKind={sourcePrimarySubAccount.kind}
      />
    )
  }, [ errorMessage ] )


  useAccountSendST1CompletionEffect( {
    onSuccess: () => {
      navigation.navigate( 'SendConfirmation', {
        fromWallet
      } )
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
      navigation.navigate( 'SendConfirmation', {
        fromWallet
      } )
    }
  }, [ sendingState.feeIntelMissing ] )

  return (
    <View style={styles.rootContainer}>
      <ModalContainer onBackground={()=>setFailure( false )} visible={sendFailureModal} closeBottomSheet={() => {}} >
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
        flexWrap:'wrap'
      }}>
        <Text style={{
          marginRight: RFValue( 4 )
        }}>
          {`${strings.SendingFrom}: `}
          <Text style={{
            fontFamily: Fonts.Regular,
            fontSize: RFValue( 11 ),
            fontStyle: 'italic',
            color: Colors.blue,
          }}>
            {sourceAccountHeadlineText}
          </Text>
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
          fromWallet={fromWallet}
        />
      </View>

      <View style={styles.footerSection}>
        <TouchableOpacity
          disabled={!selectedAmount}
          onPress={handleConfirmationButtonPress}
        >
          <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
            start={{
              x: 0, y: 0
            }} end={{
              x: 1, y: 0
            }}
            locations={[ 0.2, 1 ]}
            style={{
              ...ButtonStyles.primaryActionButton, opacity: !selectedAmount ? 0.5: 1
            }}
          >
            <Text style={ButtonStyles.actionButtonText}>{common.confirmProceed}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAddRecipientButtonPress}
          disabled={!!sendingState.sendMaxFee || !selectedAmount }
          style={{
            ...ButtonStyles.primaryActionButton,
            marginRight: 8,
            backgroundColor: 'transparent',
            opacity: !!sendingState.sendMaxFee || !selectedAmount ? 0.5 : 1
          }}
        >
          <Text style={{
            ...ButtonStyles.actionButtonText,
            color: sendingState.sendMaxFee || !selectedAmount ? Colors.textColorGrey : Colors.blue,
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
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 13 ),
  },
} )

export default SentAmountForContactFormScreen

