import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native'
import FormStyles from '../../common/Styles/FormStyles'
import { Input } from 'react-native-elements'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../common/Colors'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Fonts from '../../common/Fonts'
import LinearGradient from 'react-native-linear-gradient'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import RGBServices from '../../services/RGBServices'
import { useDispatch } from 'react-redux'
import { syncRgb } from '../../store/actions/rgb'
import Toast from '../../components/Toast'
import { launchImageLibrary } from 'react-native-image-picker'

export default function IssueScreen( props ) {

  const issueType = props.navigation.getParam( 'issueType' )
  const dispatch = useDispatch()
  const [ name, setName ] = useState( '' )
  const [ description, setDescription ] = useState( '' )
  const [ totalAmount, setTotalAmount ] = useState( '' )
  const [ ticker, setTicker ] = useState( '' )
  const [ attachedfile, setAttachedFile ] = useState( 'Attach File' )
  const [ requesting, setRequesting ] = useState( false )

  async function IssueAssetClick() {
    try {
      if( issueType === 'collectible' ) {
        setRequesting( true )
        const newAsset = await RGBServices.issueRgb121Asset( name, description, totalAmount, attachedfile )
        setRequesting( false )
        if( newAsset.assetId ) {
          props.navigation.goBack()
          dispatch( syncRgb() )
          Toast( 'Asset created' )
        } else {
          Toast( `Failed ${newAsset.error}` )
        }
      } else {
        setRequesting( true )
        const newAsset = await RGBServices.issueRgb20Asset( ticker, name, totalAmount )
        setRequesting( false )
        if( newAsset.assetId ) {
          props.navigation.goBack()
          dispatch( syncRgb() )
          Toast( 'Asset created' )
        } else {
          Toast( `Failed ${newAsset.error}` )
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
      <Text style={styles.headerTitleText}>{'Issue ' + issueType}</Text>
      <Text style={styles.headerSubTitleText}>{'Issue new coins or collectibles on RGB. Set limit and send it around your tribe'}</Text>

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
              setTicker( text )
            }}
            numberOfLines={1}
            editable={!requesting}
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
            <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
              start={{
                x: 0, y: 0
              }} end={{
                x: 1, y: 0
              }}
              locations={[ 0.2, 1 ]}
              style={styles.IssueAssetWrapper}
            >
              <Text style={styles.IssueAssetText}>{'Issue Asset'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  },
  bodySection: {
    paddingHorizontal: 16,
    flex: 1,
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
    marginTop: 30
  },
  IssueAssetText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    marginLeft: 20,
    fontFamily: Fonts.Regular,
  },
  headerSubTitleText: {
    fontSize: RFValue( 12 ),
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontFamily: Fonts.Regular,
    marginLeft: 20,
    marginTop: 6,
    marginBottom: 20
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
