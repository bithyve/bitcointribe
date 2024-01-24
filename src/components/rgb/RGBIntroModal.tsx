import React, { useRef } from 'react'
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
    heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import MemoriableIllustration from '../../assets/images/svgs/MemoriableIllustration.svg'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import BounceLoader from '../loader/BounceLoader'

export default function RGBIntroModal( props ) {
  const scrollViewRef = useRef<ScrollView>()
  const strings  = translations[ 'accounts' ]

  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <View style={{
        height: hp( 82 )
      }}>
        <AppBottomSheetTouchableWrapper
          style={{
            justifyContent: 'center', alignItems: 'center', marginTop: 10
          }}
          activeOpacity={10}
        >
          <Text style={styles.headerText}>{props.title}</Text>

        </AppBottomSheetTouchableWrapper>
        <ScrollView
          ref={scrollViewRef}
          style={{
            flexGrow: 1,
            backgroundColor: Colors.blue,
          }}
          snapToInterval={hp( '70%' )}
          decelerationRate="fast"
        >
          <View style={styles.ElementView}>
            <Text
              style={{
                ...styles.infoText,
                marginTop: wp( '2%' ),
              }}
            >
            {props.info}
            </Text>
            <ImageBackground source={require( '../../assets/images/illustrationbackground.png' )}
              style={{
                justifyContent: 'center',
                alignItems: 'center'
              }}
              resizeMode='contain'
            >
              <View style={{
                justifyContent: 'center', alignItems: 'center'
              }}>
                <MemoriableIllustration />
              </View>
            </ImageBackground>
            <Text
              style={{
                ...styles.infoText,
              }}
            >
             {props.otherText}
            </Text>
          </View>
        </ScrollView>
        <View>
        <View style={styles.modalMessageWrapper}>
            <View style={{ width: '80%' }}>
              <Text style={styles.modalMessageText}>
                This step will take a few seconds. You would be able to proceed soon
              </Text>
            </View>
            <View style={{ width: '20%' }}>
              <BounceLoader />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              props.closeModal()
            }}
            style={{
              alignSelf: 'flex-end',
              margin: 10
            }}
          >
            <LinearGradient colors={[ Colors.white, Colors.white ]}
              start={{
                x: 0, y: 0
              }} end={{
                x: 1, y: 0
              }}
              locations={[ 0.2, 1 ]}
              style={styles.buttonView}
            >
              <Text style={styles.buttonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
  },
  headerText: {
    color: Colors.backgroundColor1,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 18 ),
    letterSpacing: 0.54,
    marginTop: hp( '1%' ),
    marginBottom: hp( '1%' ),
    textAlign: 'center'
  },
  infoText: {
    textAlign: 'center',
    color: Colors.backgroundColor1,
    fontSize: RFValue( 12 ),
    letterSpacing: 0.6,
    fontFamily: Fonts.Regular,
    marginHorizontal: wp( '8%' ),
  },
  ElementView: {
    height: hp( '60%' ),
    justifyContent: 'space-between',
  },
  boldText:{
    fontWeight: 'bold'
  },
  buttonView: {
    padding: 10,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  modalMessageWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center'
  },
  modalMessageText: {
    fontSize: 13,
    color: Colors.white,
    fontFamily: Fonts.Regular,
    marginHorizontal: wp( '8%' ),
  },
} )
