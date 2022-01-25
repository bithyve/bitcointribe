import React, { Component } from 'react'
import { Text, View, StyleSheet, Button } from 'react-native'
import CoveredQRCodeScanner from '../../../components/qr-code-scanning/CoveredQRCodeScanner'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { sourceAccountSelectedForSending } from '../../../store/actions/sending'
import { TextInput } from 'react-native-paper'
import { inject, observer } from 'mobx-react'
// import { Button } from 'react-native-elements/dist/buttons/Button'

@inject('TransactionsStore')
@observer
export default class SendCoinScreen extends Component {
    constructor(props) {
        super(props)
        this.node= props.navigation.getParam('node')
        this.state = {
          addr: '',
          sat_per_byte: '',
          amount: ''
        }
    }


    render() {
        return (
          <View style = {{
            margin: 5
          }}>
            <View style={styles.viewSectionContainer}>
              {/* <CoveredQRCodeScanner */}
                <CoveredQRCodeScanner
                  containerStyle={styles.qrScannerContainer}
                />

                <TextInput
                placeholder='address'
                onChangeText={(val) => {
                  this.setState({addr:val})
                }}
                />
                <TextInput
                placeholder='sats'
                onChangeText={(val) => {
                  this.setState({amount:val})
                }}
                />
                <TextInput
                placeholder='fees'
                onChangeText={(val) => {
                  this.setState({sat_per_byte:val})
                }}
                />
                <Button
                title={'Send'}
                onPress={() => {
                  this.props.TransactionsStore.sendCoinsOnChain(this.node, this.state)
                  this.props.navigation.goBack()
                }}
                />
              </View>
          </View>
        )
    }
}

const qrScannerHeight = heightPercentageToDP( 35 )

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: 'white',
  },

  viewSectionContainer: {
    marginBottom: 16,
  },
  qrScannerContainer: {
    // width: '100%',
    // maxWidth: qrScannerHeight * ( 1.40 ),
    height: qrScannerHeight,
    marginBottom: 9,
  }
} )
