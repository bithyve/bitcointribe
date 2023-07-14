import React, { useState, useEffect } from 'react'
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
import { translations } from '../../common/content/LocContext'
import LinearGradient from 'react-native-linear-gradient'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

export default function IssueScreen ( props ) {
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const issueType = props.navigation.getParam( 'issueType' )

  const [ name, setName ] = useState( '' )
  const [ description, setDescription ] = useState( '' )
  const [ totalAmount, setTotalAmount ] = useState( '' )
  const [ ticker, setTicker ] = useState( '' )
  const [attachedfile, setAttachedFile] = useState('Attach File')
  
  function IssueAssetClick() {

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
            <Text style={styles.headerTitleText}>{'Issue ' + issueType }</Text>
            <Text style={styles.headerSubTitleText}>{'Lorem ipsum dolor sit amet, consec tetur'}</Text>

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
            setTotalAmount( text )
          }}
          keyboardType="number-pad"
          numberOfLines={1}
        />
      {issueType != 'coin' &&
         <TouchableOpacity style={[FormStyles.textInputContainer, {marginHorizontal:12, alignItems: 'center'}]}>
              <Text style={ attachedfile == 'Attach File' ? styles.attachPlaceholderText : styles.attachText}>{attachedfile}</Text>
         </TouchableOpacity>
}
         <View style={styles.footerSection}>
        <TouchableOpacity onPress={IssueAssetClick}>
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
    marginTop:6,
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
