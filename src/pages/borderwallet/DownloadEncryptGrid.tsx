import React, { useEffect, useState } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'
import Fonts from '../../common/Fonts'
import { GridType } from '../../bitcoin/utilities/Interface'
import Toast from '../../components/Toast'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import RNFetchBlob from 'rn-fetch-blob'
import { generateGridHtmlString } from './gridToHtml'
import { generateBorderWalletGrid } from '../../utils/generateBorderWalletGrid'
import RNFS from 'react-native-fs'


const DownloadEncryptGrid = ( props ) => {
  const mnemonic = props.navigation.getParam( 'mnemonic' )
  const isAccountCreation = props.navigation.getParam( 'isAccountCreation' )
  const gridType = props.navigation.getParam( 'gridType' ) || GridType.WORDS

  const [ headerTitle ] = useState( 'Download grid (optional)' )

  useEffect( () => {
    Toast( 'Entropy Grid Regenerated Successfully!' )
  }, [] )

  const onPressNext = () => {
    isAccountCreation ?  props.navigation.navigate( 'BorderWalletGridScreenAccount', {
      mnemonic, isNewWallet: true, gridType, isAccountCreation
    } ) :
      props.navigation.navigate( 'BorderWalletGridScreen', {
        mnemonic, isNewWallet: true, gridType, isAccountCreation
      } )
  }

  const downloadPdf = async () => {
    try {
      const options = {
        html: generateGridHtmlString( generateBorderWalletGrid( mnemonic, gridType ), mnemonic, gridType ),
        fileName: 'BorderWalletEntropyGrid',
        directory: 'Documents',
        height: 842,
        width: 595,
        padding: 10
        //base64: true
      }
      const file = await RNHTMLtoPDF.convert( options )
      // const downloadsDir = `${RNFS.DocumentDirectoryPath}/Tribe/`
      // await RNFS.moveFile( file.filePath, downloadsDir )
      Alert.alert( 'File saved', `BorderWalletEntropyGrid.pdf save to ${file.filePath}`, [
        {
          text: 'Next',
          onPress: () => onPressNext(),
          style: 'default',
        },
      ], {
        cancelable: false
      } )

      //RNFetchBlob.ios.openDocument( file.filePath )
    } catch ( error ) {
      console.log( error )
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.backgroundColor,
      }}
    >
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SeedHeaderComponent
        onPressBack={() => {
          props.navigation.goBack()
        }}
        info1={'Step 3 of Creating Border Wallet'}
        info={'The Regeneration Mnemonic for the entropy grid will help you create back the grid, but you can optionally also download the grid'}
        selectedTitle={headerTitle}
      />
      <View
        style={{
          height: '45%',
        }}
      >
        <TouchableOpacity
          style={styles.menuWrapper}
          onPress={() => onPressNext()}
        >
          <View style={styles.titleWrapper}>
            <Text style={styles.titleText}>Download with Encryption</Text>
            <Text style={styles.subTitleText}>
              Provide an encryption password in the next step
            </Text>
          </View>
          <View style={styles.arrowIconView}>
            <MaterialIcons
              name="arrow-forward-ios"
              color={Colors.borderColor}
              size={15}
              style={{
                alignSelf: 'center',
              }}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuWrapper} onPress={downloadPdf}>
          <View style={styles.titleWrapper}>
            <Text style={styles.titleText}>Download without Encryption</Text>
            <Text style={styles.subTitleText}>
              Store a PDF file with grid
            </Text>
          </View>
          <View style={styles.arrowIconView}>
            <MaterialIcons
              name="arrow-forward-ios"
              color={Colors.borderColor}
              size={15}
              style={{
                alignSelf: 'center',
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity
          style={styles.menuWrapper}
          onPress={() => onPressNext()}
        >
          <View style={styles.titleWrapper}>
            <Text style={styles.titleText}>Proceed without downloading</Text>
            <Text style={styles.subTitleText}>
              If you have already noted down the 12-word Regeneration Mnemonic
            </Text>
          </View>
          <View style={styles.arrowIconView}>
            <MaterialIcons
              name="arrow-forward-ios"
              color={Colors.borderColor}
              size={15}
              style={{
                alignSelf: 'center',
              }}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomButtonView}>
        <View style={styles.statusIndicatorView}>
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorActiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
        </View>
      </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  menuWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '85%',
    padding: 15,
    marginHorizontal: 25,
    marginVertical: 10,
    backgroundColor: Colors.backgroundColor1,
    borderRadius: 10,
    elevation: 6,
  },
  titleWrapper: {
    width: '90%',
  },
  titleText: {
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
  },
  subTitleText: {
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },
  arrowIconView: {
    width: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonView: {
    flex: 1,
    position: 'absolute',
    bottom: 25,
    marginLeft: 25,
  },
  statusIndicatorView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicatorActiveView: {
    height: 10,
    width: 10,
    backgroundColor: Colors.CLOSE_ICON_COLOR,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    height: 7,
    width: 7,
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 10,
    marginLeft: 5,
  },
} )
export default DownloadEncryptGrid
