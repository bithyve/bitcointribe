import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { addRecipientForSending, amountForRecipientUpdated, executeSendStage1, executeSendStage2, recipientRemovedFromSending, recipientSelectedForAmountSetting, sendTxNotification } from '../../store/actions/sending'
import { connect, useDispatch } from 'react-redux'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'

import AlertModalContents from '../../components/AlertModalContents'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import { CKTapCard } from 'cktap-protocol-react-native'
import Colors from '../../common/Colors'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fonts from '../../common/Fonts'
import GiftStepperComponent from './GiftStepperComponent'
import ModalContainer from '../../components/home/ModalContainer'
import { RFValue } from 'react-native-responsive-fontsize'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { TxPriority } from '../../bitcoin/utilities/Interface'
import idx from 'idx'
import { makeAddressRecipientDescription } from '../../utils/sending/RecipientFactories'
import useAccountSendST1CompletionEffect from '../../utils/sending/UseAccountSendST1CompletionEffect'
import useAccountSendST2CompletionEffect from '../../utils/sending/UseAccountSendST2CompletionEffect'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSendingState from '../../utils/hooks/state-selectors/sending/UseSendingState'
import useSourceAccountShellForSending from '../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'

const { height, } = Dimensions.get( 'window' )

const dummySatcardAddress = '2N7eyWGdtdqQUk65rxb3ysDzFw3pkc72hSU'
const temp: CKTapCard = {
  _certs_checked: true,
  active_slot: 6,
  applet_version: '0.9.0',
  auth_delay: 0,
  is_tapsigner: true,
  is_testnet: false,
  num_backups: null,
  num_slots: 10,
  path: null,

  card_nonce: null,
  card_pubkey: null,
  card_ident: null,
  birth_height: null,
}

export default function SetUpSatNextCardScreen( props ) {
  const dispatch = useDispatch()
  const giftAmount = props.navigation?.state?.params?.giftAmount


  // const sourceAccountShell = useSourceAccountShellForSending()
  const card = useRef( new CKTapCard() ).current

  // const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )

  const [ stepsVerified, setStepsVerified ] = useState( 0 )
  const [ slotAddress, setSlotAddress ] = useState<String | null>( dummySatcardAddress )
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ showNFCModal, setNFCModal ] = useState( false )
  // const formattedUnitText = useFormattedUnitText( {
  //   bitcoinUnit: sourcePrimarySubAccount?.kind ==  'TEST_ACCOUNT' ? BitcoinUnit.TSATS : BitcoinUnit.SATS,
  // } )
  const sendingState = useSendingState()

  const isRecipientSelectedForSending = useCallback( ( recipient: RecipientDescribing ) => {
    return (
      sendingState
        .selectedRecipients
        .some( r => r.id == recipient.id )
    )
  }, [ sendingState ] )

  const withModal = async ( callback ) => {
    try {
      setNFCModal( true )
      const resp = await card.nfcWrapper( callback )
      setNFCModal( false )
      return {
        response:resp, error:null
      }
    } catch ( error: any ) {
      if ( error.toString() ) {
        return {
          response:null, error:error.toString()
        }
      }
      setNFCModal( false )
    }
  }


  useEffect( () => {
    let timeoutVariable
    let timeout1

    timeout1 = setTimeout( async() => {
      const { response, error } = await withModal( getCardData )
      // const { response, error } = await withModal( claimGifts )

      // handle err if exists

      // else
      const { address } = response

      timeout1 = setTimeout( () => {
        if ( !card?.is_tapsigner ) {
          setStepsVerified( 1 )
          timeout1 = setTimeout( () => {
            if ( card?._certs_checked ) {
              setStepsVerified( 2 )
              timeout1 = setTimeout( () => {
                // setStepsVerified( 3 )
                console.log( 'getAddrees===>' + JSON.stringify( address ) )

                handleManualAddressSubmit( dummySatcardAddress )
                // timeout1 = setTimeout( () => {
                //   props.navigation.navigate( 'GiftCreated', {
                //     numSlots: card?.num_slots,
                //     activeSlot: card?.active_slot,
                //     fromClaimFlow: props.navigation?.state?.params?.fromClaimFlow
                //   } )
                // }, 2000 )
              }, 2000 )
            }
          }, 2000 )
        } else {
          timeoutVariable = setTimeout( () => {
            console.log( 'skk1111' )
            setShowAlertModal( true )
          }, 5000 )
        }
      }, 2000 )
    }, 1000 )

    return () => {
      clearTimeout( timeoutVariable )
      clearTimeout( timeout1 )
    }
  }, [] )


  async function getCardData() {
    try{
      await card.first_look()
      //For Create Flow
      const { addr:address, pubkey } = await card.address( true, true, card.active_slot )
      setSlotAddress( address )
      console.log( 'getAddrees===>' + JSON.stringify( address ) )
      return {
        address, pubkey
      }
      // handleManualAddressSubmit( dummySatcardAddress )
    }catch( err ){
      // corner case when the slot is not setup
      if( err.toString() === 'Error: Current slot is not yet setup.' ){
        Alert.alert( 'navigate to setup card here' )
        await card.setup( 'cvc' )
        // navigate to setup card (cvc page)
      }
      throw err
    }



  }

  const fetchBanalnceOfSlot  = ( address='' ) =>{
    // TODO: implement
    return 100
  }

  const claimGifts = async() =>{
    // For Claim Flow
    await card.first_look()
    const { addr:address, pubkey } = await card.address( true, true, card.active_slot )
    const balance = fetchBanalnceOfSlot( address )
    if( balance!==0 ){
      // get the cvc from user
      const unSealSlot = await card.unseal_slot( 'spendCode/cvc' )
      // unSealSlot ->
      // {
      //     pk: Buffer;
      //     target: number;
      // }

      // with this key move all the funds from the slot to checking account (rnd)
      console.log( 'slot address ===>' + JSON.stringify( unSealSlot ) )
      // For setup slot for next user
      const setUpSlot = await card.setup( '123', undefined, true )
      console.log( 'slot address ===>' + JSON.stringify( setUpSlot ) )
    }else{
      // corner case when the slot is unseled but no balance
      // continue with error flow
    }

  }

  const handleManualAddressSubmit = ( address: string ) => {
    const addressRecipient = makeAddressRecipientDescription( {
      address
    } )

    console.log( 'skk inside recipent', JSON.stringify( isRecipientSelectedForSending( addressRecipient ) ) )
    // if ( isRecipientSelectedForSending( addressRecipient ) == false ) {
    handleRecipientSelection( addressRecipient )
    // }
  }


  const handleRecipientSelection = async ( recipient: RecipientDescribing ) => {
    if ( isRecipientSelectedForSending( recipient ) == false ) {
      dispatch( addRecipientForSending( recipient ) )
    }

    dispatch( recipientSelectedForAmountSetting( recipient ) )
    // navigateToSendDetails( recipient )
    setTimeout( () => {
      if( recipient.id != null && recipient.id != '' ){
        console.log( 'skk inside recipent', JSON.stringify( recipient ) )
        dispatch( amountForRecipientUpdated( {
          recipient: recipient,
          amount: giftAmount
        } ) )
        // dispatch( executeSendStage1( {
        //   accountShell: sourceAccountShell
        // } ) )
        dispatch( recipientRemovedFromSending( recipient ) )
      }
    }, 2000 )
  }

  useAccountSendST1CompletionEffect( {
    onSuccess: () => {
      console.log( 'skk use acc 1 success' )
      // dispatch( executeSendStage2( {
      //   accountShell: sourceAccountShell,
      //   txnPriority: TxPriority.LOW,
      //   note:''
      // } ) )

    },
    onFailure: ( error ) => {
      console.log( 'skk111122', error )
      setShowAlertModal( true )
    },
  } )

  useAccountSendST2CompletionEffect( {
    onSuccess: ( txid: string | null, amt: number | null ) => {
      console.log( 'skk use acc 2 success' )
      // active
    },
    onFailure: ( errorMessage: string | null ) => {
      if ( errorMessage ) {
        // setError( errorMessage )
        console.log( 'skk111122333' )
        setShowAlertModal( true )
        // setTimeout( () => {
        // setFailure( true )
        // setHandleButton( true )
        // }, 200 )
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
        verifiedText={stepsVerified >= 1 ? 'SATSCARDTM detected' : 'Detecting SATSCARDTM'}
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
            verifiedText={stepsVerified >= 2 ? 'Card detected' : 'Detecting card'}
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
            verifiedText={stepsVerified >= 3 ? 'SATSCARDTM ready to use' : 'Getting SATSCARDTM for use'}
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
