import React, { useState, useEffect, useRef, useContext } from 'react'
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput
} from 'react-native'
import Share from 'react-native-share'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CommonStyles from '../../common/Styles/Styles'
import Colors from '../../common/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { LocalizationContext } from '../../common/content/LocContext'
import CopyThisText from '../../components/CopyThisText'
import QRCode from '../../components/QRCode'
import HeaderTitle from '../../components/HeaderTitle'
import DashedLargeContainer from './DahsedLargeContainer'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import { RFValue } from 'react-native-responsive-fontsize'
import ViewShot from 'react-native-view-shot'
import ThemeList from './Theme'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import ModalContainer from '../../components/home/ModalContainer'
import Fonts from '../../common/Fonts'
import { DeepLinkEncryptionType } from '../../bitcoin/utilities/Interface'
import Clipboard from '@react-native-clipboard/clipboard'
import Toast from '../../components/Toast'


export default function SendViaLinkAndQR( props ) {

  const [ OTPmodal, setOTPmodal ] = useState( false )

  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const common  = translations[ 'common' ]

  const type = props.route.params?.type
  const qrCode = props.route.params?.qrCode
  const link = props.route.params?.link
  const amt = props.route.params?.amt
  const senderName = props.route.params?.senderName
  const themeId = props.route.params?.themeId
  const giftNote = props.route.params?.giftNote
  const OTP =  props.route.params?.OTP
  const encryptLinkWith =  props.route.params?.encryptLinkWith
  const shortOTP = OTP && OTP.split( '' )

  const viewRef = useRef( null )

  useEffect( () => {
    init()
  }, [ qrCode ] )

  useEffect(()=>{
    if(!link){
      Toast('Something went wrong, please try again.')
    }
  },[])

  function init() {
    setTimeout( () => {
      onPress()
    }, 1000 )
  }

  // useEffect( () => {
  //   setShareLink( props.link.replace( /\s+/g, '' ) )
  // }, [ props.link ] )

  const shareOption = async () => {
    try {
      // const url = 'https://awesome.contents.com/';
      const title = 'Request'

      const options = Platform.select( {
        default: {
          title,
          message: `You have received a bitcoin gift from ${senderName}. Click on the link and follow the steps to receive bitcoin in your Bitcoin Tribe bitcoin wallet\n\n${link}`,
        },
      } )
      Share.open( options )
        .then( ( res ) => {
          // if (res.success) {
          props.onPressShare()
          // }
        } )
        .catch( ( err ) => {
        } )
    } catch ( error ) {
      // console.log(error);

    }
  }

  const writeToClipboard = () => {
    setOTPmodal( false )
    Clipboard.setString( OTP )
    Toast( common.copied )
  }

  const shareOTPModal = () => {
    return (
      <View style={styles.modalContentContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setOTPmodal( false )
          }}
          style={{
            width: wp( 7 ),
            height: wp( 7 ),
            borderRadius: wp( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.CLOSE_ICON_COLOR,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: wp( 3 ),
            marginRight: wp( 3 ),
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} />
        </TouchableOpacity>
        <View>
          <View
            style={{
              marginLeft: wp( 7 ),
            }}
          >
            <Text
              style={{
                ...styles.modalTitleText,
                fontSize: 18,
                fontFamily: Fonts.Regular,
              }}
            >
              Show Second Factor
              {/* {props.encryptLinkWith === DeepLinkEncryptionType.NUMBER ? 'Share phone' : props.encryptLinkWith === DeepLinkEncryptionType.EMAIL ? 'Share Email ' : props.encryptLinkWith === DeepLinkEncryptionType.SECRET_PHRASE ? 'Secret Phrase ' : 'Share OTP '} */}

            </Text>
          </View>
          <Text
            style={{
              ...styles.modalInfoText,
              paddingTop: 8,
              marginLeft: 30,
              fontFamily: Fonts.Regular,
              fontSize: 14,
            }}
          >
            {'Touch to copy'}
          </Text>
          {OTP.length == '6' &&
                <TouchableOpacity style={styles.otpContainer} onPress={writeToClipboard}>
                  <View style={styles.otpBoxContainer}>
                    <Text style={styles.otpBoxText}>{shortOTP[ 0 ]}</Text>
                  </View>
                  <View style={styles.otpBoxContainer}>
                    <Text style={styles.otpBoxText}>{shortOTP[ 1 ]}</Text>
                  </View>
                  <View style={styles.otpBoxContainer}>
                    <Text style={styles.otpBoxText}>{shortOTP[ 2 ]}</Text>
                  </View>
                  <View style={styles.otpBoxContainer}>
                    <Text style={styles.otpBoxText}>{shortOTP[ 3 ]}</Text>
                  </View>
                  <View style={styles.otpBoxContainer}>
                    <Text style={styles.otpBoxText}>{shortOTP[ 4 ]}</Text>
                  </View>
                  <View style={styles.otpBoxContainer}>
                    <Text style={styles.otpBoxText}>{shortOTP[ 5 ]}</Text>
                  </View>
                </TouchableOpacity>
          }
          {OTP.length > 6 &&
            <TouchableOpacity onPress={writeToClipboard} style={styles.otpInputFieldContainer}>
              <Text style={styles.otpInput}>{OTP}</Text>
            </TouchableOpacity>
          }
          <View>
            <Text
              style={{
                margin: 10,
                marginLeft: 35,
                color: '#6C6C6C',
                width:'85%',
                fontFamily: Fonts.Regular
              }}
            >
              Use a medium/ app different to that used for sending the gift
            </Text>

          </View>
        </View>
      </View>
    )

  }


  function onPress() {
    if( type === 'QR'  && qrCode  ) {
      capture()
    } else {
      shareOption()
    }
  }

  function capture() {
    viewRef.current.capture().then( uri => {
      Share.open(
        Platform.select( {
          default: {
            title: 'Share Gift Card',
            url: `file://${uri}`,
          }
        }, )
      )
        .then( ( res ) => {
        } )
    } )
  }


  const getTheme = () => {
    // props.themeId
    const filteredArr = ThemeList.filter( ( item => item.id === themeId ) )
    return filteredArr[ 0 ]
  }

  return (
    <ScrollView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor,
        flexDirection: 'row',
        justifyContent: 'space-between'
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <HeaderTitle
        firstLineTitle={`Share via ${type === 'Link' ? 'link' : 'QR'}`}
        secondLineTitle={type === 'Link' ? 'Once you have shared the QR/ link, you can view the Second Factor set (if any)' : ''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <ViewShot ref={viewRef} options={{
        format: 'jpg', quality: 1
      }}>

        <DashedLargeContainer
          titleText={'Gift Sats'}
          titleTextColor={Colors.black}
          subText={senderName}
          extraText={giftNote? giftNote: 'This is to get you started!\nWelcome to Bitcoin'}
          amt={amt}
          type={type}
          onPress={onPress}
          image={<GiftCard height={60} width={60} />}
          theme={getTheme()}
          isSend
          renderQrOrLink={() => {
            return (
              <>
                {type === 'QR' &&
            <View
              style={[ styles.mainContainer,
                {
                  // marginTop: hp( '1%' ),
                  // marginBottom: hp( '1%' ),
                } ]}
            >
              <View style={[ styles.qrContainer, {
              } ]}>
                {!link ? (
                  <ActivityIndicator size="large" color={Colors.babyGray} />
                ) : (
                  <QRCode
                    title={'Gift card'}
                    value={link}
                    size={hp( '20%' )} />
                )}
              </View>
            </View>
                }
                {/* {!props.isGift &&
            <HeaderTitle
              firstLineTitle={strings.orShare}
              secondLineTitle={strings.WithContact}
              infoTextNormal={''}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />
            } */}
                {type === 'Link' &&
            // <CopyThisText
            //   openLink={link ? shareOption : () => { }}
            //   backgroundColor={Colors.white}
            //   text={link ? link : strings.Creating}
            //   width={'20%'}
            //   height={'18%'}
            // />
            <View
              style={{
                // flex: 1,
                width:wp( '75%' ),
                backgroundColor: Colors.backgroundColor,
                borderRadius: wp( 3 ),
                height: wp( props.height ? props.height : '13%' ),
                paddingHorizontal: 15,
                justifyContent: 'center',
                alignItems: 'center', marginTop: hp( 2 )
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: RFValue( 13 ),
                  color: Colors.lightBlue,
                }}
              >
                {link ? link : strings.Creating}
              </Text>
            </View>
                }
              </>
            )
          }}
        />
      </ViewShot>


      <Text style={{
        color: Colors.lightTextColor,
        fontSize: RFValue( 14 ),
        fontFamily: Fonts.Regular,
        // fontWeight: '700',
        letterSpacing: 0.01,
        lineHeight: 18,
        marginHorizontal: wp( 8 ),
        marginVertical: 10
      }}>
        Once you have shared the QR/link, you can view the OTP
      </Text>

      <AppBottomSheetTouchableWrapper
        onPress={() => {
          OTP && DeepLinkEncryptionType.SECRET_PHRASE !==  encryptLinkWith ? ( setOTPmodal( true ) ) :
            props.navigation.pop( 1 )
          try {
            if( props.route.params?.setActiveTab ) {
              props.route.params?.setActiveTab( 'SENT' )
            }
          } catch ( error ) {
            //
          }
        }}
        style={{
          ...styles.proceedButtonView,
          elevation: 10,
          backgroundColor:
               Colors.blue
        }}
      >
        <Text style={styles.proceedButtonText}>{OTP ? 'Show 2nd Factor' : 'Yes, I have shared'}</Text>
      </AppBottomSheetTouchableWrapper>
      {OTPmodal &&
      <ModalContainer
        closeBottomSheet={() => setOTPmodal( false )}
        visible={OTPmodal}
        onBackground={()=>setOTPmodal( false )}
      >
        {shareOTPModal()}
      </ModalContainer>}
    </ScrollView>
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
  qrContainer: {
    height: hp( '24%' ),
    justifyContent: 'center',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  mainContainer: {
    marginTop: 15,
    marginRight: 20,
    marginLeft:20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedButtonView: {
    marginTop: hp( '2%' ),
    marginBottom: hp( '4%' ),
    height: wp( '13%' ),
    width: wp( '40%' ),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    // shadowColor: Colors.shadowBlue,
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 15, height: 15
    // },
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
  },
  modalContentContainer: {
    backgroundColor: Colors.backgroundColor,
    paddingBottom: hp( 4 ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    marginRight: wp( 10 )
  },
  otpContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:30,
    marginTop:20
  },
  otpBoxContainer:{
    height:50,
    width: 45,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#fff',
    borderRadius:10
  },
  otpBoxText:{
    fontSize:26,
    color:'#000',
    fontWeight:'400'
  },
  otpInput:{
    //letterSpacing:7,
    fontSize:22,
  },
  otpInputFieldContainer:{
    marginTop:20,
    borderRadius: 10,
    backgroundColor:'#fff',
    // height:50,
    justifyContent:'center',
    alignItems:'center',
    padding:10,
    marginHorizontal:30,
  },
  btnContainer:{
    marginTop:10,
    backgroundColor:'#006DB4',
    width:100,
    padding:14,
    borderRadius:6,
    marginLeft: 30,
    justifyContent:'center',
    alignItems:'center',
  },
  btnText: {
    color: '#fff',
    fontWeight:'500',
    fontSize:15,
    fontFamily: Fonts.Regular
  }
} )
