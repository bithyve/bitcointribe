import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect } from 'react'
import { Alert } from 'react-native'
import { useDispatch } from 'react-redux'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import SendHelpContents from '../../../components/Helper/SendHelpContents'
import { removeTwoFA, clearTransfer } from '../../../store/actions/accounts'
import { initialKnowMoreSendSheetShown } from '../../../store/actions/preferences'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import usePreferencesState from '../../../utils/hooks/state-selectors/preferences/UsePreferencesState'
import useTrustedContactRecipients from '../../../utils/hooks/state-selectors/trusted-contacts/UseTrustedContactRecipients'
import { NavigationScreenComponent } from 'react-navigation'
import defaultStackScreenNavigationOptions, { NavigationOptions } from '../../../navigation/options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import KnowMoreButton from '../../../components/KnowMoreButton'
import { BarCodeReadEvent } from 'react-native-camera'
import useWalletServiceForSubAccountKind from '../../../utils/hooks/state-selectors/accounts/UseWalletServiceForSubAccountKind'
import { ScannedAddressKind } from '../../../bitcoin/utilities/Interface'
import Toast from '../../../components/Toast'
import useCompatibleAccountShells from '../../../utils/hooks/state-selectors/accounts/UseCompatibleAccountShells'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { makeAddressRecipientDescription } from '../../../utils/sending/RecipientFactories'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import { addRecipientForSending, recipientSelectedForAmountSetting } from '../../../store/actions/sending'
import AccountSendScreen from './AccountSendScreen'

export type Props = {
  navigation: any;
};

export type NavigationParams = {
  accountShellID: string;
};


const AccountSendContainerScreen: NavigationScreenComponent<
  NavigationOptions,
  NavigationParams
> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal()

  const accountShell = useAccountShellFromNavigation( navigation )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const sendableAccountShells = useCompatibleAccountShells( accountShell )
  const sendableContacts = useTrustedContactRecipients()
  const walletService = useWalletServiceForSubAccountKind( primarySubAccount.kind )

  const sendingState = useSendingState()

  const {
    hasCompletedTFASetup,
    hasShownInitialKnowMoreSendSheet,
  } = usePreferencesState()

  const isRecipientSelectedForSending = useCallback( ( recipient: RecipientDescribing ) => {
    return (
      sendingState
        .selectedRecipients
        .some( r => r.id == recipient.id )
    )
  }, [ sendingState ] )


  function handleRecipientSelection( recipient: RecipientDescribing ) {
    dispatch( addRecipientForSending( recipient ) )
    dispatch( recipientSelectedForAmountSetting( recipient ) )

    navigateToSendDetails()
  }

  function navigateToSendDetails() {
    navigation.navigate( 'SendToContact', {
      accountShellID: accountShell.id,
    } )
  }

  function handlePaymentURIEntry( uri: string ) {
    let address: string
    let donationID: string | null = null

    try {
      const decodingResult = walletService.decodePaymentURI( uri )

      address = decodingResult.address
      const options = decodingResult.options

      // checking for donationId to send note
      if ( options?.message ) {
        const rawMessage = options.message
        donationID = rawMessage.split( ':' ).pop().trim()
      }
    } catch ( err ) {
      Alert.alert( 'Unable to decode payment URI' )
      return
    }

    const newRecipient = makeAddressRecipientDescription( {
      address,
      donationID,
    } )

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


  const showKnowMoreBottomSheet = useCallback( () => {
    presentBottomSheet(
      <SendHelpContents titleClicked={dismissBottomSheet} />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '89%' ],
        onChange: ( newIndex ) => {
          if ( newIndex < 1 ) {
            dispatch( initialKnowMoreSendSheetShown() )
          }
        }
      },
    )
  }, [ presentBottomSheet, dismissBottomSheet ] )


  useEffect( () => {
    if ( hasCompletedTFASetup == false && primarySubAccount.isTFAEnabled ) {
      dispatch( removeTwoFA() )
      navigation.navigate( 'TwoFASetup', {
        // TODO: Figure out how `service.secureHDWallet.twoFASetup` fits in on this screen 👇.
        // twoFASetup: accountsState[this.state.serviceType].service.secureHDWallet.twoFASetup,
      } )
    }
  }, [ hasCompletedTFASetup, primarySubAccount ] )

  useEffect( () => {
    if ( primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT && hasShownInitialKnowMoreSendSheet == false ) {
      showKnowMoreBottomSheet()
    }
  }, [ hasShownInitialKnowMoreSendSheet, primarySubAccount.kind ] )


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


AccountSendContainerScreen.navigationOptions = ( { navigation } ): NavigationOptions => {
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
          <KnowMoreButton onpress={navigation.getParam( 'toggleKnowMoreSheet' )} />
        )
      }
    },
  }
}

export default AccountSendContainerScreen
