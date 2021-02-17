import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { BaseNavigationProp } from '../../../navigation/Navigator'

export type NavigationParams = {
};

type NavigationProp = {
  params: NavigationParams;
} & BaseNavigationProp;

export type Props = {
  navigation: NavigationProp;
};

const AccountSendConfirmationContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  return (
    <View style={styles.rootContainer}>
      <Text>AccountSendConfirmationContainerScreen</Text>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  }
} )

export default AccountSendConfirmationContainerScreen
