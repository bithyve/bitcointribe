import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Input } from 'react-native-elements'
import FormStyles from '../../common/Styles/FormStyles'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import useWalletServiceForSubAccountKind from '../../utils/hooks/state-selectors/accounts/UseWalletServiceForSubAccountKind'

const SAMPLE_ADDRESS = '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8'

export type Props = {
  placeholder: string;
  containerStyle?: Record<string, unknown>;
  subAccountKind: SubAccountKind;
  onAddressSubmitted: ( address: string ) => void;
};

const RecipientAddressTextInputSection: React.FC<Props> = ( {
  placeholder = 'Enter Address Manually',
  containerStyle = {
  },
  subAccountKind,
  onAddressSubmitted,
}: Props ) => {
  const [ recipientAddress, setRecipientAddress ] = useState( '' )
  const [ isAddressInvalid, setIsAddressInvalid ] = useState( false )

  const walletService = useWalletServiceForSubAccountKind( subAccountKind )

  const walletInstance = useMemo( () => {
    return walletService.hdWallet || walletService.secureHDWallet
  }, [ walletService ] )


  // TODO: Every text change shouldn't be treated as a "submit".
  // We're doing this because `Send` is calling `setRecipientAddress` on
  // every change and inspecting it to take an action once an actionable
  // address is interpreted. We should probably move that logic into this component
  // and avoid re-rendering the entire send screen on text changes.
  function handleTextChange( newValue: string ) {
    setRecipientAddress( newValue )

    if ( isAddressInvalid == false ) {
      onAddressSubmitted( newValue )
    }
  }

  return (
    <View style={styles.rootContainer}>
      <Input
        containerStyle={containerStyle}
        inputContainerStyle={[ FormStyles.textInputContainer ]}
        inputStyle={FormStyles.inputText}
        placeholder={placeholder}
        placeholderTextColor={FormStyles.placeholderText.color}
        value={recipientAddress}
        onChangeText={handleTextChange}
        onKeyPress={( event ) => {
          if ( event.nativeEvent.key === 'Backspace' ) {
            setIsAddressInvalid( false )
          }
        }}
        onBlur={() => {
          const isAddressValid = walletInstance.isValidAddress( recipientAddress )
          setIsAddressInvalid( !isAddressValid )
        }}
        numberOfLines={1}
      />

      {subAccountKind == SubAccountKind.TEST && (
        <TouchableOpacity
          onPress={() => {
            handleTextChange( SAMPLE_ADDRESS )
          }}
          style={{
            padding: 6, marginLeft: 'auto'
          }}
        >
          <Text style={FormStyles.hintText}>
            Send it to a sample address!
          </Text>
        </TouchableOpacity>
      )}

      {isAddressInvalid && (
        <View style={{
          marginLeft: 'auto'
        }}>
          <Text style={FormStyles.errorText}>
            Enter correct address
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  },
} )

export default RecipientAddressTextInputSection
