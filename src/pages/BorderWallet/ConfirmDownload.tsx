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
import ModalContainer from '../../components/home/ModalContainer'

const ConfirmDownload = ( props ) => {
  const [ headerTitle, setHeaderTitle ]=useState( 'Memorise/Download' )
  const [ successModal, setSuccessModal ] = useState( false )
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
          <View style={styles.patternPreviewWrapper}></View>
          <TouchableOpacity style={styles.previewPatternButton}>
            <Text style={styles.PreviewButtonText}>Preview Pattern</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.mnemonicWrapper}>
          <Text style={styles.previewTitle}>Regeneration Mnemonic</Text>
          <FlatList
            data={DATA}
            renderItem={( { item } ) => <Item title={item.title} id={item.id} />}
            keyExtractor={item => item.id}
            numColumns={2}
          />
          <Text style={[ styles.previewTitle, {
            marginLeft: 5
          } ]}>Checksum Word</Text>
          <View style={[ styles.item, {
            marginLeft: 8
          } ]}>
            <View style={styles.indexWrapper}>
              <Text style={styles.gridItemIndex}>34</Text>
            </View>
            <Text style={styles.title}>DOVE</Text>
          </View>
          <View>
            <Text style={[ styles.previewTitle, {
              marginLeft: 5
            } ]}>Passphrase</Text>
            <View style={styles.passPhraseWrapper}>
              <Text>Do not go gentle into that good night, Old age should burn and rave at close of day</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.bottomButtonView}>
        <View>
          <TouchableOpacity
            onPress={() => {
            //   setGenerateEntropyGrid( true )
              setSuccessModal( true )
              // props.navigation.navigate( 'SelectChecksumWord' )
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
      {/* <ModalContainer
        onBackground={()=> setSuccessModal( false )}
        visible={successModal}
        closeBottomSheet={()=> setSuccessModal( false )}
      >

      </ModalContainer> */}
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  item: {
    flexDirection: 'row',
    width: '38%',
    backgroundColor: '#FAFAFA',
    padding: 15,
    margin: 2,
    alignItems: 'center'
  },
  indexWrapper: {
    width: '30%'
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#717171'
  },
  gridItemIndex: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.blue
  },
  previewWrapper: {
    flexDirection: 'row',
    width: '100%',
    marginHorizontal: 20,
    height: '73%'

  },
  patternWrapper: {
    width: '40%'
  },
  mnemonicWrapper: {
    width: '60%'
  },
  previewTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
    marginBottom: 5
  },
  patternPreviewWrapper: {
    backgroundColor: '#CBCBCB',
    height: '65%',
    width: '90%',
    marginTop: 20
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
    paddingBottom: deviceInfoModule.hasNotch() ? hp( 4 ) : hp( 3 ),
    justifyContent: 'flex-end',
    alignItems: 'center',
    right: 20
  },
  passPhraseWrapper:{
    width: '80%',
    backgroundColor: '#FAFAFA',
    padding: 10,
    marginLeft: 5
  },
  previewPatternButton :{
    backgroundColor: '#69A2B0',
    borderRadius: 5,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 10
  }
} )
export default ConfirmDownload