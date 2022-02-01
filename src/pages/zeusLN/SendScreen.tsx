import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import HeaderTitle from '../../components/HeaderTitle'
import {  Input } from 'react-native-elements'
import FormStyles from '../../common/Styles/FormStyles'
import AddressUtils from '../../utils/ln/AddressUtils'
import { inject, observer } from 'mobx-react'

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
      console.log( qrData )
      if( AddressUtils.isValidBitcoinAddress( qrData, isTestNet || isRegTest ) ) {
        const { value, amount }: any = AddressUtils.processSendAddress( qrData )
        console.log( 'isValidBitcoinAddress' )

      }else if ( AddressUtils.isValidLightningPaymentRequest( qrData ) ) {
        console.log( 'isValidLightningPaymentRequest' )
        InvoicesStore.getPayReq( qrData )
        navigation.replace( 'PayInvoice' )
      }
    } catch ( error ) {
      console.log( error )
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

