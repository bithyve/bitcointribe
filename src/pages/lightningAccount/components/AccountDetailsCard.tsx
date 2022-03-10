import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
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
import Icon from '../../../assets/images/svgs/onchain_icon.svg'
import LightningIcon from '../../../assets/images/svgs/ligntning_icon.svg'

const windowHeight = Dimensions.get( 'window' ).height

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { inject, observer } from 'mobx-react'
export type Props = {
  accountShell: AccountShell;
  onKnowMorePressed: () => void;
  onSettingsPressed: () => void;
  onPressOut: () => void;
  navigation: any;
  balance: string;
  mode: Mode;
  background:boolean
};

const getCardHeight = () => {
  if( windowHeight >= 850 ){
    return 18
  }else if( windowHeight >= 750 ){
    return 20
  }else if( windowHeight >= 650 ){
    return 22
  } else if( windowHeight >= 550 ){
    return 24
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

const AccountDetailsCard : React.FC<Props> = inject(
  'NodeInfoStore',
  'InvoicesStore', )( observer( ( {
  NodeInfoStore,
  accountShell,
  onKnowMorePressed,
  onSettingsPressed,
  onPressOut,
  navigation,
  balance,
  mode,
  background
} ) => {

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

  const ChainType = () => {
    if( Object.keys( NodeInfoStore.nodeInfo ).length === 0 ) {
      return <View />
    }
    return (
      <View style={styles.containerType}>
        <Text style={styles.textChainType}>{getChainType()}</Text>
      </View>
    )
  }

  const getChainType = () => {
    if( NodeInfoStore.nodeInfo.testnet ) {
      return 'TESTNET'
    } if( NodeInfoStore.nodeInfo.regtest ) {
      return 'REGTEST'
    }
    return 'MAINNET'
  }

  const AccountKindDetailsSection: React.FC = () => {
    return (
      <View style={styles.accountKindDetailsSection}>
        <View style={{
          marginLeft: 'auto',
          marginTop: hp( 1 ),

        }}>
          <SettingsButton />
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 4,
        }}>
          {
            mode === Mode.LIGHTNING ?
              <LightningIcon/>:<Icon/>
          }
          <View style={{
            marginLeft:12
          }}>
            <View style={{
              flexDirection:'row',
              alignItems: 'center'
            }}>
              <Text style={styles.title1Text}>
                {
                  mode === Mode.LIGHTNING ?
                    'Lightning bitcoin':
                    'On-Chain bitcoin'
                }
              </Text>
              <ChainType />
            </View>
            <Text style={styles.transactionsText} >For direct layer 1 transactions</Text>
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
            {''}
          </Text>
        </View>
        {/* <KnowMoreButton /> */}
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
        onPress={()=>{
          onSettingsPressed()
        }}
      >
        <Image
          source={require( '../../../assets/images/icons/icon_settings.png' )}
          style={styles.settingsButtonImage}
        />
      </TouchableOpacity>
    )
  }


  return (
    <TouchableOpacity activeOpacity={1.0} onPressOut={onPressOut}>
      <ImageBackground
      //activeOpacity={0.7}
        source={
          mode === Mode.LIGHTNING ?
            require( '../../../assets/images/carouselImages/bg-ln-card.png' ) :
            require( '../../../assets/images/carouselImages/bg-onchain-card.png' )
        }
        //onPressOut={onPressOut}
        style={{
          height: hp(  getCardHeight() )
        }}
        imageStyle={[ styles.cardImageContainer, {
          backgroundColor: shadowColorForAccountKind( mode )
        } ]}>
        <View style={styles.mainContentContainer}>
          <AccountKindDetailsSection />
          <FooterSection />
        </View>
      </ImageBackground>
    </TouchableOpacity>
  )
} ) )

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
    fontSize: RFValue( 20 ),
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

  textChainType: {
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 12 ),
    color: Colors.mango,
  },

  containerType: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 5
  },
  transactionsText:{
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
    color: Colors.white,
    fontWeight:'400',
    marginTop: hp( 0.3 )
  }
} )

export default withNavigation( AccountDetailsCard )

