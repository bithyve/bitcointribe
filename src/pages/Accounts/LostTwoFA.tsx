import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SECURE_ACCOUNT } from '../../common/constants/serviceTypes';
import { useSelector, useDispatch } from 'react-redux';
import { generateSecondaryXpriv } from '../../store/actions/accounts';

const LostTwoFA = props => {
  const additional = useSelector(state => state.accounts.additional);
  let generatedSecureXPriv;
  if (additional && additional.secure) {
    generatedSecureXPriv = additional.secure.xprivGenerated;
  }
  const dispatch = useDispatch();
  const service = useSelector(state => state.accounts[SECURE_ACCOUNT].service);

  useEffect(() => {
    if (generatedSecureXPriv) {
      props.navigation.navigate('Send', {
        serviceType: SECURE_ACCOUNT,
        netBalance:
          service.secureHDWallet.balances.balance +
          service.secureHDWallet.balances.unconfirmedBalance,
        sweepSecure: true,
      });
    } else if (generatedSecureXPriv === false) {
      Alert.alert('Invalid Secondary Mnemonic', 'Please try again');
    }
  }, [generatedSecureXPriv]);

  // useEffect(() => {}, []);

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
              scanedCode: qrData => {
                // dispatch(generateSecondaryXpriv(SECURE_ACCOUNT, qrData));
              },
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
              scanedCode: qrData => {
                dispatch(generateSecondaryXpriv(SECURE_ACCOUNT, qrData));
              },
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
