import React, { memo, useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../common/Colors'
import { wp as wp1, hp as hp1 } from '../../common/data/responsiveness/responsive'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Fonts from '../../common/Fonts'
import { translations } from '../../common/content/LocContext'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import KeyPad from '../KeyPad'
const ReceiveAmountContent = ( {
  title,
  message,
  selectedAmount,
  onPressConfirm,
  onPressBack
} ) => {
  const [ value, setValue ] = useState( Number( selectedAmount ) )
  const [ amount, setAmount ] = useState( selectedAmount !== '' ? selectedAmount : 'Enter amount in sats' )
  const common  = translations[ 'common' ]

  const onPressNumber = ( text ) => {
    let tmpPasscode = value.toString()
    if ( value === 0 ) {
      tmpPasscode = ''
    }

    if ( text != 'x' ) {
      if ( value !== 0 || text !== '0' ) {
        tmpPasscode += text
        setAmount( tmpPasscode )
        setValue( Number ( tmpPasscode ) )
      }
    }

    if ( value && text == 'x' ) {
      if ( tmpPasscode.length > 1 ) {
        const passcodeTemp = tmpPasscode.slice( 0, -1 )
        setAmount( passcodeTemp )
        setValue( Number ( passcodeTemp ) )
      } else {
        setAmount( 'Enter amount in sats' )
        setValue( 0 )
      }
    }
  }

  return (
    <View style={styles.modalContentContainer}>
      <View style={{
        // flex: 1
      }}>
        <TouchableOpacity style={{
          backgroundColor: '#FABC05',
          width: wp1( 28 ),
          height: wp1( 28 ),
          borderRadius: wp1( 14 ),
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-end',
          marginTop: hp1( 10 ),
          marginRight: wp1( 10 )
        }}
        onPress={onPressBack ? onPressBack : null}>
          <FontAwesome
            name={'close'}
            color={'white'}
            size={wp1( 15 )}
          />
        </TouchableOpacity>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.modalTitleText}>{title}</Text>
          <Text style={{
            ...styles.modalInfoText, marginTop: wp( '1.5%' )
          }}>{message}</Text>
        </View>
        <View style={styles.textBoxView}>
          {/* <View style={styles.amountInputImage}>
            <Image
              style={styles.textBoxImage}
              source={require( '../../assets/images/icons/icon_bitcoin_gray.png' )}
            />
          </View> */}
          <Text
            style={{
              ...styles.textBox,
              color: value === 0 ? '#CBCBCB' : Colors.textColorGrey,
            }}
          >
            {amount}
          </Text>
        </View>
        <View style={{
          marginTop: 'auto',
        }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: hp1( 30 ),
              marginHorizontal: wp1( 20 )
            }}
          >
            <TouchableOpacity
              onPress={() => {
                onPressConfirm( amount )
              }}
              style={styles.successModalButtonView}
            >
              <Text style={styles.proceedButtonText}>{common.confirm}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyPad onPressNumber={onPressNumber}/>
    </View>
  )
}

export default memo( ReceiveAmountContent )

const styles = StyleSheet.create( {
  modalContentContainer: {
    // height: '100%',
    width: '100%',
    backgroundColor: '#F5F5F5',
  },
  successModalHeaderView: {
    marginHorizontal: wp1( 30 ),
    marginTop: hp1( 9 )
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.RobotoSlabMedium,
    lineHeight: RFValue( 24 ),
    letterSpacing: RFValue( 0.54 )
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.RobotoSlabRegular,
    textAlign: 'justify',
    lineHeight: RFValue( 18 ),
    letterSpacing: RFValue( 0.6 )
  },
  successModalButtonView: {
    height: hp1( 50 ),
    width: wp1( 120 ),
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
    alignSelf: 'flex-end',
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.RobotoSlabMedium,
    lineHeight: RFValue( 16 ),
    letterSpacing: RFValue( 0.24 )
  },
  backButton:{
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBoxView: {
    flexDirection: 'row',
    height: 50,
    marginHorizontal: wp1( 20 ),
    marginBottom: hp1( 41 ),
    marginTop: hp1( 96 ),
  },
  textBoxImage: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    height: hp1( 50 ),
    paddingLeft: 20,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13 ),
    backgroundColor: Colors.white,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center'
  },
} )
