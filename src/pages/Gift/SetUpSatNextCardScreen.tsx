import { Account, ActiveAddresses, NetworkType, TxPriority } from '../../bitcoin/utilities/Interface'
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { addRecipientForSending, amountForRecipientUpdated, executeSendStage1, executeSendStage2, recipientRemovedFromSending, recipientSelectedForAmountSetting, sendTxNotification } from '../../store/actions/sending'
import { connect, useDispatch } from 'react-redux'

import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import AlertModalContents from '../../components/AlertModalContents'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import { CKTapCard } from 'cktap-protocol-react-native'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import GiftStepperComponent from './GiftStepperComponent'
import ModalContainer from '../../components/home/ModalContainer'
import { RFValue } from 'react-native-responsive-fontsize'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import axios from 'axios'
import { makeAddressRecipientDescription } from '../../utils/sending/RecipientFactories'
import useAccountByAccountShell from '../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import useAccountSendST1CompletionEffect from '../../utils/sending/UseAccountSendST1CompletionEffect'
import useAccountSendST2CompletionEffect from '../../utils/sending/UseAccountSendST2CompletionEffect'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSendingState from '../../utils/hooks/state-selectors/sending/UseSendingState'
import useSourceAccountShellForSending from '../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'

const { height, width } = Dimensions.get( 'window' )

const dummySatcardAddress = '2N8yb9sYtwEeysNrSgfqnpdknjFUksRQtnM'
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
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const account: Account = useAccountByAccountShell( sourceAccountShell )

  const [ stepsVerified, setStepsVerified ] = useState( 0 )
  const [ cardDetails, setCardDetails ] = useState<CKTapCard | null>()
  const [ slotAddress, setSlotAddress ] = useState<string | null>()
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ showNFCModal, setNFCModal ] = useState( false )

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

  const fetchBanalnceOfSlot = ( address: [] ) => {
    // TODO: implement
    return 100
  }
  let timeoutVariable
  let timeout1
  const flowUpdate = async() =>{
    timeout1 = setTimeout( async() => {
      const { response, error } = await withModal( getCardData )
      console.log( {
        response, error
      } )
      console.log( 'cardDetails===>' + JSON.stringify( cardDetails ) )

      timeout1 = setTimeout( () => {
        if ( !cardDetails?.is_tapsigner ) {
          setStepsVerified( 1 )
          timeout1 = setTimeout( () => {
            if ( !cardDetails?._certs_checked ) {
              setStepsVerified( 2 )
              timeout1 = setTimeout( async () => {
                setStepsVerified( 3 )
                console.log( 'fromClaimFlow===>' + JSON.stringify( fromClaimFlow ) )
                handleManualAddressSubmit( slotAddress )
                timeout1 = setTimeout( () => {
                  props.navigation.navigate( 'GiftCreated', {
                    numSlots: cardDetails?.num_slots,
                    activeSlot: cardDetails?.active_slot,
                    slotFromIndex: fromClaimFlow == 0 ?
                      cardDetails?.num_backups == 0 ? 1 : 2
                      : cardDetails?.num_backups == 0 ? 3 : 4,
                  } )
                }, 2000 )
              }, 2000 )
            }
          }, 2000 )
        } else {
          timeoutVariable = setTimeout( () => {
            console.log( 'skk1111' )
            // setShowAlertModal( true )
          }, 5000 )
        }
      }, 2000 )
    }, 1000 )
  }

  useEffect( () => {
    console.log( 'checking....' )
    flowUpdate()
    return () => {
      console.log( 'returning....' )
      card.endNfcSession()
      clearTimeout( timeoutVariable )
      clearTimeout( timeout1 )
    }
  }, [] )

  const withModal = async ( callback ) => {
    try {
      console.log( 'scanning...' )
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

      return {
        response: null, error: error.toString()
      }

    }
  }
  async function getCardData() {
    const cardData = await card.first_look()
    setCardDetails( cardData )
    console.log( 'card details===>' + JSON.stringify( cardData ) )

    if ( cardData && !cardData.is_tapsigner ) {
      console.log( 'came in' )
      try {
        //For Create Flow
        const { addr: address, pubkey } = await card.address( true, true, cardDetails.active_slot )
        setSlotAddress( address )
        console.log( 'getAddrees===>' + JSON.stringify( address ) )

        const network = AccountUtilities.getNetworkByType( NetworkType.MAINNET )
        // const balance = await AccountUtilities.fetchSelectedAccountBalance( address, network )
        const { data } = await axios.get( `https://api.blockcypher.com/v1/btc/main/addrs/${dummySatcardAddress}` )
        const { balance } = data
        console.log( 'balance===>' + JSON.stringify( balance ) )
        // handleManualAddressSubmit( dummySatcardAddress )
        // return {
        //   address, pubkey
        // }
      } catch ( err ) {
        console.log( {
          err
        } )


        // corner case when the slot is not setup
        // if ( err.toString() === 'Error: Current slot is not yet setup.' ) {
        //   Alert.alert( 'navigate to setup card here' )
        //   await card.setup( '304577' )
        //   // navigate to setup card (cvc page)
        // }
        throw err
      }
    }
  }
  const handleManualAddressSubmit = ( address: string ) => {
    const addressRecipient = makeAddressRecipientDescription( {
      address
    } )

    console.log( 'skk inside recipent', JSON.stringify( isRecipientSelectedForSending( addressRecipient ) ) )
    if ( isRecipientSelectedForSending( addressRecipient ) == false ) {
      handleRecipientSelection( addressRecipient )
    }
  }


  const handleRecipientSelection = async ( recipient: RecipientDescribing ) => {
    if ( isRecipientSelectedForSending( recipient ) == false ) {
      dispatch( addRecipientForSending( recipient ) )
    }

    dispatch( recipientSelectedForAmountSetting( recipient ) )
    // navigateToSendDetails( recipient )
    setTimeout( () => {
      if ( recipient.id != null && recipient.id != '' ) {
        console.log( 'skk inside recipent', JSON.stringify( recipient ) )
        dispatch( amountForRecipientUpdated( {
          recipient: recipient,
          amount: giftAmount
        } ) )
        dispatch( executeSendStage1( {
          accountShell: sourceAccountShell
        } ) )
        dispatch( recipientRemovedFromSending( recipient ) )
      }
    }, 2000 )
  }

  useAccountSendST1CompletionEffect( {
    onSuccess: () => {
      console.log( 'skk use acc 1 success' )
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
      console.log( 'skk use acc 2 success' )
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
        // setStepsVerified( 3 )
        // setTimeout( () => {
        //   props.navigation.navigate( 'GiftCreated', {
        //     numSlots: cardDetails?.num_slots,
        //     activeSlot: cardDetails?.active_slot,
        //     slotFromIndex: fromClaimFlow ?
        //       cardDetails?.num_backups == 0 ? 1 : 2
        //       : cardDetails?.num_backups == 0 ? 3 : 4,
        //   } )
        // }, 2000 )
      }
    },
    onFailure: ( errorMessage: string | null ) => {
      if ( errorMessage ) {
        console.log( 'skk111122333' )
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
              color={Colors.blue}
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
          info={'SatCards not detected '}
          proceedButtonText={'Please try again'}
          onPressProceed={() => {
            setShowAlertModal( false )
            props.navigation.goBack()
          }}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
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