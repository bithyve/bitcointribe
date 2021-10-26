import React, { useEffect, useState } from 'react'
import { TouchableOpacity, TouchableWithoutFeedback, Modal, View, Keyboard, Platform, AppState } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { ScreenCornerRadius } from 'react-native-screen-corner-radius'

const ModalContainer = ( {
  visible,
  closeBottomSheet,
  background = 'rgba(0,0,0,0.5)',
  children
} ) => {
  const [ height, setHeight ] = useState( 6 )
  const  onAppStateChange = ( state ) => {
    if ( state === 'background' || state === 'inactive' ){
      closeBottomSheet()
    }
  }

  useEffect( () => {
    AppState.addEventListener(
      'change',
      onAppStateChange
    )
    return () => AppState.removeEventListener( 'change', onAppStateChange )
  }, [] )
  useEffect( ()=>{
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setHeight( 0 )
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setHeight( 6 )
      }
    )

    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [] )
  return(
    <Modal
      visible={visible}
      onRequestClose={() => { closeBottomSheet() }}
      transparent={true}
      style={{
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <KeyboardAwareScrollView
        scrollEnabled={false}
        contentContainerStyle={{
          // flex: 1,

          backgroundColor: background,
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          // alignItems: 'center',
          paddingBottom: Platform.OS === 'ios' ? hp( '6%' ) : hp( `${height}%` ),
          paddingHorizontal: wp( '2%' ),
          // borderRadius: 20
        }}
        resetScrollToCoords={{
          x: 0, y: 0
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => {
            closeBottomSheet()
          }}
          style={{
            flex:1,
            justifyContent: 'flex-end'
          }}
        >
          <TouchableWithoutFeedback>

            <View style={{
              width: '100%',
              borderRadius: wp( '4%' ),
              overflow: 'hidden',
              // marginBottom: hp( 0.5 )
            }}>

              {children}
            </View>

          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </Modal>
  )
}

export default ModalContainer
