import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import SubAccountKind from '../../common/data/enums/SubAccountKind';
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind';
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo';
import CardView from 'react-native-cardview';
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import AccountBalanceDisplay from '../accounts/AccountBalanceDisplay';
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState';
import AccountShell from '../../common/data/models/AccountShell';
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell';


export type Props = {
  accountShell: AccountShell;
  isBalanceLoading: boolean;
};

type HeaderProps = {
  accountShell: AccountShell;
};

type BodyProps = Props;


export function headerImageSourceForServiceKind(kind: ServiceAccountKind): NodeRequire {
  switch (kind) {
    case ServiceAccountKind.SWAN:
      return require('../../assets/images/icons/icon_swan.png');
    case ServiceAccountKind.FAST_BITCOINS:
      return require('../../assets/images/icons/icon_fastbitcoins_hex_dark.png');
    default:
      return require('../../assets/images/icons/icon_wallet.png');
  }
}

export function headerImageSourceForSubAccountKind(kind: SubAccountKind): NodeRequire {
  switch (kind) {
    case SubAccountKind.TEST:
      return require('../../assets/images/icons/icon_test.png');
    case SubAccountKind.REGULAR:
      return require('../../assets/images/icons/icon_regular.png');
    case SubAccountKind.SECURE:
      return require('../../assets/images/icons/icon_secureaccount.png');
    case SubAccountKind.TRUSTED_CONTACTS:
      return require('../../assets/images/icons/icon_wallet.png');
    case SubAccountKind.DONATION:
      return require('../../assets/images/icons/icon_donation_hexa.png');
    case SubAccountKind.WATCH_ONLY_IMPORTED_WALLET:
      return require('../../assets/images/icons/icon_import_watch_only_wallet.png');
    case SubAccountKind.FULLY_IMPORTED_WALLET:
      return require('../../assets/images/icons/icon_wallet.png');
    default:
      return require('../../assets/images/icons/icon_wallet.png');
  }
}

const HeaderSection: React.FC<HeaderProps> = ({
  accountShell,
}: HeaderProps) => {
  const primarySubAccount = usePrimarySubAccountForShell(accountShell);

  const cardBadgeSource: NodeRequire = useMemo(() => {
    if (primarySubAccount.kind === SubAccountKind.SERVICE) {
      return headerImageSourceForServiceKind((primarySubAccount as ExternalServiceSubAccountInfo).serviceAccountKind);
    } else {
      return headerImageSourceForSubAccountKind(primarySubAccount.kind);
    }
  }, [accountShell]);


  const secondarySubAccountBadgeIcons: NodeRequire[] = useMemo(() => {
    // TODO: Figure out the right logic for generating secondary sub-account badge images.
    return [];
  }, [accountShell])


  return (
    <View style={styles.headerSectionContainer}>
      <Image
        style={styles.headerAccountImage}
        source={cardBadgeSource}
      />

      <View style={styles.headerBadgeContainer}>
        {primarySubAccount.kind === SubAccountKind.SECURE && (
          <Text style={styles.tfaIndicatorText}>2FA</Text>
        )}

        {secondarySubAccountBadgeIcons.map(iconSource => {
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
  accountShell,
  isBalanceLoading,
}: BodyProps) => {
  const primarySubAccount = usePrimarySubAccountForShell(accountShell);
  const accountsState = useAccountsState();

  const balanceTextStyle = useMemo(() => {
    const color = accountsState.accountsSynched ? Colors.black : Colors.textColorGrey;

    return { color };
  }, [accountsState.accountsSynced]);


  return (
    <View style={styles.bodyContainer}>
      <Text style={styles.titleText} numberOfLines={2}>
        {primarySubAccount.customDisplayName ?? primarySubAccount.defaultTitle}
      </Text>

      <Text style={styles.subtitleText} numberOfLines={3}>
        {primarySubAccount.customDescription ?? primarySubAccount.defaultDescription}
      </Text>

      {isBalanceLoading && (
        <LoadingBalanceView />
      ) || (
        <AccountBalanceDisplay
          accountShell={accountShell}
          containerStyle={styles.balanceRow}
          amountTextStyle={balanceTextStyle}
        />
      )}
    </View>
  );
};


const HomeAccountsListCard: React.FC<Props> = ({
  accountShell,
  isBalanceLoading,
}: Props) => {
  return (
    <CardView cornerRadius={10} style={styles.rootContainer}>
      <HeaderSection accountShell={accountShell} />

      <BodySection
        accountShell={accountShell}
        isBalanceLoading={isBalanceLoading}
      />
    </CardView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
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
    marginTop: 10,
  },
});

export default HomeAccountsListCard;
