import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, SafeAreaView, View } from 'react-native'
import { useDispatch } from 'react-redux'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import SendHelpContents from '../../../components/Helper/SendHelpContents'
import { clearTransfer } from '../../../store/actions/accounts'
import { initialKnowMoreSendSheetShown } from '../../../store/actions/preferences'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import usePreferencesState from '../../../utils/hooks/state-selectors/preferences/UsePreferencesState'
import defaultStackScreenNavigationOptions from '../../../navigation/options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import KnowMoreButton from '../../../components/KnowMoreButton'
import { BarCodeReadEvent } from 'react-native-camera'
import { ScannedAddressKind, Wallet } from '../../../bitcoin/utilities/Interface'
import Toast from '../../../components/Toast'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { makeAddressRecipientDescription } from '../../../utils/sending/RecipientFactories'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import { addRecipientForSending, amountForRecipientUpdated, recipientSelectedForAmountSetting } from '../../../store/actions/sending'
import AccountSendScreen from './AccountSendScreen'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import useSendableTrustedContactRecipients from '../../../utils/hooks/state-selectors/sending/UseSendableTrustedContactRecipients'
import useSendableAccountShells from '../../../utils/hooks/state-selectors/sending/UseSendableAccountShells'
import useAccountsState from '../../../utils/hooks/state-selectors/accounts/UseAccountsState'
import idx from 'idx'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import { NavigationScreenConfig } from 'react-navigation'
import { NavigationStackOptions } from 'react-navigation-stack'
import BottomSheetHandle from '../../../components/bottom-sheets/BottomSheetHandle'
import Colors from '../../../common/Colors'
import ModalContainer from '../../../components/home/ModalContainer'
import { PermanentChannelsSyncKind, syncPermanentChannels } from '../../../store/actions/trustedContacts'
import AccountUtilities from '../../../bitcoin/utilities/accounts/AccountUtilities'
import useAccountByAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import AsyncStorage from '@react-native-async-storage/async-storage'
import useWalletState from '../../../utils/hooks/state-selectors/storage/useWalletState'
import AccountShell from '../../../common/data/models/AccountShell'
import CustomToolbar from '../../../components/home/CustomToolbar'
import { hp } from '../../../common/data/responsiveness/responsive'

export type Props = {
  navigation: any;
};

const AccountSendContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const dispatch = useDispatch()
  const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal()
  const [ isShowingKnowMoreSheet, setIsShowingKnowMoreSheet ] = useState( false )

  const [ accountShell, setAccountShell ] = useState<AccountShell>( useSourceAccountShellForSending() )
  const account = useAccountByAccountShell( accountShell )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const sendableAccountShells = useSendableAccountShells( accountShell )
  const sendableContacts = useSendableTrustedContactRecipients()
  const fromWallet = navigation?.getParam( 'fromWallet' ) || false
  const address = navigation?.getParam( 'address' ) || ''

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

  // const showKnowMoreBottomSheet = useCallback( () => {
  //   presentBottomSheet(
  //     <SendHelpContents titleClicked={dismissBottomSheet} />,
  //     {
  //       ...defaultBottomSheetConfigs,
  //       snapPoints: [ 0, '89%' ],
  //       handleComponent: KnowMoreBottomSheetHandle,
  //       onChange: ( newIndex ) => {
  //         if ( newIndex < 1 ) {
  //           dispatch( initialKnowMoreSendSheetShown() )
  //         }
  //       }
  //     },
  //   )
  // }, [ presentBottomSheet, dismissBottomSheet ] )
  const showKnowMoreBottomSheet = () => {
    return(
      // <ModalContainer visible={true} closeBottomSheet={() => {}}>
      <SendHelpContents titleClicked={dismissBottomSheet} />
      // </ModalContainer>
    )
  }

  useEffect( () => {
    if ( primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT && hasShownInitialKnowMoreSendSheet == false ) {
      showKnowMoreBottomSheet()
    }
  }, [ hasShownInitialKnowMoreSendSheet, primarySubAccount.kind ] )

  useEffect( () => {
    // Initiate 2FA setup flow(for savings and corresponding derivative accounts) unless setup is successfully completed
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
    <View style={{
      flex:1
    }}>
      <SafeAreaView style={{
        backgroundColor: Colors.appPrimary
      }} />
      <CustomToolbar
        onBackPressed={() => navigation.pop()}
        toolbarTitle={'Send'}
        containerStyle={{
          height: hp( 100 )
        }} />
      <AccountSendScreen
        address={address}
        accountShell={accountShell}
        setAccountShell={setAccountShell}
        sendableContacts={sendableContacts}
        sendableAccountShells={sendableAccountShells}
        onQRScanned={handleQRScan}
        onAddressSubmitted={handleManualAddressSubmit}
        onPaymentURIEntered={handlePaymentURIEntry}
        onRecipientSelected={handleRecipientSelection}
      />
    </View>
  )
}

export default AccountSendContainerScreen
