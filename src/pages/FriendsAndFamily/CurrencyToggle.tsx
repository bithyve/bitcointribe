import React, { useMemo } from 'react'
import {
  View, StyleSheet,
} from 'react-native'

import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch, useSelector } from 'react-redux'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import { giftCurrencyKindSet } from '../../store/actions/preferences'
import CurrencyKindToggleSwitch from '../../components/CurrencyKindToggleSwitch'
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../../components/MaterialCurrencyCodeIcon'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'

const ToggleContainer = ( ) => {
  const dispatch = useDispatch()
  const currencyKind : CurrencyKind = useSelector( state => state.preferences.giftCurrencyKind || CurrencyKind.BITCOIN )
  const currencyCode = useCurrencyCode()

  const prefersBitcoin = useMemo( () => {
    if ( !currencyKind ) return true
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  const { exchangeRates } = useAccountsState()

  return (
    <View style={styles.headerToggleSwitchContainer}>
      <CurrencyKindToggleSwitch
        fiatCurrencyCode={currencyCode}
        activeOnImage={require( '../../assets/images/icons/icon_bitcoin_light.png' )}
        inactiveOnImage={require( '../../assets/images/icons/icon_bitcoin_dark.png' )}
        activeOffImage={
          materialIconCurrencyCodes.includes( currencyCode ) ?
            <MaterialCurrencyCodeIcon
              currencyCode={currencyCode}
              color={Colors.white}
              size={14}
            />
            : null
        }
        inactiveOffImage={
          materialIconCurrencyCodes.includes( currencyCode ) ?
            <MaterialCurrencyCodeIcon
              currencyCode={currencyCode}
              color={Colors.blue}
              size={14}
            />
            : null
        }
        trackColor={Colors.lightBlue}
        thumbColor={Colors.blue}
        onpress={() => {
          dispatch( giftCurrencyKindSet(
            prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
          ) )
        }}
        isOn={prefersBitcoin}
        disabled={exchangeRates && exchangeRates[ currencyCode ] ? false : true}
      />
    </View>
  )
}

export default ToggleContainer


const styles = StyleSheet.create( {
  headerToggleSwitchContainer: {
    flex: 3,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
} )
