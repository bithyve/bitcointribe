import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ImageSourcePropType,
  AppState,
  Animated,
  FlatList
} from 'react-native'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import Fonts from '../../../common/Fonts'
import Colors from '../../../common/Colors'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import LabeledBalanceDisplay from '../../../components/LabeledBalanceDisplay'
import { Button } from 'react-native-elements'
import { TouchableOpacity } from 'react-native-gesture-handler'
import AccountShell from '../../../common/data/models/AccountShell'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces'
import { AccountType } from '../../../bitcoin/utilities/Interface'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { withNavigation } from 'react-navigation'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import { translations } from '../../../common/content/LocContext'
import { Mode } from '../AccountDetails'
import  BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'

export type Props = {
  accountShell: AccountShell;
  onKnowMorePressed: () => void;
  onSettingsPressed: () => void;
  onPressOut: () => void;
  navigation: any;
  balance: string;
  mode: Mode
};

function backgroundImageForAccountKind(
  primarySubAccount: SubAccountDescribing,
): ImageSourcePropType {
  switch ( primarySubAccount.kind ) {

      default:
        return require( '../../../assets/images/carouselImages/savings_account_background.png' )
  }
}

function shadowColorForAccountKind( mode ): string {
  switch ( mode ) {
      case Mode.ON_CHAIN:
        return '#F5AA97'
      case Mode.LIGHTNING:
        return '#FABA5F'
      default:
        return '#F5AA97'
  }
}

const AccountDetailsCard: React.FC<Props> = ( {
  accountShell,
  onKnowMorePressed,
  onSettingsPressed,
  onPressOut,
  navigation,
  balance,
  mode
}: Props ) => {
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const [ swanModal, showSwanModal ] = useState( false )
  const dispatch = useDispatch()
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]


  const rootContainerStyle = useMemo( () => {
    return {
      ...styles.rootContainer,
      shadowColor: shadowColorForAccountKind( mode ),
    }
  }, [ primarySubAccount ] )


  const AccountKindDetailsSection: React.FC = () => {
    return (
      <View style={styles.accountKindDetailsSection}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: 4,
        }}>
          <View>
            <Text style={styles.title1Text}>
              {
                mode === Mode.LIGHTNING ?
                  'Lightning bitcoin':
                  'On-Chain bitcoin'
              }
            </Text>
          </View>
          <View style={{
            marginLeft: 'auto'
          }}>
            <SettingsButton />
          </View>
        </View>
        {/* <View style={styles.accountKindBadgeImage} >
          {getAvatarForSubAccount( primarySubAccount, false, false, true )}
        </View> */}

      </View>
    )
  }

  const FooterSection: React.FC = () => {
    return (
      <View style={styles.footerSection}>
        <View style={{
          flex: 1
        }}>
          <LabeledBalanceDisplay
            balance={balance}
            bitcoinUnit={BitcoinUnit.SATS}
            amountTextStyle={styles.balanceAmountText}
            unitTextStyle={styles.balanceUnitText}
            currencyImageStyle={styles.balanceCurrencyIcon}
            bitcoinIconColor="light"
            textColor={Colors.white}
            isTestAccount={false}
          />
          <Text
            style={styles.title2Text}
            numberOfLines={2}
            ellipsizeMode={'tail'}
          >
            Sit exercitation non exercitation in laboris.
          </Text>
        </View>
        <KnowMoreButton />
      </View>
    )
  }

  const KnowMoreButton: React.FC = () => {
    return (
      <Button
        title={common.knowMore}
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
    )
  }

  const SettingsButton: React.FC = () => {
    return (
      <TouchableOpacity
        style={styles.settingsButtonContainer}
        onPress={onSettingsPressed}
      >
        <Image
          source={require( '../../../assets/images/icons/icon_settings.png' )}
          style={styles.settingsButtonImage}
        />
      </TouchableOpacity>
    )
  }


  return (
    <ImageBackground
      //activeOpacity={0.7}
      source={
        mode === Mode.LIGHTNING ?
          require( '../../../assets/images/carouselImages/bg-ln-card.png' ) :
          require( '../../../assets/images/carouselImages/bg-onchain-card.png' )
      }
      //onPressOut={onPressOut}
      style={{
        height: hp( '20%' )
      }}
      imageStyle={[ styles.cardImageContainer, {
        backgroundColor: shadowColorForAccountKind( mode )
      } ]}>
      <View style={styles.mainContentContainer}>
        <AccountKindDetailsSection />
        <FooterSection />
      </View>
    </ImageBackground>
  )
}

const cardBorderRadius = 15

const styles = StyleSheet.create( {
  rootContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: 440 * 0.4,
    minHeight: 150,
    borderRadius: cardBorderRadius,
    elevation: 5,
    shadowOpacity: 0.62,
    shadowRadius: 14,
    shadowOffset: {
      width: 0, height: 10
    },
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
    width: widthPercentageToDP( 16 ),
    height: widthPercentageToDP( 16 ),
    resizeMode: 'contain',
  },

  title1Text: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 15 ),
    color: Colors.white,
    letterSpacing: 0.01
  },

  title2Text: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12 ),
    color: Colors.white,
    marginTop: 2,
  },

  footerSection: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  balanceAmountText: {
    fontFamily: Fonts.OpenSans,
    fontSize: 21,
  },

  balanceUnitText: {
    fontSize: 13,
    fontFamily: Fonts.FiraSansRegular,
  },

  balanceCurrencyIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
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
} )

export default withNavigation( AccountDetailsCard )

