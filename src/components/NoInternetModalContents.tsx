import React, { useContext } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Entypo from 'react-native-vector-icons/Entypo'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import { LocalizationContext } from '../common/content/LocContext'

export default function NoInternetModalContents( props ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'noInternet' ]
  const common = translations[ 'common' ]

  return ( <View style={{
    ...styles.modalContentContainer
  }}>
    {/* <View style={{
      height: '100%'
    }}> */}
    <View style={styles.successModalHeaderView}>
      <Text style={styles.modalTitleText}>{`${strings.no}\n${strings.Connection}`}</Text>
      <Text style={{
        ...styles.modalInfoText, marginTop: wp( '1.5%' )
      }}>{`${strings.there}\n`}<Text style={{
          fontFamily: Fonts.FiraSansMediumItalic, fontWeight: 'bold', fontStyle: 'italic'
        }}>{`${strings.internet}`}</Text></Text>
    </View>
    <View style={styles.successModalAmountView}>
      <Text style={{
        ...styles.modalInfoText, marginBottom: hp( '3%' )
      }}>{`${strings.some}`}</Text>
      <View style={{
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', marginBottom: 5
        }}>
          <Entypo name={'dot-single'} size={18} color={Colors.textColorGrey} />
          <Text style={{
            ...styles.modalInfoText,
          }}>{strings.fetching}</Text>
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', marginBottom: 5
        }}>
          <Entypo name={'dot-single'} size={18} color={Colors.textColorGrey} />
          <Text style={styles.modalInfoText}>{strings.sending}</Text>
        </View>
        <View style={{
          flexDirection: 'row', alignItems: 'center', marginBottom: 5
        }}>
          <Entypo name={'dot-single'} size={18} color={Colors.textColorGrey} />
          <Text style={styles.modalInfoText}>{strings.contact}
          </Text>
        </View>
      </View>
    </View>
    <View style={{
      flexDirection: 'row', marginTop: 'auto', alignItems: 'center'
    }} >
      <AppBottomSheetTouchableWrapper
        onPress={() => props.onPressIgnore()}
        style={{
          ...styles.successModalButtonView
        }}
      >
        <Text style={styles.proceedButtonText}>{common.ok}</Text>
      </AppBottomSheetTouchableWrapper>
      {/* <AppBottomSheetTouchableWrapper
                    onPress={() => props.onPressIgnore()}
                    style={{
                        height: wp('13%'),
                        width: wp('35%'),
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text style={{...styles.proceedButtonText, color:Colors.blue, }}>Ignore</Text>
                </AppBottomSheetTouchableWrapper> */}
      <Image source={require( '../assets/images/icons/noInternet.png' )} style={styles.successModalImage} />
    </View>
    {/* </View> */}
  </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
    marginTop: wp( '10%' ),
    // flex: 1.7
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
    letterSpacing: 0.54
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.6,
    opacity: 1
  },
  successModalAmountView: {
    // flex: 2,
    justifyContent: 'center',
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
    marginTop: hp( '4%' )
  },
  successModalWalletNameText: {
    color: Colors.black,
    fontSize: RFValue( 25 ),
    fontFamily: Fonts.FiraSansRegular
  },
  successModalAmountImage: {
    width: wp( '3%' ),
    height: wp( '3%' ),
    marginRight: 5,
    marginBottom: wp( '1%' ),
    resizeMode: 'contain',
  },
  successModalAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 21 ),
    marginRight: 5
  },
  successModalAmountUnitText: {
    color: Colors.borderColor,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
  },
  successModalAmountInfoView: {
    flex: 0.4,
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '30%' ),
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
    marginLeft: wp( '10%' ),
  },
  successModalImage: {
    width: wp( '25%' ),
    height: hp( '18%' ),
    marginLeft: 'auto',
    resizeMode: 'cover'
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium
  },
} )
