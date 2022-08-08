import React, { useContext } from 'react'
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { Shadow } from 'react-native-shadow-2'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import { LocalizationContext } from '../../common/content/LocContext'

export default function VerifySatModalContents( props ) {
  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  return (
    <View style={{
      ...styles.modalContentContainer,
    }}>
      <View style={{
        height: props.small ? hp( 74 ) : 'auto'
      }}>
        {props.closeModal &&
          <AppBottomSheetTouchableWrapper
            onPress={props.onCloseClick}
            style={{
              marginTop: wp( '3%' ),
              marginRight: wp( '3%' ),
              width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
              alignSelf: 'flex-end',
              backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
              // marginTop: wp( 3 )
            }}
          >
            <FontAwesome name="close" color={Colors.white} size={19} style={{
              // marginTop: hp( 0.5 )
            }} />
          </AppBottomSheetTouchableWrapper>
        }
        <View style={[ styles.successModalHeaderView, {
          // marginTop: RFValue( 18 )
        } ]}>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between'
          }}>
            <Text
              style={{
                color: props.headerTextColor
                  ? props.headerTextColor
                  : Colors.blue,
                fontSize: RFValue( 18 ),
                fontFamily: Fonts.FiraSansRegular,
                letterSpacing: 0.01,
                // marginTop: RFValue( 20 )
                // width: wp( 65 )
              }}
            >
              {props.title}
            </Text>
            {/* <TouchableOpacity onPress={props.onCloseClick} style={{
              width: 28, height: 28, backgroundColor: Colors.blue
            }}></TouchableOpacity> */}
          </View>
          {props.info ? (
            <Text
              style={{
                ...styles.modalInfoText,
                marginTop: wp( '1.5%' ),
              }}
            >
              {props.info}
            </Text>
          ) : null}
          <Image source={props.bottomImage}
            resizeMode='contain' style={{
              width: RFValue( 203 ), height: RFValue( 136 ), marginTop:RFValue( 27 )
            }}/>
          <View style={{
            flexDirection:'row', marginTop: RFValue( 25 )
          }}>
            {/* <View style={{
              width:RFValue( 5 ), height:RFValue( 5 ), borderRadius: RFValue( 5 ), backgroundColor: Colors.blue, marginTop: RFValue( 5 )
            }}/> */}
            <Text style={{
              fontSize: RFValue( 12 ), color:Colors.textColorGrey, fontFamily: Fonts.FiraSansRegular, letterSpacing:0.6, marginStart: RFValue( 5 )
            }}>
              {props.subPoints}
            </Text>
          </View>
        </View>
        <View
          style={{
            height: hp( '12%' ),
            flexDirection: 'row',
            marginTop: 'auto',
            alignItems: 'flex-end',
            // backgroundColor: 'red',
            justifyContent: 'flex-end',
            marginEnd: RFValue( 20 )
          }}
        >
          <Shadow viewStyle={{
            ...styles.successModalButtonView,
            backgroundColor: props.buttonColor
              ? props.buttonColor
              : Colors.blue,
          }} distance={2}
          startColor={props.buttonShadowColor
            ? props.buttonShadowColor
            : Colors.shadowBlue}
          offset={[ 42, 14 ]}>
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressProceed()}
              style={{
                // ...styles.successModalButtonView,
                shadowColor: props.buttonShadowColor
                  ? props.buttonShadowColor
                  : Colors.shadowBlue,

              }}
              delayPressIn={0}
            >
              <Text
                style={{
                  ...styles.proceedButtonText,
                  color: props.buttonTextColor
                    ? props.buttonTextColor
                    : Colors.white,
                }}
              >
                {props.proceedButtonText}
              </Text>
            </AppBottomSheetTouchableWrapper>
          </Shadow>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    // backgroundColor:'red'
    // marginTop: wp( '1%' ),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    // opacity: 1,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.6
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp( '12%' ),
    marginLeft: wp( '8%' ),
    marginTop: hp( '2%' ),
  },
  successModalButtonView: {
    height: wp( '12%' ),
    minWidth: wp( '22%' ),
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
    marginBottom: hp( '3%' ),
  },
  successModalImage: {
    width: wp( '30%' ),
    height: wp( '30%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: wp( -3 ),
    marginBottom: wp( -3 ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
} )
