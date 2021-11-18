import React from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native'
import Colors from '../common/Colors'
import { Button } from 'react-native-elements'
import ButtonStyles from '../common/Styles/ButtonStyles'


export interface Props {
  buttonText: string;
  handleButtonPress;
  buttonDisable?: boolean;
}

const ButtonBlue: React.FC<Props> = ( {
  buttonText,
  handleButtonPress,
  buttonDisable
}: Props ) => {
  return (
    <TouchableOpacity onPress={()=>handleButtonPress()} style={buttonDisable ? styles.disabledPrimaryActionButton : styles.primaryActionButton}>
      <Text style={ButtonStyles.actionButtonText}>{buttonText}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create( {
  disabledPrimaryActionButton: {
    ...ButtonStyles.disabledPrimaryActionButton,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 5,
    shadowOffset: {
      width: 12, height: 12
    },
    elevation: 5,
  },
  primaryActionButton:{
    ...ButtonStyles.primaryActionButton,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 5,
    shadowOffset: {
      width: 12, height: 12
    },
    elevation: 5,
  }
} )

export default ButtonBlue
