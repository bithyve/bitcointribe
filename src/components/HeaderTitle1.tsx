import React, { Component } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  Text
} from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import CommonStyles from '../common/Styles/Styles'
import KnowMoreButton from './KnowMoreButton'
import { RFValue } from 'react-native-responsive-fontsize'

export default function HeaderTitle1( props ) {

  return ( <View>
    <View style={{
      flexDirection: 'row', alignItems: 'center'
    }}>
      <Text style={CommonStyles.headerTitles1} >
        {props.firstLineTitle}
      </Text>
    </View>
    <View style={{
      flexDirection: 'row', alignItems: 'center',
    }}>
      <Text style={[ CommonStyles.subHeaderTitlesBold, {
        fontWeight: '400', width: wp( 90 )
      } ]} >
        {props.secondLineBoldTitle}
        <Text style={[ CommonStyles.subHeaderTitlesBold, {
          fontWeight: 'normal'
        } ]} >
          {props.secondLineTitle}
        </Text>
      </Text>

    </View>
    {props.isKnowMoreButton &&
                <KnowMoreButton onpress={() => props.onPressKnowMore} containerStyle={{
                  marginLeft: 'auto', marginRight: 20
                }} />
    }

    <Text style={CommonStyles.headerTitlesInfoText} >
      {props.infoTextNormal}
    </Text>
  </View>

  )
}
