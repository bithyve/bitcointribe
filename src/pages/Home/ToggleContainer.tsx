import React, { useMemo } from 'react'
import {
  View, StyleSheet,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from './../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
// import CurrencyKindToggleSwitch from '../CurrencyKindToggleSwitch'
const currencyCode = [ 'BRL', 'CNY', 'JPY', 'GBP', 'KRW', 'RUB', 'TRY', 'INR', 'EUR' ]
import { useDispatch } from 'react-redux'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import { currencyKindSet } from '../../store/actions/preferences'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import CurrencyKindToggleSwitch from '../../components/CurrencyKindToggleSwitch'

const ToggleContainer = ( { CurrencyCode, } ) => {
  const dispatch = useDispatch()
  const currencyKind: CurrencyKind = useCurrencyKind()

  const prefersBitcoin = useMemo( () => {
    if ( !currencyKind ) return true
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )


  return (
    <View style={styles.headerToggleSwitchContainer}>
      <CurrencyKindToggleSwitch
        fiatCurrencyCode={CurrencyCode}
        onpress={() => {
          dispatch( currencyKindSet(
            prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
          ) )
        }}
        // disabled={exchangeRates ? false : true}
        isOn={prefersBitcoin}
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
