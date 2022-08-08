import { Animated, Image, Modal, StyleSheet, Text, View } from 'react-native'

import React from 'react'

function NfcPrompt( { visible } ) {
  const animation = React.useRef( new Animated.Value( 0 ) ).current

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
} )

export default NfcPrompt
