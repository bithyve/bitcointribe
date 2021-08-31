import React, { useState, useCallback } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CommonStyles from '../../common/Styles/Styles'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import TimerModalContents from '../../pages/Contacts/TimerModalContents'
import RequestKeyFromContact from '../../components/RequestKeyFromContact'
import ShareOtpWithContact from '../NewBHR/ShareOtpWithTrustedContact'
import ModalContainer from '../../components/home/ModalContainer'

export default function QrAndLink( props ) {
  const [ isOTPType, setIsOTPType ] = useState( props.navigation.getParam( 'otp' )
    ? props.navigation.getParam( 'otp' )
    : '' )
  const [ shareOtpWithTrustedContactModel, setShareOtpWithTrustedContactModel ] = useState( false )
  const [ OTP, setOTP ] = useState( props.navigation.getParam( 'otp' )
    ? props.navigation.getParam( 'otp' )
    : '' )

  const [ timerModal, setTimerModal ] = useState( props.navigation.getParam( 'otp' )
    ? true
    : false )
  const [ renderTimer, setRenderTimer ] = useState( false )

  const [ trustedLink, setTrustedLink ] = useState( props.navigation.getParam( 'trustedLink' )
    ? props.navigation.getParam( 'trustedLink' )
    : '' )
  const [ trustedQR, setTrustedQR ] = useState( props.navigation.getParam( 'trustedQr' )
    ? props.navigation.getParam( 'trustedQr' )
    : '' )

  const SelectedContact = props.navigation.getParam( 'SelectedContact' )
    ? props.navigation.getParam( 'SelectedContact' )
    : []

  const [ Contact ] = useState(
    SelectedContact ? SelectedContact[ 0 ] : {
    },
  )

  const openTimer = async () => {
    setTimeout( () => {
      setRenderTimer( true )
    }, 2 )
    // const TCRequestTimer = JSON.parse(
    //   await AsyncStorage.getItem( 'TCRequestTimer' ),
    // );
    // ( SendViaLinkBottomSheet as any ).current.snapTo( 0 )
    // if ( !TCRequestTimer ) {
    //   ( TimerModalBottomSheet as any ).current.snapTo( 1 )
    // }
  }

  const renderTimerModalContents = useCallback( () => {
    return (
      <TimerModalContents
        isOTPType={isOTPType}
        contactText={'Trusted Contact'}
        contact={Contact}
        renderTimer={renderTimer}
        onPressContinue={() => onContinueWithTimer()}
      />
    )
  }, [ renderTimer ] )


  const onContinueWithTimer = () => {
    setTimerModal( false )
    props.navigation.goBack()
  }


  const renderShareOtpWithTrustedContactContent = useCallback( () => {
    return (
      <ShareOtpWithContact
        renderTimer={renderTimer}
        onPressOk={() => {
          setRenderTimer( false )
          setShareOtpWithTrustedContactModel( false )
          props.navigation.goBack()
        }}
        onPressBack={() => {
          setShareOtpWithTrustedContactModel( false )
        }}
        OTP={OTP}
      />
    )
  }, [ OTP, renderTimer ] )

  console.log( 'trustedQR', trustedQR )

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <ScrollView >
        <View style={[ CommonStyles.headerContainer, {
          backgroundColor: Colors.backgroundColor
        } ]}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.popToTop()
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
        </View>
        <RequestKeyFromContact
          isModal={false}
          // headerText={'Request Recovery Secret from trusted contact'}
          // subHeaderText={`Request share from trusted Contact, you can change${'\n'}your trusted contact, or either primary mode of context`}
          contactText={'Adding to Friends & Family:'}
          contact={Contact}
          QR={trustedQR}
          link={trustedLink}
          contactEmail={''}
          onPressBack={() => {
            props.navigation.goBack()
          }}
          onPressDone={() => {
            // openTimer()
          }}
          onPressShare={() => {
            setTimeout( () => {
              setRenderTimer( true )
            }, 2 )
            if ( isOTPType ) {
              setShareOtpWithTrustedContactModel( true )
            } else {
              openTimer()
            }
          }}
        />
        <ModalContainer visible={timerModal }  closeBottomSheet={() => {}} >
          {renderTimerModalContents()}
        </ModalContainer>
        <ModalContainer visible={shareOtpWithTrustedContactModel }  closeBottomSheet={() => {}} >
          {renderShareOtpWithTrustedContactContent()}
        </ModalContainer>
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp( '1.7%' ),
  },
  contactProfileImage: {
    borderRadius: 60 / 2,
    width: 60,
    height: 60,
    resizeMode: 'cover',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  contactNameText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '30%' ),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
} )
