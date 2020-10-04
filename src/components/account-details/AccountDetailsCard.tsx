import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import AccountKind from '../../common/data/enums/AccountKind';
import AccountPayload from '../../common/data/models/AccountPayload/Interfaces';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import ButtonStyles from '../../common/Styles/Buttons';
import { RFValue } from 'react-native-responsive-fontsize';
import AccountBalanceDisplay from '../accounts/AccountBalanceDisplay';
import { Button } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { widthPercentageToDP } from 'react-native-responsive-screen';

export type Props = {
  accountPayload: AccountPayload;
  onKnowMorePressed: () => void;
  onSettingsPressed: () => void;
};


function badgeImageForAccountKind(accountKind: AccountKind): NodeRequire {
  switch (accountKind) {
    case AccountKind.TEST:
      return require('../../assets/images/icons/icon_test_white.png');
    case AccountKind.REGULAR:
      return require('../../assets/images/icons/icon_regular_account.png');
    case AccountKind.SECURE:
      return require('../../assets/images/icons/icon_secureaccount_white.png');
    case AccountKind.DONATION:
      return require('../../assets/images/icons/icon_donation_account.png');
    default:
      return require('../../assets/images/icons/accounts.png');
  }
}

function backgroundImageForAccountKind(accountKind: AccountKind): NodeRequire {
  switch (accountKind) {
    case AccountKind.TEST:
      return require('../../assets/images/carouselImages/test_account_background.png');
    case AccountKind.REGULAR:
      return require('../../assets/images/carouselImages/regular_account_background.png');
    case AccountKind.SECURE:
      return require('../../assets/images/carouselImages/savings_account_background.png');
    case AccountKind.DONATION:
      return require('../../assets/images/carouselImages/donation_account_background.png');
    default:
      return require('../../assets/images/carouselImages/savings_account_background.png');
  }
}

function shadowColorForAccountKind(accountKind: AccountKind): string {
  switch (accountKind) {
    case AccountKind.TEST:
      return Colors.blue;
    case AccountKind.REGULAR:
      return Colors.yellow;
    case AccountKind.SECURE:
      return Colors.green;
    case AccountKind.DONATION:
      return Colors.borderColor;
    default:
      return Colors.borderColor;
  }
}


const AccountDetailsCard: React.FC<Props> = ({
  accountPayload,
  onKnowMorePressed,
  onSettingsPressed,
}: Props) => {

  const rootContainerStyle = useMemo(() => {
    return {
      ...styles.rootContainer,
      shadowColor: shadowColorForAccountKind(accountPayload.kind),
    };
  }, [accountPayload.kind]);


  const AccountKindDetailsSection: React.FC = () => {
    return (
      <View style={styles.accountKindDetailsSection}>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Image
            source={badgeImageForAccountKind(accountPayload.kind)}
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
            {accountPayload.defaultTitle}
          </Text>

          <Text
            style={{
              fontFamily: Fonts.FiraSansRegular,
              fontSize: RFValue(12),
              color: Colors.white,
              marginTop: 2,
            }}
          >
            {accountPayload.defaultDescription}
          </Text>
        </View>
      </View>
    );
  }

  const FooterSection: React.FC = () => {
    return (
      <View style={styles.footerSection}>
        <AccountBalanceDisplay
          accountPayload={accountPayload}
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
        source={backgroundImageForAccountKind(accountPayload.kind)}
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

  balanceCurrencyIcon: {
    color: Colors.white,
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
