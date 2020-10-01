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
import useSecondarySubAccountsForShell from '../../utils/hooks/account-utils/UseSecondarySubAccountForShell';


export type Props = {
  accountShell: AccountShell;
};

type HeaderProps = Props;
type BodyProps = Props;


const HeaderSection: React.FC<HeaderProps> = ({
  accountShell,
}: HeaderProps) => {
  const primarySubAccount = usePrimarySubAccountForShell(accountShell);
  const secondarySubAccounts = useSecondarySubAccountsForShell(accountShell);

  const secondarySubAccountBadgeIcons: NodeRequire[] = useMemo(() => {
    return secondarySubAccounts.map(subAccount => subAccount.avatarImageSource);
  }, [secondarySubAccounts])

  return (
    <View style={styles.headerSectionContainer}>
      <Image
        style={styles.headerAccountImage}
        source={primarySubAccount.avatarImageSource}
      />

      <View style={styles.headerBadgeContainer}>
        {secondarySubAccountBadgeIcons.map(iconSource => {
          return (
            <Image style={styles.headerBadgeIcon} source={iconSource} />
          );
        })}

        {primarySubAccount.kind === SubAccountKind.SECURE && (
          <Text style={styles.tfaIndicatorText}>2FA</Text>
        )}
      </View>
    </View>
  );
};

const BodySection: React.FC<BodyProps> = ({
  accountShell,
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

      <AccountBalanceDisplay
        accountShell={accountShell}
        containerStyle={styles.balanceRow}
        amountTextStyle={balanceTextStyle}
      />
    </View>
  );
};


const HomeAccountsListCard: React.FC<Props> = ({
  accountShell,
}: Props) => {
  return (
    <CardView cornerRadius={10} style={styles.rootContainer}>
      <HeaderSection accountShell={accountShell} />
      <BodySection accountShell={accountShell} />
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
