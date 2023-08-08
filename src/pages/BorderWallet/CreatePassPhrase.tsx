import React, { useState } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'
import Fonts from '../../common/Fonts'
import { hp, wp } from '../../common/data/responsiveness/responsive'
import LinearGradient from 'react-native-linear-gradient'
import deviceInfoModule from 'react-native-device-info'

const CreatePassPhrase = ( props ) => {
  const [ headerTitle, setHeaderTitle ]=useState( 'Create Passphrase' )
  const [ checksumWord, setChecksumWord ] = useState( '' )

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
        info1={'Step 4 of Create with Border Wallet'}
        info={'This is the final step of creating your Border Wallet'}
        selectedTitle={headerTitle}
      />
      <View style={styles.textInputWrapper}>
        <View>
          <TextInput
            style={
              styles.textBox
            }
            placeholder={'Passphrase'}
            placeholderTextColor={Colors.textColorGrey}
            value={checksumWord}
            onChangeText={text => setChecksumWord( text )}
          />
        </View>
        <View>
          <TextInput
            style={
              styles.textBox
            }
            placeholder={'Confirm passphrase'}
            placeholderTextColor={Colors.textColorGrey}
            value={checksumWord}
            onChangeText={text => setChecksumWord( text )}
          />
        </View>
      </View>
      <View style={styles.bottomButtonView}>
        <Text style={styles.skipText}>Skip</Text>
        <View>
          <TouchableOpacity
            onPress={() => {
            //   setGenerateEntropyGrid( true )
              props.navigation.navigate( 'ConfirmDownload' )
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
  textBox: {
    marginHorizontal: wp( 25 ),
    marginVertical: hp( 10 ),
    paddingLeft: 15,
    height: 120,
    borderRadius: 10,
    color: Colors.textColorGrey,
    fontFamily: Fonts.Light,
    fontSize: RFValue( 13 ),
    backgroundColor: '#FAFAFA'
  },
  textInputWrapper:{
    height: '70%'
  },
  item: {
    flexDirection: 'row',
    width: '87%',
    backgroundColor: '#FAFAFA',
    padding: 15,
    marginVertical: 8,
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
    width: '100%',
    paddingHorizontal: hp( 6 ),
    paddingBottom: deviceInfoModule.hasNotch() ? hp( 4 ) : hp( 3 ),
    justifyContent: 'flex-end',
    alignItems: 'center',
    right: 20
  },
  skipText :{
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
    marginRight: 15
  }
} )
export default CreatePassPhrase
