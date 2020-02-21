import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SECURE_ACCOUNT } from '../../common/constants/serviceTypes';
import { useSelector } from 'react-redux';

const LostTwoFA = props => {
  const service = useSelector(state => state.accounts[SECURE_ACCOUNT].service);
  const verifySecondaryMnemonic = (secondaryMnemonic, reset?) => {
    // following instance of the secure account isn't stringified and saved to database (as we don't want to persist the secondary mnemonic/xpriv in the app), hence, we need to pass this instance around as the instance in database doesn't hold the secondaryXPriv
    const { generated } = service.generateSecondaryXpriv(secondaryMnemonic);
    if (generated) {
      if (reset) {
      } else {
        props.navigation.navigate('Send', {
          serviceType: SECURE_ACCOUNT,
          secondaryService: service,
          sweepSecure: true,
        });
      }
    } else {
      Alert.alert('Invalid Secondary Mnemonic', 'Please try again');
    }
  };

  return (
    <View style={styles.screen}>
      <View
        style={{
          alignItems: 'center',
          margin: 40,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate('QrScanner', {
              title: 'Scan Secondary Mnemonic',
              scanedCode: qrData => verifySecondaryMnemonic(qrData, true),
            });
          }}
        >
          <Text>Reset 2FA</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          alignItems: 'center',
          margin: 40,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate('QrScanner', {
              title: 'Scan Secondary Mnemonic',
              scanedCode: qrData => verifySecondaryMnemonic(qrData),
            });
          }}
        >
          <Text>Sweep Savings</Text>
        </TouchableOpacity>
      </View>
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

export default LostTwoFA;
