import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
    heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import LoadingAnimation from './Loader'

export default function InProgressModal(props) {
  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <View >
        <View style={{ marginVertical: hp(1) }}>
          <Text style={styles.headerText}>{props.title}</Text>
        </View>
        <View style={{ alignItems: 'center', marginVertical: hp(5) }}>
        <LoadingAnimation />
        </View>
        <View style={{ marginVertical: hp(2) }}>
          <Text
            style={{
              ...styles.infoText,
            }}
          >
            {props.otherText}
          </Text>
        </View>
        
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    padding: wp(5)
  },
  headerText: {
    color: Colors.backgroundColor1,
    fontFamily: Fonts.SemiBold,
    fontSize: RFValue(22),
    letterSpacing: 0.54,
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    textAlign: 'left'
  },
  infoText: {
    textAlign: 'left',
    color: Colors.backgroundColor1,
    fontSize: RFValue(12),
    letterSpacing: 0.6,
    fontFamily: Fonts.Regular,
  },
  buttonView: {
    padding: 10,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginRight: 5
  },
  buttonText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.Medium,
  },
  modalMessageWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginVertical: 10
  },
  modalMessageText: {
    fontSize: 13,
    color: Colors.white,
    fontFamily: Fonts.Regular,
    marginHorizontal: wp('7%'),
  },
})
