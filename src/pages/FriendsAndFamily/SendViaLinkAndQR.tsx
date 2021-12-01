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
  Platform
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

export default function SendViaLinkAndQR( props ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const type = props.navigation.getParam( 'type' )
  const qrCode = props.navigation.getParam( 'qrCode' )
  const link = props.navigation.getParam( 'link' )
  const amt = props.navigation.getParam( 'amt' )
  const senderName = props.navigation.getParam( 'senderName' )
  const themeId = props.navigation.getParam( 'themeId' )
  const giftNote = props.navigation.getParam( 'giftNote' )
  const viewRef = useRef( null )

  useEffect( () => {
    onPress()
  }, [ qrCode ] )

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
          message: `${link}`,
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

  function onPress() {
    if( type === 'QR'  && qrCode ) {
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
            message: `${link}`,
            url: `file://${uri}`,
          },
          ios: {
            activityItemSources: [
              {
                placeholderItem: {
                  type: 'url',
                  content: `file://${uri}`,
                },
              }
            ],
          }
        }, )
      )
        .then( ( res ) => {
        } )
    } )
  }

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
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
              color={Colors.blue}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <HeaderTitle
        firstLineTitle={`Share via ${type === 'Link' ? 'link' : 'QR'}`}
        secondLineTitle={type === 'Link' ? 'Send the link to your contact from any app below' : ''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <ViewShot ref={viewRef} options={{
        format: 'jpg', quality: 1
      }}>

        <DashedLargeContainer
          titleText={'Gift Card'}
          titleTextColor={Colors.black}
          subText={senderName}
          extraText={giftNote? giftNote: 'This is to get you started!\nWelcome to Bitcoin'}
          amt={amt}
          onPress={onPress}
          image={<GiftCard height={60} width={60} />}
          theme={getTheme()}
          renderQrOrLink={() => {
            return (
              <>
                {type === 'QR' &&
            <View
              style={[ styles.mainContainer,
                {
                  marginTop: hp( '2%' ),
                  marginBottom: hp( '1%' ),
                } ]}
            >
              <View style={[ styles.qrContainer, {
              } ]}>
                {!qrCode ? (
                  <ActivityIndicator size="large" color={Colors.babyGray} />
                ) : (
                  <QRCode
                    title={'Gift card'}
                    value={qrCode}
                    size={hp( '24%' )} />
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

      <AppBottomSheetTouchableWrapper
        onPress={() => {
          props.navigation.pop( 3 )
          try {
            if( props.navigation.state.params.setActiveTab ) {
              props.navigation.state.params.setActiveTab( 'SENT' )
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
        <Text style={styles.proceedButtonText}>Yes, I have shared</Text>
      </AppBottomSheetTouchableWrapper>
      {/* <RequestKeyFromContact
        isModal={false}
        headerText={'Send Gift'}
        subHeaderText={'You can send it to anyone using the QR or the link'}
        contactText={strings.adding}
        isGift={true}
        senderName={senderName}
        contact={{
        }}
        QR={giftQR}
        link={giftDeepLink}
        contactEmail={''}
        onPressBack={() => {
          props.navigation.goBack()
        }}
        onPressDone={() => {
          // openTimer()
        }}
        amt={numberWithCommas( giftToSend.amount )}
        onPressShare={() => {
        }}
      /> */}
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
    height: hp( '27%' ),
    justifyContent: 'center',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  mainContainer: {
    marginLeft: 20,
    marginRight: 20,
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
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
  },
} )
