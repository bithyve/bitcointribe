import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
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

export default function RequestKeyFromContact( props ) {
  const [ shareLink, setShareLink ] = useState( '' )
  const strings = translations[ 'f&f' ]
  const common = translations[ 'common' ]
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
        firstLineTitle={strings.scanQR}
        secondLineTitle={strings.withHexa}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
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
      <HeaderTitle
        firstLineTitle={strings.orShare}
        secondLineTitle={strings.WithContact}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <CopyThisText
        openLink={shareLink ? shareOption : () => { }}
        backgroundColor={Colors.white}
        text={shareLink ? shareLink : strings.Creating}
        width={'22%'}
        height={'22%'}
      />
      {/* </ScrollView> */}

    </View>
  )
}
const styles = StyleSheet.create( {
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
