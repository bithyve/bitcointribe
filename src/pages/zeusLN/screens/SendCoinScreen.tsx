import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import CoveredQRCodeScanner from '../../../components/qr-code-scanning/CoveredQRCodeScanner'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { sourceAccountSelectedForSending } from '../../../store/actions/sending'

export default class SendCoinScreen extends Component {
    constructor(props) {
        super(props)
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
