import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AccountKind from '../../common/data/enums/AccountKind';
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind';
import AccountPayload from '../../common/data/models/AccountPayload/Interfaces';
import ServiceAccountPayload from '../../common/data/models/AccountPayload/ServiceAccountPayload';
import CardView from 'react-native-cardview';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import useAccountsState from '../../utils/hooks/state-selectors/UseAccountsState';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import useExchangeRates from '../../utils/hooks/state-selectors/UseExchangeRates';
import { UsNumberFormat } from '../../common/utilities';
import { displayNameForBitcoinUnit } from '../../common/data/enums/BitcoinUnit';
import { getCurrencyImageByRegion } from '../../common/CommonFunctions';
import MaterialCurrencyCodeIcon, { materialIconCurrencyCodes } from '../MaterialCurrencyCodeIcon';
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind';
import useCurrencyCode from '../../utils/hooks/state-selectors/UseCurrencyCode';
import CurrencyKind from '../../common/data/enums/CurrencyKind';


export interface Props {
  accountPayload: AccountPayload;
  isBalanceLoading: boolean;
}

interface HeaderProps {
  accountPayload: AccountPayload;
}

interface BodyProps extends Props { }


export function headerImageSourceForServiceAccount(accountPayload: ServiceAccountPayload): NodeRequire {
  const { serviceAccountKind } = accountPayload;

  switch (serviceAccountKind) {
    case ServiceAccountKind.SWAN:
      return require('../../assets/images/icons/icon_swan.png');
    case ServiceAccountKind.FAST_BITCOINS:
      return require('../../assets/images/icons/icon_fastbitcoins_hex_dark.png');
    default:
      return require('../../assets/images/icons/icon_wallet.png');
  }
}

export function headerImageSourceForAccount(accountPayload: AccountPayload): NodeRequire {
  const { kind } = accountPayload;

  switch (kind) {
    case AccountKind.TEST:
      return require('../../assets/images/icons/icon_test.png');
    case AccountKind.REGULAR:
      return require('../../assets/images/icons/icon_regular.png');
    case AccountKind.SECURE:
      return require('../../assets/images/icons/icon_secureaccount.png');
    case AccountKind.TRUSTED_CONTACTS:
      return require('../../assets/images/icons/icon_wallet.png');
    case AccountKind.DONATION:
      return require('../../assets/images/icons/icon_donation_hexa.png');
    case AccountKind.WATCH_ONLY_IMPORTED_WALLET:
      return require('../../assets/images/icons/icon_import_watch_only_wallet.png');
    case AccountKind.FULLY_IMPORTED_WALLET:
      return require('../../assets/images/icons/icon_wallet.png');
    default:
      return require('../../assets/images/icons/icon_wallet.png');
  }
}


const BalanceCurrencyIcon = ({ isUsingBitcoinUnits, fiatCurrencyCode }) => {
  if (isUsingBitcoinUnits) {
    return <Image
      style={styles.balanceCurrencyImage}
      source={require('../../assets/images/currencySymbols/icon_bitcoin_gray.png')}
    />;
  } else if (materialIconCurrencyCodes.includes(fiatCurrencyCode)) {
    return <MaterialCurrencyCodeIcon
      currencyCode={fiatCurrencyCode}
      color={Colors.lightBlue}
      size={styles.balanceCurrencyImage.width}
    />;
  } else {
    return <Image
      style={styles.balanceCurrencyImage}
      source={
        getCurrencyImageByRegion(
          fiatCurrencyCode,
          'light_blue',
        )
      }
    />;
  }
};

const HeaderSection: React.FC<HeaderProps> = ({
  accountPayload,
}: HeaderProps) => {

  const cardBadgeSource: NodeRequire = useMemo(() => {
    if (accountPayload.kind === AccountKind.SERVICE) {
      return headerImageSourceForServiceAccount(accountPayload as ServiceAccountPayload);
    } else {
      return headerImageSourceForAccount(accountPayload);
    }
  }, [accountPayload]);


  const serviceBadgeIcons: NodeRequire[] = useMemo(() => {
    if (accountPayload.kind === AccountKind.REGULAR) {
      // TODO: How do we detect if an account has an underlying service integration? (https://bithyve-workspace.slack.com/archives/CEBLWDEKH/p1601337510034800)
      return [
        // require('../../assets/images/icons/icon_fastbitcoins_light_blue.png');
      ];
    } else {
      return [];
    }
  }, [accountPayload])


  return (
    <View style={styles.headerSectionContainer}>
      <Image
        style={styles.headerAccountImage}
        source={cardBadgeSource}
      />

      <View style={styles.headerBadgeContainer}>
        {accountPayload.kind === AccountKind.SECURE && (
          <Text style={styles.tfaIndicatorText}>2FA</Text>
        )}

        {serviceBadgeIcons.map(iconSource => {
          return (
            <Image style={styles.headerBadgeIcon} source={iconSource} />
          );
        })}
      </View>
    </View>
  );
};

// TODO: Figure out when this actually gets rendered and what it's supposed
// to look like.
const LoadingBalanceView: React.FC = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: heightPercentageToDP('1%'),
      }}
    >
      <View
        style={{
          backgroundColor: Colors.backgroundColor,
          width: widthPercentageToDP('30%'),
          height: widthPercentageToDP('5%'),
          borderRadius: 8,
        }}
      />
    </View>
  );
};

const BodySection: React.FC<BodyProps> = ({
  accountPayload,
  isBalanceLoading,
}: BodyProps) => {
  const fiatCurrencyCode = useCurrencyCode();
  const currencyKind = useCurrencyKind();
  const accountsState = useAccountsState();
  const exchangeRates = useExchangeRates();

  const prefersBitcoin = useMemo(() => {
    return currencyKind === CurrencyKind.BITCOIN;
  }, [currencyKind]);

  const isUsingBitcoinUnits = useMemo(() => {
    return prefersBitcoin || accountPayload.kind === AccountKind.TEST;
  }, [prefersBitcoin, accountPayload.kind])

  const formattedBalanceText = useMemo(() => {
    const balance = accountPayload.balance || 0;

    if (isUsingBitcoinUnits) {
      return UsNumberFormat(balance);
    } else if (exchangeRates !== null) {
      return (
        (balance / 1e8) * exchangeRates[fiatCurrencyCode].last
      ).toFixed(2);
    } else {
      return `${balance}`;
    }
  }, [isUsingBitcoinUnits, accountPayload, exchangeRates]);

  const formattedUnitText = useMemo(() => {
    if (isUsingBitcoinUnits) {
      return displayNameForBitcoinUnit(accountPayload.unit);
    } else {
      return fiatCurrencyCode.toLocaleLowerCase();
    }
  }, [isUsingBitcoinUnits, accountPayload]);

  const balanceTextStyle = useMemo(() => {
    const color = accountsState.accountsSynched ? Colors.black : Colors.textColorGrey;

    return {
      ...styles.balanceAmountText,
      color,
    };
  }, [accountsState.accountsSynced]);


  return (
    <View style={styles.bodyContainer}>
      <Text style={styles.titleText} numberOfLines={2}>
        {accountPayload.customDisplayName ?? accountPayload.title}
      </Text>

      <Text style={styles.subtitleText} numberOfLines={3}>
        {accountPayload.customDescription ?? accountPayload.shortDescription}
      </Text>

      {isBalanceLoading && (
        <LoadingBalanceView />
      ) || (
          <View style={styles.balanceRow}>
            <View style={styles.currencyIconContainer}>
              <BalanceCurrencyIcon
                isUsingBitcoinUnits={isUsingBitcoinUnits}
                fiatCurrencyCode={fiatCurrencyCode}
              />
            </View>

            <Text style={balanceTextStyle}>
              {formattedBalanceText}
            </Text>

            <Text style={styles.balanceUnitText}>
              {formattedUnitText}
            </Text>
          </View>
        )}
    </View>
  );
};


const HomeAccountsListCard: React.FC<Props> = ({
  accountPayload,
  isBalanceLoading,
}: Props) => {
  return (
    <CardView cornerRadius={10} style={styles.rootContainer}>
      <HeaderSection accountPayload={accountPayload} />

      <BodySection
        accountPayload={accountPayload}
        isBalanceLoading={isBalanceLoading}
      />
    </CardView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    // margin: 0,
    width: widthPercentageToDP('42.6%'),
    height: heightPercentageToDP('20.1%'),
    borderColor: Colors.borderColor,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: Colors.white,
  },

  headerSectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  headerAccountImage: {
    width: 44,
    height: 44,
  },

  headerBadgeContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
    justifyContent: 'flex-end',
  },

  headerBadgeIcon: {
    width: 16,
    height: 16,
  },

  tfaIndicatorText: {
    marginLeft: 'auto',
    color: Colors.blue,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },

  bodyContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  titleText: {
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
    fontSize: RFValue(10),
  },

  subtitleText: {
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
  },

  balanceRow: {
    flexDirection: 'row',
    marginTop: 10,
  },

  currencyIconContainer: {
    marginRight: 5,
  },

  balanceCurrencyImage: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },

  balanceAmountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: RFValue(17),
    marginRight: 5,
    lineHeight: RFValue(17),
  },

  balanceUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    lineHeight: RFValue(17),
  },
});

export default HomeAccountsListCard;
