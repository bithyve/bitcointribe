import React from 'react'
import {
  Text,
  View
} from 'react-native'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import Toast from 'react-native-root-toast'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Colors from '../common/Colors'

export default (  message, icon = '', toastPosition=-15 ) => {
  return Toast.show( <View style={{
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
    width:300,
    minHeight:70,
    height:'auto'
  }}>
    {icon &&
    <MaterialCommunityIcons
      name="check-circle-outline"
      color={Colors.white}
      size={30}
    />
    }
    <Text style={{
      color:Colors.white,
      paddingLeft:10,
      fontSize:15,
      flex:1,
      flexWrap:'wrap'
    }}>
      {message}
    </Text>
  </View>, {
    duration: Toast.durations.LONG,
    position: heightPercentageToDP( toastPosition ),
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    opacity: 1,
    backgroundColor: Colors.CLOSE_ICON_COLOR,
    textColor: Colors.white,
  } )
}
