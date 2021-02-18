import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import TransactionPriority from '../../../common/data/enums/TransactionPriority'
import RadioButton from '../../../components/RadioButton'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP } from 'react-native-responsive-screen'

export type Props = {

};

const TransactionPriorityMenu: React.FC<Props> = ( {}: Props ) => {
  const [ transactionPriority, setTransactionPriority ] = useState( TransactionPriority.LOW )

  return (
    <View style={styles.rootContainer}>
      <Text>Transaction Priority</Text>

      <View>
        <View
          style={{
            ...styles.priorityDataContainer,
            justifyContent: 'flex-start',
          }}
        >
          <RadioButton
            size={20}
            color={Colors.lightBlue}
            borderColor={Colors.borderColor}
            isChecked={transactionPriority == TransactionPriority.LOW}
            onpress={() => setTransactionPriority( TransactionPriority.LOW )}
          />
          <Text style={styles.priorityTableText}>
            Low
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  },

  tableHeadingText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansMedium,
  },

  priorityTableText: {
    fontSize: RFValue( 12 ),
    lineHeight: RFValue( 12 ),
    color: Colors.textColorGrey,
    textAlign: 'right',
  },

  priorityTableHeadingContainer: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: heightPercentageToDP( '2%' ),
    paddingBottom: heightPercentageToDP( '1.5%' ),
  },
  priorityTableContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    marginTop: heightPercentageToDP( '1.5%' ),
    paddingBottom: heightPercentageToDP( '1.5%' ),
  },

  priorityDataContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  priorityValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
} )

export default TransactionPriorityMenu
