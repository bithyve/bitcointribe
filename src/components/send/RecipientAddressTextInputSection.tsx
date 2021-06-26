import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Input } from 'react-native-elements'
import FormStyles from '../../common/Styles/FormStyles'
import { Account, AccountType, ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import AccountShell from '../../common/data/models/AccountShell'
import useAccountByAccountShell from '../../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'

const SAMPLE_ADDRESS = '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8'

export type Props = {
  placeholder: string;
  containerStyle?: Record<string, unknown>;
  accountShell: AccountShell,
  onAddressEntered: ( address: string ) => void;
  onPaymentURIEntered: ( uri: string ) => void;
};

const RecipientAddressTextInputSection: React.FC<Props> = ( {
  placeholder = 'Enter address manually',
  containerStyle = {
  },
  accountShell,
  onAddressEntered,
  onPaymentURIEntered,
}: Props ) => {
  const [ recipientAddress, setRecipientAddress ] = useState( '' )
  const [ isAddressInvalid, setIsAddressInvalid ] = useState( false )
  const account: Account = useAccountByAccountShell( accountShell )
  const network = AccountUtilities.getNetworkByType( account.networkType )

  function handleTextChange( newValue: string ) {
    setRecipientAddress( newValue )
    const isAddressInvalid = AccountUtilities.isValidAddress( newValue, network ) == false
    setIsAddressInvalid( isAddressInvalid )

    if ( isAddressInvalid ) { return }

    const { type: scannedAddressKind }: { type: ScannedAddressKind } = AccountUtilities.addressDiff( newValue.trim(), network )

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
          const isAddressValid = AccountUtilities.isValidAddress( recipientAddress, network )
          setIsAddressInvalid( !isAddressValid )
        }}
        numberOfLines={1}
      />

      {accountShell.primarySubAccount.type == AccountType.TEST_ACCOUNT && (
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
