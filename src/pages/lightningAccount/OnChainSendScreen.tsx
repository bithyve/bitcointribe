import React, { useState, useMemo, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import HeaderTitle from '../../components/HeaderTitle'
import { inject, observer } from 'mobx-react'
import Colors from '../../common/Colors'
import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import Fonts from '../../common/Fonts'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import FormStyles from '../../common/Styles/FormStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch } from 'react-redux'
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText'
import useSelectedRecipientForSendingByID from '../../utils/hooks/state-selectors/sending/UseSelectedRecipientForSendingByID'
import useSelectedRecipientsForSending from '../../utils/hooks/state-selectors/sending/UseSelectedRecipientsForSending'
import BalanceEntryFormGroup from '../Accounts/Send/BalanceEntryFormGroup'
import SelectedRecipientsCarousel from '../Accounts/Send/SelectedRecipientsCarousel'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import { translations } from '../../common/content/LocContext'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import Toast from '../../components/Toast'
import SendConfirmationContent from '../Accounts/SendConfirmationContent'
import ModalContainer from '../../components/home/ModalContainer'


const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 5,
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

const SendScreen = inject(
  'TransactionsStore',
  'BalanceStore',
  'UnitsStore',
  'FeeStore',
  'UTXOsStore',
)( observer( ( {
  TransactionsStore,
  BalanceStore,
  FeeStore,
  UTXOsStore,
  navigation,
  route
} ) => {

  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]
  const currentAmount = Number( route.params?.amount )
  const [ fee, setFee ] = useState( '2' )
  const [ selectedAmount, setSelectedAmount ] = useState<Satoshis | null>( currentAmount ? currentAmount : 0 )
  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: BitcoinUnit.SATS,
  } )
  const [ recipientAddress ] = useState( route.params?.value )
  const [ showModal, setShowModal ] = useState( false )
  const selectedRecipients = useSelectedRecipientsForSending()
  const currentRecipient = useSelectedRecipientForSendingByID( route.params?.value )
  const formattedAvailableBalanceAmountText = useFormattedAmountText( BalanceStore.totalBlockchainBalance )
  const [ utxos, setUtxos ] = useState( [] )
  const [ targetConf, setTargetConf ] = useState( '60' )

  useEffect( () => {
    const { loading, error, error_msg, txid } = TransactionsStore
    if( !loading && error || error_msg|| txid ){
      setShowModal( true )
    }
  }, [ TransactionsStore.loading ] )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = 'Lightning Account'

    return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`
  }, [ formattedAvailableBalanceAmountText ] )

  function handleConfirmationButtonPress() {
    if( selectedAmount === 0 ){
      Toast( 'Please enter amount' )
      return
    }
    let request
    if ( utxos && utxos.length > 0 ) {
      request = {
        addr: recipientAddress,
        sat_per_byte: fee,
        amount: `${Math.floor( selectedAmount )}`,
        target_conf: targetConf,
        utxos
      }
    } else {
      request = {
        addr: recipientAddress,
        sat_per_byte: fee,
        amount: `${Math.floor( selectedAmount )}`,
        target_conf: targetConf
      }
    }
    TransactionsStore.sendCoins( request )
  }

  const orderedRecipients = useMemo( () => {
    return Array.from( selectedRecipients || [] ).reverse()
  }, [ selectedRecipients ] )


  return (
    <KeyboardAwareScrollView
      bounces={false}
      overScrollMode="never"
      style={styles.rootContainer}>

      <ModalContainer
        onBackground={()=>
          setShowModal( false )
        }
        visible={showModal}
        closeBottomSheet={() => setShowModal( false )} >
        <SendConfirmationContent
          title={TransactionsStore.txid ? strings.SentSuccessfully: strings.SendUnsuccessful}
          info={TransactionsStore.txid ? strings.SentSuccessfully: TransactionsStore.error_msg}
          infoText={ ' '}
          isFromContact={false}
          okButtonText={strings.ViewAccount}
          cancelButtonText={common.back}
          isCancel={false}
          onPressOk={() => {
            TransactionsStore.getTransactions()
            BalanceStore.getBlockchainBalance()
            navigation.goBack()
          }}
          onPressCancel={() => setShowModal( false )}
          isSuccess={true}
        />
      </ModalContainer>

      <View style={styles.headerSection}>
        <SelectedRecipientsCarousel
          recipients={orderedRecipients}
          subAccountKind={SubAccountKind.LIGHTNING_ACCOUNT}
          onRemoveSelected={()=> {}}
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
          fontFamily: Fonts.Regular,
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
          subAccountKind={SubAccountKind.LIGHTNING_ACCOUNT}
          spendableBalance={Number( BalanceStore.totalBlockchainBalance )}
          onAmountChanged={( amount: Satoshis ) => {
            setSelectedAmount( amount )
          }}
          onSendMaxPressed={()=> {}}
          showSendMax={false}
        />
      </View>

      <View style={styles.footerSection}>
        <TouchableOpacity
          disabled={selectedAmount === 0 || TransactionsStore.loading}
          onPress={handleConfirmationButtonPress}
          style={{
            ...ButtonStyles.primaryActionButton, opacity: selectedAmount === 0 || TransactionsStore.loading ? 0.5: 1
          }}
        >
          <Text style={ButtonStyles.actionButtonText}>{common.confirmProceed}</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAwareScrollView>
  )
} ) )

export default SendScreen

