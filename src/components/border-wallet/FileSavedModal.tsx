import React, { useContext } from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import { LocalizationContext } from '../../common/content/LocContext'
import LinearGradient from 'react-native-linear-gradient'
import SuccessBWIllustration from '../../assets/images/svgs/successBWIllustration.svg'

export default function FileSavedModal( props ) {
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
          onPress={() => props.closeModal()}
          style={{
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.CLOSE_ICON_COLOR, alignItems: 'center', justifyContent: 'center',
            marginTop: wp( 3 ), marginRight: wp( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
          }} />
        </AppBottomSheetTouchableWrapper>
        }
        <View style={[ styles.successModalHeaderView, {
          marginTop: props.closeModal ? wp( '1%' ) : wp( '8%' )
        } ]}>
          <Text
            style={{
              color: props.headerTextColor
                ? props.headerTextColor
                : Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.Regular,
              letterSpacing: 0.54
              // width: wp( 65 )
            }}
          >
            {props.title}
            {props.titleNextLine ? '\n' + props.titleNextLine : null}
          </Text>
          {props.info ? (
            <Text
              style={{
                ...styles.modalInfoText,
                marginTop: wp( '1.5%' ),
                marginRight: wp( 9 )
              }}
            >
              {props.info}
            </Text>
          ) : null}
        </View>
        {/* <View style={styles.filePathWrapper}>
          <Text style={styles.filePathText}>BorderWalletEntropyGrid.pdf save to /Users/Elrond/Library/ Developer/CoreSimulator/Devices/1B593559-B55D-443C-83C4-835D847749A7/ data/Containers/Data/Application/F3E68CF5-F673-4A41-9740-E22052CD8C97/Documents/ BorderWalletEntropyGrid.pdf</Text>
        </View> */}
        <View
          style={{
            height: hp( '15%' ),
            width: wp( '90%' ),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:'flex-end'
          }}
        >
          {props.isIgnoreButton && (
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressIgnore()}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 15,
                marginTop: 25
              }}
              delayPressIn={0}
            >
              <Text
                style={{
                  ...styles.proceedButtonText,
                  color: props.buttonTextColor
                    ? props.buttonTextColor
                    : Colors.blue,
                }}
              >
                {props.cancelButtonText ? props.cancelButtonText : common.ignore}
              </Text>
            </AppBottomSheetTouchableWrapper>
          )}
          <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
            start={{
              x: 0, y: 0
            }} end={{
              x: 1, y: 0
            }}
            locations={[ 0.2, 1 ]}
            style={{
              ...styles.successModalButtonView,
              backgroundColor: props.buttonColor
                ? props.buttonColor
                : Colors.blue,
            }}
          >
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressProceed()}
              style={{
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
          </LinearGradient>


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
    marginTop: wp( '1%' ),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    opacity: 1,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
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
    minWidth: wp( '27%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    alignSelf: 'flex-end',
    // marginLeft: wp( '8%' ),
    marginBottom:hp ( '3%' ),
  },
  successModalImage: {
    width: wp( '30%' ),
    height: wp( '30%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  filePathWrapper: {
    backgroundColor: Colors.offWhite,
    padding: 15,
    marginHorizontal: 25,
    marginTop: 20,
    borderRadius: 15
  },
  filePathText: {
    color: Colors.homepageButtonColor,
    fontSize: 14
  }
} )
