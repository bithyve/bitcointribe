import React from 'react'
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import { RFValue } from 'react-native-responsive-fontsize'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import useTotalSpendingAmount from '../../utils/hooks/sending-utils/UseTotalSpendingAmount'
import { heightPercentageToDP } from 'react-native-responsive-screen'

export type Props = {
  Unit
};

const {height} = Dimensions.get('window')

const SendConfirmationCurrentTotalHeader: React.FC<Props> = ( {Unit}: Props ) => {

  const totalAmount = useTotalSpendingAmount()

  const formattedAmountText = useFormattedAmountText( totalAmount )
  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: Unit,
  } )

  return (
    <View style={styles.rootContainer}>

      <View style={styles.totalAmountRow}>
        <Text style={styles.headingText}>Total Amount</Text>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <Image
            style={styles.currencyIcon}
            source={require( '../../assets/images/icons/icon_bitcoin_gray.png' )}
            resizeMode="contain"
          />
          <Text style={styles.amountText}>{formattedAmountText}</Text>
          <Text style={styles.unitText}>{formattedUnitText}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingHorizontal: 24,
    paddingVertical: height > 720 ? heightPercentageToDP( 2.5 ) : 0,
  },

  headingText: {
    color: Colors.btextColorGreylue,
    fontFamily: Fonts.Regular,
    fontSize: 12,
  },

  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  currencyIcon: {
    width: 20,
    height: 20,
  },

  amountText: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 20 ),
    marginRight: 6,
  },

  unitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
  },
} )

export default SendConfirmationCurrentTotalHeader
