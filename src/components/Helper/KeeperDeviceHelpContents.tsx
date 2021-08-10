import React, { useRef } from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
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

export default function KeeperDeviceHelpContents( props ) {
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
        <Text
          style={{
            color: Colors.white,
            fontFamily: Fonts.FiraSansMedium,
            fontSize: RFValue( 20 ),
            marginTop: hp( '1%' ),
            marginBottom: hp( '1%' ),
          }}
        >
          Recovery Keys on a Keeper Device
        </Text>
      </AppBottomSheetTouchableWrapper>
      <View
        style={{
          backgroundColor: Colors.homepageButtonColor,
          height: 1,
          marginLeft: wp( '5%' ),
          marginRight: wp( '5%' ),
          marginBottom: hp( '1%' ),
        }}
      />
      <ScrollView
        ref={scrollViewRef}
        style={styles.modalContainer}
        snapToInterval={hp( '85%' )}
        decelerationRate="fast"
      >
        <View
          style={{
            height: hp( '85%' ),
            justifyContent: 'space-between',
            paddingBottom: hp( '6%' ),
            marginTop: hp( '2%' ),
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp( '5%' ),
              marginRight: wp( '5%' ),
            }}
          >
            Any other phone that has Hexa installed can become a “Keeper Device”. A Keeper Device stores one of your five Recovery Keys
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Image
              source={require( '../../assets/images/icons/keeper_device_recovery_key.png' )}
              style={{
                width: wp( '90%' ),
                height: wp( '80%' ),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp( '5%' ),
              marginRight: wp( '5%' ),
            }}
          >
            If your Keeper Device is not accessible, it is possible to recover it using your primary device and one of your Personal Copy Keepers
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{
              alignItems: 'center'
            }}
            onPress={() => {
              scrollViewRef.current?.scrollTo( {
                x: 0,
                y: hp( '85%' ),
                animated: true,
              } )
            }}
          >
            <FontAwesome
              name="angle-double-down"
              color={Colors.white}
              size={40}
            />
          </AppBottomSheetTouchableWrapper>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <View
              style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp( '80%' ),
                height: 0,
              }}
            />
          </View>
        </View>
        <View
          style={{
            height: hp( '85%' ),
            // paddingTop: hp('2%'),
            paddingBottom: hp( '6%' ),
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp( '5%' ),
              marginRight: wp( '5%' ),
            }}
          >
            Click on Backup Now. You will see a QR Code
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Image
              source={require( '../../assets/images/icons/keeper_device_recovery_key_2.png' )}
              style={{
                width: wp( '90%' ),
                height: wp( '80%' ),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp( '5%' ),
              marginRight: wp( '5%' ),
            }}
          >
            Go to the Scan a QR section on your Keeper Device and scan the QR you just saw on your Primary Device. Click on ‘Yes I have scanned’ on your Primary Device after you have scanned the QR
          </Text>
          <AppBottomSheetTouchableWrapper
            style={{
              alignItems: 'center'
            }}
            onPress={() => {
              scrollViewRef.current?.scrollTo( {
                x: 0,
                y: hp( '170%' ),
                animated: true,
              } )
            }}
          >
            <FontAwesome
              name="angle-double-down"
              color={Colors.white}
              size={40}
            />
          </AppBottomSheetTouchableWrapper>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <View
              style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp( '80%' ),
                height: 0,
              }}
            />
          </View>
        </View>
        <View
          style={{
            height: hp( '85%' ),
            // paddingTop: hp('2%'),
            paddingBottom: hp( '20%' ),
            justifyContent: 'space-between'
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp( '5%' ),
              marginRight: wp( '5%' ),
            }}
          >
            Note that you cannot make a device that has your “Personal Copy” backed up as your Keeper Device. This is by design
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center', marginTop: wp( '-20%' ), marginBottom: wp( '-20%' )
          }}>
            <Image
              source={require( '../../assets/images/icons/keeper_device_recovery_key_3.png' )}
              style={{
                width: wp( '90%' ),
                height: wp( '80%' ),
                resizeMode: 'contain',
              }}
            />
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansRegular,
              marginLeft: wp( '5%' ),
              marginRight: wp( '5%' )
            }}
          >
              The Keeper Device also acts as the host of your Exit Key, which
              can be used to migrate from Hexa to another wallet at any time.
              Although, why would you want to do that!
          </Text>
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
} )
