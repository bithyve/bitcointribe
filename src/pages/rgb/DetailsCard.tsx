import { TouchableOpacity } from '@gorhom/bottom-sheet'
import React, { useMemo } from 'react'
import {
  StyleSheet,
  Text,
  View
} from 'react-native'
import { Button } from 'react-native-elements'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import useFormattedAmountText from 'src/utils/hooks/formatting/UseFormattedAmountText'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'
import { wp } from '../../common/data/responsiveness/responsive'
import Fonts from '../../common/Fonts'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import LabeledBalanceDisplay from '../../components/LabeledBalanceDisplay'

export type Props = {
  onKnowMorePressed: () => void;
  onSettingsPressed: () => void;
  balance: number;
  title: string;
  description: string;
  cardColor: string;
  showKnowMore: boolean;
  knowMoreText?: string;
  renderIcon: () => React.ReactNode;
  isBitcoin: boolean;
  assetId?: string
};

const AccountDetailsCard: React.FC<Props> = ( {
  onKnowMorePressed,
  balance,
  title,
  description,
  cardColor,
  showKnowMore,
  knowMoreText,
  renderIcon,
  isBitcoin,
  assetId
}: Props ) => {

  const common  = translations[ 'common' ]

  const rootContainerStyle = useMemo( () => {
    return {
      ...styles.rootContainer,
      shadowColor: cardColor,
      minHeight: 170
    }
  }, [  ] )

  const AccountKindDetailsSection: React.FC = () => {
    return (
      <View style={styles.accountKindDetailsSection}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          // marginBottom: 4,
        }}>
          <View style={styles.accountKindBadgeImage} >
            {renderIcon()}
          </View>
          <View style={{
            flex: 1
          }}>
            {/* <SettingsButton /> */}
            {
              assetId && (
                <TouchableOpacity activeOpacity={0.6}>
                  <Text style={styles.title}>ASSET ID</Text>
                  <Text numberOfLines={1} ellipsizeMode="middle" style={[ styles.title1Text ]}>{assetId}</Text>
                </TouchableOpacity>
              )
            }

          </View>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}>
          <Text style={styles.title1Text}>
            {title}
          </Text>
        </View>

        <Text
          style={styles.title2Text}
          numberOfLines={2}
          ellipsizeMode={'tail'}
        >
          {description}
        </Text>
      </View>
    )
  }

  const FooterSection: React.FC = () => {
    return (
      <View style={styles.footerSection}>
        {
          isBitcoin ?
            <LabeledBalanceDisplay
              balance={balance}
              amountTextStyle={styles.balanceAmountText}
              unitTextStyle={styles.balanceUnitText}
              currencyImageStyle={styles.balanceCurrencyIcon}
              bitcoinIconColor="light"
              textColor={Colors.white}
              isTestAccount={false}
            />:
            <Text style={styles.amountText}>{useFormattedAmountText(balance)}</Text>
        }

        {
          showKnowMore && ( <KnowMoreButton knowMoreText={knowMoreText} /> )
        }
      </View>
    )
  }

  const KnowMoreButton: React.FC<{knowMoreText: string}> = ( props ) => {
    return (
      <Button
        title={ props.knowMoreText ?? common.knowMore}
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

  return (
    <View style={rootContainerStyle}>
      <View style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: cardColor,
        borderRadius: 15
      }}></View>
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
      width: 0, height: 10
    },
    position: 'relative',
  },
  amountText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 15 ),
    marginRight: wp( 1 ),
    color: Colors.white
    // alignItems: 'baseline',
    // width:wp( 25 )
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
  title: {
    fontFamily: Fonts.SemiBold,
    fontSize: RFValue( 9 ),
    color: Colors.white,
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
    letterSpacing: 0.01,
    marginBottom: 10
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

