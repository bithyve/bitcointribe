import React, { useState } from 'react'
import { Keyboard, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { Input } from 'react-native-elements'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { launchImageLibrary } from 'react-native-image-picker'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch } from 'react-redux'
import ModalContainer from 'src/components/home/ModalContainer'
import RGBIntroModal from 'src/components/rgb/RGBIntroModal'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import FormStyles from '../../common/Styles/FormStyles'
import CommonStyles from '../../common/Styles/Styles'
import HeaderTitle from '../../components/HeaderTitle'
import Toast from '../../components/Toast'
import RGBServices from '../../services/RGBServices'
import { syncRgb } from '../../store/actions/rgb'

export default function IssueScreen( props ) {

  const issueType = props.route.params?.issueType
  const dispatch = useDispatch()
  const [ name, setName ] = useState( '' )
  const [ description, setDescription ] = useState( '' )
  const [ totalAmount, setTotalAmount ] = useState( '' )
  const [ ticker, setTicker ] = useState( '' )
  const [ attachedfile, setAttachedFile ] = useState( 'Attach File' )
  const [ requesting, setRequesting ] = useState( false )
  // const [ loading, setLoading ] = useState( false )

  async function IssueAssetClick() {
    Keyboard.dismiss()
    try {
      if( issueType === 'collectible' ) {
        if ( !name || !description || !totalAmount || !attachedfile ) {
          Toast( 'Please enter all details.' )
        } else {
          setRequesting( true )
          setTimeout(async()=>{
          const newAsset = await RGBServices.issueRgb25Asset( name, description, totalAmount, attachedfile )
          setRequesting( false )
          if( newAsset.assetId ) {
            props.navigation.goBack()
            dispatch( syncRgb() )
            Toast( 'Asset created' )
          } else {
            Toast( `Failed ${newAsset.error}` )
          }
        },300)
        }
      } else {
        if ( !ticker || !name || !totalAmount ) {
          Toast( 'Please enter all details.' )
        } else {
          setRequesting( true )
          setTimeout(async()=>{
          const newAsset = await RGBServices.issueRgb20Asset( ticker, name, totalAmount )
          setRequesting( false )
          if( newAsset.assetId ) {
            props.navigation.goBack()
            dispatch( syncRgb() )
            Toast( 'Asset created' )
          } else {
            Toast( `Failed ${newAsset.error}` )
          }
        },300)
        }
      }
    } catch ( error ) {
      setRequesting( false )
      Toast( `Failed ${error}` )
      console.log( 'error', error )
    }
  }

  const pickFile = ()=> {
    launchImageLibrary(
      {
        title: 'Select a file',
        mediaType: 'photo',
        takePhotoButtonTitle: null,
        selectionLimit: 1,
      },
      response => {
        console.log( response )
        if( response.assets ) {
          setAttachedFile( response.assets[ 0 ].uri.replace( 'file://', '' ) )

        }
      },
    )
  }
  
  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      {/* {
        requesting &&
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <ActivityIndicator size="large" color={Colors.darkBlue} />
        </View>
      } */}
      <SafeAreaView style={{
        flex: 0
      }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <HeaderTitle
        firstLineTitle={'Issue ' + issueType.slice(0,1).toUpperCase() + issueType.slice(1, issueType.length)}
        secondLineTitle={issueType=== 'collectible' ? 'Enter collectible asset details' : 'Enter coin asset details'}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />

      <View style={styles.bodySection}>
        <Input
          inputContainerStyle={[
            FormStyles.textInputContainer,
            styles.textInputContainer,
          ]}
          inputStyle={FormStyles.inputText}
          placeholder={'Asset Name'}
          placeholderTextColor={FormStyles.placeholderText.color}
          underlineColorAndroid={'transparent'}
          value={name}
          onChangeText={( text ) => {
            setName( text )
          }}
          numberOfLines={1}
          editable={!requesting}
        />
        {issueType != 'coin' &&
          <Input
            inputContainerStyle={[
              FormStyles.textInputContainer,
              styles.textInputContainer,
            ]}
            inputStyle={FormStyles.inputText}
            placeholder={'Asset Description'}
            placeholderTextColor={FormStyles.placeholderText.color}
            underlineColorAndroid={'transparent'}
            value={description}
            onChangeText={( text ) => {
              setDescription( text )
            }}
            editable={!requesting}
            numberOfLines={1}
          />
        }
        {issueType == 'coin' &&
          <Input
            inputContainerStyle={[
              FormStyles.textInputContainer,
              styles.textInputContainer,
            ]}
            inputStyle={FormStyles.inputText}
            placeholder={'Asset Ticker'}
            placeholderTextColor={FormStyles.placeholderText.color}
            underlineColorAndroid={'transparent'}
            value={ticker}
            onChangeText={( text ) => {
              setTicker( text.toUpperCase() )
            }}
            numberOfLines={1}
            editable={!requesting}
            autoCapitalize={'characters'}
          />
        }
        <Input
          inputContainerStyle={[
            FormStyles.textInputContainer,
            styles.textInputContainer,
          ]}
          inputStyle={FormStyles.inputText}
          placeholder={'Total Supply Amount'}
          placeholderTextColor={FormStyles.placeholderText.color}
          underlineColorAndroid={'transparent'}
          value={totalAmount}
          onChangeText={( text ) => {
            setTotalAmount( text.replace( /[^0-9]/g, '' ), )
          }}
          keyboardType="number-pad"
          numberOfLines={1}
          editable={!requesting}
        />
        {issueType != 'coin' &&
          <TouchableOpacity onPress={pickFile} activeOpacity={0.6} disabled={requesting} style={[ FormStyles.textInputContainer, {
            marginHorizontal: 12, alignItems: 'center', backgroundColor: 'white'
          } ]}>
            <Text style={attachedfile == 'Attach File' ? styles.attachPlaceholderText : styles.attachText}>{attachedfile}</Text>
          </TouchableOpacity>
        }
        <View style={styles.footerSection}>
          <TouchableOpacity disabled={requesting} activeOpacity={0.6} onPress={IssueAssetClick}>
            <View
              style={styles.IssueAssetWrapper}
            >
              <Text style={styles.IssueAssetText}>{'Submit'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <ModalContainer
        onBackground={()=>{}}
        closeBottomSheet={() => {}}
        visible={requesting}
      >
        <RGBIntroModal
          title={'Creating Asset'}
          info={'RGB protocol allows you to issue and manage fungible (coins) and non-fungible (collectibles) assets on the bitcoin network'}
          otherText={'Syncing assets with RGB nodes'}
          proceedButtonText={'Continue'}
          isIgnoreButton={false}
          closeModal={()=> setRequesting( false )}
          onPressProceed={() => {setRequesting( false )}}
          onPressIgnore={() => {
            setRequesting( false )
          }}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
        />
      </ModalContainer>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  },
  bodySection: {
    paddingHorizontal: 16,
    flex: 1,
    marginTop: 20
  },

  textInputContainer: {
    backgroundColor: 'white',
    elevation: 1
  },

  footerSection: {
    paddingHorizontal: 26,
    alignItems: 'flex-end',
    marginVertical: 20
  },
  IssueAssetWrapper: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: Colors.blue
  },
  IssueAssetText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium
  },
  attachPlaceholderText: {
    flex: 1,
    paddingHorizontal: 20,
    color: FormStyles.placeholderText.color,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 12 ),
    textAlign: 'left',
  },
  attachText: {
    flex: 1,
    paddingHorizontal: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 12 ),
    textAlign: 'left',
  }

} )
