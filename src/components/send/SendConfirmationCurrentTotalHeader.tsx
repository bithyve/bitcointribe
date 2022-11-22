import React from 'react'
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import { RFValue } from 'react-native-responsive-fontsize'
import useTotalSpendingAmount from '../../utils/hooks/sending-utils/UseTotalSpendingAmount'
import { hp, wp } from '../../common/data/responsiveness/responsive'

export type Props = {
  Unit
};

const { height } = Dimensions.get( 'window' )

const SendConfirmationCurrentTotalHeader: React.FC<Props> = ( { Unit }: Props ) => {

  const totalAmount = useTotalSpendingAmount()

  const formattedAmountText = useFormattedAmountText( totalAmount )
  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: Unit,
  } )

  return (
    <View style={styles.rootContainer}>

      <View style={styles.totalAmountRow}>
        <Text style={styles.headingText}>Amount</Text>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: hp( 26 )
        }}>
          <Image
            style={styles.currencyIcon}
            source={require( '../../assets/images/icons/icon_bitcoin_gray.png' )}
            resizeMode="contain"
          />
          <Text style={styles.amountText}> {formattedAmountText}</Text>
          <Text style={styles.unitText}>{formattedUnitText}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingHorizontal: 24,
    paddingTop: hp( 29 ),
    paddingBottom: hp( 53 )
  },

  headingText: {
    color: '#041513',
    fontFamily: Fonts.RobotoSlabRegular,
    fontSize: RFValue( 12 ),
    lineHeight: RFValue( 11 ),
    letterSpacing: RFValue( 0.24 )
  },

  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  currencyIcon: {
    width: wp( 8 ),
    height: hp( 11 ),
    alignSelf: 'flex-end'
  },

  amountText: {
    fontFamily: Fonts.RobotoSlabRegular,
    fontSize: RFValue( 20 ),
    marginRight: 6,
    lineHeight: RFValue( 26 ),
  },

  unitText: {
    color: '#969696',
    fontSize: RFValue( 13 ),
    lineHeight:RFValue( 17 ),
    alignSelf: 'flex-end'
  },
} )

export default SendConfirmationCurrentTotalHeader
