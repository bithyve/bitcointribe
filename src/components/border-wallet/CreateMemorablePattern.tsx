import React, { useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { ScrollView } from 'react-native-gesture-handler'
import { translations } from '../../common/content/LocContext'
import MemoriableIllustration from '../../assets/images/svgs/MemoriableIllustration.svg'

export default function CreateMemorablePattern( props ) {
  const scrollViewRef = useRef<ScrollView>()
  const strings  = translations[ 'accounts' ]

  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <View style={{
        height: hp( 78 )
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
          <Text style={styles.headerText}>Step 2: Create a Memorable Pattern</Text>

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
            You now need to create a <Text style={styles.boldText}>memorable pattern</Text> to apply onto your <Text style={styles.boldText}>Entropy Grid</Text> in order to generate your Border Wallet.
            </Text>
            <View style={{
              justifyContent: 'center', alignItems: 'center'
            }}>
              <MemoriableIllustration />
            </View>
            <Text
              style={{
                ...styles.infoText,
              }}
            >
              Your pattern must comprise <Text style={styles.boldText}>11 cells</Text>, selected in your own <Text style={styles.boldText}>preferred order</Text>
            </Text>
            <Text
              style={{
                ...styles.infoText,
              }}
            >
           Border Wallet to be recovered at a future date, you will need to be able to recall your pattern, so choose it carefully
            </Text>
            <Text
              style={{
                ...styles.infoText,
              }}
            >
           The row numbers and column letters will assist you.
            </Text>
          </View>
        </ScrollView>
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
    textAlign: 'center'
  },
  infoText: {
    textAlign: 'center',
    color: Colors.backgroundColor1,
    fontSize: RFValue( 12 ),
    letterSpacing: 0.6,
    fontFamily: Fonts.Regular,
    marginHorizontal: wp( '10%' ),
  },
  ElementView: {
    height: hp( '60%' ),
    justifyContent: 'space-between',
  },
  boldText:{
    fontWeight: 'bold'
  }
} )
