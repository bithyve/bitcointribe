import React, { useEffect, useState } from 'react'
import { AppState, Keyboard, Modal, Platform, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'

const ModalContainer = ( {
  visible,
  closeBottomSheet,
  background = 'rgba(0,0,0,0.5)',
  children,
  onBackground
}:{
  visible?: boolean;
  closeBottomSheet?: any
  background?: string;
  children?: any;
  onBackground?: any;
} ) => {
  const [ height, setHeight ] = useState( 6 )
  const  onAppStateChange = ( state ) => {
    if ( state === 'background' || state === 'inactive' ){
      onBackground ? onBackground() : closeBottomSheet()
    }
  }

  useEffect( () => {
    const subscription = AppState.addEventListener(
      'change',
      onAppStateChange
    )
    return () => subscription.remove()
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
      onRequestClose={() => { closeBottomSheet ? closeBottomSheet(): null }}
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
        <View style={{
          width: '100%',
          borderRadius: wp( '4%' ),
          overflow: 'hidden',
          // marginBottom: hp( 0.5 )
        }}>

          {children}
        </View>

      </KeyboardAwareScrollView>
    </Modal>
  )
}

export default ModalContainer
