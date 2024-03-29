import React from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'
import { ScrollView } from 'react-native-gesture-handler'

export default function SecurityQuestionHelpContents( props ) {
  return (
    <View style={styles.modalContainer}>
      <AppBottomSheetTouchableWrapper
        style={{
          justifyContent: 'center', alignItems: 'center'
        }}
        activeOpacity={10}
        onPress={()=> props.titleClicked && props.titleClicked()}>
        <Text
          style={{
            color: Colors.white,
            fontFamily: Fonts.Medium,
            fontSize: RFValue( 20 ),
            marginTop: hp( '1%' ),
            marginBottom: hp( '1%' ),
          }}
        >
          Security Question
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
        style={styles.modalContainer}
        snapToInterval={hp( '89%' )}
        decelerationRate="fast"
      >
        <View
          style={{
            height: hp( '89%' ),
            paddingBottom: hp( '6%' ),
            justifyContent: 'space-between'
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.Regular,
            }}
          >
            Your Security Question is used to safeguard your personal Recovery Keys in the event someone gets access to them without your consent. Therefore, it is required that you remember the question and answer you provide
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center'
          }}>
            <Image
              source={require( '../../assets/images/icons/security_question_info.png' )}
              style={{
                width: wp( '80%' ),
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
              fontFamily: Fonts.Regular,
            }}
          >
            Bitcoin Tribe will remind you of your Security Question routinely, helping you remember your question and answer. The Health Shield automatically updates when you answer correctly
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.Regular,
            }}
          >
            If someone gets to know your Security Question and Answer, they cannot steal or deny access to your funds. However, you should still keep the answer safe to give yourself an extra layer of security
          </Text>
          <View style={{
            justifyContent: 'center', alignItems: 'center', marginTop: hp( '2%' )
          }}>
            <View
              style={{
                borderStyle: 'dotted',
                borderWidth: 1,
                borderRadius: 1,
                borderColor: Colors.white,
                width: wp( '70%' ),
                height: 0,
              }}
            />
          </View>
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
