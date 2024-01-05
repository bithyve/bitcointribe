import * as bip39 from 'bip39'
import React, { useEffect, useState } from 'react'
import {
  FlatList, SafeAreaView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native'
import deviceInfoModule from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../common/Colors'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import Fonts from '../../common/Fonts'
import GenerateEntropyGridModal from '../../components/border-wallet/GenerateEntropyGridModal'
import BottomInfoBox from '../../components/BottomInfoBox'
import ModalContainer from '../../components/home/ModalContainer'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'

const CreateWithBorderWallet = ( props ) => {
  const [ headerTitle, setHeaderTitle ]=useState( 'Generate New Entropy Grid' )
  const [ generateEntropyGrid, setGenerateEntropyGrid ] = useState( false )
  const isAccountCreation = props.route.params?.isAccountCreation || false

  const mnemonic =  bip39.generateMnemonic()

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

  useEffect( ()=>{
    setGenerateEntropyGrid( true )
  }, [] )

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
        info1={'Step 1 of Creating with Border Wallet'}
        info={'Note down these 12 word Regeneration Mnemonic'}
        selectedTitle={headerTitle}
      />

      <FlatList
        data={mnemonic.split( ' ' )}
        renderItem={( { item, index } ) => <Item title={item} id={`${index+1}`} />}
        keyExtractor={item => item}
        numColumns={2}
        showsVerticalScrollIndicator={false}
      />
      <BottomInfoBox
        title={'Note'}
        infoText={'Treat these words & grid with the same degree of security that you would a Bitcoin seed phrase'}
      />
      <View style={styles.bottomButtonView}>
        <View style={styles.statusIndicatorView}>
          <View style={styles.statusIndicatorActiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              isAccountCreation ? props.navigation.navigate( 'SelectEntropyGridTypeAccount', {
                mnemonic,
                isAccountCreation,
              } ):
                props.navigation.navigate( 'SelectEntropyGridType', {
                  mnemonic,
                  isAccountCreation,
                } )
            }}
          >
            <View
              style={styles.buttonView}
            >
              <Text style={styles.buttonText}>Next</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <ModalContainer onBackground={() =>setGenerateEntropyGrid( false )}
        visible={generateEntropyGrid}
        closeBottomSheet={() => { }}>
        <GenerateEntropyGridModal closeModal={() => setGenerateEntropyGrid( false )}/>
      </ModalContainer>
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
  bottomButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
export default CreateWithBorderWallet
