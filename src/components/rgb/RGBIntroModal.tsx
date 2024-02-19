import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import BounceLoader from '../loader/BounceLoader'
import LoadingAnimation from '../loader/Loader'

export default function RGBIntroModal(props) {
  return (
    <View style={{
      ...styles.modalContainer, ...props.containerStyle
    }}>
      <View style={{
        height: props.height ? props.height :  hp(55)
      }}>
        <View style={{ marginVertical: hp(1) }}>
          <Text style={styles.headerText}>{props.title}</Text>
        </View>

        <View style={{ marginVertical: hp(1) }}>
          <Text
            style={{
              ...styles.infoText,
            }}
          >
            {props.info}
          </Text>
        </View>
        <View style={{ alignItems: 'center', marginVertical: hp(1) }}>
        <LoadingAnimation />
        </View>
        <View style={{ marginVertical: hp(1) }}>
          <Text
            style={{
              ...styles.infoText,
            }}
          >
            {props.otherText}
          </Text>
        </View>
        <View style={{marginBottom: hp(15)}}>
          {!props.showBtn?<View style={styles.modalMessageWrapper}>
            <View style={{ width: '80%' }}>
              <Text style={styles.modalMessageText}>
                This step will take a few seconds. You would be able to proceed soon
              </Text>
            </View>
            <View style={{ width: '20%' }}>
              <BounceLoader />
            </View>
          </View>:
          <TouchableOpacity
            onPress={() => {
              props.closeModal()
            }}
            style={{
              alignSelf: 'flex-end',
              margin: 10
            }}
          >
            <View style={styles.buttonView}>
              <Text style={styles.buttonText}>{props.proceedButtonText}</Text>
            </View>
          </TouchableOpacity>}
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
  },
  headerText: {
    color: Colors.backgroundColor1,
    fontFamily: Fonts.Regular,
    fontSize: RFValue(18),
    letterSpacing: 0.54,
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    textAlign: 'center'
  },
  infoText: {
    textAlign: 'center',
    color: Colors.backgroundColor1,
    fontSize: RFValue(12),
    letterSpacing: 0.6,
    fontFamily: Fonts.Regular,
    marginHorizontal: wp('7%'),
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
