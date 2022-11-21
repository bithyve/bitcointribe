import React, { useContext } from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import { Shadow } from 'react-native-shadow-2'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import { LocalizationContext } from '../../common/content/LocContext'
import BottomInfoBox from '../../components/BottomInfoBox'

export default function SeedBacupModalContents( props ) {
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
            width: wp( 28 ), height: wp( 28 ), borderRadius: wp( 14 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.golden, alignItems: 'center', justifyContent: 'center',
            marginTop: wp( 13 ), marginRight: wp( 10 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
          }} />
        </AppBottomSheetTouchableWrapper>
        }
        <View style={[ styles.successModalHeaderView, {
          marginTop: props.closeModal ? wp( 10 ) : wp( 41 ),
        } ]}>
          <Text
            style={{
              color: props.headerTextColor
                ? props.headerTextColor
                : Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.RobotoSlabRegular,
              letterSpacing: 0.54,
              lineHeight: RFValue( 22 )
              // width: wp( 65 )
            }}
          >
            {props.title}
            {props.titleNextLine ? '\n' + props.titleNextLine : null}
          </Text>
          {props.info ? (
            props.info.split( '\n\n\n' ).map( ( d, i ) => (
              <Text
                key={i}
                style={{
                  ...styles.modalInfoText,
                  marginTop: wp( 5 ),
                  color: i === 0 ? Colors.lightTextColor : Colors.textColorGrey,
                  fontSize: RFValue( 12 ),
                  fontFamily: Fonts.RobotoSlabRegular,
                  marginBottom: i === 0 ? hp( 92 ) : 0
                  // marginHorizontal: wp( '5%' ),
                }}
              >
                {d}
              </Text> ) ) ) : null}
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
                      color: Colors.textColorGrey, opacity: 1, fontSize: RFValue( 12 ), letterSpacing: 0.6, fontFamily: Fonts.FiraSansRegular, marginLeft: wp( 2 )
                    }}>
                      {item}
                    </Text>
                  </View>
                )
              } )}
            </View>
          }
        </View>
        { props.bottomBoxInfo && <View style={{
          marginTop: hp( 10 ),
          marginBottom: hp( 1 ),
          marginLeft: wp ( 3 )
        }}>
          <BottomInfoBox
            title={'Note:'}
            infoText={props.note}
            italicText={''}
            backgroundColor={Colors.white}
          />
        </View>
        }
        {/* <View style={styles.successModalAmountView}>
          {props.note ? (
            <Text
              style={{
                ...styles.modalInfoText,
                marginBottom: hp( '1%' ),
                marginTop: 'auto',
                letterSpacing: 0.11,
                fontSize: RFValue( 11 ),
                color: Colors.textColorGrey
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
                      color: Colors.textColorGrey, opacity: 1, fontSize: RFValue( 11 ), letterSpacing: 0.6, fontFamily: Fonts.FiraSansRegular,
                    }}>
                      {item.link}
                    </Text>
                  </View>
                )
              } )}
            </View>
          }
        </View> */}
        {props.otherText ? (
          <View style={styles.successModalAmountView}>
            <Text
              style={{
                ...styles.modalInfoText,
                marginBottom: hp( 5 ),
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
            height: wp( 103 ),
            flexDirection: 'row',
            marginTop: 10,
            alignItems: 'flex-end',
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
            : Colors.shadowBlue }
          offset={[ 42, 14 ]}>
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressProceed()}
              style={{
                // ...styles.successModalButtonView,
                shadowColor: props.buttonShadowColor
                  ? props.buttonShadowColor
                  : Colors.shadowBlue,
                width: wp( 120 ),
                alignItems: 'center'
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

          {props.isIgnoreButton && (
            <AppBottomSheetTouchableWrapper
              onPress={() => props.onPressIgnore()}
              style={{
                height: wp( 18 ),
                width: wp( 41 ),
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                // position: 'absolute',
                // left: wp( 53 )
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

          {props.isBottomImage && (
            <Image
              source={
                props.bottomImage
                  ? props.bottomImage
                  : require( '../../assets/images/icons/noInternet.png' )
              }
              style={props.isBottomImageStyle ? props.isBottomImageStyle : styles.successModalImage}
            />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.backgroundColor,
    height: 'auto',
  },
  successModalHeaderView: {
    marginRight: wp( 116 ),
    marginLeft: wp( 30 ),
    marginTop: hp( 41 ),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    opacity: 1,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.6
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp( 18 ),
    marginLeft: wp( 12 ),
    marginTop: hp( 10 ),
  },
  successModalButtonView: {
    height: hp( 50 ),
    minWidth: wp( 120 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( 30 ),
    marginBottom: hp ( 40 ),
  },
  successModalImage: {
    width: wp( 103 ),
    height: hp( 128 ),
    marginLeft: 'auto',
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.RobotoSlabRegular,
  },
} )
