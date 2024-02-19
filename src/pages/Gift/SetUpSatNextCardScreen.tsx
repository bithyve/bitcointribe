import { AccountType, NetworkType, TxPriority } from '../../bitcoin/utilities/Interface'
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { addRecipientForSending, amountForRecipientUpdated, executeSendStage1, executeSendStage2, recipientRemovedFromSending, recipientSelectedForAmountSetting, resetSendStage1, resetSendState, sendTxNotification, sourceAccountSelectedForSending } from '../../store/actions/sending'
import { useDispatch, useSelector } from 'react-redux'

import { AccountsState } from '../../store/reducers/accounts'
import AlertModalContents from '../../components/AlertModalContents'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import { CKTapCard } from 'cktap-protocol-react-native'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import GiftStepperComponent from './GiftStepperComponent'
import ModalContainer from '../../components/home/ModalContainer'
import NfcPrompt from './NfcPromptAndroid'
import { RFValue } from 'react-native-responsive-fontsize'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import axios from 'axios'
import { makeAddressRecipientDescription } from '../../utils/sending/RecipientFactories'
import nfcManager from 'react-native-nfc-manager'
import useAccountByAccountShell from '../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import useAccountSendST1CompletionEffect from '../../utils/sending/UseAccountSendST1CompletionEffect'
import useAccountSendST2CompletionEffect from '../../utils/sending/UseAccountSendST2CompletionEffect'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSendingState from '../../utils/hooks/state-selectors/sending/UseSendingState'
import useSourceAccountShellForSending from '../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import { weekdaysShort } from 'moment'

const { height, width } = Dimensions.get( 'window' )
const dummySatcardAddress = '3Ax781srE163xdH9DR9JKPRWooQ3xkbM4m'
// const dummySatcardAddress = '3LcY5MMQXibVJ1RA4XYAeVyfrgbrD1WEzj'
// const temp = {
//   'card_nonce':{
//     'type':'Buffer', 'data':[ 156, 61, 66, 83, 118, 58, 158, 31, 255, 118, 127, 143, 181, 12, 12, 208 ]
//   }, 'card_pubkey':{
//     'type':'Buffer', 'data':[ 3, 6, 239, 160, 72, 161, 55, 244, 48, 79, 91, 111, 47, 176, 120, 237, 155, 49, 188, 58, 151, 169, 30, 48, 118, 188, 142, 6, 244, 206, 142, 70, 214 ]
//   }, 'card_ident':'PLJCZ-CFK24-EMH7F-VPDZF', 'applet_version':'1.0.0', 'birth_height':744019, 'is_testnet':false, 'auth_delay':0, 'is_tapsigner':false, 'path':null, 'num_backups':'NA', 'active_slot':0, 'num_slots':10, '_certs_checked':false
// }

export default function SetUpSatNextCardScreen( props ) {
  const dispatch = useDispatch()
  const giftAmount = props.navigation?.state?.params?.giftAmount
  const fromClaimFlow = props.navigation?.state?.params?.fromClaimFlow

  const card = useRef( new CKTapCard() ).current
  const sourceAccountShell = useSourceAccountShellForSending()
  const [ stepsVerified, setStepsVerified ] = useState( 0 )
  const [ cardDetails, setCardDetails ] = useState<CKTapCard | null>(  )
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ showNFCModal, setNFCModal ] = useState( false )
  const [ satCardBalance, setSatCardBalance ] = useState( 0 )
  const accountsState: AccountsState = useSelector( ( state ) => state.accounts, )

  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: BitcoinUnit.SATS,
  } )
  const sendingState = useSendingState()

  const isRecipientSelectedForSending = useCallback( ( recipient: RecipientDescribing ) => {
    return (
      sendingState
        .selectedRecipients
        .some( r => r.id == recipient.id )
    )
  }, [ sendingState ] )
  let timeoutVariable
  let timeout1
  const flowUpdate = async() =>{
    timeout1 = setTimeout( async() => {
      // getCardData()
      const { response, error } = await withModal( getCardData )
      if( response.balance > 0 ){
        Alert.alert( 'Please claim the existing gift before creating new one!' )
        return
      }
      if( error ){
        console.log( error )
        Alert.alert( error.toString() )
        return
      }
      const { address } = response

      timeout1 = setTimeout( () => {
        if ( !cardDetails?.is_tapsigner ) {
          setStepsVerified( 1 )
          timeout1 = setTimeout( () => {
            if ( !cardDetails?._certs_checked ) {
              setStepsVerified( 2 )
              timeout1 = setTimeout( async () => {
                setStepsVerified( 3 )
                !fromClaimFlow && handleManualAddressSubmit( address )
              }, 2000 )
            }
          }, 2000 )
        } else {
          timeoutVariable = setTimeout( () => {
            // setShowAlertModal( true )
          }, 5000 )
        }
      }, 2000 )
    }, 1000 )
  }

  useEffect( () => {

    flowUpdate()
    return () => {
      card.endNfcSession()
      clearTimeout( timeoutVariable )
      clearTimeout( timeout1 )
    }
  }, [] )

  const withModal = async ( callback ) => {
    try {
      if( Platform.OS == 'android' )
        setNFCModal( true )
      const resp = await card.nfcWrapper( callback )
      await card.endNfcSession()
      setNFCModal( false )
      return {
        response: resp, error: null
      }
    } catch ( error: any ) {
      console.log( error.toString() )
      setNFCModal( false )
      nfcManager.setAlertMessageIOS( error.toString() )
      setErrorMessage( error.toString() )
      setShowAlertModal( true )
      return {
        response: null, error: error.toString()
      }

    }
  }
  async function getCardData() {
    console.log( 'at callback' )
    const cardData = await card.first_look()
    setCardDetails( cardData )
    console.log( 'card details===>' + JSON.stringify( cardData ) )
    if ( cardData && !cardData.is_tapsigner ) {
      console.log( 'came in' )
      try {
        const activeSlotUsage = await card.get_slot_usage( cardData.active_slot )
        if ( activeSlotUsage.status === 'SEALED' ) {
          //For Create Flow
          const { addr: address, pubkey } = await card.address( true, true, cardData.active_slot )
          console.log( 'getAddrees===>' + JSON.stringify( address ) )
          const { data } = await axios.get( `https://api.blockcypher.com/v1/btc/main/addrs/${address}` )
          const { balance, unconfirmed_balance } = data
          if( unconfirmed_balance >0 ){
            throw new Error( 'Your previous gift is still being confirmed. Please wait for a while' )
          }
          setSatCardBalance( balance )
          console.log( 'balance===>' + JSON.stringify( balance ) )
          console.log( {
            address
          } )
          return {
            address, pubkey, balance
          }
        }else if ( activeSlotUsage.status === 'UNUSED' ){
          // Alert.alert('Sorry the current slot is not setup yet!')
          throw new Error( 'Sorry the current slot is not setup yet!' )
        }else{
          throw new Error( 'Active slot cannot be unsealed' )
        }
      } catch ( err ) {
        console.log( {
          err
        } )
        throw err
      }
    }
  }
  const handleManualAddressSubmit = useCallback( ( address: string ) => {
    const addressRecipient = makeAddressRecipientDescription( {
      address
    } )

    if ( isRecipientSelectedForSending( addressRecipient ) == false ) {

      handleRecipientSelection( addressRecipient )
    }
  }, [ sourceAccountShell ] )


  const handleRecipientSelection = useCallback( async ( recipient: RecipientDescribing )=>{
    if ( isRecipientSelectedForSending( recipient ) == false ) {

      dispatch( addRecipientForSending( recipient ) )
    }

    dispatch( recipientSelectedForAmountSetting( recipient ) )
    // navigateToSendDetails( recipient )

    setTimeout( () => {
      if ( recipient.id != null && recipient.id != '' ) {
        dispatch( amountForRecipientUpdated( {
          recipient: recipient,
          amount: giftAmount
        } ) )
        dispatch( addRecipientForSending( recipient ) )
        console.log( {
          sourceAccountShell, recipient
        } )
        dispatch( executeSendStage1( {
          accountShell: sourceAccountShell
        } ) )
        dispatch( recipientRemovedFromSending( recipient ) )
      }
    }, 2000 )
  }, [ sourceAccountShell ] )

  useAccountSendST1CompletionEffect( {
    onSuccess: () => {
      dispatch( executeSendStage2( {
        accountShell: sourceAccountShell,
        txnPriority: TxPriority.LOW,
        note: ''
      } ) )

    },
    onFailure: ( error ) => {
      console.log( 'skk111122', error )
      // setShowAlertModal( true )
    },
  } )

  useAccountSendST2CompletionEffect( {
    onSuccess: ( txid: string | null, amt: number | null ) => {
      if ( txid ) {
        let type
        if ( sourceAccountShell.primarySubAccount.type === undefined ) {
          type = -1
        } else if ( sourceAccountShell.primarySubAccount.type === 'TEST_ACCOUNT' ) {
          type = 0
        } else if ( sourceAccountShell.primarySubAccount.type === 'CHECKING_ACCOUNT' ) {
          type = 1
        } else if ( sourceAccountShell.primarySubAccount.type === 'SWAN_ACCOUNT' ) {
          type = 2
        } else if ( sourceAccountShell.primarySubAccount.type === 'SAVINGS_ACCOUNT' ) {
          type = 3
        }
        if ( amt ) {
          dispatch( sendTxNotification( txid, amt + ' ' + formattedUnitText, type ) )
        } else {
          dispatch( sendTxNotification( txid, null, type ) )
        }

        dispatch( resetSendState() )
        // setStepsVerified( 3 )
        setTimeout( () => {
          props.navigation.navigate( 'GiftCreated', {
            numSlots: cardDetails?.num_slots,
            activeSlot: cardDetails?.active_slot,
            giftAmount : satCardBalance == 0 ? giftAmount: 0,
            slotFromIndex: fromClaimFlow ?
              cardDetails?.num_backups == 0 ? 1 : 2
              : cardDetails?.num_backups == 0 ? 3 : 4,
          } )
        }, 2000 )
      }
    },
    onFailure: ( errorMessage: string | null ) => {
      if ( errorMessage ) {
        console.log( 'skk111122333', JSON.stringify( errorMessage ) )
        // setShowAlertModal( true )

      }
    },
  } )

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.white,
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {

            props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>

      <GiftStepperComponent
        extraContainer={{
          marginTop: 10
        }}
        showLoader={stepsVerified <= 0}
        verifiedText={stepsVerified >= 1 ? 'SATSCARD™ detected' : 'Detecting SATSCARD™'}
      />
      {
        stepsVerified >= 1 &&
        <>
          <View style={styles.dashContainer}>
            <View style={styles.dashInnerContainer} />
          </View>

          <GiftStepperComponent
            // extraContainer={{        }}
            showLoader={stepsVerified <= 1}
            verifiedText={stepsVerified >= 2 ? 'Card found' : 'Detecting card'}
          />
        </>
      }
      {
        stepsVerified >= 2 &&
        <>
          <View style={styles.dashContainer}>
            <View style={styles.dashInnerContainer} />
          </View>
          <GiftStepperComponent
            // extraContainer={{        }}
            showLoader={stepsVerified <= 2}
            verifiedText={stepsVerified >= 3 ? 'SATSCARD™ ready to use' : 'Transferring sats into SATSCARD™'}
          />
        </>
      }
      <View style={{
        flex: 1
      }} />
      <View style={styles.pagerContainer}>
        <View style={styles.pagerDeSelected} />
        <View style={styles.pagerSelected} />
      </View>
      <ModalContainer onBackground={() => { setShowAlertModal( false ) }} visible={showAlertModal} closeBottomSheet={() => { }}>
        <AlertModalContents
          info={errorMessage != '' ? errorMessage : 'SatCards not detected'}
          proceedButtonText={'Please try again'}
          onPressProceed={() => {
            setShowAlertModal( false )
            props.navigation.goBack()
          }}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
      <NfcPrompt visible={showNFCModal} close={()=> setNFCModal( false )}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  safeAreaContainer: {
    flex: 1, backgroundColor: Colors.white,
  },
  dashContainer: {
    width: 1, overflow: 'hidden', flexDirection: 'column', marginStart: 28, marginVertical: 5
  },
  dashInnerContainer: {
    height: 34, borderWidth: 1, borderColor: Colors.blue, borderStyle: 'dotted', borderRadius: 1, flexDirection: 'column'
  },
  pagerContainer: {
    flexDirection: 'row', marginStart: 20, marginBottom: RFValue( 100 )
  },
  pagerSelected: {
    backgroundColor: Colors.blue, width: 26, height: 4, borderRadius: 4, marginStart: 4
  },
  pagerDeSelected: {
    backgroundColor: Colors.blue, width: 6, height: 4, borderRadius: 4
  }
} )
