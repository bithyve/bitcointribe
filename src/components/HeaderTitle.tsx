import React from 'react'
import {
  Text, TouchableOpacity, View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../common/Colors'
import CommonStyles from '../common/Styles/Styles'
import KnowMoreButton from './KnowMoreButton'

export default function HeaderTitle( props ) {

  return ( <View>
    {props.backButton? <View style={CommonStyles.headerContainer}>
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
    </View>:null}
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
            fontWeight: '500',
            // width: wp( 65 )
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
