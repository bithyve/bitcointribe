import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useDispatch } from 'react-redux'
import { Input } from 'react-native-elements'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../../../components/MaterialCurrencyCodeIcon'
import useCurrencyCode from '../../../utils/hooks/state-selectors/UseCurrencyCode'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import FormStyles from '../../../common/Styles/FormStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { getCurrencyImageByRegion } from '../../../common/CommonFunctions'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'
import CurrencyKindToggleSwitch from '../../../components/CurrencyKindToggleSwitch'
import useExchangeRates from '../../../utils/hooks/state-selectors/UseExchangeRates'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import useTotalSpendingAmount from '../../../utils/hooks/sending-utils/UseTotalSpendingAmount'
import { clearSendMaxFee } from '../../../store/actions/sending'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import idx from 'idx'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper'
import { translations } from '../../../common/content/LocContext'

export type Props = {
  currentRecipient: RecipientDescribing,
  subAccountKind: SubAccountKind;
  spendableBalance: Satoshis;
  onAmountChanged: ( amount: Satoshis ) => void;
  onSendMaxPressed: ( ) => void;
};


const BalanceEntryFormGroup: React.FC<Props> = ( {
  currentRecipient,
  subAccountKind,
  spendableBalance,
  onAmountChanged,
  onSendMaxPressed,
}: Props ) => {
  const exchangeRates = useExchangeRates()
  const currencyCode = useCurrencyCode()
  const currencyKind = useCurrencyKind()
  const sendingState = useSendingState()
  const totalSpendingAmount = useTotalSpendingAmount( currentRecipient )
  const dispatch = useDispatch()
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]
  const [ isSendingMax, setIsSendingMax ] = useState( false )
  const currentAmount = idx( currentRecipient, ( _ ) => _.amount )
  const [ currentSatsAmountTextValue, setCurrentSatsAmountTextValue ] = useState( String(  currentAmount ? currentAmount : 0 ) )
  const [ currentFiatAmountTextValue, setCurrentFiatAmountTextValue ] = useState( String( convertSatsToFiat( Number( currentSatsAmountTextValue ) ) ) )

  const currentSatsAmountFormValue = useMemo( () => {
    return Number( currentSatsAmountTextValue )
  }, [ currentSatsAmountTextValue, isSendingMax ] )

  const sendMaxFee = useMemo( () => {
    return sendingState.sendMaxFee
  }, [ sendingState.sendMaxFee ] )

  const remainingSpendableBalance = useMemo( () => {
    return spendableBalance - totalSpendingAmount - sendingState.sendMaxFee
  }, [ totalSpendingAmount, sendMaxFee ] )

  const isAmountInvalid = useMemo( () => {
    return currentSatsAmountFormValue > spendableBalance
  }, [ currentSatsAmountFormValue, spendableBalance ] )

  const [ currencyKindForEntry, setCurrencyKindForEntry ] = useState( currencyKind )

  const FiatAmountInputLeftIcon: React.FC = () => {
    return (
      <View style={styles.amountInputImage}>
        {materialIconCurrencyCodes.includes( currencyCode ) ? (
          <View style={styles.currencyImageView}>
            <MaterialCurrencyCodeIcon
              currencyCode={currencyCode}
              color={Colors.currencyGray}
              size={widthPercentageToDP( 6 )}
            />
          </View>
        ) : (
          <Image
            style={{
              ...styles.textBoxImage,
            }}
            source={getCurrencyImageByRegion(
              currencyCode,
              'gray',
            )}
          />
        )}
      </View>
    )
  }

  function handleSendMaxPress() {
    if( spendableBalance ){
      setIsSendingMax( true )
      onSendMaxPressed()
    }
  }

  useEffect( ()=>{
    if( isSendingMax && sendMaxFee ){
      const sendMaxAmount = remainingSpendableBalance
      const convertedFiatAmount = convertSatsToFiat( sendMaxAmount ).toFixed( 2 )

      setCurrentFiatAmountTextValue( String( convertedFiatAmount ) )
      setCurrentSatsAmountTextValue( String( sendMaxAmount ) )
      onAmountChanged( sendMaxAmount )
    }
    else if( !isSendingMax && sendMaxFee ) dispatch( clearSendMaxFee() )

  }, [ sendMaxFee, isSendingMax ] )

  function convertFiatToSats( fiatAmount: number ) {
    return exchangeRates && exchangeRates[ currencyCode ]
      ? (
        ( fiatAmount / exchangeRates[ currencyCode ].last ) * SATOSHIS_IN_BTC
      )
      : 0
  }

  function convertSatsToFiat( amount: Satoshis ) {
    return exchangeRates && exchangeRates[ currencyCode ]
      ? ( amount / SATOSHIS_IN_BTC ) * exchangeRates[ currencyCode ].last
      : 0
  }

  return (
    <View style={styles.rootContainer}>

      {/* Text-input column */}
      <View>

        {/* Fiat Amount */}
        <TouchableOpacity
          style={{
            ...styles.textInputFieldWrapper,
            backgroundColor: currencyKindForEntry == CurrencyKind.FIAT
              ? Colors.white
              : Colors.backgroundColor,
          }}
        >
          <FiatAmountInputLeftIcon />

          <View style={styles.textInputImageDivider} />

          <Input
            containerStyle={styles.textInputContainer}
            inputContainerStyle={{
              height: '100%',
              padding: 0,
              borderBottomColor: 'transparent',
            }}
            inputStyle={styles.textInputContent}
            editable={currencyKindForEntry == CurrencyKind.FIAT}
            placeholder={currencyKindForEntry == CurrencyKind.BITCOIN
              ? `${strings.ConvertedIn} ` + currencyCode
              : `${strings.Enteramountin} ` + currencyCode
            }
            placeholderTextColor={FormStyles.placeholderText.color}
            value={currentFiatAmountTextValue}
            returnKeyLabel="Done"
            returnKeyType="done"
            keyboardType={'numeric'}
            onChangeText={( value ) => {
              if( !isNaN( Number( value ) ) ) {
                if( isSendingMax ) setIsSendingMax( false )
                setCurrentFiatAmountTextValue( value.split( '.' ).map( ( el, i )=>i?el.split( '' ).slice( 0, 2 ).join( '' ):el ).join( '.' ) )
                setCurrentSatsAmountTextValue( String( Math.round( convertFiatToSats( Number( value ) ?? 0 ) ) ) )
                onAmountChanged( convertFiatToSats( Number( value ) ?? 0 ) )
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

          {
            ( currencyKindForEntry == CurrencyKind.FIAT ) &&
            ( isSendingMax == false ) &&
            (
              <AppBottomSheetTouchableWrapper
                onPress={handleSendMaxPress}
                style={{
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    color: Colors.blue,
                    textAlign: 'center',
                    // paddingHorizontal: 10,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansItalic,
                  }}
                >
                  {strings.SendMax}
                </Text>
              </AppBottomSheetTouchableWrapper>

            )}
        </TouchableOpacity>


        {/* BTC Amount */}
        <TouchableOpacity
          style={{
            ...styles.textInputFieldWrapper,
            backgroundColor: currencyKindForEntry == CurrencyKind.BITCOIN
              ? Colors.white
              : Colors.backgroundColor,
          }}
        >
          <View style={styles.amountInputImage}>
            <Image
              style={styles.textBoxImage}
              source={require( '../../../assets/images/icons/icon_bitcoin_gray.png' )}
            />
          </View>

          <View style={styles.textInputImageDivider} />

          <Input
            containerStyle={styles.textInputContainer}
            inputContainerStyle={{
              height: '100%',
              padding: 0,
              borderBottomColor: 'transparent',
            }}
            inputStyle={styles.textInputContent}
            editable={currencyKindForEntry == CurrencyKind.BITCOIN}
            placeholder={
              currencyKindForEntry == CurrencyKind.BITCOIN
                ? subAccountKind == SubAccountKind.TEST_ACCOUNT
                  ? `${strings.Enteramountin} in t-sats`
                  : `${strings.Enteramountin} in sats`
                : subAccountKind == SubAccountKind.TEST_ACCOUNT
                  ? `${strings.ConvertedIn} t-sats`
                  : `${strings.ConvertedIn} sats`
            }
            placeholderTextColor={FormStyles.placeholderText.color}
            value={currentSatsAmountTextValue}
            returnKeyLabel="Done"
            returnKeyType="done"
            keyboardType={'numeric'}
            onChangeText={( value ) => {
              const regEx = /^[0-9]+$/
              if( regEx.test( value ) || value === '' ) {
                setIsSendingMax( false )
                setCurrentSatsAmountTextValue( value )
                setCurrentFiatAmountTextValue( String( convertSatsToFiat( Number( value ) ?? 0 ).toFixed( 2 ) ) )
                onAmountChanged( Number( value ) ?? 0 )
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

          {
            ( currencyKindForEntry == CurrencyKind.BITCOIN ) &&
            ( isSendingMax == false ) &&
            (
              <TouchableOpacity
                onPress={handleSendMaxPress}
              >
                <Text
                  style={{
                    color: Colors.blue,
                    textAlign: 'center',
                    paddingRight: 10,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansItalic,
                  }}
                >
                  {strings.SendMax}
                </Text>
              </TouchableOpacity>
            )}
        </TouchableOpacity>


        {isAmountInvalid && (
          <View style={{
            marginLeft: 'auto'
          }}>
            <Text style={FormStyles.errorText}>{strings.Insufficient}</Text>
          </View>
        )}

        {/*
        {this.getIsMinimumAllowedStatus() ? (
          <View style={{
            marginLeft: 'auto'
          }}>
            <Text style={styles.errorText}>
            Enter more than 550 sats (min allowed)
            </Text>
          </View>
        ) : null} */}
      </View>

      <View style={styles.toggleSwitchView}>
        <CurrencyKindToggleSwitch
          fiatCurrencyCode={currencyCode}
          onpress={() => setCurrencyKindForEntry(
            currencyKindForEntry == CurrencyKind.BITCOIN ?
              CurrencyKind.FIAT
              : CurrencyKind.BITCOIN
          )}
          isOn={currencyKindForEntry == CurrencyKind.BITCOIN}
          isVertical={true}
          disabled={exchangeRates && exchangeRates[ currencyCode ] ? false : true}
        />
      </View>
    </View >
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
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
    padding: 0,
  },

  textBoxImage: {
    width: widthPercentageToDP( 6 ),
    height: widthPercentageToDP( 6 ),
    resizeMode: 'contain',
  },

  amountInputImage: {
    width: 40,
    height: widthPercentageToDP( 13 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },

  currencyImageView: {
    width: widthPercentageToDP( 6 ),
    height: widthPercentageToDP( 6 ),
    justifyContent: 'center',
    alignItems: 'center',
  },

  textInputImageDivider: {
    width: 2,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },

  toggleSwitchView: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
  },
} )

export default BalanceEntryFormGroup
