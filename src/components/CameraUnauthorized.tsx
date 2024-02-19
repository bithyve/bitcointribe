import React from 'react'
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'

function CameraUnauthorized() {
  const requestPermission = () => {
    Linking.openSettings()
  }

  return (
    <View style={styles.cameraView}>
      <Text
        style={{
          fontSize: RFValue( 13 ),
          fontFamily: Fonts.Regular,
          color: Colors.white,
        }}
      >
          Camera access is turned off
      </Text>
      <Text
        style={{
          fontSize: RFValue( 11 ),
          fontFamily: Fonts.Regular,
          color: Colors.textColorGrey,
          marginBottom: '5%',
        }}
      >
          Turn on the camera in your device settings
      </Text>
      <TouchableOpacity
        onPress={requestPermission}
        style={styles.settingsButton}
      >
        <Text style={styles.settingsText}>
              Tap to go to settings
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default CameraUnauthorized

const styles = StyleSheet.create( {
  cameraView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: Colors.black
  },
  settingsButton: {
    marginBottom: '15%',
    backgroundColor: Colors.white,
    padding: 5,
    borderRadius: 5,
  },
  settingsText: {
    fontSize: RFValue( 13 ),
    letterSpacing: 0.6,
    alignSelf: 'center',
    color: Colors.THEAM_TEXT_COLOR
  },
} )
