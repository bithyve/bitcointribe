import React, { useEffect, useState } from 'react'
import {
  Alert,
  Platform, SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity, View
} from 'react-native'
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import { RFValue } from 'react-native-responsive-fontsize'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import RNFetchBlob from 'rn-fetch-blob'
import { GridType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import Toast from '../../components/Toast'
import { generateBorderWalletGrid } from '../../utils/generateBorderWalletGrid'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'
import { generateGridHtmlString } from './gridToHtml'


const DownloadEncryptGrid = ( props ) => {
  const mnemonic = props.route.params?.mnemonic
  const isAccountCreation = props.route.params?.isAccountCreation
  const gridType = props.route.params?.gridType || GridType.WORDS

  const [ headerTitle ] = useState( 'Download grid (optional)' )

  useEffect( () => {
    Toast( 'Entropy Grid Regenerated Successfully!' )
  }, [] )


  const showAlert = () => {
    Alert.alert( '', 'In the next step, save the PDF file appropriately in a secure location', [
      {
        text: 'OK',
        onPress: () => downloadPdf(),
        style: 'default',
      },
    ], {
      cancelable: false
    } )
  }

  const onPressNext = () => {
    isAccountCreation ?  props.navigation.navigate( 'BorderWalletGridScreen', {
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
      if( Platform.OS === 'ios' ) {
        RNFetchBlob.ios.openDocument( file.filePath )
      } else {
        RNFetchBlob.android.actionViewIntent( file.filePath, 'application/pdf' )
      }
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
        info={'The Regeneration Mnemonic for the entropy grid will help you create back the grid, but you can optionally also download the grid or continue without downloading'}
        selectedTitle={headerTitle}
      />
      <View
        style={{
          // height: '45%',
        }}
      >
        {/* <TouchableOpacity
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
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.menuWrapper} onPress={()=> showAlert()}>
          <View style={styles.titleWrapper}>
            <Text style={styles.titleText}>Download</Text>
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
      {/* <View>
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
      </View> */}
      <View style={styles.bottomButtonView}>
        <View style={styles.statusIndicatorView}>
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorActiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
        </View>
        <View
          style={{
            ...styles.proceedButtonView,
            backgroundColor: Colors.blue,
          }}
        >
          <AppBottomSheetTouchableWrapper
            onPress={() => onPressNext()}
            style={{
              shadowColor: props.buttonShadowColor
                ? props.buttonShadowColor
                : Colors.shadowBlue,

            }}
            delayPressIn={0}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.white,
              }}
            >
            Continue
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
      {/* <ModalContainer
        onBackground={()=> setFileSavedModal( false )}
        visible={fileSavedModal}
        closeBottomSheet={()=> setFileSavedModal( false )}
      >
        <FileSavedModal
          title={'File Saved'}
          info={'Your Border wallet PDF has been downloaded to the location below and you can also view it in your local files.'}
          proceedButtonText={'Next'}
          cancelButtonText={'Open File'}
          isIgnoreButton
          closeModal={()=> setFileSavedModal( false )}
          onPressProceed={() => {setFileSavedModal( false ); onPressNext()}}
          onPressIgnore={() => downloadPdf()}
        />
      </ModalContainer> */}
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
    flexDirection: 'row',
    width: '93%',
    position: 'absolute',
    bottom: 25,
    margin: 25,
    justifyContent: 'space-between'
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
  proceedButtonView: {
    padding: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    margin: 25,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )
export default DownloadEncryptGrid
