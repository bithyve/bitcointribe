import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import TransactionPriority from '../../../common/data/enums/TransactionPriority'
import RadioButton from '../../../components/RadioButton'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import useTransactionFeeInfoForSending from '../../../utils/hooks/state-selectors/sending/UseTransactionFeeInfoForSending'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import CustomPriorityContent from '../CustomPriorityContent'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import { initialKnowMoreSendSheetShown } from '../../../store/actions/preferences'
import { timeConvertNear30 } from '../../../common/utilities'

export type Props = {

};

const TransactionPriorityMenu: React.FC<Props> = ( {}: Props ) => {
  const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal()
  const [ transactionPriority, setTransactionPriority ] = useState( TransactionPriority.LOW )

  const transactionFeeInfo = useTransactionFeeInfoForSending()


  const showCustomPriorityBottomSheet = useCallback( () => {
    presentBottomSheet(
      <CustomPriorityContent
        title={'Custom Priority'}
        info={'Enter the fee rate in sats per byte.'}
        // err={this.state.customFeePerByteErr}
        // network={network}
        okButtonText={'Confirm'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={( amount, customEstimatedBlock ) => {
          Keyboard.dismiss()
          dismissBottomSheet()
          // this.handleCustomFee( amount, customEstimatedBlock )
        }}
        onPressCancel={() => {
          Keyboard.dismiss()
          dismissBottomSheet()
        }}
      />,
      {
        ...defaultBottomSheetConfigs,
        snapPoints: [ 0, '44%' ],
      },
    )
  }, [ presentBottomSheet, dismissBottomSheet ] )


  return (
    <View style={styles.rootContainer}>
      <Text>Transaction Priority</Text>

      <View style={{
        paddingHorizontal: 16
      }}>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 10,
        }}>
          <Text>Priority</Text>
          <Text>Arrival Time</Text>
          <Text>Fee</Text>
        </View>

        {[ TransactionPriority.LOW, TransactionPriority.MEDIUM, TransactionPriority.HIGH ].map( priority => {
          return (
            <View style={styles.priorityRowContainer} key={priority}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
              }}>
                <RadioButton
                  size={20}
                  color={Colors.lightBlue}
                  borderColor={Colors.borderColor}
                  isChecked={transactionPriority == priority}
                  onpress={() => setTransactionPriority( priority )}
                />
                <Text style={{
                  ...styles.priorityTableText,
                  marginLeft: 12,
                }}>
                  {String( priority )}
                </Text>
              </View>

              <Text style={styles.priorityTableText}>
                ~
                {timeConvertNear30(
                  ( transactionFeeInfo[ priority ].estimatedBlocksBeforeConfirmation + 1 )
                  * 10
                )}
              </Text>

              <Text style={styles.priorityTableText}>
                0.10 $
              </Text>
            </View>
          )
        } )}

        <TouchableOpacity
          style={styles.customPriorityGroupBox}
          onPress={showCustomPriorityBottomSheet}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: heightPercentageToDP( '1.5%' ),
              paddingHorizontal: heightPercentageToDP( '1.5%' ),
            }}
          >
            <Text style={styles.customPriorityGroupBoxLabel}>
              Custom Priority
            </Text>
            <View
              style={{
                paddingHorizontal: 5,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={12}
              />
            </View>
          </View>
        </TouchableOpacity>
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

  priorityRowContainer: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1,
    paddingHorizontal: 24,
  },

  priorityValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  customPriorityGroupBox: {
    borderRadius: 8,
    marginVertical: heightPercentageToDP( '1.2%' ),
    backgroundColor: Colors.secondaryBackgroundColor,
    borderColor: Colors.backgroundColor,
    borderWidth: 2,
  },

  customPriorityGroupBoxLabel: {
    color: Colors.blue,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansItalic,
  }
} )

export default TransactionPriorityMenu
