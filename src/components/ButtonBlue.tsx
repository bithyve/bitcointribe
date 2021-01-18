import React from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
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
    <View style={styles.rootContainer}>
      <Button
          raised
          buttonStyle={ButtonStyles.primaryActionButton}
          disabledStyle={ButtonStyles.disabledPrimaryActionButton}
          disabledTitleStyle={ButtonStyles.actionButtonText}
          title={buttonText}
          titleStyle={ButtonStyles.actionButtonText}
          onPress={handleButtonPress}
          disabled={!buttonDisable ? false : true}
        />
    </View>
  )
}

const styles = StyleSheet.create( {
    rootContainer: {
        shadowColor: Colors.shadowBlue,
        shadowOpacity: 1,
        shadowOffset: { width: 15, height: 15 },
        elevation: 5
      },
} )

export default ButtonBlue
