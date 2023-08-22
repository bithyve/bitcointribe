import React, { useState, useEffect } from 'react'
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
import { hp, wp } from '../../common/data/responsiveness/responsive'
import LinearGradient from 'react-native-linear-gradient'
import deviceInfoModule from 'react-native-device-info'
import IconArrowDown from '../../assets/images/svgs/icon_arrow_down.svg'
import * as bip39 from 'bip39'
import BottomInfoBox from '../../components/BottomInfoBox'
import dbManager from '../../storage/realm/dbManager'
import { Wallet } from '../../bitcoin/utilities/Interface'
import Toast from '../../components/Toast'
import { useDispatch } from 'react-redux'
import { setBorderWalletBackup } from '../../store/actions/BHR'

const wordlists = bip39.wordlists.english

const ValidateBorderWalletChecksum = ( props ) => {
  const wallet: Wallet =  dbManager.getWallet()
  const words = props.navigation.getParam( 'words' )
  const [ checksums, setChecksums ] = useState( [] )
  const [ headerTitle ] = useState( 'Select Checksum Word' )
  const [ checksumWord, setChecksumWord ] = useState( 'Select checksum word' )
  const [ showDropdown, setShowDropdown ] = useState( false )
  type ItemProps = { title: string; id: string };
  const dispatch = useDispatch()

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

  const onPressVerify = () => {
    const selectedWord = checksumWord.split( ' ' )[ 1 ]
    if( selectedWord === wallet.primaryMnemonic.split( ' ' )[ 11 ] ) {
      Toast( 'Checksum matched' )
      dispatch( setBorderWalletBackup( true ) )
      props.navigation.navigate( 'BackupMethods' )
    } else {
      Toast( 'Invalid checksum' )
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
        info1={''}
        info={''}
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
          height: '40%',
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
      {/* <BottomInfoBox
        title={'Note'}
        infoText={'In addition to having your Entropy Grid Regeneration Mnemonic and recalling your Pattern, you will need to remember this final Checksum Word in order to recover your Border Wallet'}
      /> */}
      <View style={styles.bottomButtonView}>
        <View style={styles.statusIndicatorView}>

        </View>
        <TouchableOpacity
          activeOpacity={0.6}
          disabled={checksumWord === 'Select checksum word'}
          onPress={onPressVerify}
        >
          <LinearGradient
            colors={[ Colors.blue, Colors.darkBlue ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            locations={[ 0.2, 1 ]}
            style={styles.buttonView}
          >
            <Text style={styles.buttonText}>Verify</Text>
          </LinearGradient>
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
    backgroundColor: Colors.blue,
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
export default ValidateBorderWalletChecksum
