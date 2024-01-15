import React from 'react'
import {
  Text, View
} from 'react-native'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import CommonStyles from '../common/Styles/Styles'
import KnowMoreButton from './KnowMoreButton'

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
