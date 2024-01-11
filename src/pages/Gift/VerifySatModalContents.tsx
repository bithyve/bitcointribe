import React, { useContext } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'

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
              marginTop: wp( '6%' ),
              marginRight: wp( '3%' ),
              width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
              alignSelf: 'flex-end',
              backgroundColor: Colors.CLOSE_ICON_COLOR, alignItems: 'center', justifyContent: 'center',
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

            <View style={{
              flexDirection:'row', alignItems:'flex-start',
            }}>
              <Text
                style={{
                  color: props.headerTextColor
                    ? props.headerTextColor
                    : Colors.blue,
                  fontSize: RFValue( 18 ),
                  fontFamily: Fonts.Regular,
                  letterSpacing: 0.01,
                  // marginTop: RFValue( 20 )
                // width: wp( 65 )
                }}
              >
                {props.title}
              </Text>
              {props.scTitleText &&
          <Text style={styles.extraSubText}>
            {props.scTitleText}
          </Text>
              }
            </View>
            {/* <TouchableOpacity onPress={props.onCloseClick} style={{
              width: 28, height: 28, backgroundColor: Colors.blue
            }}></TouchableOpacity> */}
          </View>
          {props.info ? (
            <View style={{
              flexDirection:'row',
              alignItems:'flex-start',
              width: '100%'
            }}>
              <Text
                style={{
                  ...styles.modalInfoText,
                  marginTop: wp( '1.5%' ),
                }}
              >
                {props.info}
              </Text>
              {props.info2 &&

              <Text
                style={{
                  ...styles.scInfoText,
                  marginTop: wp( '1.5%' ),
                }}
              >
                {props.info1}
              </Text>
              }
              {props.info2 &&
              <Text
                style={{
                  ...styles.modalInfoText,
                  marginTop: wp( '1.5%' ),
                }}
              >
                {props.info2}
              </Text>
              }
            </View>
          ) : null}
          <View style={{
            flexDirection:'row', marginTop: RFValue( 25 )
            // , alignItems:'flex-start',
          }}>
            {/* <View style={{
              width:RFValue( 5 ), height:RFValue( 5 ), borderRadius: RFValue( 5 ), backgroundColor: Colors.blue, marginTop: RFValue( 5 )
            }}/> */}
            <Text style={{
              fontSize: RFValue( 12 ), color:Colors.textColorGrey, fontFamily: Fonts.Regular, marginStart: RFValue( 5 ), textAlign: 'center', marginTop:20
            }}>
              {props.subPoints}
            </Text>
            { props.subPoints1 && <Text  style={{
              fontSize: RFValue( 6 ), color:Colors.textColorGrey, fontFamily: Fonts.Regular, lineHeight: 8
            }}>
              {props.subPoints1}
            </Text>}
            { props.subPoints2 && <Text style={{
              fontSize: RFValue( 12 ), color:Colors.textColorGrey, fontFamily: Fonts.Regular
            }}>
              {props.subPoints2}
            </Text>}
            { props.subPoints3 && <Text style={{
              fontSize: RFValue( 12 ), color:Colors.textColorGrey, fontFamily: Fonts.Regular,
            }}>
              {props.subPoints3}
            </Text>}
            { props.subPoints4 && <Text style={{
              fontSize: RFValue( 6 ), color:Colors.textColorGrey, fontFamily: Fonts.Regular, lineHeight: 8
            }}>
              {props.subPoints4}
            </Text>}
          </View>
        </View>
        <View
          style={styles.footerWrapper}
        >
          <Image source={props.bottomImage}
            resizeMode='contain'/>
          <View
            style={{
              ...styles.successModalButtonView,
              backgroundColor: props.buttonColor
                ? props.buttonColor
                : Colors.blue,
              marginTop:20
            }}
          >
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
              <View style={{
                flexDirection: 'row', alignItems: 'flex-start'
              }}>
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
                {props.proceedButtonSubText &&
                <Text
                  style={{
                    ...styles.proceedButtonSubText,
                    color: props.buttonTextColor
                      ? props.buttonTextColor
                      : Colors.white,
                  }}
                >
                  {props.proceedButtonSubText}
                </Text>
                }
              </View>
            </AppBottomSheetTouchableWrapper>
          </View>
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
    fontFamily: Fonts.Regular,
    letterSpacing: 0.6,
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
    fontFamily: Fonts.Medium,
  },
  proceedButtonSubText: {
    color: Colors.white,
    fontSize: RFValue( 8 ),
    fontFamily: Fonts.Medium,
    lineHeight: 12
  },
  extraSubText:{
    fontSize: RFValue( 9 ),
    lineHeight:14,
    color: Colors.blue,
    letterSpacing: 0.7,
    fontFamily: Fonts.Medium,
  },
  scInfoText:{
    color: Colors.textColorGrey,
    // opacity: 1,
    fontSize: RFValue( 6 ),
    fontFamily: Fonts.Regular,
    letterSpacing: 0.6,
    lineHeight: 8
  },
  footerWrapper:{
    flexDirection:'row',
    alignItems:'flex-end',
    width:'100%',
    marginTop:10,
  }
} )
