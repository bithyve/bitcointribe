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
import QRCode from 'react-native-qrcode-svg'
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
} from '../common/constants/wallet-service-types'
import CopyThisText from '../components/CopyThisText'
import UserDetails from './UserDetails'

export default function RequestKeyFromContact( props ) {
  const [ shareLink, setShareLink ] = useState( '' )
  // console.log('props.QR RequestKeyFromContact > ', props.QR);

  const contact = props.navigation ? props.navigation.state.params.contact : props.contact
  const [ serviceType, setServiceType ] = useState(
    props.navigation ? props.navigation.state.params.serviceType : props.serviceType ? props.serviceType : '',
  )
  //console.log("amountCurrency", props.amountCurrency);
  const [ Contact, setContact ] = useState( props.navigation ? props.navigation.state.params.contact : props.contact )

  useEffect( () => {
    setShareLink( props.navigation ? props.navigation.state.params.link : props.link )
    // if ( props.infoText ) setInfoText( props.infoText )
  }, [ props.link ] )

  useEffect( () => {
    if ( contact ) {
      setContact( props.navigation ? props.navigation.state.params.link : props.link )
    }
  }, [ contact ] )

  useEffect( () => {
    const serviceTypeProp = props.navigation ? props.navigation.state.params.serviceType : props.serviceType
    if ( serviceTypeProp ) {
      setServiceType( serviceTypeProp )
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
          if ( props.navigation ) {
            props.navigation.state.params.onPressShare()
          } else {
            props.onPressShare()
          }
          // }
        } )
        .catch( ( err ) => {
        } )
    } catch ( error ) {
      // console.log(error);

    }
  }
  const isModalProp = props.navigation ? props.navigation.state.params.isModal : props.isModal
  const headerText = props.navigation ? props.navigation.state.params.headerText : props.headerText
  const subHeaderText = props.navigation ? props.navigation.state.params.subHeaderText : props.subHeaderText
  const qrProp = props.navigation ? props.navigation.state.params.QR : props.QR
  return (
    <View style={styles.modalContainer}>
      <View
        style={styles.mainView}
      >
        {isModalProp &&
					<View style={styles.topSubView}>
					  <AppBottomSheetTouchableWrapper
					    onPress={() => {
					      if ( props.navigation ) {
					        props.navigation.state.params.onPressBack()
					      } else {
					        props.onPressBack()
					      }

					    }}
					    style={styles.backButton}
					  >
					    <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
					  </AppBottomSheetTouchableWrapper>
					  <View style={{
					    flex: 1, marginLeft: 5
					  }}>
					    {headerText &&
								<Text style={styles.modalHeaderTitleText}>
								  {headerText}
								</Text>
					    }
					    {subHeaderText &&
								<Text
								  style={styles.subHeaderText}
								>
								  {subHeaderText}
								</Text>
					    }
					  </View>
					</View>
        }
      </View>
      <View style={[ styles.topContainer, {
        marginTop: !isModalProp ? 0 : hp( '1.7%' ),
        marginBottom: !isModalProp ? 0 : hp( '1.7%' ),
      } ]}>
        <UserDetails
          titleStyle={styles.titleStyle}
          contactText={props.navigation ? props.navigation.state.params.contactText : props.contactText}
          Contact={Contact} />
      </View>
      <ScrollView contentContainerStyle={{
        flex: 1
      }}>
        <View
          style={[ styles.mainContainer,
            {
              marginTop: !isModalProp ? hp( '2%' ) : hp( '1.7%' ),
              marginBottom: !isModalProp ? hp( '2%' ) : hp( '1.7%' ),
            } ]}
        >
          <View style={[ styles.qrContainer, {
            marginTop: !isModalProp ? 0 : hp( '4%' )
          } ]}>
            {!qrProp ? (
              <ActivityIndicator size="large" color={Colors.babyGray} />
            ) : (
              <QRCode value={qrProp} size={hp( '27%' )} />
            )}
          </View>
          <CopyThisText
            openLink={shareLink ? shareOption : ()=> {}}
            backgroundColor={Colors.backgroundColor1}
            text={shareLink ? shareLink : 'Creating Link....'}
          />
        </View>
      </ScrollView>

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
    height: '100%',
    backgroundColor: Colors.white,
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
