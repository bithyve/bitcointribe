import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { connect, useDispatch } from 'react-redux'
import idx from 'idx'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import GiftStepperComponent from './GiftStepperComponent'
import { CKTapCard } from 'cktap-protocol-react-native'
import ModalContainer from '../../components/home/ModalContainer'
import AlertModalContents from '../../components/AlertModalContents'
import { makeAddressRecipientDescription } from '../../utils/sending/RecipientFactories'
import useSendingState from '../../utils/hooks/state-selectors/sending/UseSendingState'
import { RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import { addRecipientForSending, amountForRecipientUpdated, executeSendStage1, executeSendStage2, recipientRemovedFromSending, recipientSelectedForAmountSetting, sendTxNotification } from '../../store/actions/sending'
import useSourceAccountShellForSending from '../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import useAccountSendST1CompletionEffect from '../../utils/sending/UseAccountSendST1CompletionEffect'
import { Account, ActiveAddresses, TxPriority } from '../../bitcoin/utilities/Interface'
import useAccountSendST2CompletionEffect from '../../utils/sending/UseAccountSendST2CompletionEffect'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import useAccountByAccountShell from '../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'

const { height, width } = Dimensions.get( 'window' )

const dummySatcardAddress = '2N7eyWGdtdqQUk65rxb3ysDzFw3pkc72hSU'
const temp: CKTapCard = {
  _certs_checked: true,
  active_slot: 6,
  applet_version: '0.9.0',
  auth_delay: 0,
  is_tapsigner: true,
  is_testnet: false,
  num_backups: 10,
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
  const fromClaimFlow = props.navigation?.state?.params?.fromClaimFlow

  const card = useRef( new CKTapCard() ).current
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const account: Account = useAccountByAccountShell( sourceAccountShell )

  const [ stepsVerified, setStepsVerified ] = useState( 0 )
  const [ cardDetails, setCardDetails ] = useState<CKTapCard | null>( temp )
  const [ slotAddress, setSlotAddress ] = useState<String | null>( dummySatcardAddress )
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ showNFCModal, setNFCModal ] = useState( false )

  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: sourcePrimarySubAccount?.kind == 'TEST_ACCOUNT' ? BitcoinUnit.TSATS : BitcoinUnit.SATS,
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
    //   accountToAddressMapping[ address ] = {
    //     External: address,
    //     Internal: [],
    //     Owned: [],
    //   }
    // }

    // try{
    //   if ( network === bitcoinJS.networks.testnet ) {
    //     res = await accAxios.post(
    //       config.ESPLORA_API_ENDPOINTS.TESTNET.NEWMULTIUTXOTXN,
    //       accountToAddressMapping,
    //     )
    //   } else {
    //     res = await accAxios.post(
    //       config.ESPLORA_API_ENDPOINTS.MAINNET.NEWMULTIUTXOTXN,
    //       accountToAddressMapping,
    //     )
    //   }
    // } catch( err ){
    //    console.log("error" + err)
    // }
  }

  useEffect( () => {
    let timeoutVariable
    let timeout1

    timeout1 = setTimeout( () => {
      getCardData()
      timeout1 = setTimeout( () => {
        if ( cardDetails?.is_tapsigner ) {
          setStepsVerified( 1 )
          timeout1 = setTimeout( () => {
            if ( cardDetails?._certs_checked ) {
              setStepsVerified( 2 )
              timeout1 = setTimeout( () => {
                setStepsVerified( 3 )
                console.log( 'fromClaimFlow===>' + JSON.stringify( fromClaimFlow ) )

                // handleManualAddressSubmit( dummySatcardAddress )
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

  const withModal = async ( callback ) => {
    try {
      setNFCModal( true )
      const resp = await card.nfcWrapper( callback )
      setNFCModal( false )
      return {
        response: resp, error: null
      }
    } catch ( error: any ) {
      if ( error.toString() ) {
        return {
          response: null, error: error.toString()
        }
      }
      setNFCModal( false )
    }
  }
  async function getCardData() {
    const cardData = await card.first_look()
    setCardDetails( cardData )
    console.log( 'card details===>' + JSON.stringify( cardData ) )

    if ( cardDetails && cardDetails.active_slot != null ) {
      //For Create Flow
      const address: any = await card.address( true, true, cardDetails.active_slot )
      try {
        await card.first_look()
        //For Create Flow
        const { addr: address, pubkey } = await card.address( true, true, card.active_slot )
        setSlotAddress( address )
        console.log( 'getAddrees===>' + JSON.stringify( address ) )

        const network = AccountUtilities.getNetworkByType( account.networkType )
        const balance = await AccountUtilities.fetchSelectedAccountBalance( address, network )
        console.log( 'balance===>' + JSON.stringify( balance ) )

        return {
          address, pubkey
        }
        // handleManualAddressSubmit( address )
      } catch ( err ) {
        // corner case when the slot is not setup
        if ( err.toString() === 'Error: Current slot is not yet setup.' ) {
          Alert.alert( 'navigate to setup card here' )
          await card.setup( 'cvc' )
          // navigate to setup card (cvc page)
        }
        throw err
      }
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
        setStepsVerified( 3 )
        setTimeout( () => {
          props.navigation.navigate( 'GiftCreated', {
            numSlots: cardDetails?.num_slots,
            activeSlot: cardDetails?.active_slot,
            slotFromIndex: fromClaimFlow ?
              cardDetails?.num_backups == 0 ? 1 : 2
              : cardDetails?.num_backups == 0 ? 3 : 4,
          } )
        }, 2000 )
      }
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
