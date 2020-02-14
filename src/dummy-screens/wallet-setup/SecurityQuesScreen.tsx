import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  AsyncStorage,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { initializeSetup } from '../../store/actions/setupAndAuth';

const SecurityQuesScreen = props => {
  const [securityAns, setSecurityAns] = useState('');
  const dispatch = useDispatch();
  const walletName = props.navigation.getParam('walletName');

  return (
    <View style={styles.screen}>
      <Text style={{ marginBottom: 50 }}>Wallet Setup Simulator</Text>
      <View style={{ flexDirection: 'row' }}>
        <Text>Security Ans:</Text>
        <TextInput
          value={securityAns}
          onChangeText={setSecurityAns}
          style={{
            borderBottomWidth: 0.5,
            width: 150,
            textAlign: 'center',
          }}
        />
      </View>
      <Button
        title="Submit"
        onPress={async () => {
          dispatch(initializeSetup(walletName, securityAns));
          await AsyncStorage.setItem('walletExists', 'true');
          props.navigation.navigate('HomeNav');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SecurityQuesScreen;
