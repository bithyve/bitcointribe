import React from 'react'
import {
  View,
  TouchableOpacity,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CommonStyles from '../common/Styles/Styles'
import Colors from '../common/Colors'
import HeaderTitle from '../components/HeaderTitle'
import { withNavigation } from 'react-navigation'
import { widthPercentageToDP } from 'react-native-responsive-screen'


const BackIconTitle = ( { navigation, firstLineTitle = '', secondLineTitle = '' } ) => {
  return(
    <>
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor, marginLeft: widthPercentageToDP( 1 )
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      {firstLineTitle !== '' || secondLineTitle !== '' &&
      <HeaderTitle
        firstLineTitle={firstLineTitle ? firstLineTitle : ''}
        secondLineTitle={secondLineTitle ? secondLineTitle : ''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      }
    </>

  )
}

export default withNavigation( BackIconTitle )
