import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Dimensions
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import idx from 'idx'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const { height, } = Dimensions.get( 'window' )

export default function GiftStepperComponent( props ) {

  return (
    <View style={[ styles.container, props.extraContainer ]}>
      {
        props.showLoader ?
          <ActivityIndicator size="small" color={Colors.blue} />
          : <Image style={styles.circularView} resizeMode='contain'
            source={props.stepImage || require( '../../assets/images/icons/checkmark.png' )} />
      }
      <Text style={[ styles.setUpText, {
        color: props.showLoader ? Colors.greyText : Colors.gray19
      } ]}>
        {props.verifiedText}</Text>
    </View>
  )
}

const styles = StyleSheet.create( {
  container: {
    flexDirection: 'row', marginHorizontal: 20, alignItems: 'center'
  },
  circularView: {
    width: 41, height: 41, borderRadius: 18
  },
  setUpText: {
    fontFamily: Fonts.FiraSansRegular,
    marginStart: 8,
    fontSize: RFValue( 14 ),
    letterSpacing: 0.8,
    color: Colors.greyText
  }
} )
