import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useMemo, useState } from 'react'
import {
  AppState,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { Button } from 'react-native-elements'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import BWDetailsIcon from '../../assets/images/svgs/bwdetailsIcon.svg'
import { AccountType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import { translations } from '../../common/content/LocContext'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import AccountShell from '../../common/data/models/AccountShell'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import SubAccountDescribing from '../../common/data/models/SubAccountInfo/Interfaces'
import { clearSwanCache, isSwanVisited, updateSwanStatus } from '../../store/actions/SwanIntegration'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import LabeledBalanceDisplay from '../LabeledBalanceDisplay'
import BottomSheetSwanInfo from '../bottom-sheets/swan/BottomSheetSwanInfo'
import ModalContainer from '../home/ModalContainer'

export type Props = {
  accountShell: AccountShell;
  onKnowMorePressed: () => void;
  onSettingsPressed: () => void;
  swanDeepLinkContent: string | null;
};


function shadowColorForAccountKind(
  primarySubAccount: SubAccountDescribing
): string {
  switch ( primarySubAccount.kind ) {
      case SubAccountKind.TEST_ACCOUNT:
        return Colors.testAccCard
      case SubAccountKind.REGULAR_ACCOUNT:
        return Colors.checkingAccCard
      case SubAccountKind.SECURE_ACCOUNT:
        return Colors.green
      case SubAccountKind.DONATION_ACCOUNT:
        return Colors.kashmirBlue
      case SubAccountKind.BORDER_WALLET:
        return Colors.mango
      case SubAccountKind.SERVICE:
        switch (
          ( primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind
        ) {
            case ServiceAccountKind.WYRE:
              return Colors.danube
            case ServiceAccountKind.RAMP:
              return Colors.riptide
            case ServiceAccountKind.SWAN:
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
  swanDeepLinkContent
}: Props ) => {
  const navigation: any = useNavigation()
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const [ swanModal, showSwanModal ] = useState( false )
  const dispatch = useDispatch()
  const isVisited = useSelector( ( state ) => state.swanIntegration.isVisited )
  const isTestAccount = useMemo( () => {
    return accountShell.primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT
  }, [ accountShell.primarySubAccount.kind ] )
  const strings = translations[ 'accounts' ]
  const common = translations[ 'common' ]

  useEffect( () => {
    const subscription = AppState.addEventListener( 'change', onAppStateChange )
    return () => subscription.remove()
  }, [] )

  const onAppStateChange = ( state ) => {
    if (
      state === 'active' &&
      ( primarySubAccount as ExternalServiceSubAccountInfo )
        .serviceAccountKind === ServiceAccountKind.SWAN
    ) {
      navigation.pop()
      // showSwanModal( false )
    }
  }
  useEffect( () => {
    if (
      !primarySubAccount.isUsable &&
      primarySubAccount.kind === SubAccountKind.SERVICE &&
      ( primarySubAccount as ExternalServiceSubAccountInfo )
        .serviceAccountKind === ServiceAccountKind.SWAN
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
      shadowColor: primarySubAccount.type === AccountType.BORDER_WALLET ? Colors.mango: shadowColorForAccountKind( primarySubAccount ),
    }
  }, [ primarySubAccount ] )

  const isBorderWallet = primarySubAccount.type === AccountType.BORDER_WALLET
  const AccountKindDetailsSection: React.FC = () => {
    return (
      <View style={styles.accountKindDetailsSection}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            // marginBottom: 4,
          }}
        >
          <View style={styles.accountKindBadgeImage}>
            { accountShell.primarySubAccount.type === AccountType.BORDER_WALLET?
              <BWDetailsIcon/>
              :getAvatarForSubAccount(
                primarySubAccount,
                false,
                false,
                true,
                isBorderWallet
              )}
          </View>
          <View
            style={{
              marginLeft: 'auto',
            }}
          >
            <SettingsButton />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
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
        {accountShell.primarySubAccount.type !== AccountType.SWAN_ACCOUNT &&
          <KnowMoreButton />}
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
          style={[
            styles.settingsButtonImage,
            {
              tintColor: Colors.white,
            },
          ]}
        />
      </TouchableOpacity>
    )
  }

  return (
    <View style={rootContainerStyle}>
      {swanModal && (
        <ModalContainer
          onBackground={() => {
            showSwanModal( false )
            setTimeout( () => {
              showSwanModal( true )
            }, 200 )
          }}
          visible={swanModal}
          closeBottomSheet={() => {}}
        >
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
      )}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor:
            accountShell.primarySubAccount.type === AccountType.BORDER_WALLET
              ? Colors.bwBackground
              : shadowColorForAccountKind( primarySubAccount ),
          borderRadius: 15,
        }}
      ></View>
      <View style={styles.mainContentContainer}>
        <AccountKindDetailsSection />
        <FooterSection />
      </View>
    </View>
  )
}

const cardBorderRadius = 15

const styles = StyleSheet.create( {
  rootContainer: {
    width: '100%',
    borderRadius: cardBorderRadius,
    elevation: 5,
    shadowOpacity: 0.62,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 10,
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
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 15 ),
    color: Colors.white,
    letterSpacing: 0.01,
  },

  title2Text: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
    color: Colors.white,
    marginTop: 1,
  },

  footerSection: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  balanceAmountText: {
    fontFamily: Fonts.Regular,
    fontSize: 21,
  },

  balanceUnitText: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
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

export default AccountDetailsCard

export { shadowColorForAccountKind }
