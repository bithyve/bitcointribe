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
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'
import { TxPriority } from '../../../bitcoin/utilities/Interface'
import AccountShell from '../../../common/data/models/AccountShell'
import ModalContainer from '../../../components/home/ModalContainer'

export type Props = {
  accountShell: AccountShell;
  bitcoinDisplayUnit: BitcoinUnit;
  onTransactionPriorityChanged: ( priority: TxPriority ) => void;
  showInsights:()=>void;
};

const TransactionPriorityMenu: React.FC<Props> = ( {
  accountShell,
  bitcoinDisplayUnit,
  onTransactionPriorityChanged,
  showInsights
}: Props ) => {
  const { present: presentBottomSheet, dismiss: dismissBottomSheet } = useBottomSheetModal()
  const [ transactionPriority, setTransactionPriority ] = useState( TxPriority.LOW )
  const [ customPriorityModel, showCustomPriorityModel ] = useState( false )
  const availableTransactionPriorities = useAvailableTransactionPriorities()
  const [ transactionPriorities, setTransactionPriorities ] = useState( availableTransactionPriorities )
  const transactionFeeInfo = useTransactionFeeInfoForSending()
  const dispatch = useDispatch()
  const sendingState = useSendingState()

  const network = useMemo( () => {
    return config.APP_STAGE === 'dev' ||
    accountShell.primarySubAccount.sourceKind === SourceAccountKind.TEST_ACCOUNT
      ? NetworkKind.TESTNET : NetworkKind.MAINNET
  }, [ accountShell.primarySubAccount.sourceKind, config ] )

  const TextValue = ( { amt, unit } ) => {
    return (
      <Text style={{
        ...styles.priorityTableText,
        flex: 1,
      }}>{`${useFormattedAmountText( amt )} ${useFormattedUnitText( unit )}`}</Text>
    )
  }

  const showCustomPriorityBottomSheet = useCallback( () => {
    return(
      <CustomPriorityContent
        title={'Custom Priority'}
        info={'Enter the fee rate in sats per byte.'}
        network={network}
        okButtonText={'Confirm'}
        cancelButtonText={'Back'}
        isCancel={true}
        onPressOk={( amount, customEstimatedBlock ) => {
          Keyboard.dismiss()
          showCustomPriorityModel( false )
          handleCustomFee( amount, customEstimatedBlock )
        }}
        onPressCancel={() => {
          Keyboard.dismiss()
          showCustomPriorityModel( false )
        }}
      />
    )
  }, [ presentBottomSheet, dismissBottomSheet ] )


  const handleCustomFee = ( feePerByte, customEstimatedBlocks ) => {
    dispatch( calculateCustomFee( {
      accountShell: accountShell,
      feePerByte,
      customEstimatedBlocks,
    } ) )
  }

  const setCustomTransactionPriority = () => {
    const { customPriorityST1 } = sendingState
    const txPriorites = availableTransactionPriorities
    if( customPriorityST1.hasFailed ) {
      setTransactionPriorities( txPriorites )
      setTransactionPriority( TxPriority.LOW )
      onTransactionPriorityChanged( TxPriority.LOW )
    } else if ( customPriorityST1.isSuccessful ) {
      setTransactionPriorities( [ ...txPriorites, TxPriority.CUSTOM ] )
      setTransactionPriority( TxPriority.CUSTOM )
      onTransactionPriorityChanged( TxPriority.CUSTOM )
      dismissBottomSheet()
    }
  }

  useEffect( ()=>{
    setCustomTransactionPriority()
  }, [ sendingState.customPriorityST1 ] )


  return (
    <View style={styles.rootContainer}>
      <View style={styles.rowContainer}>
      <Text style={{
        ...HeadingStyles.listSectionHeading,
        paddingHorizontal: 24,
        marginBottom: 14,
      }}>
        Transaction Priority
      </Text>
      <View style={styles.divider}/>
      <Text style={{
        ...HeadingStyles.listSectionHeading,
        paddingHorizontal: 24,
        marginBottom: 14,
      }}
      onPress={showInsights}
      >
        Show Insight
      </Text>
      </View>

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
            <TouchableOpacity
              style={styles.priorityRowContainer}
              key={priority}
              onPress={() => {
                setTransactionPriority( priority )
                onTransactionPriorityChanged( priority )
              }}>
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
                  {String( priority.toUpperCase() )}
                </Text>
              </View>

              <Text style={{
                ...styles.priorityTableText,
              }}>
                ~
                {timeConvertNear30(
                  ( transactionFeeInfo[ priority.toUpperCase() ].estimatedBlocksBeforeConfirmation + 1 )
                  * 10
                )}
              </Text>
              <TextValue amt={transactionFeeInfo[ priority.toUpperCase() ].amount} unit={{
                bitcoinUnit: bitcoinDisplayUnit,
              }}/>
              {/* <Text style={{
                ...styles.priorityTableText,
                flex: 1,
              }}>
                {useFormattedAmountText( transactionFeeInfo[ priority ].amount )} {useFormattedUnitText( {
                  bitcoinUnit: BitcoinUnit.SATS,
                } )}
              </Text> */}
            </TouchableOpacity>
          )
        } )}

        <TouchableOpacity
          style={styles.customPriorityGroupBox}
          onPress={() => showCustomPriorityModel( true )}
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
      <ModalContainer onBackground={()=>showCustomPriorityModel( false )} visible={customPriorityModel} closeBottomSheet={() => {}} >
        {showCustomPriorityBottomSheet()}
      </ModalContainer>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  },
  rowContainer:{
    flexDirection:'row',
    alignItems:"center",
  },
  divider:{
    flex:1
  },
  tableHeadingText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Medium,
  },
  priorityTableText: {
    fontSize: RFValue( 12 ),
    lineHeight: RFValue( 14 ),
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
    paddingHorizontal: 25,
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
    fontFamily: Fonts.Italic,
  },

  headingLabelText: {
    fontSize: RFValue( 9 ),
    fontWeight: '700',
    flex: 1,
    textAlign: 'center'
  }
} )

export default TransactionPriorityMenu
