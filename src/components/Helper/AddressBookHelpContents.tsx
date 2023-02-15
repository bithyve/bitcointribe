import React, { useRef } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import openLink from '../../utils/OpenLink'
import { ScrollView } from 'react-native-gesture-handler'

export default function AddressBookHelpContents( props ) {
  const scrollViewRef = useRef<ScrollView>()

  return (
    <View style={styles.modalContainer}>
      <AppBottomSheetTouchableWrapper
        style={{
          justifyContent: 'center', alignItems: 'center'
        }}
        activeOpacity={10}
        onPress={() => props.titleClicked && props.titleClicked()}
      >
        <Text style={styles.headerText}>Friends & Family</Text>
      </AppBottomSheetTouchableWrapper>
      <View style={styles.headerSeparator} />
      <ScrollView
        ref={scrollViewRef}
        style={{
          flex: 1,
          backgroundColor: Colors.blue,
        }}
        snapToInterval={hp( '80%' )}
        decelerationRate="fast"
      >
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp( '5%' ),
            }}
          >
            Friends & Family are people who you trust and end up paying regularly. When sending sats to people on your Friends & Family, you are not required to ask them for a QR code when sending - saving lots of time!
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Image
              source={require( '../../assets/images/icons/FnF_recovery_key_2.png' )}
              style={styles.helperImage}
            />
          </View>
          <Text
            style={{
              ...styles.infoText,
            }}
          >
            Picking someone to be Friends & Family creates a secure channel between you and them. This means you can pay them - and they can pay you - whenever you want, securely!
          </Text>
          <AppBottomSheetTouchableWrapper style={{
            alignItems: 'center'
          }} onPress={() => {
            scrollViewRef.current?.scrollTo( {
              x: 0, y: hp( '80%' ), animated: true
            } )
          }}>
            <FontAwesome name="angle-double-down" color={Colors.white} size={40} />
          </AppBottomSheetTouchableWrapper>
          <View
            style={{
              borderStyle: 'dotted',
              borderWidth: 1,
              borderRadius: 1,
              borderColor: Colors.white,
              ...styles.separatorView,
            }}
          />
        </View>
        <View style={styles.ElementView}>
          <Text
            style={{
              ...styles.infoText,
              marginTop: wp( '10%' ),
            }}
          >
            We send your Friends & Family your extended public key for your wallet. An extended public key can be used by someone else to generate new addresses on your behalf.
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Image
              source={require( '../../assets/images/icons/test_account_info_2.png' )}
              style={styles.helperImage}
            />
          </View>
          <View style={styles.bottomLinkView}>
            <Text style={{
              ...styles.infoText, marginLeft: 0, marginRight: 0,
            }}>
              If someone has your extended public key, your sats are still safe! This is because the contact does not possess your private key, which is needed to move bitcoin out of your wallet.
            </Text>
            <View style={{
              ...styles.linkView, marginTop: wp( '7%' )
            }}>
              <Text style={styles.toKnowMoreText}>To know more,</Text>
              <AppBottomSheetTouchableWrapper
                style={{
                  marginLeft: 5
                }}
                onPress={() =>
                  openLink(
                    'https://en.wikipedia.org/wiki/Elliptic-curve_Diffie–Hellman',
                  )
                }
              >
                <Text style={styles.clickHereText}>click here</Text>
              </AppBottomSheetTouchableWrapper>
            </View>
          </View>
          <View style={styles.separatorView} />
        </View>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 2
    },
  },
  headerText: {
    color: Colors.white,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 20 ),
    marginTop: hp( '1%' ),
    marginBottom: hp( '1%' ),
  },
  headerSeparator: {
    backgroundColor: Colors.homepageButtonColor,
    height: 1,
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: hp( '1%' ),
  },
  infoText: {
    textAlign: 'center',
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
  },
  clickHereText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  toKnowMoreText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
  },
  linkView: {
    flexDirection: 'row',
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ElementView: {
    height: hp( '80%' ),
    justifyContent: 'space-between',
  },
  separatorView: {
    width: wp( '70%' ),
    height: 0,
    alignSelf: 'center',
    marginBottom: wp( '1%' ),
  },
  helperImage: {
    width: wp( '80%' ),
    height: wp( '65%' ),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    marginBottom: wp( '15%' ),
  },
} )
