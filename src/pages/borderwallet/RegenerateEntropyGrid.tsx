
import React, { useState } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity
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
import { decode } from 'base-64'
import Toast from '../../components/Toast'

const RNFS = require( 'react-native-fs' )


const RegenerateEntropyGrid = ( props ) => {
  const [ recoverBorderModal, setRecoverBorderModal ] = useState( false )
  const [ mnemonicPDFErrorModal, setMnemonicPDFErrorModal ] = useState( false )

  const pickBWGrid = async () => {
    try{
      const result = await DocumentPicker.pick( {
        type: [ DocumentPicker.types.allFiles ],
      } )
      try {
        const cosigner = await RNFS.readFile( result[ 0 ].uri, 'base64' )
        const decodedString: string = decode( cosigner )
        const start = decodedString.indexOf( 'Recovery' )
        if( start === -1 ){
          setMnemonicPDFErrorModal( true )
          return
        }
        const approx = decodedString.slice( start, start + 100 )
        const mnemonic =  approx.slice( approx.indexOf( ':' )+1, approx.indexOf( ')' ) )
        const isValidMnemonic = bip39.validateMnemonic( mnemonic.trim() )
        if( isValidMnemonic ) {
          props.navigation.navigate( 'BorderWalletGridScreen', {
            mnemonic,
            isNewWallet: false
          } )
        } else {
          Toast( 'Invalid mnemonic' )
        }
      } catch ( err ) {
        console.log( err )
      }
    }catch( err ){
      console.log( err )
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
          info={'Lorem ipsum dolor sit amet, consectetur adipiscing elit,'}
          otherText={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '}
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
