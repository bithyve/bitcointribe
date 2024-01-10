import React, { useEffect, useState } from 'react'
import {
  FlatList, SafeAreaView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native'
import deviceInfoModule from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import { GridType, Wallet } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import Fonts from '../../common/Fonts'
import dbManager from '../../storage/realm/dbManager'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'

const BackupGridMnemonic = ( props ) => {
  const [ headerTitle, setHeaderTitle ]=useState( 'Regenerate Entropy Grid' )
  const [ generateEntropyGrid, setGenerateEntropyGrid ] = useState( false )
  const [ isAccount, setIsAccount ] = useState( false )
  const [ borderWalletGridType, seBborderWalletGridType ] = useState( props.route.params?.borderWalletGridType )
  const borderWalletMnemonicAccount =  props.route.params?.borderWalletMnemonic
  const borderWalletGridMnemonicAccount = props.route.params?.borderWalletGridMnemonic


  const wallet: Wallet =  dbManager.getWallet()
  const walletMnemonic=  wallet.borderWalletMnemonic

  const [ borderWalletGridMnemonic, setBorderWalletGridMneomnic ] = useState( '' )
  const [ borderWalletMnemonic, setborderWalletMnemonic ] = useState( '' )

  useEffect( () => {
    if( borderWalletGridMnemonicAccount && borderWalletGridType ){
      setBorderWalletGridMneomnic( borderWalletGridMnemonicAccount )
      setborderWalletMnemonic( borderWalletMnemonicAccount )
      setIsAccount( true )
    }
    else{
      setBorderWalletGridMneomnic( walletMnemonic )
      setborderWalletMnemonic( wallet.primaryMnemonic )
      seBborderWalletGridType( wallet.borderWalletGridType || GridType.WORDS )
    }
  }, [] )


  type ItemProps = {title: string, id: string};
  const getFormattedNumber = ( number ) => {
    if ( number < 10 ) return '0' + number
    else return number + ''
  }
  const Item = ( { title, id }: ItemProps ) => (
    <View style={styles.item}>
      <View style={[ styles.indexWrapper ]}>
        <Text style={styles.gridItemIndex}>{getFormattedNumber( id )}</Text>
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
        info1={'Backup with Border Wallet'}
        info={'Note down these 12 word Regeneration Mnemonic'}
        selectedTitle={headerTitle}
      />
      <FlatList
        data={borderWalletGridMnemonic.split( ' ' )}
        renderItem={( { item, index } ) => <Item title={item} id={`${index+1}`} />}
        keyExtractor={item => item}
        numColumns={2}
      />
      {/* <BottomInfoBox
        title={'Note'}
        infoText={'Treat these words & grid with the same degree of security that you would a Bitcoin seed phrase'}
      /> */}
      <View style={styles.bottomButtonView}>
        {/* <View style={styles.statusIndicatorView}>
          <View style={styles.statusIndicatorActiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
        </View> */}
        <View>
          <TouchableOpacity
            onPress={()=> props.navigation.navigate( 'ValidateBorderWalletPattern', {
              borderWalletMnemonic, borderWalletGridType, borderWalletGridMnemonic
            } )}
          >
            <View
              style={styles.buttonView}
            >
              <Text style={styles.buttonText}>Generate Grid</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {/* <ModalContainer onBackground={() =>setGenerateEntropyGrid( false )}
        visible={generateEntropyGrid}
        closeBottomSheet={() => { }}>
        <GenerateEntropyGridModal closeModal={() => setGenerateEntropyGrid( false )}/>
      </ModalContainer> */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  item: {
    flexDirection: 'row',
    width: '42%',
    backgroundColor: '#F8F8F8',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    alignItems: 'center'
  },
  indexWrapper: {
    width: '30%'
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#717171',
    fontFamily: Fonts.Regular,
  },
  gridItemIndex: {
    fontSize: 20,
    fontFamily: Fonts.Regular,
    fontWeight: '500',
    color: Colors.blue
  },
  buttonView: {
    padding: 15,
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
  bottomButtonView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: wp( 30 ),
    paddingBottom: deviceInfoModule.hasNotch() ? hp( 4 ) : hp( 3 ),
  },
  statusIndicatorView: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusIndicatorActiveView: {
    height: 10,
    width: 10,
    backgroundColor: Colors.CLOSE_ICON_COLOR,
    borderRadius: 10,
  },
  statusIndicatorInactiveView: {
    height: 7,
    width: 7,
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 10,
    marginLeft: 5,
  },
} )
export default BackupGridMnemonic
