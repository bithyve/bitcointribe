import { inject, observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Input } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import FormStyles from '../../common/Styles/FormStyles'
import HeaderTitle from '../../components/HeaderTitle'
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner'
import AddressUtils from '../../utils/ln/AddressUtils'
import handleInvoiceData from '../../utils/ln/handleInvoiceData'

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  viewSectionContainer: {
    marginBottom: 16,
  },
  qrScannerContainer: {
    height: heightPercentageToDP( 35 ),
    marginBottom: 9,
  },
} )

const SendScreen = inject(
  'NodeInfoStore',
  'InvoicesStore', )( observer( ( {
  NodeInfoStore,
  InvoicesStore,
  navigation
} ) => {

  useEffect( () => {

    NodeInfoStore.getNodeInfo()
  }, [] )

  const [ address, setAddress ] = useState( '' )

  function onQRScanned( qrData: string ) {
    try {
      const { nodeInfo } = NodeInfoStore
      const { isTestNet, isRegTest } = nodeInfo
      if( AddressUtils.isValidBitcoinAddress( qrData, isTestNet || isRegTest ) ) {
        const { value, amount }: any = AddressUtils.processSendAddress( qrData )
        navigation.replace( 'OnChainSend', {
          value, amount
        } )
      } else {
        handleInvoiceData( qrData )
          .then( ( [ route, props ] ) => {
            navigation.replace( route, props )
          } )
          .catch( ( err ) => {
            // error
          } )
      }
    } catch ( error ) {
    //  error
    }
  }

  return (
    <KeyboardAwareScrollView
      bounces={false}
      overScrollMode="never"
      style={styles.rootContainer}>
      <HeaderTitle
        firstLineTitle={'Send'}
        secondLineTitle={'Scan lightning invoice or bitcoin address'}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <View style={styles.viewSectionContainer}>
        <CoveredQRCodeScanner
          onCodeScanned={( e )=> onQRScanned( e.data )}
          containerStyle={styles.qrScannerContainer}
        />
      </View>

      <Input
        placeholder={'Enter lightning invoice or bitcoin address'}
        value={address}
        containerStyle={{
        }}
        inputContainerStyle={[ FormStyles.textInputContainer ]}
        inputStyle={FormStyles.inputText}
        placeholderTextColor={FormStyles.placeholderText.color}
        onChangeText={( text: string ) => {
          setAddress( text.trim() )
          onQRScanned( text.trim() )
        }

        }
        numberOfLines={1}

      />
    </KeyboardAwareScrollView>
  )
} ) )

export default SendScreen

