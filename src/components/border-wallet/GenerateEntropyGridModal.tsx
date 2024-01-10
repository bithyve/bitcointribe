import React, { useRef } from 'react'
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import EntropyGridIllustration from '../../assets/images/svgs/generateGridEntropyIllustration.svg'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'

export default function GenerateEntropyGridModal( props ) {
  const scrollViewRef = useRef<ScrollView>()
  const strings  = translations[ 'accounts' ]

  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <View style={{
        height: hp( 82 )
      }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.closeModal()
          }}
          style={{
            width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
            marginTop: wp( 3 ), marginRight: wp( 3 ), marginBottom:wp( -4 ), zIndex:999
          }}
        >
          <FontAwesome name="close" color={Colors.blue} size={19} style={{
          // marginTop: hp( 0.5 )
          }} />
        </TouchableOpacity>
        <AppBottomSheetTouchableWrapper
          style={{
            justifyContent: 'center', alignItems: 'center', marginTop: 10
          }}
          activeOpacity={10}
          onPress={() => props.titleClicked && props.titleClicked()}
        >
          <Text style={styles.headerText}>Step 1: Generate New Entropy Grid</Text>

        </AppBottomSheetTouchableWrapper>
        <ScrollView
          ref={scrollViewRef}
          style={{
            flex: 1,
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
            To regenerate the Entropy Grid that you are about to be shown, you will need the following <Text style={styles.boldText}>12 word Entropy Grid Regeneration Mnemonic</Text>
            </Text>
            <Text style={{
              ...styles.infoText
            }}>These 12 words are <Text style={styles.boldText}>NOT</Text> your seed phrase. It can, however, be used as a valid seed phrase for a decoy wallet.</Text>

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
                <EntropyGridIllustration />
              </View>
            </ImageBackground>
            <Text
              style={{
                ...styles.infoText,
              }}
            >
            To regenerate your Entropy Grid at a later date - and therefore your Border Wallet - you will need this 12-word Regeneration Mnemonic.
            </Text>
          </View>
        </ScrollView>
        <View>
          <TouchableOpacity
            onPress={() => {
              props.closeModal()
            }}
            style={{
              alignSelf: 'flex-end',
              margin: 10
            }}
          >
            <View
              style={styles.buttonView}
            >
              <Text style={styles.buttonText}>Next</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    // height: '100%',
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
    textAlign: 'center',
    width: '90%'
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
    color: Colors.backgroundColor1,
    fontSize: RFValue( 12 ),
    letterSpacing: 0.6,
    fontFamily: Fonts.Regular,
    marginHorizontal: wp( '10%' ),
  },
  clickHereText: {
    color: Colors.backgroundColor1,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  toKnowMoreText: {
    color: Colors.backgroundColor1,
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
    height: hp( '60%' ),
    justifyContent: 'space-between',
  },
  separatorView: {
    width: wp( '70%' ),
    height: 0,
    alignSelf: 'center',
    marginBottom: wp( '1%' ),
    borderStyle: 'dotted',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: Colors.white,
  },
  helperImage: {
    width: wp( '80%' ),
    height: wp( '60%' ),
    resizeMode: 'contain',
  },
  bottomLinkView: {
    marginLeft: wp( '10%' ),
    marginRight: wp( '10%' ),
    marginBottom: wp( '15%' ),
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
    backgroundColor: Colors.white
  },
  buttonText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )
