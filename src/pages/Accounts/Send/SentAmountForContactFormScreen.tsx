import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Keyboard, TouchableOpacity, ScrollView } from 'react-native'
import { Input } from 'react-native-elements'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch } from 'react-redux'
import AccountShell from '../../../common/data/models/AccountShell'
import { ContactRecipientDescribing, RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import { BaseNavigationProp } from '../../../navigation/Navigator'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useSelectedRecipientForSendingByID from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientForSendingByID'
import useSelectedRecipientsForSending from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientsForSending'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import BalanceEntryFormGroup from './BalanceEntryFormGroup'
import SelectedRecipientsCarousel from './SelectedRecipientsCarousel'
import { calculateSendMaxFee, executeSendStage1, amountForRecipientUpdated, recipientRemovedFromSending } from '../../../store/actions/sending'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import useAccountSendST1CompletionEffect from '../../../utils/sending/UseAccountSendST1CompletionEffect'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import ImageStyles from '../../../common/Styles/ImageStyles'
import SendConfirmationContent from '../SendConfirmationContent'
import { clearTransfer } from '../../../store/actions/accounts'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import useSpendableBalanceForAccountShell from '../../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import idx from 'idx'
import { PermanentChannelsSyncKind, syncPermanentChannels } from '../../../store/actions/trustedContacts'
import RecipientKind from '../../../common/data/enums/RecipientKind'
import ModalContainer from '../../../components/home/ModalContainer'
import { translations } from '../../../common/content/LocContext'
import useAccountByAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import { NetworkType } from '../../../bitcoin/utilities/Interface'
import { hp, wp } from '../../../common/data/responsiveness/responsive'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import RecipientAvatar from '../../../components/RecipientAvatar'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import SelectAccount from '../../../components/SelectAccount'
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind'

export type NavigationParams = {
};

export type NavigationProp = {
  params: NavigationParams;
} & BaseNavigationProp;

export type Props = {
  navigation: NavigationProp;
};

const SentAmountForContactFormScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const dispatch = useDispatch()

  const [ sendFailureModal, setFailure ] = useState( false )
  const [ errorMessage, setError ] = useState( '' )
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]

  const selectedRecipients = useSelectedRecipientsForSending()
  const currentRecipient = useSelectedRecipientForSendingByID( navigation.getParam( 'selectedRecipientID' ) )
  const [ sourceAccountShell, setSourceShell ] = useState<AccountShell>( useSourceAccountShellForSending() )
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const sourceAccount = useAccountByAccountShell( sourceAccountShell )
  const currentAmount = idx( currentRecipient, ( _ ) => _.amount )
  const [ selectedAmount, setSelectedAmount ] = useState<Satoshis | null>( currentAmount ? currentAmount : 0 )
  const sendingState = useSendingState()
  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: sourceAccount.networkType === NetworkType.TESTNET? BitcoinUnit.TSATS: BitcoinUnit.SATS,
  } )
  const availableBalance = useMemo( () => {
    return AccountShell.getSpendableBalance( sourceAccountShell )
  }, [ sourceAccountShell ] )
  const fromWallet = navigation?.getParam( 'fromWallet' ) || false
  const [ currentFiatAmountTextValue, setCurrentFiatAmountTextValue ] = useState( '' )
  const formattedAvailableBalanceAmountText = useFormattedAmountText( availableBalance )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`
  }, [ formattedAvailableBalanceAmountText, sourcePrimarySubAccount ] )
  const currencyKind = useCurrencyKind()
  const [ currencyKindForEntry, setCurrencyKindForEntry ] = useState( currencyKind )
  const orderedRecipients = useMemo( () => {
    return Array.from( selectedRecipients || [] ).reverse()
  }, [ selectedRecipients ] )

  useEffect( () => {
    return () => {
      setFailure( false )
    }
  }, [ navigation ] )

  useEffect( ()=> {
    // refresh selected recipient's permanent channel
    if( currentRecipient && currentRecipient.kind === RecipientKind.CONTACT ){
      const channelUpdate = {
        contactInfo: {
          channelKey: ( currentRecipient as ContactRecipientDescribing ).channelKey,
        }
      }
      dispatch( syncPermanentChannels( {
        permanentChannelsSyncKind: PermanentChannelsSyncKind.SUPPLIED_CONTACTS,
        channelUpdates: [ channelUpdate ]
      } ) )
    }
  }, [ ( currentRecipient as ContactRecipientDescribing )?.channelKey ] )

  function handleRecipientRemoval( recipient: RecipientDescribing ) {
    dispatch( recipientRemovedFromSending( recipient ) )
    navigation.goBack()
  }

  function updateAmountForRecipient() {
    dispatch( amountForRecipientUpdated( {
      recipient: currentRecipient,
      amount: selectedAmount
    } ) )
  }

  function handleConfirmationButtonPress() {
    updateAmountForRecipient()
    dispatch( executeSendStage1( {
      accountShell: sourceAccountShell
    } ) )
  }

  function onAmountChanged ( amount: Satoshis ) {
    setSelectedAmount( amount )
  }

  const showSendFailureBottomSheet = useCallback( () => {
    return(
      <SendConfirmationContent
        title={strings.SendUnsuccessful}
        info={String( errorMessage )}
        isFromContact={false}
        recipients={sendingState.selectedRecipients}
        okButtonText={common.tryAgain}
        cancelButtonText={common.back}
        isCancel={true}
        onPressOk={() => setFailure( false )}
        onPressCancel={() => {
          dispatch( clearTransfer( sourcePrimarySubAccount.kind ) )
          setFailure( false )

          navigation.dispatch(
            resetStackToAccountDetails( {
              accountShellID: sourceAccountShell.id,
            } )
          )
        }}
        isUnSuccess={true}
        accountKind={sourcePrimarySubAccount.kind}
      />
    )
  }, [ errorMessage ] )


  useAccountSendST1CompletionEffect( {
    onSuccess: () => {
      navigation.navigate( 'SendConfirmation', {
        fromWallet
      } )
    },
    onFailure: ( error ) => {
      setError( error )
      setTimeout( () => {
        setFailure( true )
      }, 200 )
    },
  } )

  useEffect( ()=> {
    if ( sendingState.feeIntelMissing ) {
      // missing fee intel: custom fee-fallback
      navigation.navigate( 'SendConfirmation', {
        fromWallet
      } )
    }
  }, [ sendingState.feeIntelMissing ] )

  return (
    <View style={styles.rootContainer}>
      <ModalContainer onBackground={()=>setFailure( false )} visible={sendFailureModal} closeBottomSheet={() => {}} >
        {showSendFailureBottomSheet()}
      </ModalContainer>
      <SelectAccount onSelect={( item ) => setSourceShell( item )}/>
      <View style={{
        ...styles.accountSelectionView,
        width: '90%',
      }}>
        <View
          style={{
            borderRadius: wp( 2 ),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              paddingVertical: hp( 10 ),
              paddingHorizontal: wp( 2 ),
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: wp( 38 ),
                height: '100%',
                marginTop: hp( 10 ),
                marginRight: wp( 11 ),
              }}
            >
              <RecipientAvatar
                recipient={orderedRecipients[ 0 ]}
                contentContainerStyle={styles.avatarImage}
              />
            </View>

            <View
              style={{
                marginHorizontal: wp( 3 ),
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue( 14 ),
                  fontFamily: Fonts.RobotoSlabRegular,
                }}
              >
                To {orderedRecipients[ 0 ].displayedName}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={24}
              color="gray"
              style={{
                alignSelf: 'center',
              }}
            />
          </View>
        </View>

        <View style={styles.formBodySection}>
          <TouchableOpacity
            style={{
              ...styles.textInputFieldWrapper,
              backgroundColor: currencyKindForEntry == CurrencyKind.BITCOIN
                ? Colors.white
                : Colors.backgroundColor,
            }}
          >
            <Input
              containerStyle={styles.textInputContainer}
              inputContainerStyle={{
                height: '100%',
                padding: 0,
                borderBottomColor: 'transparent',
              }}
              inputStyle={styles.textInputContent}
              placeholder={currencyKind == CurrencyKind.BITCOIN
                ? sourcePrimarySubAccount.kind == SubAccountKind.TEST_ACCOUNT
                  ? `${strings.Enteramountin} t-sats`
                  : `${strings.Enteramountin} sats`
                : sourcePrimarySubAccount.kind == SubAccountKind.TEST_ACCOUNT
                  ? `${strings.ConvertedIn} t-sats`
                  : `${strings.ConvertedIn} sats`}
              placeholderTextColor={FormStyles.placeholderText.color}
              value={currentFiatAmountTextValue}
              returnKeyLabel="Done"
              returnKeyType="done"
              keyboardType={'numeric'}
              onChangeText={( value ) => {
                if( !isNaN( Number( value ) ) ) {
                  setCurrentFiatAmountTextValue( value.split( '.' ).map( ( el, i )=>i?el.split( '' ).slice( 0, 2 ).join( '' ):el ).join( '.' ) )
                  onAmountChanged( ( Number( value ) ?? 0 ) )
                }
              }}
              onFocus={() => {
              // this.setState({
              //   InputStyle1: styles.inputBoxFocused
              // })
              }}
              onBlur={() => {
              // this.setState({
              //   InputStyle1: styles.textBoxView
              // })
              }}
              autoCorrect={false}
              autoCompleteType="off"
            />
          </TouchableOpacity>

        </View>

        <View style={styles.footerSection}>
          <TouchableOpacity
            disabled={!selectedAmount}
            onPress={handleConfirmationButtonPress}
            style={{
              ...ButtonStyles.primaryActionButton, opacity: !selectedAmount ? 0.5: 1,
              alignSelf: 'flex-end'
            }}
          >
            <Text style={ButtonStyles.actionButtonText}>{common.confirmProceed}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA'
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
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  textInputFieldWrapper: {
    ...FormStyles.textInputContainer,
    marginTop: hp( 60 ),
    marginBottom: hp( 50 ),
    width: wp( 324 ),
    height: hp( 50 ),
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 0,
    backgroundColor: '#fff'
  },

  textInputContainer: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
  },

  textInputContent: {
    height: '100%',
    color: Colors.textColorGrey,
    fontFamily: Fonts.RobotoSlabMedium,
    fontSize: RFValue( 13 ),
  },
  accountSelectionView: {
    width: '90%',
    // shadowOpacity: 0.06,
    // shadowOffset: {
    //   width: 10, height: 10
    // },
    // shadowRadius: 10,
    // elevation: 2,
    alignSelf: 'center',
    marginTop: hp( 2 ),
    marginBottom: hp( 2 ),
  },
  avatarImage: {
    marginLeft: wp( 5 ),
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp ( 19 ),
  },
} )

export default SentAmountForContactFormScreen

