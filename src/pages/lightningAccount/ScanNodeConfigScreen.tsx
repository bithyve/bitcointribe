import React, { useContext, useState } from 'react'
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP, heightPercentageToDP as hp,
  widthPercentageToDP, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import HeaderTitle from '../../components/HeaderTitle'
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner'
import Toast from '../../components/Toast'
import LndConnectUtils from '../../utils/ln/LndConnectUtils'

const styles = StyleSheet.create( {
  viewContainer: {
    flex: 1,
    backgroundColor: Colors.LIGHT_BACKGROUND,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  buttonView: {
    height: wp( '12%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    // shadowColor: Colors.shadowBlue,
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 15, height: 15
    // },
    backgroundColor: Colors.blue,
    marginHorizontal: wp( 4 ),
    marginVertical: hp( '2%' ),
  },
  icArrow: {
    marginLeft: wp( '3%' ),
    marginRight: wp( '3%' ),
    alignSelf: 'center',
  },
  textValue: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 13 ),
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginLeft: wp( '3%' ),
  },
  textHelpUs: {
    fontFamily: Fonts.SemiBold,
    fontSize: RFValue( 12 ),
    color: Colors.THEAM_TEXT_COLOR,
    marginLeft: wp( '3%' ),
  },
  textHelpUsSub: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginLeft: wp( '3%' ),
    marginTop: wp( '1%' ),
  },
  addModalView: {
    backgroundColor: Colors.gray7,
    paddingVertical: 25,
    paddingHorizontal: widthPercentageToDP( 1 ),
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: heightPercentageToDP( '5' ),
    alignSelf: 'center',
    borderRadius: widthPercentageToDP( '2' ),
    marginBottom: heightPercentageToDP( '1.2' ),
    shadowOpacity: 0.05,
    // shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 6,
    elevation: 6,
  },
  divider:{
    width:'100%',
    height:20
  }
} )


export default function ScanNodeConfig( { navigation } ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'lightningAccount' ]
  const common = translations[ 'common' ]
  const [ knowMore, setKnowMore ] = useState( true )

  async function handleBarcodeRecognized( { data: scannedData }: { data: string } ) {
    if( scannedData.includes( 'config' ) ){
      const url = scannedData.split( 'config=' )[ 1 ]
      LndConnectUtils.procesBtcPayConfig( url ).then(
        res=> {
          console.log( res )
          const {
            uri,
            macaroon,
            chainType,
            port
          } = res.configurations[ 0 ]
          if ( uri && macaroon ) {
            navigation.navigate( 'EnterNodeConfig', {
              node: {
                host: uri, port, macaroonHex: macaroon
              },
            } )
          } else {
            Toast( 'Error fetching config' )
          }
        }
      ).catch( e=> {
        console.log( e )
        Toast( 'Error fetching config' )

      } )
    } else {
      const {
        host,
        port,
        macaroonHex
      } = LndConnectUtils.processLndConnectUrl( scannedData )
      if( host &&  macaroonHex ) {
        navigation.navigate( 'EnterNodeConfig', {
          node: {
            host: host, port: port, macaroonHex: macaroonHex
          },
        } )
      } else {
        Toast( 'Invalid QR' )
      }
    }
  }

  return (

    <SafeAreaView style={styles.viewContainer}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor,
        marginRight: wp( 4 )
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
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
      <ScrollView
        overScrollMode="never"
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1
        }}
        keyboardShouldPersistTaps='handled'>
        <HeaderTitle
          firstLineTitle={'Set up Lighting Account'}
          secondLineTitle={strings.Connectyournode}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
        <View style={styles.divider}/>
        <CoveredQRCodeScanner
          onCodeScanned={handleBarcodeRecognized}
          containerStyle={{
            marginBottom: 16
          }}
        />
        {/* <TouchableOpacity
          style={styles.buttonView}
          activeOpacity={0.6}
          onPress={() => {
            navigation.navigate( 'EnterNodeConfig' )
          }}
        >
          <Text style={styles.buttonText}>{strings.Entermanually}</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate( 'EnterNodeConfig' )
          }}
          activeOpacity={0.6}
          style={styles.addModalView
          }
        >
          <View style={{
            flex: 0.9,
          }
          }>
            <Text
              style={styles.textHelpUs}
            >
              {strings.Entermanually}
            </Text>
            <Text
              style={styles.textHelpUsSub}
            >
              {'Customize your set up'}
            </Text>
          </View>
          <Ionicons
            name={'chevron-forward'}
            color={Colors.textColorGrey}
            size={22}
            style={styles.icArrow}
          />
        </TouchableOpacity>
      </ScrollView>


    </SafeAreaView>
  )
}
