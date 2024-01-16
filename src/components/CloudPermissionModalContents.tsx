import React, { useEffect, useState } from 'react'
import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import { translations } from '../common/content/LocContext'
import Fonts from '../common/Fonts'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'

export default function CloudPermissionModalContents( props ) {
  const [ timerArray, setTimerArray ] = useState( [ 1, 1, 1 ] )
  const [ timeLeft, setTimeLeft ] = useState( null )
  const [ intervalRef, setIntervalRef ] = useState( null )
  const strings  = translations[ 'common' ]

  const getElusiveTimer = () =>{
    return timerArray.map( ( value, key )=>{
      return <View key={key} style={{
        backgroundColor: value ? Colors.lightBlue : Colors.white, width: wp( '2%' ), height: wp( '10%' ), borderRadius: 4
      }}/>
    } )
  }

  useEffect( ()=>{
    if( props.isRendered ){
      setTimeLeft( 3 )
    }
  }, [ props.isRendered ] )

  useEffect( () => {
    if( timeLeft===0 ){
      props.autoClose()
      setTimeLeft( null )
    }
    if ( !timeLeft ) return
    const intervalId = setInterval( () => {
      setTimeLeft( timeLeft - 1 )
      if( timeLeft - 1 == 2 ){ setTimerArray( [ 1, 1, 0 ] )
      } else if( timeLeft - 1 == 1 ){
        setTimerArray( [ 1, 0, 0 ] )
      }
      else if( timeLeft - 1 == 0 ){
        setTimerArray( [ 0, 0, 0 ] )
      }
    }, 1000 )
    setIntervalRef( intervalId )
    return () => { clearInterval( intervalId ) }
  }, [ timeLeft ] )


  return (
    <View style={{
      ...styles.modalContentContainer,
    }}>
      {/* <View style={{
        // height: '100%'
      }}> */}
      <View style={{
        ...styles.successModalHeaderView, flexDirection:'row', alignItems:'center'
      }}>
        <Text
          style={{
            color: props.headerTextColor
              ? props.headerTextColor
              : Colors.blue,
            fontSize: RFValue( 18 ),
            fontFamily: Fonts.Medium,
          }}
        >
          {props.title}
          {props.titleNextLine ? '\n' + props.titleNextLine : null}
        </Text>
        {props.isRendered && <View style={{
          flexDirection:'row', justifyContent:'space-between', alignItems: 'center', width: wp( '10%' ), alignSelf: 'auto', marginLeft: 'auto', elevation: 5, shadowColor: Colors.babyGray, shadowOffset: {
            width: 0, height: 3
          }, shadowOpacity: 1, shadowRadius: 4
        }}>
          {getElusiveTimer()}
        </View>}
      </View>
      <View style={styles.successModalAmountView}>
        {props.info ? (
          <Text
            style={{
              ...styles.modalInfoText,
              marginTop: wp( '1.5%' ),
              marginBottom: hp( '3%' ),
            }}
          >
            {props.info}
          </Text>
        ) : null}
        {props.note ? (
          <Text
            style={{
              ...styles.modalInfoText,
              marginBottom: hp( '1%' ),
              marginTop: 'auto',
            }}
          >
            {props.note}
            {props.noteNextLine ? '\n' + props.noteNextLine : null}
          </Text>
        ) : null}
      </View>
      {props.otherText ? (
        <View style={styles.successModalAmountView}>
          <Text
            style={{
              ...styles.modalInfoText,
              marginBottom: hp( '1%' ),
              marginTop: 'auto',
            }}
          >
            {props.otherText}
          </Text>
        </View>
      ) : null}
      <View
        style={{
          height: hp( '14%' ),
          flexDirection: 'row',
          marginTop: 'auto',
          alignItems: 'center',
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => { clearInterval( intervalRef ); props.onPressProceed( true ) }}
          style={{
            ...styles.successModalButtonView,
            shadowColor: props.buttonShadowColor
              ? props.buttonShadowColor
              : Colors.shadowBlue,
            backgroundColor: props.buttonColor
              ? props.buttonColor
              : Colors.blue,
          }}
        >
          <Text
            style={{
              ...styles.proceedButtonText,
              color: props.buttonTextColor
                ? props.buttonTextColor
                : Colors.white,
            }}
          >
            {strings.backup}
          </Text>
        </AppBottomSheetTouchableWrapper>

        <AppBottomSheetTouchableWrapper
          onPress={() => { clearInterval( intervalRef ); props.onPressIgnore( false )}}
          style={{
            height: wp( '13%' ),
            width: wp( '25%' ),
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: wp( '8%' ),
          }}
        >
          <Text
            style={{
              ...styles.proceedButtonText,
              color: props.buttonTextColor
                ? props.buttonTextColor
                : Colors.blue,
            }}
          >
            {strings.skip}
          </Text>
        </AppBottomSheetTouchableWrapper>
        <Image
          source={
            props.bottomImage
              ? props.bottomImage
              : require( '../assets/images/icons/noInternet.png' )
          }
          style={styles.successModalImage}
        />
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
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: wp( '8%' ),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    opacity: 1,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    letterSpacing: 0.6,
    marginRight: wp( 10 )
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
    elevation: 6,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 10, height: 10
    },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
  },
  successModalImage: {
    width: wp( '30%' ),
    height: wp( '25%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginBottom: Platform.OS == 'ios' && DeviceInfo.hasNotch() ? -30 : -15,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )
