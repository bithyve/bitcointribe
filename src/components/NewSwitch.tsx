import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import React, { useCallback, useMemo, useState } from 'react'
import { ImageBackground, TouchableOpacity } from 'react-native'
import { useDispatch } from 'react-redux'
import defaultBottomSheetConfigs from '../common/configs/BottomSheetConfigs'
import CurrencyKind from '../common/data/enums/CurrencyKind'
import { hp, wp } from '../common/data/responsiveness/responsive'
import { currencyKindSet } from '../store/actions/preferences'
import useAccountsState from '../utils/hooks/state-selectors/accounts/UseAccountsState'
import useCurrencyCode from '../utils/hooks/state-selectors/UseCurrencyCode'
import useCurrencyKind from '../utils/hooks/state-selectors/UseCurrencyKind'
import NoExchangeRateBottomSheet from './bottom-sheets/NoExchangeRateBottomSheet'
import IconDollar from '../assets/images/svgs/icon_dollar1.svg'
import IconBitcoin from '../assets/images/svgs/icon_bitcoin.svg'

const NewSwitch = () => {
  const { exchangeRates } = useAccountsState()
  const dispatch = useDispatch()
  const [ b, setB ] = useState( false )
  const currencyCode = useCurrencyCode()
  const currencyKind = useCurrencyKind()
  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )
  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  const showNoExchangeRateBottomSheet = useCallback( () => {
    presentBottomSheet(
      <NoExchangeRateBottomSheet
        onClickSetting={() => {
          dismissBottomSheet()
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '40%' ],
      },
    )
  }, [ presentBottomSheet, dismissBottomSheet ] )
  return (
    <ImageBackground
      resizeMode={'stretch'}
      style={{
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        height: hp( 30 ),
        width: hp( 60 ),
      }}
      source={require( '../assets/images/switchbase.png' )}
    >
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: prefersBitcoin ? '#fff' : 'transparent',
          elevation: prefersBitcoin ? 5 : 0,
          width: hp( 26 ),
          height: hp( 26 ),
          borderRadius: wp( 13 ),
          marginVertical: hp( 2 ),
          marginStart: wp( 2 ),
        }}
        onPress={() => {
          ( exchangeRates && exchangeRates[ currencyCode ] )
            ? dispatch( currencyKindSet(
              b ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
            ) )
            : showNoExchangeRateBottomSheet()
          setB( true )
        }}
      >
        <IconDollar />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: !prefersBitcoin ? '#fff' : 'transparent',
          width: hp( 26 ),
          height: hp( 26 ),
          borderRadius: wp( 13 ),
          marginVertical: hp( 2 ),
          marginEnd: wp( 2 ),
          elevation: !prefersBitcoin ? 5 : 0,
        }}
        onPress={() => {
          ( exchangeRates && exchangeRates[ currencyCode ] )
            ? dispatch( currencyKindSet(
              prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
            ) )
            : showNoExchangeRateBottomSheet()
        }}
      >
        <IconBitcoin />
      </TouchableOpacity>
    </ImageBackground>
  )
}


export default NewSwitch
