import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import Colors from '../../common/Colors';
import ScreenHeaderStyles from '../../common/Styles/ScreenHeaders';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CurrencyKindToggleSwitch from '../CurrencyKindToggleSwitch';
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode';
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../MaterialCurrencyCodeIcon';
import { getCurrencyImageByRegion } from '../../common/CommonFunctions';
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind';
import CurrencyKind from '../../common/data/enums/CurrencyKind';
import { currencyKindSet } from '../../store/actions/preferences';
import useAccountShell from '../../utils/hooks/state-selectors/accounts/UseAccountShell';
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell';


export type Props = {
  accountID: string;
  onBackPressed: () => void;
};

const AccountDetailsNavHeader: React.FC<Props> = ({
  accountID,
  onBackPressed,
}: Props) => {
  const dispatch = useDispatch();
  const accountShell = useAccountShell(accountID);
  const primarySubAccountInfo = usePrimarySubAccountForShell(accountShell);

  const currencyCode = useCurrencyCode();
  const currencyKind = useCurrencyKind();

  const prefersBitcoin = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  const title = useMemo(() => {
    return primarySubAccountInfo?.customDisplayName || primarySubAccountInfo?.defaultTitle || 'Account Details';
  }, [accountID]);

  return (
    <View>
      <SafeAreaView style={{ flex: 0 }} />

      <StatusBar
        backgroundColor={Colors.backgroundColor}
        barStyle="dark-content"
      />

      <View style={ScreenHeaderStyles.smallHeaderContainer}>

        <View style={styles.mainContentContainer}>
          <TouchableOpacity
            style={{ height: '100%', justifyContent: 'center', alignItems: 'center', flex: 0 }}
            hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
            onPress={onBackPressed}
          >
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
            />
          </TouchableOpacity>

          <Text style={styles.titleText}>
            {title}
          </Text>

          <View style={styles.currencyKindToggleContainer}>
            <CurrencyKindToggleSwitch
              activeOnImage={require('../../assets/images/icons/icon_bitcoin_light.png')}
              inactiveOnImage={require('../../assets/images/icons/icon_bitcoin_dark.png')}
              activeOffImage={
                materialIconCurrencyCodes.includes(currencyCode) ?
                  <MaterialCurrencyCodeIcon
                    currencyCode={currencyCode}
                    color={Colors.white}
                    size={14}
                  />
                  : getCurrencyImageByRegion(currencyCode, 'light')
              }
              inactiveOffImage={
                materialIconCurrencyCodes.includes(currencyCode) ?
                  <MaterialCurrencyCodeIcon
                    currencyCode={currencyCode}
                    color={Colors.blue}
                    size={14}
                  />
                  : getCurrencyImageByRegion(currencyCode, 'dark')
              }
              trackColor={Colors.lightBlue}
              thumbColor={Colors.blue}
              onpress={() => {
                dispatch(currencyKindSet(
                  prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
                ));
              }}
              isOn={prefersBitcoin}
            />
          </View>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  mainContentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  titleText: {
    ...ScreenHeaderStyles.smallHeaderTitleText,
    flex: 1,

  },

  currencyKindToggleContainer: {
    flex: 0,
  },
});

export default AccountDetailsNavHeader;
