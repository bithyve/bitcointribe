import * as bip39 from 'bip39'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import deviceInfoModule from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import IconArrowDown from '../../assets/images/svgs/icon_arrow_down.svg'
import Colors from '../../common/Colors'
import { hp, windowHeight, wp } from '../../common/data/responsiveness/responsive'
import Fonts from '../../common/Fonts'
import BottomInfoBox from '../../components/BottomInfoBox'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'

const wordlists = bip39.wordlists.english

const SelectChecksumWord = ( props ) => {
  const words = props.route.params?.words
  const selected = props.route.params?.selected
  const isNewWallet = props.route.params?.isNewWallet
  const isAccountCreation = props.route.params?.isAccountCreation
  const isImportAccount = props.route.params?.isImportAccount
  const [ checksums, setChecksums ] = useState( [] )
  const [ headerTitle, setHeaderTitle ] = useState( 'Select Checksum Word' )
  const [ checksumWord, setChecksumWord ] = useState( 'Select checksum word' )
  const [ showDropdown, setShowDropdown ] = useState( false )
  type ItemProps = { title: string; id: string };



  useEffect( () => {
    const validChecksums = []
    let count = 1
    wordlists.forEach( ( word, index ) => {
      const s = `${words} ${word}`
      if ( bip39.validateMnemonic( s ) ) {
        validChecksums.push( {
          id: `${count}`,
          title: word,
        } )
        count++
      }
    } )
    setChecksums( validChecksums )
  }, [] )

  const Item = ( { title, id }: ItemProps ) => (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor:
            checksumWord === `${id} ${title}` ? '#69A2B0' : '#FAFAFA',
        },
      ]}
      onPress={() => {
        setShowDropdown( false ), setChecksumWord( `${id} ${title}` )
      }}
    >
      <View style={styles.indexWrapper}>
        <Text
          style={[
            styles.gridItemIndex,
            {
              color:
                checksumWord === `${id} ${title}` ? '#FAFAFA' : Colors.blue,
            },
          ]}
        >
          {id}
        </Text>
      </View>
      <Text
        style={[
          styles.title,
          {
            color: checksumWord === `${id} ${title}` ? '#FAFAFA' : '#717171',
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )

  const onPressNext = ()=> {
    const mnemonic = `${words} ${checksumWord.split( ' ' )[ 1 ]}`
    isAccountCreation?  props.navigation.navigate( 'CreatePassPhraseAccount', {
      selected,
      checksumWord,
      mnemonic,
      initialMnemonic: props.route.params?.initialMnemonic,
      gridType: props.route.params?.gridType,
      isAccountCreation,
      isNewWallet
    } ) : props.navigation.navigate( 'ImportWalletPassphrase', {
      selected,
      checksumWord,
      mnemonic,
      initialMnemonic: props.route.params?.initialMnemonic,
      gridType: props.route.params?.gridType,
      isImportAccount,
      isNewWallet
    } )
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
        info1={isNewWallet ? 'Step 5 of Create with Border Wallet': 'Recover with Border Wallet'}
        info={'This is the final step of creating your Border Wallet'}
        selectedTitle={headerTitle}
      />
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setShowDropdown( !showDropdown )}
      >
        <Text style={styles.dropdownText}>{checksumWord}</Text>
        <IconArrowDown />
      </TouchableOpacity>
      <View
        style={{
          height: windowHeight> 850? '40%' : '30%',
        }}
      >
        {showDropdown && (
          <FlatList
            data={checksums}
            overScrollMode="never"
            bounces={false}
            renderItem={( { item } ) => <Item title={item.title} id={item.id} />}
            keyExtractor={( item ) => item.id}
          />
        )}
      </View>
      {
        isNewWallet && (
          <BottomInfoBox
            title={'Note'}
            infoText={'In addition to having your Entropy Grid Regeneration Mnemonic and recalling your Pattern, you will need to remember this final Checksum Word in order to recover your Border Wallet'}
          />
        )
      }
      <View style={styles.bottomButtonView}>
        {
          isNewWallet && (
            <View style={styles.statusIndicatorView}>
              <View style={styles.statusIndicatorInactiveView} />
              <View style={styles.statusIndicatorInactiveView} />
              <View style={styles.statusIndicatorInactiveView} />
              <View style={styles.statusIndicatorInactiveView} />
              <View style={styles.statusIndicatorActiveView} />
              <View style={styles.statusIndicatorInactiveView} />
            </View>
          )
        }
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={checksumWord === 'Select checksum word'}
          onPress={onPressNext}
        >
          <View
            style={[ styles.buttonView, {
              backgroundColor: checksumWord !== 'Select checksum word'? Colors.blue : Colors.greyTextColor
            } ]}
          >
            <Text style={styles.buttonText}>{isNewWallet ? 'Next': 'Recover'}</Text>
          </View>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  dropdownBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: wp( 25 ),
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  dropdownText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 13 ),
  },
  item: {
    flexDirection: 'row',
    width: '87%',
    padding: 15,
    borderBottomColor: '#BABABA',
    borderBottomWidth: 0.3,
    marginHorizontal: wp( 25 ),
    alignItems: 'center',
    borderRadius: 10,
  },
  indexWrapper: {
    width: '15%'
  },
  gridItemIndex: {
    fontSize: 20,
    fontWeight: 'bold',
    opacity: 0.6,
    fontFamily: Fonts.Regular,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.6,
    fontFamily: Fonts.Regular,
  },
  buttonView: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: 120,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  bottomButtonView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: wp( 30 ),
    paddingBottom: deviceInfoModule.hasNotch() ? hp( 4 ) : hp( 3 ),
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
export default SelectChecksumWord
