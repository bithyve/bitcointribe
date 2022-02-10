import React, { useState, useMemo } from 'react'
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
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13 ),
  },
} )

const SendScreen = inject(
  'NodeInfoStore',
  'BalanceStore',
  'UnitsStore',
  'FeeStore',
  'UTXOsStore',
)( observer( ( {
  NodeInfoStore,
  BalanceStore,
  FeeStore,
  UTXOsStore,
  navigation
} ) => {

  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]
  const currentAmount = Number( BalanceStore.totalBlockchainBalance )

  const [ selectedAmount, setSelectedAmount ] = useState<Satoshis | null>( currentAmount ? currentAmount : 0 )
  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: BitcoinUnit.SATS,
  } )
  const selectedRecipients = useSelectedRecipientsForSending()
  const currentRecipient = useSelectedRecipientForSendingByID( navigation.getParam( 'value' ) )
  const formattedAvailableBalanceAmountText = useFormattedAmountText( BalanceStore.totalBlockchainBalance )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = 'Lightning Account'

    return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`
  }, [ formattedAvailableBalanceAmountText ] )

  function handleConfirmationButtonPress() {
    console.log( selectedAmount )
  }

  const orderedRecipients = useMemo( () => {
    return Array.from( selectedRecipients || [] ).reverse()
  }, [ selectedRecipients ] )


  return (
    <KeyboardAwareScrollView
      bounces={false}
      overScrollMode="never"
      style={styles.rootContainer}>
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
          fontFamily: Fonts.FiraSansRegular,
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
          spendableBalance={currentAmount}
          onAmountChanged={( amount: Satoshis ) => {
            setSelectedAmount( amount )
          }}
          onSendMaxPressed={()=> {}}
        />
      </View>

      <View style={styles.footerSection}>
        <TouchableOpacity
          disabled={!selectedAmount}
          onPress={handleConfirmationButtonPress}
          style={{
            ...ButtonStyles.primaryActionButton, opacity: !selectedAmount ? 0.5: 1
          }}
        >
          <Text style={ButtonStyles.actionButtonText}>{common.confirmProceed}</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAwareScrollView>
  )
} ) )

export default SendScreen

