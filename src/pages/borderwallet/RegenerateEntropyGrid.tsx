
import React, { useState } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  NativeModules
} from 'react-native'
import Colors from '../../common/Colors'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'
import ArrowRight from '../../assets/images/svgs/icon_arrow_right.svg'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import RecoverBorderWalletModal from '../../components/border-wallet/RecoverBorderWalletModal'
import ModalContainer from '../../components/home/ModalContainer'
import IconUp from '../../assets/images/svgs/icon_arrow_up.svg'
import DocumentPicker from 'react-native-document-picker'
import MnemonicPDFError from '../../components/border-wallet/MnemonicPDFError'
import * as bip39 from 'bip39'
import Toast from '../../components/Toast'
import PDFUtils from '../../nativemodules/PDFUtils'
import { GridType } from '../../bitcoin/utilities/Interface'
const iCloud = NativeModules.iCloud

const RegenerateEntropyGrid = ( props ) => {
  const [ recoverBorderModal, setRecoverBorderModal ] = useState( false )
  const [ mnemonicPDFErrorModal, setMnemonicPDFErrorModal ] = useState( false )

  const dirtyGridTypePrediction =
   (  data ) => {
     if( Platform.OS==='android' ){
       const gtype = differentiateText( data )
       return gtype
     }
     let gridType = GridType.BLANK
     const start = data.indexOf( 'ABCDEFGHIJKLMNOP' )+16
     const rowApprox = data.slice( start, start+50 )
     const counts = new Map()
     for ( const ch of rowApprox ) {
       if( ch !== ' ' && ch !== '' ){
         const count = counts.get( ch ) ?? 0
         counts.set( ch, count + 1 )
       }
     }
     let letterCount = 0
     let numberCount = 0
     counts.forEach( ( value, key ) => {
       if( isNaN( key ) ){
         letterCount += value
       }else{
         numberCount += value
       }
     } )
     if( letterCount> 5 && numberCount > 5 ){
       gridType = GridType.HEXADECIMAL
     }else if( numberCount < 5 ){
       gridType = GridType.WORDS
     }else if( !letterCount ){
       gridType = GridType.NUMBERS
     }
     return gridType
   }

  const extractMnemonic = async (  ) => {
    let decodedString = ''
    let gridType = GridType.WORDS

    if( Platform.OS === 'ios' ){
      const result = await DocumentPicker.pick( {
        type: [ DocumentPicker.types.allFiles ],
      } )
      const path = result[ 0 ].uri
      const pages = await iCloud.pdfText( path )
      if( pages[ 0 ] ){
        gridType = dirtyGridTypePrediction( pages[ 0 ] )
        decodedString = pages[ 0 ]
      }
    }else{
      const result = await DocumentPicker.pickSingle( {
        copyTo: 'cachesDirectory',
      } )
      const path = result.fileCopyUri?.replace( 'file://', '' )
      const pages = await PDFUtils.pdfToText( path )
      if( pages[ 0 ] ){
        gridType = dirtyGridTypePrediction( pages[ 0 ] )
        decodedString = pages[ 0 ]
      }
    }
    return {
      decodedString, gridType
    }
  }

  function differentiateText( text ) {
    if ( /Grid Type: words/.test( text ) ) {
      return    GridType.WORDS
    } else if ( /Grid Type: numbers/.test( text ) ) {
      return    GridType.NUMBERS
    } else if ( /Grid Type: hexadecimal\(base64\)/.test( text ) ) {
      return    GridType.HEXADECIMAL
    } else if ( /Grid Type: blank/.test( text ) ) {
      return    GridType.BLANK
    } else {
      return    GridType.WORDS
    }
  }

  const pickBWGrid = async () => {
    try {
      const { decodedString, gridType } = await extractMnemonic()
      const start = decodedString.indexOf( 'Recovery' )
      if( start === -1 ){
        setMnemonicPDFErrorModal( true )
        return
      }
      const approx = decodedString.slice( start, start + 200 )
      const words = approx.slice( approx.indexOf( ':' ) ).split( ' ' ).filter( word=>word.length > 1 ).map( word=>word.trim() )
      const mnemonic =  words.slice( 0, 12 ).join( ' ' )
      const isValidMnemonic = bip39.validateMnemonic( mnemonic )
      if( isValidMnemonic ) {
        props.navigation.navigate( 'BorderWalletGridScreen', {
          mnemonic,
          isNewWallet: false,
          gridType
        } )
      } else {
        Toast( 'Invalid mnemonic' )
      }
    } catch ( err ) {
      console.log( err )
      if( err.toString().includes( 'canceled' ) ){
        return
      }
      Toast( 'Something went wrong!' )
    }
  }

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <SafeAreaView
        style={{
          flex: 0, backgroundColor: Colors.backgroundColor
        }}
      />
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <SeedHeaderComponent
        onPressBack={() => {
          props.navigation.goBack()
        }}
        info1={'Step 1 of Recover Border Wallet'}
        selectedTitle={'Regenerate Entropy Grid'}
        info={'Enter the 12 word Entropy Grid Regeneration Mnemonic'}
      />
      <TouchableOpacity style={styles.EntropyGridTabWrapper} onPress={()=> props.navigation.navigate( 'RecoverBorderWallet' )}>
        <View style={styles.titleTextWrapper}>
          <Text style={styles.titleText}>Enter Entropy Grid Regeneration Mnemonic</Text>
          <Text style={styles.subTitleText}>Enter the 12 word Entropy Grid Regeneration Mnemonic</Text>
        </View>
        <View style={styles.iconWrapper}>
          <ArrowRight/>
        </View>
      </TouchableOpacity>
      <View style={styles.EntropyGridTabWrapper}>
        <View style={styles.titleTextWrapper}>
          <Text style={styles.titleText}>or Upload Grid</Text>
          <Text style={styles.subTitleText}>Import an Entropy Grid file.</Text>
        </View>
        <View style={styles.iconWrapper}>
          <TouchableOpacity style={styles.uploadBtnWraper} onPress={()=> {
            pickBWGrid()
          }}>
            <View style={styles.iconUpWrapper}>
              <IconUp/>
            </View>
            <Text style={styles.uploadBtnText}>&nbsp;Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Modal */}
      <ModalContainer onBackground={() =>{}}
        visible={recoverBorderModal}
        closeBottomSheet={() => { }}>
        <RecoverBorderWalletModal closeModal={() => {
          setRecoverBorderModal( false )
        }}/>
      </ModalContainer>
      <ModalContainer
        onBackground={()=> setMnemonicPDFErrorModal( false )}
        visible={mnemonicPDFErrorModal}
        closeBottomSheet={()=> setMnemonicPDFErrorModal( false )}
      >
        <MnemonicPDFError
          title={'Error reading PDF, enter Regeneration Mnemonic'}
          info={'There was an error trying to import your PDF. Alternatively, please enter the 12 words written at the bottom of each page of the PDF'}
          otherText={'The app will regenerate the PDF with the help of these words'}
          proceedButtonText={'Enter Words'}
          isIgnoreButton={false}
          closeModal={()=> setMnemonicPDFErrorModal( false )}
          onPressProceed={() => {
            setMnemonicPDFErrorModal( false )
            props.navigation.navigate( 'RecoverBorderWallet' )
          }}
          tryAgain={()=>{
            setMnemonicPDFErrorModal( false )
            setTimeout( ()=>{
              pickBWGrid()
            }, 500 )
          }}
          onPressIgnore={() => {
          }}
        />
      </ModalContainer>
    </View>
  )
}
const styles = StyleSheet.create( {
  EntropyGridTabWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundColor1,
    width: '90%',
    margin: 20,
    paddingHorizontal: 5,
    paddingVertical: 20,
    alignContent: 'center'
  },
  titleTextWrapper: {
    width: '80%'
  },
  iconWrapper: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconUpWrapper: {
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    height: 15,
    width: 15,
    borderRadius: 15,
    marginLeft: 5
  },
  titleText: {
    fontSize: RFValue( 16 ),
    color: Colors.blue
  },
  subTitleText: {
    fontSize: RFValue( 12 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.lightTextColor,
  },
  uploadBtnWraper: {
    flexDirection: 'row',
    backgroundColor: '#69A2B0',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadBtnText:{
    fontSize:  RFValue( 12 ),
    color: Colors.white
  }
} )
export default RegenerateEntropyGrid
