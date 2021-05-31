import React from 'react'
import { TouchableOpacity, TouchableWithoutFeedback, Modal, View } from 'react-native'

const ModalContainer = ( {
  visible,
  closeBottomSheet,
  children
} ) => {
  return(
    <Modal
      visible={visible}
      onRequestClose={() => { closeBottomSheet() }}
      transparent={true}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressOut={() => {
          closeBottomSheet()
        }}
        style={{
          // flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          // borderRadius: 20

        }}
      >
        <TouchableWithoutFeedback>
          <View style={{
            width: '95%',
            borderRadius: 20,
            overflow: 'hidden',
          }}>

            {children}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  )
}

export default ModalContainer
