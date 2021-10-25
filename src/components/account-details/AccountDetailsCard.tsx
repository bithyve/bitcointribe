import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ImageSourcePropType,
  AppState,
} from 'react-native'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import LabeledBalanceDisplay from '../LabeledBalanceDisplay'
import { Button } from 'react-native-elements'
import { TouchableOpacity } from 'react-native-gesture-handler'
import AccountShell from '../../common/data/models/AccountShell'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import { subAccountSettingsUpdateCompleted } from '../../store/actions/accounts'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import { AccountType } from '../../bitcoin/utilities/Interface'
import { useSelector } from 'react-redux'
import ModalContainer from '../home/ModalContainer'
import BottomSheetSwanInfo from '../bottom-sheets/swan/BottomSheetSwanInfo'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import { useDispatch } from 'react-redux'
import { clearSwanCache, isSwanVisited, updateSwanStatus } from '../../store/actions/SwanIntegration'
import { withNavigation } from 'react-navigation'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import { translations } from '../../common/content/LocContext'

export type Props = {
  accountShell: AccountShell;
  onKnowMorePressed: () => void;
  onSettingsPressed: () => void;
  swanDeepLinkContent: string | null;
  navigation: any
};

function backgroundImageForAccountKind(
  primarySubAccount: SubAccountDescribing,
): ImageSourcePropType {
  switch ( primarySubAccount.kind ) {
      case SubAccountKind.TEST_ACCOUNT:
        return require( '../../assets/images/carouselImages/test_account_background.png' )
      case SubAccountKind.REGULAR_ACCOUNT:
        return require( '../../assets/images/carouselImages/regular_account_background.png' )
      case SubAccountKind.SECURE_ACCOUNT:
        return require( '../../assets/images/carouselImages/savings_account_background.png' )
      case SubAccountKind.DONATION_ACCOUNT:
        return require( '../../assets/images/carouselImages/donation_account_background.png' )
      case SubAccountKind.SERVICE:
        switch( ( primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind ) {
            case ServiceAccountKind.WYRE:
              return require( '../../assets/images/carouselImages/wyre_account_background.png' )
            case( ServiceAccountKind.RAMP ):
              return require( '../../assets/images/carouselImages/ramp_account_background.png' )
            case( ServiceAccountKind.SWAN ):
              return require( '../../assets/images/carouselImages/swan_account_background.png' )
        }
      default:
        return require( '../../assets/images/carouselImages/savings_account_background.png' )
  }
}

function shadowColorForAccountKind( primarySubAccount: SubAccountDescribing ): string {
  switch ( primarySubAccount.kind ) {
      case SubAccountKind.TEST_ACCOUNT:
        return Colors.blue
      case SubAccountKind.REGULAR_ACCOUNT:
        return Colors.yellow
      case SubAccountKind.SECURE_ACCOUNT:
        return Colors.green
      case SubAccountKind.DONATION_ACCOUNT:
        return Colors.kashmirBlue
      case SubAccountKind.SERVICE:
        switch( ( primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind ){
            case ( ServiceAccountKind.WYRE ):
              return Colors.danube
            case ( ServiceAccountKind.RAMP ):
              return Colors.riptide
            case ( ServiceAccountKind.SWAN ):
              return Colors.kashmirBlue
        }
      default:
        return Colors.kashmirBlue
  }
}

const AccountDetailsCard: React.FC<Props> = ( {
  accountShell,
  onKnowMorePressed,
  onSettingsPressed,
  swanDeepLinkContent,
  navigation
}: Props ) => {
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const [ swanModal, showSwanModal ] = useState( false )
  const dispatch = useDispatch()
  const isVisited = useSelector( ( state ) => state.swanIntegration.isVisited )
  const isTestAccount = useMemo( () => {
    return accountShell.primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT
  }, [ accountShell.primarySubAccount.kind ] )
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]

  useEffect( () => {
    AppState.addEventListener(
      'change',
      onAppStateChange
    )
    return () => AppState.removeEventListener( 'change', onAppStateChange )
  }, [] )

  const  onAppStateChange = ( state ) => {
    if( state === 'active' && ( primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind === ServiceAccountKind.SWAN ) {
      navigation.pop()
      // showSwanModal( false )
    }
  }
  useEffect( () => {
    if (
      !primarySubAccount.isUsable &&
        primarySubAccount.kind === SubAccountKind.SERVICE &&
      ( primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind === ServiceAccountKind.SWAN
    ) {
      dispatch( clearSwanCache() )
      dispatch( updateSwanStatus( SwanAccountCreationStatus.BUY_MENU_CLICKED ) )
      // else {
      //   dispatch( updateSwanStatus( SwanAccountCreationStatus.ACCOUNT_CREATED ) )
      // }
      setTimeout( () => {
        showSwanModal( true )
      }, 600 )

    }
  }, [] )

  const rootContainerStyle = useMemo( () => {
    return {
      ...styles.rootContainer,
      shadowColor: shadowColorForAccountKind( primarySubAccount ),
    }
  }, [ primarySubAccount ] )


  const AccountKindDetailsSection: React.FC = () => {
    return (
      <View style={styles.accountKindDetailsSection}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}>
          <View style={styles.accountKindBadgeImage} >
            {getAvatarForSubAccount( primarySubAccount, false, false, true )}
          </View>
          <View style={{
            marginLeft: 'auto'
          }}>
            <SettingsButton />
          </View>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <Text style={styles.title1Text}>
            {primarySubAccount.customDisplayName ||
              primarySubAccount.defaultTitle}
          </Text>
          {primarySubAccount.isTFAEnabled && (
            <Text style={styles.title1Text}>2FA</Text>
          )}
        </View>

        <Text
          style={styles.title2Text}
          numberOfLines={2}
          ellipsizeMode={'tail'}
        >
          {primarySubAccount.customDescription ||
              primarySubAccount.defaultDescription}
        </Text>
      </View>
    )
  }

  const FooterSection: React.FC = () => {
    return (
      <View style={styles.footerSection}>
        <LabeledBalanceDisplay
          balance={AccountShell.getTotalBalance( accountShell )}
          bitcoinUnit={accountShell.unit}
          amountTextStyle={styles.balanceAmountText}
          unitTextStyle={styles.balanceUnitText}
          currencyImageStyle={styles.balanceCurrencyIcon}
          bitcoinIconColor="light"
          textColor={Colors.white}
          isTestAccount={isTestAccount}
        />
        { accountShell.primarySubAccount.type !== AccountType.SWAN_ACCOUNT &&
        <KnowMoreButton />
        }
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
          source={require( '../../assets/images/icons/icon_settings.png' )}
          style={styles.settingsButtonImage}
        />
      </TouchableOpacity>
    )
  }


  return (
    <View style={rootContainerStyle}>
      {swanModal &&
      <ModalContainer visible={swanModal} closeBottomSheet={() => {}} >
        <BottomSheetSwanInfo
          swanDeepLinkContent={swanDeepLinkContent}
          onClickSetting={() => {
            showSwanModal( false )
          }}
          onPress={() => {
            if ( !isVisited ) {
              dispatch( isSwanVisited() )
            }
            showSwanModal( false )
            navigation.pop()
          }}
        />
      </ModalContainer>
      }
      <ImageBackground
        source={backgroundImageForAccountKind( primarySubAccount )}
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
  )
}

const cardBorderRadius = 15

const styles = StyleSheet.create( {
  rootContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: 440 * 0.7,
    minHeight: 210,
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

export {
  shadowColorForAccountKind
}
