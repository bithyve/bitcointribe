import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import CrossButton from '../../assets/images/svgs/icons_close.svg'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'

export default function BWHealthCheckModal( props ) {

  return (
    <View style={{
      ...styles.modalContentContainer
    }}>
      <View style={{
      }}>
        <View style={styles.successModalHeaderView}>
          <Text
            style={{
              color: props.headerTextColor
                ? props.headerTextColor
                : Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.Medium,
              width: '80%'
            }}
          >
            {props.title}
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{
              height: wp( '8%' ),
              width: wp( '8%' ),
              backgroundColor: Colors.blue,
              borderWidth: 1,
              borderColor: Colors.borderColor,
              borderRadius: wp( 4 ),
              marginLeft: 'auto',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}
            onPress={() => {
              props.onPressClose()
            }}>
            <CrossButton />
          </AppBottomSheetTouchableWrapper>
        </View>
        <View>
          <Text style={styles.subTitleText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed  </Text>
        </View>
        <View>
          <Text style={styles.infoText}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed  </Text>
        </View>
        <View
          style={{
            marginTop: 'auto',
            marginBottom: hp( '5%' ),
            marginLeft: wp( '8%' ),
          }}
        >

          <View
            style={{
              flexDirection: 'row',
              marginTop: 'auto',
              alignItems: 'center',
            }}
          >
            {
              props.cancelButtonText !== '' && (
                <AppBottomSheetTouchableWrapper
                  onPress={() => {
                    props.onPressIgnore()
                  }}
                  style={{
                    height: wp( '13%' ),
                    width: wp( '35%' ),
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 15,
                  }}
                >
                  <Text
                    onPress={() => {
                      props.onPressIgnore()
                    }}
                    style={{
                      ...styles.proceedButtonText, color: Colors.blue
                    }}
                  >
                    {props.cancelButtonText}
                  </Text>
                </AppBottomSheetTouchableWrapper>
              )
            }
            <AppBottomSheetTouchableWrapper
              disabled={false}
              onPress={props.onPressProceed}
              style={{
                ...styles.successModalButtonView
              }}
            >
              <Text style={styles.proceedButtonText}>
                {props.proceedButtonText}</Text>
            </AppBottomSheetTouchableWrapper>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginHorizontal: wp( '8%' ),
    marginTop: wp( '8%' ),
    flexDirection:'row',
    width: '85%'
  },
  subTitleText: {
    fontSize: 12,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    fontFamily: Fonts.Regular,
    marginHorizontal: wp( '8%' ),
    marginTop: wp( '3%' )
  },
  infoText:{
    fontSize: 12,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    fontFamily: Fonts.Regular,
    marginHorizontal: wp( '8%' ),
    marginVertical: wp( '10%' )
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '4%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )
