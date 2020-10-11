import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import SubAccountKind from '../../common/data/enums/SubAccountKind';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import ButtonStyles from '../../common/Styles/Buttons';
import { RFValue } from 'react-native-responsive-fontsize';
import AccountBalanceDisplay from '../accounts/AccountBalanceDisplay';
import { Button } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AccountShell from '../../common/data/models/AccountShell';
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell';

export type Props = {
  accountShell: AccountShell;
  onKnowMorePressed: () => void;
  onSettingsPressed: () => void;
};


function badgeImageForAccountKind(accountKind: SubAccountKind): NodeRequire {
  switch (accountKind) {
    case SubAccountKind.TEST:
      return require('../../assets/images/icons/icon_test_white.png');
    case SubAccountKind.REGULAR:
      return require('../../assets/images/icons/icon_regular_account.png');
    case SubAccountKind.SECURE:
      return require('../../assets/images/icons/icon_secureaccount_white.png');
    case SubAccountKind.DONATION:
      return require('../../assets/images/icons/icon_donation_account.png');
    default:
      return require('../../assets/images/icons/accounts.png');
  }
}

function backgroundImageForAccountKind(accountKind: SubAccountKind): NodeRequire {
  switch (accountKind) {
    case SubAccountKind.TEST:
      return require('../../assets/images/carouselImages/test_account_background.png');
    case SubAccountKind.REGULAR:
      return require('../../assets/images/carouselImages/regular_account_background.png');
    case SubAccountKind.SECURE:
      return require('../../assets/images/carouselImages/savings_account_background.png');
    case SubAccountKind.DONATION:
      return require('../../assets/images/carouselImages/donation_account_background.png');
    default:
      return require('../../assets/images/carouselImages/savings_account_background.png');
  }
}

function shadowColorForAccountKind(accountKind: SubAccountKind): string {
  switch (accountKind) {
    case SubAccountKind.TEST:
      return Colors.blue;
    case SubAccountKind.REGULAR:
      return Colors.yellow;
    case SubAccountKind.SECURE:
      return Colors.green;
    case SubAccountKind.DONATION:
      return Colors.borderColor;
    default:
      return Colors.borderColor;
  }
}


const AccountDetailsCard: React.FC<Props> = ({
  accountShell,
  onKnowMorePressed,
  onSettingsPressed,
}: Props) => {
  const primarySubAccountInfo = usePrimarySubAccountForShell(accountShell);

  const rootContainerStyle = useMemo(() => {
    return {
      ...styles.rootContainer,
      shadowColor: shadowColorForAccountKind(primarySubAccountInfo?.kind),
    };
  }, [primarySubAccountInfo]);


  const AccountKindDetailsSection: React.FC = () => {
    return (
      <View style={styles.accountKindDetailsSection}>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Image
            source={primarySubAccountInfo.avatarImageSource}
            style={styles.accountKindBadgeImage}
          />

          <View style={{ marginLeft: 'auto' }}>
            <SettingsButton />
          </View>
        </View>

        <View>
          <Text
            style={{
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(15),
              color: Colors.white,
            }}
          >
            {primarySubAccountInfo.defaultTitle}
          </Text>

          <Text
            style={{
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(12),
              color: Colors.white,
              marginTop: 2,
            }}
          >
            {primarySubAccountInfo.defaultDescription}
          </Text>
        </View>
      </View>
    );
  }

  const FooterSection: React.FC = () => {
    return (
      <View style={styles.footerSection}>
        <AccountBalanceDisplay
          accountShell={accountShell}
          amountTextStyle={styles.balanceAmountText}
          unitTextStyle={styles.balanceUnitText}
          currencyImageStyle={styles.balanceCurrencyIcon}
          currencyImageSource={require('../../assets/images/icons/icon_bitcoin_light.png')}
        />

        <KnowMoreButton />
      </View>
    );
  };


  const KnowMoreButton: React.FC = () => {
    return (
      <Button
        title="Know More"
        type="outline"
        buttonStyle={{
          borderRadius: 5,
          minWidth: 44,
          paddingHorizontal: 8,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 28,
          borderColor: Colors.white,
        }}
        titleStyle={ButtonStyles.actionButtonText}
        onPress={onKnowMorePressed}
      />
    );
  };

  const SettingsButton: React.FC = () => {
    return (
      <TouchableOpacity
        style={styles.settingsButtonContainer}
        onPress={onSettingsPressed}
      >
        <Image
          source={require('../../assets/images/icons/icon_settings.png')}
          style={styles.settingsButtonImage}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={rootContainerStyle}>
      <ImageBackground
        source={backgroundImageForAccountKind(primarySubAccountInfo?.kind)}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        imageStyle={styles.cardImageContainer}
      >
        <View style={styles.mainContentContainer}>
          <AccountKindDetailsSection />
          <FooterSection />
        </View>

      </ImageBackground>
    </View>
  );
};


const cardBorderRadius = 15;

const styles = StyleSheet.create({
  rootContainer: {
    width: '100%',
    maxWidth: 440,
    height: 222,
    borderRadius: cardBorderRadius,
    elevation: 5,
    shadowOpacity: 0.62,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    position: 'relative',
  },

  mainContentContainer: {
    position: 'relative',
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },

  cardImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: cardBorderRadius,
    resizeMode: 'cover',
  },

  accountKindDetailsSection: {
    flex: 1,
    width: '100%',
  },

  accountKindBadgeImage: {
    width: 58,
    height: 58,
    resizeMode: 'contain',
  },

  footerSection: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  balanceAmountText: {
    color: Colors.white,
    fontFamily: Fonts.OpenSans,
    fontSize: 21,
  },

  balanceUnitText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.FiraSansRegular,
  },

  settingsButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },

  settingsButtonImage: {
    height: 24,
    width: 24,
  },
});

export default AccountDetailsCard;
