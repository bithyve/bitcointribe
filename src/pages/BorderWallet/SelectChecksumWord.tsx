import React, { useState } from 'react'
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

const SelectChecksumWord = ( props ) => {
  const DATA = [
    {
      id: '01',
      title: 'soup',
    },
    {
      id: '02',
      title: 'example',
    },
    {
      id: '03',
      title: 'crater',
    },
    {
      id: '04',
      title: 'canyon',
    },
    {
      id: '05',
      title: 'air',
    },
    {
      id: '06',
      title: 'tiger',
    },
    {
      id: '07',
      title: 'either',
    },
    {
      id: '08',
      title: 'repair',
    },
    {
      id: '09',
      title: 'warfare',
    },
    {
      id: '10',
      title: 'blind',
    },
    {
      id: '11',
      title: 'permit',
    },
    {
      id: '12',
      title: 'art',
    }
  ]
  const [ headerTitle, setHeaderTitle ]=useState( 'Select Checksum Word' )
  const [ checksumWord, setChecksumWord ] = useState( 'Select checksum word' )
  const [ showDropdown, setShowDropdown ] = useState( false )
  type ItemProps = {title: string, id: string};

  const Item = ( { title, id }: ItemProps ) => (
    <TouchableOpacity style={styles.item} onPress={()=> setChecksumWord( `${id} ${title}` ) }>
      <View style={[ styles.indexWrapper ]}>
        <Text style={styles.gridItemIndex}>{id}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
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
        info1={'Step 3 of Create with Border Wallet'}
        info={'This is the final step of creating your Border Wallet'}
        selectedTitle={headerTitle}
      />
      <TouchableOpacity style={styles.dropdownBox} onPress={()=> setShowDropdown( !showDropdown )}>
        <Text style={styles.dropdownText}>{checksumWord}</Text>
        <IconArrowDown/>
      </TouchableOpacity>
      {showDropdown && <FlatList
        contentContainerStyle={{
          height: '55%'
        }}
        data={DATA}
        renderItem={( { item } ) => <Item title={item.title} id={item.id} />}
        keyExtractor={item => item.id}
      />}
      <View style={styles.bottomButtonView}>
        <View>
          <TouchableOpacity
            onPress={() => {
            //   setGenerateEntropyGrid( true )
              props.navigation.navigate( 'CreatePassPhrase' )
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
              <Text style={styles.buttonText}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#FAFAFA'
  },
  dropdownText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 13 ),
  },
  item: {
    flexDirection: 'row',
    width: '87%',
    backgroundColor: '#FAFAFA',
    padding: 15,
    borderBottomColor: '#BABABA',
    borderBottomWidth: 0.3,
    marginHorizontal:  wp( 25 ),
    alignItems: 'center'
  },
  indexWrapper: {
    width: '10%'
  },
  gridItemIndex: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.blue,
    opacity: 0.6
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#717171',
    opacity: 0.6
  },
  buttonView: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.blue,
    right: 15,
    width: 120
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  bottomButtonView: {
    flex: 1,
    // flexDirection: 'row',
    // paddingHorizontal: hp( 6 ),
    paddingBottom: deviceInfoModule.hasNotch() ? hp( 4 ) : hp( 3 ),
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
} )
export default SelectChecksumWord
