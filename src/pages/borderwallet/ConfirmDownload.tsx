import { CommonActions } from '@react-navigation/native'
import React, { useContext, useState } from 'react'
import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch } from 'react-redux'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import { hp, windowHeight } from '../../common/data/responsiveness/responsive'
import Fonts from '../../common/Fonts'
import BorderWalletSuccessModal from '../../components/border-wallet/BorderWalletSuccessModal'
import ModalContainer from '../../components/home/ModalContainer'
import { createBorderWallet } from '../../store/actions/accounts'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'

const ConfirmDownload = ( props ) => {
  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  const [ headerTitle, setHeaderTitle ]=useState( 'Summary for Border Wallet' )
  const [ successModal, setSuccessModal ] = useState( false )
  const [ loading, setLoading ] = useState( true )
  const mnemonic = props.route.params?.mnemonic
  const grid = Array( 2048 ).fill( 0 )
  const pattern = props.route.params?.selected
  const checksumWord =props.route.params?.checksumWord
  const initialMnemonic = props.route.params?.initialMnemonic
  const isAccountCreation = props.route.params?.isAccountCreation
  const isImportAccount = props.route.params?.isImportAccount
  const passphrase = props.route.params?.passphrase
  const gridType = props.route.params?.gridType
  const dispatch = useDispatch()
  type ItemProps = {title: string, id: string};

  const onPressContinue = () => {
    if( isAccountCreation || isImportAccount ){
      dispatch( createBorderWallet( mnemonic, initialMnemonic, gridType, passphrase ) )
      //TO-DO- BW bind this to account creation redux state
      // Alert.alert( 'Wallet Created!', 'Border Wallet has been succssefully created', [ {
      //   text: 'Ok', onPress: ()=> {  props.navigation.navigate( 'Home' )}
      // } ] )
      setTimeout( ()=>{
        props.navigation.dispatch( CommonActions.reset( {
          index: 0,
          routes: [
            {
              name: 'App'
            }
          ],
        } ) )
      }, 3000 )
    }
    else{
      props.navigation.navigate( 'NewWalletName', {
        mnemonic, initialMnemonic, gridType, passphrase
      } )
    }

  }
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
        info={'Make sure you have a way to regenerate the grid (using Regeneration Mnemonic or using PDF). Also remember the pattern, checksum word and Passphrase if used.'}
        info1={'Final step'}
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
              <View key={`${item}_${index}`} style={pattern.includes( index ) ?  styles.patternPreviewStyle : styles.previewStyle}/>
            )}
            initialNumToRender={1000}
            numColumns={16}
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
              data={initialMnemonic.split( ' ' )}
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
          {
            passphrase !== '' && (
              <View>
                <Text style={[ styles.previewTitle, {
                  marginLeft: 5, marginTop: 10
                } ]}>Passphrase</Text>
                <View style={styles.passPhraseWrapper}>
                  <Text>{passphrase}</Text>
                </View>
              </View>
            )
          }
          <View style={styles.bottomButtonView}>
            <View>
              <TouchableOpacity
                onPress={onPressContinue}
              >
                <View
                  style={styles.buttonView}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ModalContainer
        onBackground={()=> setSuccessModal( false )}
        visible={successModal}
        closeBottomSheet={()=> setSuccessModal( false )}
      >
        <BorderWalletSuccessModal
          title={isImportAccount? 'Border wallet imported successfully.' : 'Border wallet created successfully.'}
          info={''}
          otherText={'Your Border Wallet has been added and is now ready for you to start using.'}
          proceedButtonText={'Continue'}
          isIgnoreButton={false}
          closeModal={()=> setSuccessModal( false )}
          onPressProceed={() => {setSuccessModal( false )}}
          onPressIgnore={() => {
            setSuccessModal( false )
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
    height: Platform.OS === 'ios' ? '70%' : '62%'

  },
  patternWrapper: {
    width: '40%',
  },
  mnemonicWrapper: {
    width: '60%',
    height: Platform.OS === 'ios' ? '60%' : '43%'
  },
  previewTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
    marginBottom: 5
  },
  buttonView: {
    padding: 15,
    width: 150,
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
    width: '100%',
    paddingHorizontal: hp( 6 ),
    marginVertical: hp( 6 ),
    justifyContent: 'flex-end',
    alignItems: 'center',
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
    height: windowHeight < 700 ? 1 : 1.4,
    width: 6,
    margin: 1,
  },
  patternPreviewStyle: {
    backgroundColor: '#304E55',
    height: windowHeight < 700 ? 1 : 1.4,
    width: 6,
    margin: 1,
  }
} )
export default ConfirmDownload
