import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useDispatch } from 'react-redux'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import SendHelpContents from '../../../components/Helper/SendHelpContents'
import { clearTransfer } from '../../../store/actions/accounts'
import { initialKnowMoreSendSheetShown } from '../../../store/actions/preferences'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import usePreferencesState from '../../../utils/hooks/state-selectors/preferences/UsePreferencesState'
import defaultStackScreenNavigationOptions, { NavigationOptions } from '../../../navigation/options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import KnowMoreButton from '../../../components/KnowMoreButton'
import { BarCodeReadEvent } from 'react-native-camera'
import useWalletServiceForSourceAccountKind from '../../../utils/hooks/state-selectors/accounts/UseWalletServiceForSourceAccountKind'
import { ScannedAddressKind } from '../../../bitcoin/utilities/Interface'
import Toast from '../../../components/Toast'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { makeAddressRecipientDescription } from '../../../utils/sending/RecipientFactories'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import { addRecipientForSending, amountForRecipientUpdated, recipientSelectedForAmountSetting } from '../../../store/actions/sending'
import AccountSendScreen from './AccountSendScreen'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import useSendableTrustedContactRecipients from '../../../utils/hooks/state-selectors/sending/UseSendableTrustedContactRecipients'
import useSendableAccountShells from '../../../utils/hooks/state-selectors/sending/UseSendableAccountShells'
import { SECURE_ACCOUNT } from '../../../common/constants/wallet-service-types'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'
import idx from 'idx'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import { NavigationScreenConfig } from 'react-navigation'
import { NavigationStackOptions } from 'react-navigation-stack'
import ModalHeader from '../../../components/ModalHeader'
import BottomSheetHandle from '../../../components/bottom-sheets/BottomSheetHandle'
import Colors from '../../../common/Colors'

export type Props = {
  navigation: any;
};

const AccountSendContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const dispatch = useDispatch()
  const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal()
  const [ isShowingKnowMoreSheet, setIsShowingKnowMoreSheet ] = useState( false )

  const accountShell = useSourceAccountShellForSending()
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const sendableAccountShells = useSendableAccountShells( accountShell )
  const sendableContacts = useSendableTrustedContactRecipients()
  const walletService = useWalletServiceForSourceAccountKind( primarySubAccount.sourceKind )

  const accountsState = useAccountsState()
  const sendingState = useSendingState()

  const { hasShownInitialKnowMoreSendSheet, } = usePreferencesState()

  const isRecipientSelectedForSending = useCallback( ( recipient: RecipientDescribing ) => {
    return (
      sendingState
        .selectedRecipients
        .some( r => r.id == recipient.id )
    )
  }, [ sendingState ] )


  function handleRecipientSelection( recipient: RecipientDescribing ) {
    if ( isRecipientSelectedForSending( recipient ) == false ) {
      dispatch( addRecipientForSending( recipient ) )
    }

    dispatch( recipientSelectedForAmountSetting( recipient ) )
    navigateToSendDetails( recipient )
  }

  function navigateToSendDetails( selectedRecipient: RecipientDescribing ) {
    navigation.navigate( 'SentAmountForContactForm', {
      selectedRecipientID: selectedRecipient.id,
    } )
  }

  function handlePaymentURIEntry( uri: string ) {
    let address: string
    let donationID: string | null = null
    let amount: number | null = 0

    try {
      const decodingResult = walletService.decodePaymentURI( uri )

      address = decodingResult.address
      const options = decodingResult.options

      // checking for donationId to send note
      if ( options?.message ) {
        const rawMessage = options.message
        donationID = rawMessage.split( ':' ).pop().trim()
        amount = options.amount
      }
      if ( options?.amount ) {
        amount = options.amount
      }
    } catch ( err ) {
      Alert.alert( 'Unable to decode payment URI' )
      return
    }

    const newRecipient = makeAddressRecipientDescription( {
      address,
      donationID,
    } )

    if ( isRecipientSelectedForSending( newRecipient ) == false ) {
      handleRecipientSelection( newRecipient )
    }
    dispatch( addRecipientForSending( newRecipient ) )
    dispatch( recipientSelectedForAmountSetting( newRecipient ) )
    dispatch( amountForRecipientUpdated( {
      recipient: newRecipient,
      amount: amount < 1 ? amount * SATOSHIS_IN_BTC : amount
    } ) )

    handleRecipientSelection( newRecipient )
  }


  function handleManualAddressSubmit( address: string ) {
    const addressRecipient = makeAddressRecipientDescription( {
      address
    } )

    if ( isRecipientSelectedForSending( addressRecipient ) == false ) {
      handleRecipientSelection( addressRecipient )
    }
  }


  function handleQRScan( { data: barcodeDataString }: BarCodeReadEvent ) {
    const { type: scannedAddressKind }: { type: ScannedAddressKind } = walletService.addressDiff( barcodeDataString.trim() )
    switch ( scannedAddressKind ) {
        case ScannedAddressKind.ADDRESS:
          const recipientAddress = barcodeDataString
          const addressRecipient = makeAddressRecipientDescription( {
            address: recipientAddress
          } )

          if ( isRecipientSelectedForSending( addressRecipient ) == false ) {
            handleRecipientSelection( addressRecipient )
          }

          break
        case ScannedAddressKind.PAYMENT_URI:
          handlePaymentURIEntry( barcodeDataString )
          break
        default:
          Toast( 'Invalid QR' )
    }
  }


  useEffect( () => {
    navigation.setParams( {
      toggleKnowMoreSheet: toggleKnowMoreSheet,
    } )
  }, [] )

  const toggleKnowMoreSheet = () => {
    const shouldShow = !isShowingKnowMoreSheet
    setIsShowingKnowMoreSheet( shouldShow )
    if ( shouldShow ) {
      showKnowMoreBottomSheet()
    }
  }



  const KnowMoreBottomSheetHandle: React.FC = () => {
    return <BottomSheetHandle containerStyle={{
      backgroundColor: Colors.blue,
    }} />
  }

  const showKnowMoreBottomSheet = useCallback( () => {
    presentBottomSheet(
      <SendHelpContents titleClicked={dismissBottomSheet} />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '89%' ],
        handleComponent: KnowMoreBottomSheetHandle,
        onChange: ( newIndex ) => {
          if ( newIndex < 1 ) {
            dispatch( initialKnowMoreSendSheetShown() )
          }
        }
      },
    )
  }, [ presentBottomSheet, dismissBottomSheet ] )

  useEffect( () => {
    if ( primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT && hasShownInitialKnowMoreSendSheet == false ) {
      showKnowMoreBottomSheet()
    }
  }, [ hasShownInitialKnowMoreSendSheet, primarySubAccount.kind ] )


  useEffect( () => {
    // Initiate 2FA setup flow(for savings and corresponding derivative accounts) unless setup is successfully completed
    if ( primarySubAccount.isTFAEnabled ) {
      const twoFASetupDetails = idx( accountsState, ( _ ) => _[ primarySubAccount.sourceKind ].service.secureHDWallet.twoFASetup )
      const twoFAValid = idx( accountsState, ( _ ) => _.twoFAHelpFlags.twoFAValid )

      if ( twoFASetupDetails && !twoFAValid )
        navigation.navigate( 'TwoFASetup', {
          twoFASetup: twoFASetupDetails,
        } )
    }
  }, [ primarySubAccount.sourceKind ] )


  return (
    <AccountSendScreen
      primarySubAccount={primarySubAccount}
      sendableContacts={sendableContacts}
      sendableAccountShells={sendableAccountShells}
      onQRScanned={handleQRScan}
      onAddressSubmitted={handleManualAddressSubmit}
      onPaymentURIEntered={handlePaymentURIEntry}
      onRecipientSelected={handleRecipientSelection}
    />
  )
}


AccountSendContainerScreen.navigationOptions = ( { navigation, } ) : NavigationScreenConfig<NavigationStackOptions, any> => {
  const subAccountKind = navigation.getParam( 'subAccountKind' )

  return {
    ...defaultStackScreenNavigationOptions,

    headerLeft: () => {
      return (
        <SmallNavHeaderBackButton
          onPress={() => {
            clearTransfer( subAccountKind )
            navigation.popToTop()
          }}
        />
      )
    },

    title: 'Send',

    headerRight: () => {
      if ( subAccountKind != SubAccountKind.TEST_ACCOUNT ) {
        return null
      } else {
        return (
          <KnowMoreButton onpress={() => {
            navigation.getParam( 'toggleKnowMoreSheet' )()}} />
        )
      }
    },
  }
}

export default AccountSendContainerScreen
