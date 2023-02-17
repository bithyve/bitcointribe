import React, { Component } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  Text
} from 'react-native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import CommonStyles from '../common/Styles/Styles'
import KnowMoreButton from './KnowMoreButton'
import { RFValue } from 'react-native-responsive-fontsize'

export default function HeaderTitle( props ) {

  return ( <View>
    <View style={{
      flexDirection: 'row', alignItems: 'center',
    }}>
      <Text style={CommonStyles.headerTitles} >
        {props.firstLineTitle}
      </Text>
    </View>
    {
      ( props.secondLineBoldTitle || props.secondLineTitle ) ?
        <View style={{
          flexDirection: 'row', alignItems: 'center',
        }}>
          <Text style={[ CommonStyles.subHeaderTitles, {
            fontWeight: '500', width: wp( 65 )
          } ]} >
            {props.secondLineBoldTitle}
            <Text style={[ CommonStyles.subHeaderTitles, {
              fontWeight: 'normal', fontSize: RFValue( 12 ),
            } ]} >
              {props.secondLineTitle}
            </Text>
          </Text>
        </View>
        : null
    }

    {props.isKnowMoreButton &&
                <KnowMoreButton onpress={() => props.onPressKnowMore} containerStyle={{
                  marginLeft: 'auto', marginRight: 20
                }} />
    }
    {props.infoTextNormal ?
      <Text style={CommonStyles.headerTitlesInfoText} >
        {props.infoTextNormal}
      </Text>
      :null
    }
  </View>
  )
}
