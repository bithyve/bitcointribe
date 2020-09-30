import React, { useMemo } from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import useActiveAccountPayload from '../../utils/hooks/state-selectors/UseActiveAccountPayload';
import AccountPayload from '../../common/data/models/AccountPayload/Interfaces';
import Colors from '../../common/Colors';
import ScreenHeaderStyles from '../../common/Styles/ScreenHeaders';
import HeadingStyles from '../../common/Styles/HeadingStyles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CurrencyKindToggleSwitch from '../CurrencyKindToggleSwitch';


export type Props = {
  accountID: string;
  onBackPressed: () => void;
};

const AccountDetailsNavHeader: React.FC<Props> = ({
  accountID,
  onBackPressed,
}: Props) => {
  const accountPayload: AccountPayload | undefined = useActiveAccountPayload(accountID);

  const title = useMemo(() => {
    return accountPayload?.customDisplayName || accountPayload?.title || 'Account Details';
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
            style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}
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

          <CurrencyKindToggleSwitch
            currencyCodeValue={CurrencyCode}
            activeOnImage={require('../../assets/images/icons/icon_bitcoin_light.png')}
            inactiveOnImage={require('../../assets/images/icons/icon_bitcoin_dark.png')}
            activeOffImage={
              this.currencyCode.includes(CurrencyCode)
                ? this.setCurrencyCodeToImage(
                  getCurrencyImageName(CurrencyCode),
                  'light',
                )
                : getCurrencyImageByRegion(CurrencyCode, 'light')
            }
            inactiveOffImage={
              this.currencyCode.includes(CurrencyCode)
                ? this.setCurrencyCodeToImage(
                  getCurrencyImageName(CurrencyCode),
                  'dark',
                )
                : getCurrencyImageByRegion(CurrencyCode, 'dark')
            }
            toggleColor={Colors.lightBlue}
            toggleCircleColor={Colors.blue}
            onpress={() => {
              this.props.currencyKindSet(
                prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
              );
            }}
            toggle={prefersBitcoin}
          />

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
    ...HeadingStyles.screenHeadingLarge,
    flex: 1,
  },
});

export default AccountDetailsNavHeader;
