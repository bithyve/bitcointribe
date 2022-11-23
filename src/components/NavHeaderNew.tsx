import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { hp, wp } from '../common/data/responsiveness/responsive'
import { RFValue } from 'react-native-responsive-fontsize'
import NewSwitch from './NewSwitch'

const NavHeaderNew: React.FC<{onPress: any, title: string}> = ( { onPress, title } ) => {
  return (
    <View style={{
      backgroundColor: Colors.blue,
      paddingHorizontal: wp( 30 ),
      borderBottomLeftRadius: wp( 25 ),
      flexDirection: 'row',
      height: hp( 90 ),
      alignItems: 'center'
    }}>
      <TouchableOpacity
        onPress={onPress}
      >
        <FontAwesome
          name='chevron-left'
          color={'white'}
          size={hp( 19 )}
        />
      </TouchableOpacity>

      <Text style={{
        color: Colors.white,
        fontFamily: Fonts.RobotoSlabMedium,
        fontSize: RFValue( 14 ),
        lineHeight: RFValue( 18 ),
        letterSpacing: RFValue( 0.7 ),
        marginLeft: wp( 30 ),
        flex: 1
      }}>
        {title}
      </Text>

      <NewSwitch />
    </View>
  )
}

export default NavHeaderNew
