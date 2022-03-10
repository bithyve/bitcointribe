import React, { useContext } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Text,
  Linking,
} from 'react-native'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Fonts from '../common/Fonts'
import Colors from '../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from '../components/BottomInfoBox'
import openLink from '../utils/OpenLink'
import { LocalizationContext } from '../common/content/LocContext'
import { useDispatch } from 'react-redux'
import { setCloudDataRecovery, setIsFileReading } from '../store/actions/cloud'
import { setDownloadedBackupData } from '../store/actions/BHR'

const WalletInitializationScreen = props => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const dispatch = useDispatch()
  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{
        marginBottom: wp( '5%' )
      }}>
        <View style={styles.titleView}>
          <Text style={styles.headerTitleText}>{`${strings.new} Wallet`}</Text>
          <Text style={styles.headerInfoText}>
            {strings.appcreates}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => props.navigation.navigate( 'NewWalletName' )}
          style={styles.NewWalletTouchableView}
        >
          <Image
            style={{
              ...styles.iconImage, width: wp( 7 ),
              height: wp( 7 ), marginBottom: wp( 2 )
            }}
            source={require( '../assets/images/icons/icon_newwallet.png' )}
          />
          <View style={styles.textView}>
            <Text style={styles.touchableText}>
              {`${strings.Createanew} Wallet`}
            </Text>
          </View>
          <View style={styles.arrowIconView}>
            <MaterialIcons
              name="arrow-forward-ios"
              color={Colors.borderColor}
              size={15}
              style={{
                alignSelf: 'center'
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={{
        flex: 1,
      }}>
        <View style={{
          ...styles.titleView, marginTop: wp( '2%' )
        }}>
          <Text style={styles.headerTitleText}>{`${strings.Existing} Wallet`}</Text>
          <Text style={styles.headerInfoText}>
            {strings.previously}
          </Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            dispatch( setDownloadedBackupData( [] ) )
            dispatch( setCloudDataRecovery( null ) )
            dispatch( setIsFileReading( false ) )
            props.navigation.navigate( 'RestoreWithICloud' )
          }}
          style={{
            ...styles.NewWalletTouchableView, marginBottom: wp( '7%' )
          }}
        >
          <Image
            style={styles.iconImage}
            source={require( '../assets/images/icons/icon_secrets.png' )}
          />
          <View style={styles.textView}>
            <Text style={styles.touchableText}>Using Recovery Keys</Text>
          </View>
          <View style={styles.arrowIconView}>
            <MaterialIcons
              name="arrow-forward-ios"
              color={Colors.borderColor}
              size={15}
              style={{
                alignSelf: 'center'
              }}
            />
          </View>
        </TouchableOpacity>
        <View style={{
          marginLeft: wp( '3%' ), marginRight: wp( '3%' )
        }}>
          <Text
            onPress={()=>  Linking.openURL( 'https://hexawallet.io/faq/' )
              .then( ( _data ) => { } )
              .catch( ( _error ) => {
              } )}
            style={styles.headerInfoText}>{strings.restoreNoteV1}<Text style={{
              color: Colors.blue
              , textDecorationLine:'underline'
            }}>{'\nhttps://hexawallet.io/faq/'}</Text></Text>
        </View>
        {/* <TouchableOpacity
          onPress={async () => {
            // props.navigation.navigate( 'RestoreWithICloud' )
          }}
          style={{
            ...styles.NewWalletTouchableView,
            marginBottom: wp( '5%' )
          }}
        >
          <Image
            style={{
              ...styles.iconImage, width: wp( 8 ),
              height: wp( 8 ), marginLeft: wp( 1 ),
            }}
            source={require( '../assets/images/icons/seedwords.png' )}
          />
          <View style={styles.textView}>
            <Text style={styles.touchableText}>Using Seed Words</Text>
          </View>
          <View style={styles.arrowIconView}>
            <MaterialIcons
              name="arrow-forward-ios"
              color={Colors.borderColor}
              size={15}
              style={{
                alignSelf: 'center'
              }}
            />
          </View>
        </TouchableOpacity> */}

        <View style={{
          flex: 1,
        }}>
          <View style={{
            marginTop: 'auto'
          }}>
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={strings.TermsService}
              infoText={
                `${strings.proceeding} `
              }
              linkText={strings.TermsService}
              onPress={() => openLink( 'https://hexawallet.io/terms-of-service/' )}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default WalletInitializationScreen

let styles = StyleSheet.create( {
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 25 ),
    marginLeft: 15,
    marginRight: 15,
    fontFamily: Fonts.FiraSansRegular,
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    marginLeft: 15,
    marginRight: 15,
    fontWeight: 'normal',
    marginTop: 3,
    fontFamily: Fonts.FiraSansRegular,
    lineHeight: RFValue( 16 ),
  },
  NewWalletTouchableView: {
    flexDirection: 'row',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    height: wp( '16%' ),
    backgroundColor: Colors.backgroundColor1,
    borderRadius: 10,
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowColor: Colors.borderColor,
    elevation: 6,
  },
  iconImage: {
    resizeMode: 'contain',
    width: wp( 9 ),
    height: wp( 9 ),
    alignSelf: 'center',
  },
  textView: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
  touchableText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  arrowIconView: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleView: {
    padding: wp( '5%' ),
    paddingLeft: wp( '3%' ),
    marginTop: wp( '5%' ),
    marginBottom: wp( '5%' )
  }
} )
