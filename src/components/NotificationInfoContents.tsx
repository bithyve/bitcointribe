import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

export default function NotificationInfoContents( props ) {

  return (
    <View style={styles.modalContentContainer}>
      <>
        <View style={styles.successModalHeaderView}>
          <Text
            style={{
              color: props.headerTextColor
                ? props.headerTextColor
                : Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            {props.title}
          </Text>
          {
            props.cancelButtonText !== '' && (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => props.onPressClose()}
                style={{
                  width: wp( 7 ), height: wp( 7 ),
                  borderRadius: wp( 7/2 ),
                  alignSelf: 'flex-end',
                  backgroundColor: Colors.lightBlue,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft:'auto',
                }}
              >
                <FontAwesome name="close" color={Colors.white} size={19}/>
              </TouchableOpacity> )
          }
        </View>

        {props.info &&
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: wp( '8%' ),
                marginRight: wp( '8%' )
              }}
            >
              <Text
                style={{
                  color: Colors.greyTextColor,
                  fontSize: RFValue( 13 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                {props.info}
              </Text>
            </View>
        }

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: wp( '8%' ),
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.releaseNotes}
          </Text>
        </View>
        <View
          style={{
            marginTop: wp( '3%' ),
            marginBottom: hp( '5%' ),
            marginLeft: wp( '8%' ),
          }}
        >
          {props.note ?<Text style={styles.modalInfoText}>{props.note}</Text>: null}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 'auto',
              alignItems: 'center',
            }}
          >
            <AppBottomSheetTouchableWrapper
              disabled={false}
              onPress={props.onPressProceed}
              style={styles.successModalButtonView}
            >
              <Text style={styles.proceedButtonText}>{props.proceedButtonText}</Text>
            </AppBottomSheetTouchableWrapper>
            {
              props.cancelButtonText !== '' && (
                <AppBottomSheetTouchableWrapper
                  onPress={() => props.onPressIgnore()}
                  style={{
                    height: wp( '13%' ),
                    width: 'auto',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 15,
                    paddingRight: wp( '5%' ),
                    paddingLeft: wp( '5%' ),
                  }}
                >
                  <Text
                    onPress={() => props.onPressIgnore()}
                    style={{
                      ...styles.proceedButtonText, color: Colors.blue
                    }}
                  >
                    {props.cancelButtonText}
                  </Text>
                </AppBottomSheetTouchableWrapper>
              )
            }

          </View>
        </View>
      </>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginLeft: wp( '8%' ),
    marginTop: wp( '8%' ),
    marginBottom: wp( '4%' ),
    marginRight: wp( '6%' ),
    flexDirection:'row'
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginBottom: hp( '3%' )
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: hp( '2%' ),
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
  },
  successModalImage: {
    width: wp( '30%' ),
    height: wp( '35%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
} )
