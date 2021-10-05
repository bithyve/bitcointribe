import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import { useSelector } from 'react-redux'
import useSendingState from '../utils/hooks/state-selectors/sending/UseSendingState'

export default function CustomPriorityContent( props ) {
  const [ amount, setAmount ] = useState( '' )
  const [ customEstimatedBlock, setCustomEstimatedBlock ] = useState( 0 )
  const averageTxFees = useSelector(
    ( state ) => state.accounts.averageTxFees,
  )

  const sendingState = useSendingState()

  const customPriorityError = useMemo( () => {
    return sendingState.customPriorityST1.failedErrorMessage
  }, [ sendingState.customPriorityST1 ] )

  const onCustomFeeChange = useCallback(
    ( value ) => {
      if ( averageTxFees && averageTxFees[ props.network ].feeRates ) {
        const { feeRates } = averageTxFees[ props.network ]
        const customFeeRatePerByte = parseInt( value )
        let customEstimatedBlock = 0
        // handling extremes
        if ( customFeeRatePerByte > feeRates[ '2' ] ) {
          customEstimatedBlock = 1
        } else if ( customFeeRatePerByte < feeRates[ '144' ] ) {
          customEstimatedBlock = 200
        } else {
          const closestFeeRatePerByte = Object.values( feeRates ).reduce(
            function ( prev, curr ) {
              return Math.abs( curr - customFeeRatePerByte ) <
                Math.abs( prev - customFeeRatePerByte )
                ? curr
                : prev
            },
          )

          const etimatedBlock = Object.keys( feeRates ).find(
            ( key ) => feeRates[ key ] === closestFeeRatePerByte,
          )
          customEstimatedBlock = parseInt( etimatedBlock )
        }

        if ( parseInt( value ) >= 1 ) setCustomEstimatedBlock( customEstimatedBlock )
        else setCustomEstimatedBlock( 0 )
      }

      setAmount( value )
    },
    [ props.network, averageTxFees ],
  )

  return (
    <View style={{
      backgroundColor: Colors.white
    }}>
      <View
        style={{
          ...styles.successModalHeaderView,
          marginRight: wp( '8%' ),
          marginLeft: wp( '8%' ),
        }}
      >
        <Text style={styles.modalTitleText}>{props.title}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '1%' )
        }}>
          {props.info}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          ...styles.inputBoxFocused,
          marginBottom: wp( '1.5%' ),
          marginTop: wp( '1.5%' ),
          marginRight: wp( '8%' ),
          marginLeft: wp( '8%' ),
          flexDirection: 'row',
          width: wp( '80%' ),
          height: wp( '13%' ),
        }}
      >
        <View style={styles.amountInputImage}>
          <Image
            style={styles.textBoxImage}
            source={require( '../assets/images/icons/icon_bitcoin_gray.png' )}
          />
        </View>
        <View style={styles.enterAmountView} />
        <TextInput
          style={{
            ...styles.textBox,
            flex: 1,
            paddingLeft: 10,
            height: wp( '13%' ),
            width: wp( '45%' ),
          }}
          placeholder={'sats/byte'}
          value={amount}
          returnKeyLabel="Done"
          returnKeyType="done"
          keyboardType={'numeric'}
          onChangeText={( value ) => {
            const regEx = /^[0-9]+$/
            if( regEx.test( value ) ) {
              onCustomFeeChange( value )
            }
          }}
          placeholderTextColor={Colors.borderColor}
          autoCorrect={false}
          autoCompleteType="off"
        />
      </TouchableOpacity>
      {customPriorityError ? (
        <View style={{
          marginRight: wp( '8%' ), marginLeft: wp( '8%' )
        }}>
          <Text style={styles.errorText}>{customPriorityError}</Text>
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          marginBottom: wp( '1.5%' ),
          marginTop: 20,
          marginRight: wp( '8%' ),
          marginLeft: wp( '8%' ),
        }}
      >
        <Text
          style={{
            color: Colors.black,
            fontSize: RFValue( 11 ),
            fontFamily: Fonts.FiraSansMedium,
            marginRight: 5,
          }}
        >
          Arrival Time
        </Text>
        <Text
          style={{
            color: Colors.textColorGrey,
            fontSize: RFValue( 11 ),
            fontFamily: Fonts.FiraSansItalic,
          }}
        >
          {customEstimatedBlock
            ? `~ ${customEstimatedBlock * 10} - ${
              ( customEstimatedBlock + 1 ) * 10
            } minutes`
            : 'Calculating...'}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: wp( '15%' ),
          marginTop: 30,
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressOk( amount, customEstimatedBlock )}
          style={{
            ...styles.successModalButtonView
          }}
        >
          <Text style={styles.proceedButtonText}>{props.okButtonText}</Text>
        </AppBottomSheetTouchableWrapper>
        {props.isCancel && (
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressCancel()}
            style={{
              height: wp( '13%' ),
              width: wp( '35%' ),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{
              ...styles.proceedButtonText, color: Colors.blue
            }}>
              {props.cancelButtonText}
            </Text>
          </AppBottomSheetTouchableWrapper>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  successModalHeaderView: {
    marginBottom: hp( '1%' ),
    marginTop: hp( '3%' ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  inputBoxFocused: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.white,
  },
  amountInputImage: {
    width: 40,
    height: wp( '13%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBoxImage: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    resizeMode: 'contain',
  },
  enterAmountView: {
    width: 2,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
  textBox: {
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue( 11 ),
    fontStyle: 'italic',
  },
} )
// function useSelector(arg0: (state: any) => any) {
//   throw new Error('Function not implemented.');
// }

