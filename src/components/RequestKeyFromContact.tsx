import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Platform, TextInput } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import moment from 'moment'
import Share from 'react-native-share'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import { ScrollView } from 'react-native-gesture-handler'
import QRCode from './QRCode'
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
} from '../common/constants/wallet-service-types'
import CopyThisText from '../components/CopyThisText'
import UserDetails from './UserDetails'
import BottomInfoBox from './BottomInfoBox'
import HeaderTitle from './HeaderTitle'
import { translations } from '../common/content/LocContext'
import DashedContainer from '../pages/FriendsAndFamily/DashedContainer'
import GiftCard from '../assets/images/svgs/icon_gift.svg'

export default function RequestKeyFromContact( props ) {
  const [ shareLink, setShareLink ] = useState( '' )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
  const [ note, setNote ] = useState( '' )
  const contact = props.contact
  const [ serviceType, setServiceType ] = useState(
    props.serviceType ? props.serviceType : '',
  )
  //console.log("amountCurrency", props.amountCurrency);
  const [ Contact, setContact ] = useState( props.contact ? props.contact : {
  } )

  useEffect( () => {
    setShareLink( props.link.replace( /\s+/g, '' ) )
    // if ( props.infoText ) setInfoText( props.infoText )
  }, [ props.link ] )

  useEffect( () => {
    if ( contact ) {
      setContact( props.contact )
    }
  }, [ contact ] )

  useEffect( () => {
    if ( props.serviceType ) {
      setServiceType( props.serviceType )
    }
  }, [ props.serviceType ] )

  const shareOption = async () => {
    try {
      // const url = 'https://awesome.contents.com/';
      const title = 'Request'

      const options = Platform.select( {
        default: {
          title,
          message: `${shareLink}`,
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
  return (
    <View style={styles.modalContainer}>
      {/* <ScrollView> */}
      {/* <View
          style={styles.mainView}
        > */}
      {/* {props.isModal &&
          <View style={styles.topSubView}>
            <AppBottomSheetTouchableWrapper
              onPress={() => {
                props.onPressBack()
              }}
              style={styles.backButton}
            >
              <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
            </AppBottomSheetTouchableWrapper>
            <View style={{
              flex: 1, marginLeft: 5
            }}>
              {props.headerText &&
                <Text style={styles.modalHeaderTitleText}>
                  {props.headerText}
                </Text>
              }
              {props.subHeaderText &&
                <Text
                  style={styles.subHeaderText}
                >
                  {props.subHeaderText}
                </Text>
              }
            </View>
          </View>
        } */}
      {/* </View> */}
      {/* <View style={[ styles.topContainer, {
        marginTop: !props.isModal ? 0 : hp( '1.7%' ),
        marginBottom: !props.isModal ? 0 : hp( '1.7%' ),
      } ]}>
        <UserDetails
          titleStyle={styles.titleStyle}
          contactText={props.contactText}
          Contact={Contact} />
      </View> */}
      <HeaderTitle
        firstLineTitle={props.headerText ? props.headerText : strings.scanQR}
        secondLineTitle={props.subHeaderText ? props.subHeaderText : strings.withHexa}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      {props.isGift &&
      <>
        <View
          style={{
            width: '90%',
            backgroundColor: Colors.gray7,
            shadowOpacity: 0.06,
            shadowOffset: {
              width: 10, height: 10
            },
            shadowRadius: 10,
            elevation: 2,
            alignSelf: 'center',
            borderRadius: wp( 2 ),
            marginTop: hp( 3 ),
            marginBottom: hp( 1 ),
            paddingVertical: hp( 3 ),
            paddingHorizontal: wp( 3 ),
            flexDirection: 'row',
            alignItems: 'center'
          }}>
          <GiftCard />
          <View style={{
            marginHorizontal: wp( 3 )
          }}>
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 10 ),
              fontFamily: Fonts.FiraSansRegular,
            }}>
                from <Text style={{
                color: Colors.textColorGrey,
                fontSize: RFValue( 11 ),
                fontFamily: Fonts.FiraSansMediumItalic,
              }}>
                Checking Account
              </Text>
            </Text>
            <Text style={{
              color: Colors.lightTextColor,
              fontSize: RFValue( 10 ),
              fontFamily: Fonts.FiraSansRegular,
            }}>
              {moment(  ).format( 'lll' )}
            </Text>
          </View>
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 'auto'
          }}>
            <Text style={{
              color: Colors.black,
              fontSize: RFValue( 24 ),
              fontFamily: Fonts.FiraSansRegular
            }}>
              {props.amt}
              <Text style={{
                color: Colors.lightTextColor,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.FiraSansRegular
              }}> sats
              </Text>
            </Text>
            {props.image}
          </View>

        </View>
        <View
          style={[ styles.inputBox, styles.inputField ]}
        >
          <TextInput
            style={styles.modalInputBox}
            placeholder={`${common.addNote} (${common.optional})`}
            placeholderTextColor={Colors.gray1}
            value={note}
            keyboardType={
              Platform.OS == 'ios'
                ? 'ascii-capable'
                : 'visible-password'
            }
            returnKeyType="done"
            returnKeyLabel="Done"
            autoCompleteType="off"
            autoCorrect={false}
            autoCapitalize="none"
            onChangeText={( text ) => {
              setNote( text )
            }}
          />
        </View>
      </>
      }
      <View
        style={[ styles.mainContainer,
          {
            marginTop: !props.isModal ? hp( '2%' ) : hp( '1.7%' ),
            marginBottom: !props.isModal ? hp( '2%' ) : hp( '1.7%' ),
          } ]}
      >
        <View style={[ styles.qrContainer, {
          marginVertical: hp( '4%' )
        } ]}>
          {!props.QR ? (
            <ActivityIndicator size="large" color={Colors.babyGray} />
          ) : (
            <QRCode
              title="F&F request"
              value={props.QR}
              size={hp( '27%' )} />
          )}
        </View>

      </View>
      {!props.isGift &&
      <HeaderTitle
        firstLineTitle={strings.orShare}
        secondLineTitle={strings.WithContact}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      }
      <CopyThisText
        openLink={shareLink ? shareOption : () => { }}
        backgroundColor={Colors.white}
        text={shareLink ? shareLink : strings.Creating}
        width={'20%'}
        height={'18%'}
      />
      {/* </ScrollView> */}

    </View>
  )
}
const styles = StyleSheet.create( {
  inputField: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    width: wp( 90 )
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 10, height: 10
    },
    backgroundColor: Colors.backgroundColor1,
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
    width: '90%'

  },
  modalInfoText: {
    width: wp( 90 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    lineHeight: 18,
    marginLeft: wp( 5 ),
    paddingVertical: wp( 1 )
  },
  titleStyle: {
    color: Colors.black,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContainer: {
    backgroundColor: Colors.backgroundColor,
    alignSelf: 'center',
    width: '100%',
  },
  qrContainer: {
    height: hp( '27%' ),
    justifyContent: 'center',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  containerQrCode: {
    backgroundColor: 'gray',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  textQr: {
    color: 'white',
    fontSize: 17,
    textAlign: 'center',
    paddingVertical: 5,
  },
  containerTextQr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5, paddingHorizontal:5,
  },
  mainContainer: {
    marginLeft: 20,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContainer: {
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeaderText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    paddingTop: 5,
  },
  mainView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp( '1.5%' ),
    paddingTop: hp( '1%' ),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp( '1.5%' ),
  },
  backButton: {
    height: 30,
    width: 30,
    justifyContent: 'center'
  },
  topSubView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start'
  }
} )
