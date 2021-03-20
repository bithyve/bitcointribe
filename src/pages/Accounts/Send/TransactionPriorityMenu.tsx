import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { View, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import HeadingStyles from '../../../common/Styles/HeadingStyles'
import TransactionPriority from '../../../common/data/enums/TransactionPriority'
import RadioButton from '../../../components/RadioButton'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import useTransactionFeeInfoForSending from '../../../utils/hooks/state-selectors/sending/UseTransactionFeeInfoForSending'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import CustomPriorityContent from '../../../components/CustomPriorityContent'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import { timeConvertNear30 } from '../../../common/utilities'
import SubAccountDescribing from '../../../common/data/models/SubAccountInfo/Interfaces'
import NetworkKind from '../../../common/data/enums/NetworkKind'
import SourceAccountKind from '../../../common/data/enums/SourceAccountKind'
import config from '../../../bitcoin/HexaConfig'
import { calculateCustomFee } from '../../../store/actions/sending'
import useAvailableTransactionPriorities from '../../../utils/hooks/sending-utils/UseAvailableTransactionPriorities'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import { Satoshis } from '../../../common/data/typealiases/UnitAliases'

export type Props = {
  sourceSubAccount: SubAccountDescribing;
  bitcoinDisplayUnit: BitcoinUnit;
  onTransactionPriorityChanged: ( priority: TransactionPriority ) => void;
};

const TransactionPriorityMenu: React.FC<Props> = ( {
  sourceSubAccount,
  bitcoinDisplayUnit,
  onTransactionPriorityChanged,
}: Props ) => {
  const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal()
  const [ transactionPriority, setTransactionPriority ] = useState( TransactionPriority.LOW )
  const availableTransactionPriorities = useAvailableTransactionPriorities()
  const [ transactionPriorities, setTransactionPriorities ] = useState( availableTransactionPriorities )
  const transactionFeeInfo = useTransactionFeeInfoForSending()
  const dispatch = useDispatch()
  const sendingState = useSendingState()

  const network = useMemo( () => {
    return config.APP_STAGE === 'dev' ||
      sourceSubAccount.sourceKind === SourceAccountKind.TEST_ACCOUNT
      ? NetworkKind.TESTNET : NetworkKind.MAINNET
  }, [ sourceSubAccount.sourceKind, config ] )

  const formattedUnitText = useMemo( () => {
    return bitcoinDisplayUnit === BitcoinUnit.SATS ? 'Sats' : 'T-Sats'
  }, [ bitcoinDisplayUnit ] )

  const showCustomPriorityBottomSheet = useCallback( () => {
    presentBottomSheet(
      <CustomPriorityContent
        title={'Custom Priority'}
        info={'Enter the fee rate in sats per byte.'}
        network={network}
        okButtonText={'Confirm'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={( amount, customEstimatedBlock ) => {
          Keyboard.dismiss()
          dismissBottomSheet()
          handleCustomFee( amount, customEstimatedBlock )
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


  const handleCustomFee = ( feePerByte, customEstimatedBlocks ) => {
    dispatch( calculateCustomFee( {
      accountShellID: sourceSubAccount.accountShellID,
      feePerByte,
      customEstimatedBlocks,
    } ) )
  }

  const setCustomTransactionPriority = () => {
    const { customPriorityST1 } = sendingState
    const txPriorites = availableTransactionPriorities
    if( customPriorityST1.hasFailed ) {
      setTransactionPriorities( txPriorites )
      setTransactionPriority( TransactionPriority.LOW )
      onTransactionPriorityChanged( TransactionPriority.LOW )
    } else if ( customPriorityST1.isSuccessful ) {
      setTransactionPriorities( [ ...txPriorites, TransactionPriority.CUSTOM ] )
      setTransactionPriority( TransactionPriority.CUSTOM )
      onTransactionPriorityChanged( TransactionPriority.CUSTOM )
    }
  }

  useEffect( ()=>{
    setCustomTransactionPriority()
  }, [ sendingState.customPriorityST1 ] )


  return (
    <View style={styles.rootContainer}>
      <Text style={{
        ...HeadingStyles.listSectionHeading,
        paddingHorizontal: 24,
        marginBottom: 14,
      }}>
        Transaction Priority
      </Text>

      <View style={{
        paddingHorizontal: 16
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 10,
        }}>
          <Text style={styles.headingLabelText}>Priority</Text>
          <Text style={styles.headingLabelText}>Arrival Time</Text>
          <Text style={styles.headingLabelText}>Fee</Text>
        </View>

        {transactionPriorities.map( priority => {
          return (
            <View style={styles.priorityRowContainer} key={priority}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: heightPercentageToDP( '2%' ),
                flex: 1,
              }}>
                <RadioButton
                  size={20}
                  color={Colors.lightBlue}
                  borderColor={Colors.borderColor}
                  isChecked={transactionPriority == priority}
                  onpress={() => {
                    setTransactionPriority( priority )
                    onTransactionPriorityChanged( priority )
                  }}
                />
                <Text style={{
                  ...styles.priorityTableText,
                  marginLeft: 12,
                }}>
                  {String( priority )}
                </Text>
              </View>

              <Text style={{
                ...styles.priorityTableText,
                flex: 1,
              }}>
                ~
                {timeConvertNear30(
                  ( transactionFeeInfo[ priority ].estimatedBlocksBeforeConfirmation + 1 )
                  * 10
                )}
              </Text>

              <Text style={{
                ...styles.priorityTableText,
                flex: 1,
              }}>
                {transactionFeeInfo[ priority ].amount} {formattedUnitText}
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
    paddingBottom: heightPercentageToDP( '2%' ),
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
  },

  headingLabelText: {
    fontSize: RFValue( 9 ),
    fontWeight: '700',
    flex: 1,
    textAlign: 'center'
  }
} )

export default TransactionPriorityMenu
