import React, { useContext } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import SuccessBWIllustration from '../../assets/images/svgs/successBWIllustration.svg'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'

export default function BorderWalletSuccessModal( props ) {
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
          {props.errPoints &&
            <View style={{
              marginTop: hp( 3 ),
              marginBottom: hp( 1 )
            }}>
              {props.errPoints.map( ( item, index ) => {
                return(
                  <View key={index} style={{
                    flexDirection: 'row', paddingVertical: hp( 1 ), alignItems: 'center',
                  }}>
                    <View style={{
                      height: 6, width: 6, borderRadius: 3, backgroundColor: Colors.gray4, alignSelf: 'center'
                    }}/>
                    <Text style={{
                      color: Colors.textColorGrey, opacity: 1, fontSize: RFValue( 12 ), letterSpacing: 0.6, fontFamily: Fonts.Regular, marginLeft: wp( 2 )
                    }}>
                      {item}
                    </Text>
                  </View>
                )
              } )}
            </View>
          }
        </View>
        <View style={styles.successModalAmountView}>
          {props.note ? (
            <Text
              style={{
                ...styles.modalInfoText,
                marginBottom: hp( '1%' ),
                marginTop: 'auto',
                letterSpacing: 0.11,
                fontSize: RFValue( 11 ),
              }}
            >
              {props.note}
              {props.noteNextLine ? '\n' + props.noteNextLine : null}
            </Text>
          ) : null}
          {props.links &&
            <View style={{
              marginTop: hp( 3 ),
              marginBottom: hp( 2 )
            }}>
              {props.links.map( ( item, index ) => {
                return(
                  <View key={index} style={{
                    flexDirection: 'row', paddingVertical: hp( 1 ), alignItems: 'center',
                  }}>
                    <Image source={item.icon} style={{
                      height: wp( 4 ), width: wp( 4 ), resizeMode: 'contain'
                    }}/>
                    <View style={{
                      height: hp( 2 ), width: wp( 0.3 ), backgroundColor: Colors.gray1, marginHorizontal: wp( 4 )
                    }} />
                    <Text style={{
                      color: Colors.textColorGrey, opacity: 1, fontSize: RFValue( 11 ), letterSpacing: 0.6, fontFamily: Fonts.Regular,
                    }}>
                      {item.link}
                    </Text>
                  </View>
                )
              } )}
            </View>
          }
        </View>
        {props.otherText ? (
          <View style={styles.successModalAmountView}>
            <Text
              style={{
                ...styles.modalInfoText,
                marginBottom: hp( '1%' ),
                marginTop: 'auto',
                marginRight: wp( 10 )
              }}
            >
              {props.otherText}
            </Text>
          </View>
        ) : null}
        <View
          style={{
            height: hp( '15%' ),
            width: wp( '90%' ),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:'space-between'
          }}
        >
          <SuccessBWIllustration/>
          {/* <Image
            source={
              props.bottomImage
                ? props.bottomImage
                : require( '../../assets/images/illustration.png' )
            }
            style={styles.successModalImage}
          /> */}
          <View
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
          </View>

          {props.isIgnoreButton && (
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressIgnore()}
              style={{
                height: wp( '12%' ),
                width: wp( '27%' ),
                alignItems: 'center',
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
} )
