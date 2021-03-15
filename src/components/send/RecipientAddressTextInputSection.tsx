import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Input } from 'react-native-elements'
import FormStyles from '../../common/Styles/FormStyles'
import useWalletServiceForSourceAccountKind from '../../utils/hooks/state-selectors/accounts/UseWalletServiceForSourceAccountKind'
import { ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'

const SAMPLE_ADDRESS = '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8'

export type Props = {
  placeholder: string;
  containerStyle?: Record<string, unknown>;
  sourceAccountKind: SourceAccountKind;
  onAddressEntered: ( address: string ) => void;
  onPaymentURIEntered: ( uri: string ) => void;
};

const RecipientAddressTextInputSection: React.FC<Props> = ( {
  placeholder = 'Enter Address Manually',
  containerStyle = {
  },
  sourceAccountKind,
  onAddressEntered,
  onPaymentURIEntered,
}: Props ) => {
  const [ recipientAddress, setRecipientAddress ] = useState( '' )
  const [ isAddressInvalid, setIsAddressInvalid ] = useState( false )

  const walletService = useWalletServiceForSourceAccountKind( sourceAccountKind )

  const walletInstance = useMemo( () => {
    if(walletService){
      return walletService.hdWallet || walletService.secureHDWallet
    }
  }, [ walletService ] )


  function handleTextChange( newValue: string ) {
    setRecipientAddress( newValue )

    const isAddressInvalid = walletInstance.isValidAddress( newValue ) == false

    setIsAddressInvalid( isAddressInvalid )

    if ( isAddressInvalid ) { return }

    const { type: scannedAddressKind }: { type: ScannedAddressKind } = walletService.addressDiff( newValue.trim() )

    switch ( scannedAddressKind ) {
        case ScannedAddressKind.ADDRESS:
          onAddressEntered( newValue )
          break
        case ScannedAddressKind.PAYMENT_URI:
          onPaymentURIEntered( newValue )
          break
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

      {sourceAccountKind == SourceAccountKind.TEST_ACCOUNT && (
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
