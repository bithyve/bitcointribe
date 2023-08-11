import React, { useContext, useState } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'
import Fonts from '../../common/Fonts'
import { hp } from '../../common/data/responsiveness/responsive'
import LinearGradient from 'react-native-linear-gradient'
import ModalContainer from '../../components/home/ModalContainer'
import BorderWalletSuccessModal from '../../components/border-wallet/BorderWalletSuccessModal'
import { LocalizationContext } from '../../common/content/LocContext'

const ConfirmDownload = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  const [ headerTitle, setHeaderTitle ]=useState( 'Memorise/Download' )
  const [ successModal, setSuccessModal ] = useState( false )
  const mnemonic = props.navigation.getParam( 'mnemonic' )
  const grid = Array( 2048 ).fill( 0 )
  const pattern = props.navigation.getParam( 'selected' )
  const checksumWord = props.navigation.getParam( 'checksumWord' )
  const initialMnemonic = props.navigation.getParam( 'initialMnemonic' )

  type ItemProps = {title: string, id: string};

  const Item = ( { title, id }: ItemProps ) => (
    <View style={styles.item}>
      <View style={[ styles.indexWrapper ]}>
        <Text style={styles.gridItemIndex}>{id}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  )

  return (
    <SafeAreaView
      style={{
        flex: 1, backgroundColor: Colors.backgroundColor
      }}
    >
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SeedHeaderComponent
        onPressBack={() => {
          props.navigation.goBack()
        }}
        info1={'Confirm'}
        selectedTitle={headerTitle}
      />
      <View style={styles.previewWrapper}>
        <View style={styles.patternWrapper}>
          <Text style={styles.previewTitle}>Your Pattern</Text>
          <FlatList
            scrollEnabled={false}
            bounces={false}
            data={grid}
            renderItem={( { item, index } )=>(
              <View style={pattern.includes( index ) ?  styles.patternPreviewStyle : styles.previewStyle}/>
            )}
            numColumns={16}
            keyExtractor={item => item.id}
          />
          <TouchableOpacity onPress={()=> props.navigation.navigate( 'PreviewPattern', {
            pattern
          } )}>
            <View  style={styles.previewPatternButton}>
              <Text style={styles.PreviewButtonText}>Preview Pattern</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.mnemonicWrapper}>
          <Text style={styles.previewTitle}>Regeneration Mnemonic</Text>
          <View>
            <FlatList
              data={mnemonic.split( ' ' )}
              renderItem={( { item, index } ) => <Item title={item} id={index+1} />}
              keyExtractor={item => item}
              numColumns={2}
            />
          </View>
          <Text style={[ styles.previewTitle, {
            marginLeft: 5, marginTop: 15
          } ]}>Checksum Word</Text>
          <View style={[ styles.item, {
            marginLeft: 8
          } ]}>
            <View style={styles.indexWrapper}>
              <Text style={styles.gridItemIndex}>{checksumWord.split( ' ' )[ 0 ]}</Text>
            </View>
            <Text style={styles.title}>{checksumWord.split( ' ' )[ 1 ]}</Text>
          </View>
          {/* <View>
            <Text style={[ styles.previewTitle, {
              marginLeft: 5, marginTop: 10
            } ]}>Passphrase</Text>
            <View style={styles.passPhraseWrapper}>
              <Text>Do not go gentle into that good night, Old age should burn and rave at close of day</Text>
            </View>
          </View> */}
        </View>
      </View>
      <View style={styles.bottomButtonView}>
        <View>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate( 'NewWalletName', {
                mnemonic, initialMnemonic
              } )
            }}
          >
            <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
              start={{
                x: 0, y: 0
              }} end={{
                x: 1, y: 0
              }}
              locations={[ 0.2, 1 ]}
              style={styles.buttonView}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ModalContainer
        onBackground={()=> setSuccessModal( false )}
        visible={successModal}
        closeBottomSheet={()=> setSuccessModal( false )}
      >
        <BorderWalletSuccessModal
          title={'Border Wallet creation success!'}
          info={'Lorem ipsum dolor sit amet, consectetur adipiscing elit,'}
          otherText={'Your Border Wallet has been added and is now ready for you to start using.'}
          proceedButtonText={common.continue}
          isIgnoreButton={false}
          closeModal={()=> setSuccessModal( false )}
          onPressProceed={() => {
            setSuccessModal( false )
          }}
          onPressIgnore={() => {

          }}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
        />
      </ModalContainer>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  item: {
    flexDirection: 'row',
    width: '42%',
    backgroundColor: '#FAFAFA',
    padding: 10,
    margin: 2,
    alignItems: 'center',
  },
  indexWrapper: {
    width: '28%',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#717171',
    fontFamily: Fonts.Regular,
  },
  gridItemIndex: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.blue,
    fontFamily: Fonts.Regular,
  },
  previewWrapper: {
    flexDirection: 'row',
    width: '100%',
    marginHorizontal: 20,
    height: '70%'

  },
  patternWrapper: {
    width: '40%',
  },
  mnemonicWrapper: {
    width: '60%',
  },
  previewTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
    marginBottom: 5
  },
  buttonView: {
    padding: 15,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  PreviewButtonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.light,
  },
  bottomButtonView: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: hp( 6 ),
    justifyContent: 'flex-end',
    alignItems: 'center',
    right: 20,
  },
  passPhraseWrapper:{
    width: '80%',
    backgroundColor: '#FAFAFA',
    padding: 10,
    marginLeft: 5
  },
  previewPatternButton :{
    width:'90%',
    backgroundColor: Colors.CLOSE_ICON_COLOR,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10
  },
  previewStyle:{
    backgroundColor: '#B5B5B5',
    height: 2,
    width: 6,
    margin: 1,
  },
  patternPreviewStyle: {
    backgroundColor: '#304E55',
    height: 2,
    width: 6,
    margin: 1,
  }
} )
export default ConfirmDownload
