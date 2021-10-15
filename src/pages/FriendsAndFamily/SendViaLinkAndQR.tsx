import React, { useState, useEffect, useCallback, useContext } from 'react'
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

export default function SendViaLinkAndQR( props ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'f&f' ]
  const type = props.navigation.getParam( 'type' )
  const qrCode = props.navigation.getParam( 'qrCode' )
  const link = props.navigation.getParam( 'link' )
  const amt = props.navigation.getParam( 'amt' )
  const senderName = props.navigation.getParam( 'senderName' )
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

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
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
        secondLineTitle={'Lorem ipsum dolor sit amet'}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <DashedLargeContainer
        titleText={'Gift Card'}
        titleTextColor={Colors.black}
        subText={props.senderName}
        extraText={'This is to get you started!\nWelcome to Bitcoin'}
        amt={numberWithCommas( amt )}
        image={<GiftCard />}
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
                    title={'Gift Address'}
                    value={qrCode}
                    size={hp( '22%' )} />
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

      {/* <RequestKeyFromContact
        isModal={false}
        headerText={'Send gift'}
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
} )
