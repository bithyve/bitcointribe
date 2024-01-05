import React, { useState } from 'react'
import {
  FlatList, SafeAreaView,
  StatusBar,
  StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native'
import deviceInfoModule from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import IconArrowDown from '../../assets/images/svgs/icon_arrow_down.svg'
import { GridType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'
import { hp, windowHeight, wp } from '../../common/data/responsiveness/responsive'
import Fonts from '../../common/Fonts'
import BottomInfoBox from '../../components/BottomInfoBox'
import ModalContainer from '../../components/home/ModalContainer'
import LoaderModal from '../../components/LoaderModal'
import SeedHeaderComponent from '../NewBHR/SeedHeaderComponent'


const SelectEntropyGridType = ( props ) => {
  const mnemonic = props.route.params?.mnemonic || null
  const isAccountCreation = props.route.params?.isAccountCreation || false
  const loaderMessage = {
    heading: translations[ 'bhr' ].Importingyourwallet,
    text: translations[ 'bhr' ].Thismaytake
  }
  const subPoints = [
    translations[ 'bhr' ].Settingupmultipleaccounts,
    translations[ 'bhr' ].Preloading,
  ]
  const bottomTextMessage = translations[ 'bhr' ].Hexaencrypts
  const gridTypeArray = [ GridType.WORDS, GridType.NUMBERS, GridType.HEXADECIMAL, GridType.BLANK ]
  const [ headerTitle ] = useState( 'Select Type of Entropy Grid' )
  const [ gridType, setGridType ] = useState( GridType.WORDS )
  const [ showDropdown, setShowDropdown ] = useState( false )
  type ItemProps = { title: string; };
  const [ loaderModal, setLoaderModal ] = useState( false )

  const Item = ( { title }: ItemProps ) => (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor:
          gridType === title ? '#69A2B0' : '#FAFAFA',
        },
      ]}
      onPress={() => {
        setShowDropdown( false ), setGridType( title )
      }}
    >
      <Text
        style={[
          styles.title,
          {
            color: gridType === title ? '#FAFAFA' : '#717171',
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )

  const onPressNext = ()=> {
    isAccountCreation ? props.navigation.navigate( 'DownloadEncryptGrid', {
      mnemonic, isNewWallet: true, gridType, isAccountCreation
    } ) :
      props.navigation.navigate( 'DownloadEncryptGrid', {
        mnemonic, isNewWallet: true, gridType, isAccountCreation
      } )
  }

  const onBackgroundOfLoader = () => {
    setLoaderModal( false )
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
        info1={'Step 2 of Creating Border Wallet'}
        info={'Different entropy grid options to select from'}
        selectedTitle={headerTitle}
      />
      <TouchableOpacity
        style={styles.dropdownBox}
        onPress={() => setShowDropdown( !showDropdown )}
      >
        <Text style={styles.dropdownText}>{gridType}</Text>
        <IconArrowDown />
      </TouchableOpacity>
      <View
        style={{
          height: windowHeight> 850? '45%' : '38%',
        }}
      >
        {showDropdown && (
          <FlatList
            data={gridTypeArray}
            overScrollMode="never"
            bounces={false}
            renderItem={( { item } ) => <Item title={item} />}
          />
        )}
      </View>
      <BottomInfoBox
        title={'Note'}
        infoText={'Words option for entropy grid is recommended'}
      />
      <View style={styles.bottomButtonView}>
        <View style={styles.statusIndicatorView}>
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorActiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
          <View style={styles.statusIndicatorInactiveView} />
        </View>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={onPressNext}
        >
          <View
            style={styles.buttonView}
          >
            <Text style={styles.buttonText}>Generate Grid</Text>
          </View>
        </TouchableOpacity>
      </View>
      <ModalContainer onBackground={onBackgroundOfLoader}  visible={loaderModal} closeBottomSheet={() => { }} >
        <LoaderModal
          headerText={loaderMessage.heading}
          messageText={loaderMessage.text}
          subPoints={subPoints}
          bottomText={bottomTextMessage} />
      </ModalContainer>

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
    textTransform: 'capitalize'
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
    textTransform: 'capitalize'
  },
  buttonView: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.blue,
    width: 200,
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
export default SelectEntropyGridType
