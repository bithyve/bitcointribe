import React, { memo } from 'react'
import {
  StyleSheet, View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'

const ModalHeader = ( props ) => {
  return <AppBottomSheetTouchableWrapper
    activeOpacity={10}
    onPress={() => props.onPressHeader && props.onPressHeader()}
    style={{
      ...styles.modalHeaderContainer, backgroundColor: props.backgroundColor ? props.backgroundColor : Colors.white, borderLeftColor: props.borderColor ? props.borderColor : Colors.borderColor, borderRightColor: props.borderColor ? props.borderColor : Colors.borderColor, borderTopColor: props.borderColor ? props.borderColor : Colors.borderColor
    }}
  >
    <View style={styles.modalHeaderHandle} />
  </AppBottomSheetTouchableWrapper>
}

export default memo( ModalHeader )

const styles = StyleSheet.create( {
  modalHeaderContainer: {
    marginTop: 'auto',
    flex: 1,
    height: 20,
    borderTopLeftRadius: 10,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightWidth: 1,
    borderTopWidth: 1,
    zIndex: 9999,
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 7,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
    marginLeft: 15,
  },
} )
