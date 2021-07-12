import React, { useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { Image, View, Text, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native'
import Colors from '../../common/Colors'
import ScreenHeaderStyles from '../../common/Styles/ScreenHeaders'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CurrencyKindToggleSwitch from '../CurrencyKindToggleSwitch'
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode'
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../MaterialCurrencyCodeIcon'
import { getCurrencyImageByRegion } from '../../common/CommonFunctions'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import { currencyKindSet } from '../../store/actions/preferences'
import useAccountShellForID from '../../utils/hooks/state-selectors/accounts/UseAccountShellForID'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import NoExchangeRateBottomSheet from '../../components/bottom-sheets/NoExchangeRateBottomSheet'
import { useCallback } from 'react'
import defaultBottomSheetConfigs from '../../common/configs/BottomSheetConfigs'

export type Props = {
  accountShellID: string;
  onBackPressed: () => void;
};

const AccountDetailsNavHeader: React.FC<Props> = ( {
  accountShellID,
  onBackPressed,
}: Props ) => {
  const dispatch = useDispatch()
  const accountShell = useAccountShellForID( accountShellID )
  const primarySubAccountInfo = usePrimarySubAccountForShell( accountShell )

  const { exchangeRates } = useAccountsState()
  const currencyCode = useCurrencyCode()
  const currencyKind = useCurrencyKind()

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  const title = useMemo( () => {
    return primarySubAccountInfo?.customDisplayName || primarySubAccountInfo?.defaultTitle || 'Account Details'
  }, [ accountShellID ] )


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
    <View>
      <SafeAreaView style={{
        flex: 0, backgroundColor: Colors.backgroundColor
      }} />

      <StatusBar
        backgroundColor={Colors.backgroundColor}
        barStyle="dark-content"
      />

      <View style={[ ScreenHeaderStyles.smallHeaderContainer, {
        backgroundColor: Colors.backgroundColor
      } ]}>

        <View style={styles.mainContentContainer}>
          <TouchableOpacity
            style={{
              height: '100%', justifyContent: 'center', alignItems: 'center', flex: 0
            }}
            hitSlop={{
              top: 20, left: 20, bottom: 20, right: 20
            }}
            onPress={onBackPressed}
          >
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
            />
          </TouchableOpacity>

          {/* <Text style={styles.titleText}>
            {title}
          </Text> */}

          <View style={styles.currencyKindToggleContainer}>
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
                ( exchangeRates && exchangeRates[ currencyCode ] )
                  ? dispatch( currencyKindSet(
                    prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
                  ) )
                  : showNoExchangeRateBottomSheet()
              }}
              isOn={prefersBitcoin}
              disabled={exchangeRates && exchangeRates[ currencyCode ] ? false : true}
            />
          </View>
        </View>
      </View>
    </View>
  )
}


const styles = StyleSheet.create( {
  mainContentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  titleText: {
    ...ScreenHeaderStyles.smallHeaderTitleText,
    flex: 1,

  },

  currencyKindToggleContainer: {
    flex: 0,
  },
} )

export default AccountDetailsNavHeader
