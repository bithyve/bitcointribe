import React from 'react'
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native'
import Fonts from '../../common/Fonts'
import NavStyles from '../../common/Styles/NavStyles'
import CommonStyles from '../../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CopyThisText from '../../components/CopyThisText'
import Colors from '../../common/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { RFValue } from 'react-native-responsive-fontsize'
import QRCode from '../../components/QRCode'
import { authenticator } from 'otplib'

const TwoFASetup = props => {
  const twoFASetup = props.navigation.getParam( 'twoFASetup' )
  // const [ twoFAValidationModal, showTwoFAValidationModal ] = useState( false )
  const { twoFAKey } = twoFASetup

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.white
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={
            () => {
              props.navigation.navigate( 'Home' )
            }
          }
          hitSlop={{
            top: 20, left: 20, bottom: 20, right: 20
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={NavStyles.modalHeaderTitleView}>
        <View style={{
          marginTop: hp( '1%' )
        }}>
          <Text style={NavStyles.modalHeaderTitleText}>
            Setup Two Factor Authentication
          </Text>
          <Text style={NavStyles.modalHeaderInfoText}>
            Please scan the following QR on your authenticator app like Google
            Authenticator in order to setup the 2FA
          </Text>
          <Text style={NavStyles.modalHeaderInfoText}>
            The authenticator app should be installed on a different device
          </Text>
        </View>
      </View>
      <View style={NavStyles.modalContentView}>
        <QRCode title="2FA key" value={authenticator.keyuri( 'hexawallet.io', 'HEXA', twoFAKey )} size={hp( '27%' )} />
        <CopyThisText text={twoFAKey} />
      </View>
      <View style={{
        margin: 20
      }}>
        <View style={{
          flexDirection: 'row', marginTop: 20, marginBottom: 20
        }}>
          <TouchableOpacity
            onPress={
              () => {
                props.navigation.navigate( 'TwoFAValidation' )
                // showTwoFAValidationModal( true )
              }
            }
            style={{
              height: wp( '13%' ),
              width: wp( '40%' ),
              backgroundColor: Colors.blue,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: {
                width: 15, height: 15
              },
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue( 13 ),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={
              () => {
                props.navigation.navigate( 'Home' )
              }
            }
            style={{
              height: wp( '13%' ),
              width: wp( '30%' ),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
            }}
          >
            {/* <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(13),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Activate Later
            </Text> */}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default TwoFASetup
