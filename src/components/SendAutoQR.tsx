import React, { useState, useEffect } from 'react'
import { View, Image, Text, StyleSheet, ActivityIndicator, TouchableOpacity, LayoutAnimation } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from './BottomInfoBox'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import { nameToInitials } from '../common/CommonFunctions'
import { ScrollView } from 'react-native-gesture-handler'
import QRCode from 'react-native-qrcode-svg'
import Indicator from './Indiactor'


const animatedQRCodeStyle = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  qrcodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderRadius: 8,
    borderColor: '#FFFFFF',
    margin: 6,
  },
  controller: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 25,
    height: 45,
    paddingHorizontal: 18,
  },
  button: {
    alignItems: 'center',
    height: 45,
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    color: Colors.deepBlu,
    fontWeight: 'bold',
  },
});

export default function SendAutoQR(props) {
  const [curentIndex, setIndex] = useState(0);
  const [hideControls, setControl] = useState(true)
  let timer = null;
  useEffect(() => {
    timer = setInterval(() => {
      if (curentIndex === (props.QR.length - 1)) {
        setIndex(0);
      } else {
        setIndex(curentIndex + 1)
      }
    }, 2000);
    // Clear timeout if the component is unmounted
    return () => clearInterval(timer);
  }, [curentIndex]);

  const moveToNextFragment = () => {
    if (curentIndex === props.QR.length - 1) {
      setIndex(0);
    } else {
      setIndex(curentIndex + 1)
    }
  };

  const startAutoMove = () => {
    // if (!timer)
      // this.setState(() => ({
      //   intervalHandler: setInterval(this.moveToNextFragment, 500),
      // }));
  };

  const stopAutoMove = () => {
    clearInterval(timer);
    timer = null
  };

  const moveToPreviousFragment = () => {
    if (curentIndex > 0) {
      setIndex(curentIndex-1)
    } else {
      setIndex(props.QR.length - 1)
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingRight: 10,
          paddingBottom: hp('1.5%'),
          paddingTop: hp('1%'),
          marginLeft: 10,
          marginRight: 10,
          marginBottom: hp('1.5%'),
        }}
      >
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center'
        }}>
          <View style={{
            flex: 1, marginLeft: 5
          }}>
            <Text style={styles.modalHeaderTitleText}>
              {props.headerText ? props.headerText : 'Send Request via QR'}
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
                paddingTop: 5,
              }}
            >
              {props.subHeaderText}
            </Text>
          </View>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressDone()}
            style={{
              height: wp('8%'),
              width: wp('18%'),
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: Colors.blue,
              justifyContent: 'center',
              borderRadius: 8,
              alignSelf: 'center',
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              Done
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      <ScrollView contentContainerStyle={{
        flex: 1
      }}>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: props.isFromReceive ? 0 : hp('1.7%'),
            marginBottom: props.isFromReceive ? 0 : hp('1.7%'),
          }}
        >
          <View style={{
            height: hp('36%'),
            justifyContent: 'center',
            marginLeft: 20,
            marginRight: 20,
            alignItems: 'center',
            marginTop: props.isFromReceive ? 0 : hp('4%')
          }}>
            {props.QR.length === 0 ? (
              <ActivityIndicator size="large" />
            ) : (
              <TouchableOpacity
                testID="DynamicCode"
                style={animatedQRCodeStyle.qrcodeContainer}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setControl(!hideControls)
                  // this.setState(prevState => ({ hideControls: !prevState.hideControls }));
                }}
              >
                <QRCode value={JSON.stringify(props.QR[curentIndex])} size={hp('36%')} />
              </TouchableOpacity>
              )}
          </View>
          <Indicator data={props.QR} curentIndex={curentIndex}/>
          
        </View>
        {!hideControls && (
          <View style={animatedQRCodeStyle.container}>
            <View>
              <Text style={animatedQRCodeStyle.text}>
                {props.QR.length}
              </Text>
            </View>
            <View style={animatedQRCodeStyle.controller}>
              <TouchableOpacity
                style={[animatedQRCodeStyle.button, { width: '25%', alignItems: 'flex-start' }]}
                onPress={() => moveToPreviousFragment()}
              >
                <Text style={animatedQRCodeStyle.text}>prev</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[animatedQRCodeStyle.button, { width: '50%' }]}
                onPress={() => timer ? stopAutoMove() : startAutoMove()}
              >
                <Text style={animatedQRCodeStyle.text}>{timer ? 'stop' : 'start'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[animatedQRCodeStyle.button, { width: '25%', alignItems: 'flex-end' }]}
                onPress={() => moveToNextFragment()}
              >
                <Text style={animatedQRCodeStyle.text}>next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {!props.isFromReceive ? (
        <View style={{
          marginTop: 'auto'
        }}>
          <BottomInfoBox
            title={props.noteHeader ? props.noteHeader : 'Note'}
            infoText={
              props.noteText ? props.noteText : 'Hold the scanner for a few seconds. Make sure all the QRs are scanned'
            }
          />
        </View>
      ) : null}
    </View>
  )
}
const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
  },
  dropdownBoxModal: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: hp('1%'),
    width: wp('90%'),
    height: hp('18%'),
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 10
    },
    backgroundColor: Colors.white,
    position: 'absolute',
    zIndex: 9999,
    overflow: 'hidden',
  },
})
