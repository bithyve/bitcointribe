import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import idx from 'idx'
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Alert } from 'react-native'
import { BarCodeReadEvent } from 'react-native-camera'
import { useDispatch } from 'react-redux'
import { ScannedAddressKind, Wallet } from '../../../bitcoin/utilities/Interface'
import AccountUtilities from '../../../bitcoin/utilities/accounts/AccountUtilities'
import Colors from '../../../common/Colors'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import SendHelpContents from '../../../components/Helper/SendHelpContents'
import KnowMoreButton from '../../../components/KnowMoreButton'
import Toast from '../../../components/Toast'
import BottomSheetHandle from '../../../components/bottom-sheets/BottomSheetHandle'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import defaultStackScreenNavigationOptions from '../../../navigation/options/DefaultStackScreenNavigationOptions'
import { clearTransfer } from '../../../store/actions/accounts'
import { addRecipientForSending, amountForRecipientUpdated, recipientSelectedForAmountSetting } from '../../../store/actions/sending'
import { PermanentChannelsSyncKind, syncPermanentChannels } from '../../../store/actions/trustedContacts'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountByAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'
import usePreferencesState from '../../../utils/hooks/state-selectors/preferences/UsePreferencesState'
import useSendableAccountShells from '../../../utils/hooks/state-selectors/sending/UseSendableAccountShells'
import useSendableTrustedContactRecipients from '../../../utils/hooks/state-selectors/sending/UseSendableTrustedContactRecipients'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import useWalletState from '../../../utils/hooks/state-selectors/storage/useWalletState'
import { makeAddressRecipientDescription } from '../../../utils/sending/RecipientFactories'
import AccountSendScreen from './AccountSendScreen'

export type Props = {
  route: any;
  navigation: any;
};

const AccountSendContainerScreen: React.FC<Props> = ( { route, navigation }: Props ) => {
  const dispatch = useDispatch()
  const { dismiss: dismissBottomSheet } = useBottomSheetModal()
  const [ isShowingKnowMoreSheet, setIsShowingKnowMoreSheet ] = useState( false )

  useLayoutEffect( () => {
    const subAccountKind = route.params?.subAccountKind
    navigation.setOptions( {
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
              route.params?.toggleKnowMoreSheet()}} />
          )
        }
      },
    } )
  }, [ navigation, route ] )

  const accountShell = useSourceAccountShellForSending()
  const account = useAccountByAccountShell( accountShell )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const sendableAccountShells = useSendableAccountShells( accountShell )
  const sendableContacts = useSendableTrustedContactRecipients()
  const fromWallet = route.params?.fromWallet || false
  const address = route.params?.address || ''

  const accountsState = useAccountsState()
  const sendingState = useSendingState()
  const wallet: Wallet = useWalletState()

  useEffect( ()=> {
    dispatch( syncPermanentChannels( {
      permanentChannelsSyncKind: PermanentChannelsSyncKind.EXISTING_CONTACTS,
      metaSync: true,
    } ) )
  }, [] )

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
      fromWallet: fromWallet
    } )
  }

  function handlePaymentURIEntry( uri: string ) {
    let address: string
    let amount: number | null = 0

    try {
      const decodingResult = AccountUtilities.decodePaymentURI( uri )

      address = decodingResult.address
      const options = decodingResult.options

      if ( options?.amount )
        amount = options.amount

    } catch ( err ) {
      Alert.alert( 'Unable to decode payment URI' )
      return
    }

    const newRecipient = makeAddressRecipientDescription( {
      address,
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
    const network = AccountUtilities.getNetworkByType( account.networkType )
    const { type: scannedAddressKind }: { type: ScannedAddressKind } = AccountUtilities.addressDiff( barcodeDataString.trim(), network )
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
    showKnowMoreBottomSheet()
    const shouldShow = !isShowingKnowMoreSheet
    setIsShowingKnowMoreSheet( shouldShow )
    if ( shouldShow ) {
      showKnowMoreBottomSheet()
    }
  }

  useEffect( () => {
    return () => {
      dismissBottomSheet()
    }
  }, [ navigation ] )


  const KnowMoreBottomSheetHandle: React.FC = () => {
    return <BottomSheetHandle containerStyle={{
      backgroundColor: Colors.blue,
    }} />
  }

  const showKnowMoreBottomSheet = () => {
    return(
      <SendHelpContents titleClicked={dismissBottomSheet} />
    )
  }

  useEffect( () => {
    if ( primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT && hasShownInitialKnowMoreSendSheet == false ) {
      showKnowMoreBottomSheet()
    }
  }, [ hasShownInitialKnowMoreSendSheet, primarySubAccount.kind ] )

  useEffect( () => {
    if ( primarySubAccount.isTFAEnabled ) {
      const twoFASetupDetails = idx( wallet, ( _ ) => _.details2FA )
      const twoFAValid = idx( accountsState, ( _ ) => _.twoFAHelpFlags.twoFAValid )
      if ( twoFASetupDetails && !twoFAValid )
        navigation.navigate( 'TwoFASetup', {
          twoFASetup: twoFASetupDetails,
          fromWallet: fromWallet,
          address
        } )
    }
  }, [ primarySubAccount.sourceKind ] )


  return (
    <AccountSendScreen
      address={address}
      accountShell={accountShell}
      sendableContacts={sendableContacts}
      sendableAccountShells={sendableAccountShells}
      onQRScanned={handleQRScan}
      onAddressSubmitted={handleManualAddressSubmit}
      onPaymentURIEntered={handlePaymentURIEntry}
      onRecipientSelected={handleRecipientSelection}
    />
  )
}

export default AccountSendContainerScreen
