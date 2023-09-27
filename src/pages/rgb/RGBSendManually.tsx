import React, { useState } from 'react'
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { Input } from 'react-native-elements'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import FormStyles from '../../common/Styles/FormStyles'
import CommonStyles from '../../common/Styles/Styles'
import { translations } from '../../common/content/LocContext'

export default function RGBSendManually ( props ) {
  const common  = translations[ 'common' ]

  const [ payTo, setPayTo ] = useState( props.route.params?.address ?? '' )
  const [ amount, setamount ] = useState( '' )
  const [ fee, setfee ] = useState( '' )

  function SendButtonClick() {

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
      <Text style={styles.headerTitleText}>{common.send}</Text>
      <Text style={styles.headerSubTitleText}>{'Enter Bitcoin address manually'}</Text>

      <KeyboardAwareScrollView
        bounces={false}
        overScrollMode="never"
        style={styles.rootContainer}>
        <View style={styles.bodySection}>
          <Input
            inputContainerStyle={[
              FormStyles.textInputContainer,
              styles.textInputContainer,
            ]}
            inputStyle={FormStyles.inputText}
            placeholder={'Pay to'}
            placeholderTextColor={FormStyles.placeholderText.color}
            underlineColorAndroid={'transparent'}
            value={payTo}
            onChangeText={( text ) => {
              setPayTo( text )
            }}
            numberOfLines={1}
          />

          <Input
            inputContainerStyle={[
              FormStyles.textInputContainer,
              styles.textInputContainer,
            ]}
            inputStyle={FormStyles.inputText}
            placeholder={'Amount to pay'}
            placeholderTextColor={FormStyles.placeholderText.color}
            underlineColorAndroid={'transparent'}
            value={amount}
            onChangeText={( text ) => {
              setamount( text )
            }}
            keyboardType="number-pad"
            numberOfLines={1}
          />
          <Input
            inputContainerStyle={[
              FormStyles.textInputContainer,
              styles.textInputContainer,
            ]}
            inputStyle={FormStyles.inputText}
            placeholder={'Fee rates'}
            placeholderTextColor={FormStyles.placeholderText.color}
            underlineColorAndroid={'transparent'}
            value={fee}
            onChangeText={( text ) => {
              setfee( text )
            }}
            keyboardType="number-pad"
            numberOfLines={1}
          />
          <View style={styles.footerSection}>
            <TouchableOpacity onPress={SendButtonClick}>
              <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
                start={{
                  x: 0, y: 0
                }} end={{
                  x: 1, y: 0
                }}
                locations={[ 0.2, 1 ]}
                style={styles.sendBtnWrapper}
              >
                <Text style={styles.sendBtnText}>{common.send}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
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
  },
  sendBtnWrapper: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
  },
  sendBtnText: {
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
    marginTop:3,
    marginBottom:20
  },
  infoHeaderText: {
    fontSize: RFValue( 12 ),
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    fontFamily: Fonts.Regular,
  },

} )
