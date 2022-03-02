import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Colors from '../../../common/Colors'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import NetworkKind from '../../../common/data/enums/NetworkKind'
import Fonts from '../../../common/Fonts'
import useCurrencyCode from '../../../utils/hooks/state-selectors/UseCurrencyCode'
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind'
import { translations } from '../../../common/content/LocContext'
import {  useSelector } from 'react-redux'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import { Shadow } from 'react-native-shadow-2'

type FooterButtonProps = {
  style?: Record<string, unknown>;
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  onPress: () => void;
};

export type Props = {
  onSendPressed: () => void;
  onReceivePressed: () => void;
  averageTxFees: any;
  network: NetworkKind;
  isTestAccount: boolean;
};

const FooterButton: React.FC<FooterButtonProps> = ( {
  style = {
  },
  title,
  subtitle,
  imageSource,
  onPress,
} ) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      delayPressIn={0}
    >
      <Shadow  distance={5} startColor={Colors.shadowColor}  offset={[ 7, 5 ]} viewStyle={{
        ...styles.buttonContainer,
        ...style,
        borderWidth:0
      }}>
        <View style={styles.buttonImageContainer}>
          <Image source={imageSource} style={styles.buttonImage} />
        </View>

        <View style={styles.buttonTextContainer}>
          <Text style={styles.buttonTitleText}>{title}</Text>
          {subtitle ? <Text style={styles.buttonSubtitleText}>{subtitle}</Text> : null}
        </View>
      </Shadow>
    </TouchableOpacity>
  )
}

const SendAndReceiveButtonsFooter: React.FC<Props> = ( {
  onSendPressed,
  onReceivePressed,
  averageTxFees,
  network,
  isTestAccount
} ) => {
  const exchangeRates = useSelector(
    ( state ) => state.accounts.exchangeRates
  )

  const currencyKind = useCurrencyKind()
  const currencyCode = useCurrencyCode()
  const common  = translations[ 'common' ]
  const transactionFeeUnitPrefix = useMemo( () => {
    if ( currencyKind == CurrencyKind.FIAT ) {
      return currencyCode.toLowerCase()
    } else {
      return network == NetworkKind.MAINNET ? 'sat' : 't-sat'
    }
  }, [ network, currencyKind ] )

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  const transactionFeeUnitText = useMemo( () => {
    if ( currencyKind == CurrencyKind.FIAT ) {
      return transactionFeeUnitPrefix
    }

    const suffix = averageTxFees && averageTxFees[ network ].low.averageTxFee == 1 ? '' : 's'

    return `${transactionFeeUnitPrefix}${suffix}`
  }, [ transactionFeeUnitPrefix, averageTxFees ] )

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignSelf: 'center',
      marginBottom: heightPercentageToDP( 2 )
    }}>
      <FooterButton
        style={{
          marginRight: 8,
          height: heightPercentageToDP( 7.5 ),
        }}
        onPress={onSendPressed}
        title={common.send}
        subtitle={`Tran Fee: ~${
          averageTxFees ?
            prefersBitcoin?
              averageTxFees[ network ].low.averageTxFee :
              exchangeRates && exchangeRates[ currencyCode ]
                ? (
                  ( averageTxFees[ network ].low.averageTxFee / SATOSHIS_IN_BTC ) *
                    exchangeRates[ currencyCode ].last
                ).toFixed( 2 )
                : ''
            : 0
        } (${isTestAccount ? 't-sats' : transactionFeeUnitText})`}
        imageSource={require( '../../../assets/images/icons/icon_send_blue.png' )}
      />
      <FooterButton
        style={{
          marginRight: 8,
          height: heightPercentageToDP( 7.5 ),
        }}
        onPress={onReceivePressed}
        title={common.receive}
        subtitle={''}
        imageSource={require( '../../../assets/images/icons/icon_receive_translucent.png' )}
      />
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  buttonContainer: {
    minWidth: 150,
    width: widthPercentageToDP( 42 ),
    maxWidth: 400,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderColor: '#E3E3E3',
    borderWidth: 1,
    backgroundColor: Colors.white,
  },

  buttonImage: {
    width: 25,
    height: 25,
  },

  buttonImageContainer: {
    marginRight: 10,
  },

  buttonTextContainer: {
  },

  buttonTitleText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 15 ),
  },

  buttonSubtitleText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 9 ),
  },
} )

export default SendAndReceiveButtonsFooter
