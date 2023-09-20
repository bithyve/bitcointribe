import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import React from 'react'
import { RFValue } from 'react-native-responsive-fontsize'

import { wp } from '../../common/data/responsiveness/responsive'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'

import Fonts from '../../common/Fonts'

function NfcPrompt( { visible, close } ) {
  const animation = React.useRef( new Animated.Value( 0 ) ).current
  const common  = translations[ 'common' ]
  visible
    ? Animated.timing( animation, {
      duration: 500,
      toValue: 1,
      useNativeDriver: true,
    } ).start()
    : Animated.timing( animation, {
      duration: 400,
      toValue: 0,
      useNativeDriver: true,
    } ).start()

  const bgAnimStyle = {
    backgroundColor: 'rgba(0,0,0,0.3)',
    opacity: animation,
  }
  const promptAnimStyle = {
    transform: [
      {
        translateY: animation.interpolate( {
          inputRange: [ 0, 1 ],
          outputRange: [ 300, 0 ],
        } ),
      },
    ],
  }

  return (
    <Modal transparent={true} visible={visible}>
      <View style={[ styles.wrapper ]}>
        <View style={{
          flex: 1
        }} />
        <Animated.View style={[ styles.prompt, promptAnimStyle ]}>
          <View style={{
            flex: 1, alignItems: 'center', justifyContent: 'center'
          }}>
            <Image
              source={require( '../../assets/images/satCards/nfc-512.png' )}
              style={{
                width: 120, height: 120, padding: 20
              }}
              resizeMode="contain"
            />
            <Text>{'Scanning'}</Text>
            <Text>{'Please tap until the modal dismisses...'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              close()
            }}
            style={styles.successModalButtonView}
          >
            <Text style={styles.proceedButtonText}>{common.cancel}</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[ styles.promptBg, bgAnimStyle ]} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create( {
  wrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  promptBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  prompt: {
    height: 300,
    alignSelf: 'stretch',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    zIndex: 2,
  },
  successModalButtonView: {
    height: wp( 38 ),
    width: wp( 100 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    backgroundColor: Colors.blue,
    alignSelf: 'flex-end',
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )

export default NfcPrompt
