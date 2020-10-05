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
import AccountBalanceDisplay from '../accounts/AccountBalanceDisplay';


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
  const accountsState = useAccountsState();

  const balanceTextStyle = useMemo(() => {
    const color = accountsState.accountsSynched ? Colors.black : Colors.textColorGrey;

    return { color };
  }, [accountsState.accountsSynced]);


  return (
    <View style={styles.bodyContainer}>
      <Text style={styles.titleText} numberOfLines={2}>
        {accountPayload.customDisplayName ?? accountPayload.defaultTitle}
      </Text>

      <Text style={styles.subtitleText} numberOfLines={3}>
        {accountPayload.customDescription ?? accountPayload.defaultDescription}
      </Text>

      {isBalanceLoading && (
        <LoadingBalanceView />
      ) || (
        <AccountBalanceDisplay
          accountPayload={accountPayload}
          containerStyle={styles.balanceRow}
          amountTextStyle={balanceTextStyle}
        />
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
