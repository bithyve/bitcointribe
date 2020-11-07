import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from 'react-native-elements';
import FormStyles from '../../common/Styles/FormStyles';
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState';
import { TEST_ACCOUNT } from '../../common/constants/serviceTypes';
import { widthPercentageToDP } from 'react-native-responsive-screen';

const SAMPLE_ADDRESS = '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8';

export type Props = {
  placeholder: string;
  containerStyle?: Record<string, unknown>;
  accountKind: string;
  onAddressSubmitted: (address: string) => void;
};

const RecipientAddressTextInputSection: React.FC<Props> = ({
  placeholder = 'Enter Address Manually',
  containerStyle = {},
  accountKind,
  onAddressSubmitted,
}: Props) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isAddressInvalid, setIsAddressInvalid] = useState(false);

  const accountsState = useAccountsState();

  const walletInstance = useMemo(() => {
    const walletService = accountsState[accountKind].service;

    return walletService.hdWallet || walletService.secureHDWallet;
  }, [accountKind, accountsState]);


  function handleTextChange(newValue: string) {
    setRecipientAddress(newValue);
  }

  return (
    <View style={styles.rootContainer}>
      <Input
        containerStyle={containerStyle}
        inputContainerStyle={[FormStyles.textInputContainer]}
        inputStyle={FormStyles.inputText}
        placeholder={placeholder}
        placeholderTextColor={FormStyles.placeholderText.color}
        value={recipientAddress}
        onChangeText={handleTextChange}
        onKeyPress={(event) => {
          if (event.nativeEvent.key === 'Backspace') {
            setIsAddressInvalid(false);
          }
        }}
        onBlur={() => {
          const isAddressValid = walletInstance.isValidAddress(recipientAddress);
          setIsAddressInvalid(!isAddressValid);
        }}
        numberOfLines={1}
      />

      {accountKind == TEST_ACCOUNT && (
        <TouchableOpacity
          onPress={() => {
            handleTextChange(SAMPLE_ADDRESS);
            onAddressSubmitted(SAMPLE_ADDRESS);
          }}
          style={{ padding: 6, marginLeft: 'auto' }}
        >
          <Text style={FormStyles.hintText}>
            Send it to a sample address!
          </Text>
        </TouchableOpacity>
      )}

      {isAddressInvalid && (
        <View style={{ marginLeft: 'auto' }}>
          <Text style={FormStyles.errorText}>
            Enter correct address
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
  },
});

export default RecipientAddressTextInputSection;
