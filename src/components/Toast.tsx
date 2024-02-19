import React from 'react'
import {
  Text,
  View
} from 'react-native'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import Toast from 'react-native-root-toast'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '../common/Colors'

export default (  message, icon = false, error= false, toastPosition=-15 ) => {
  return Toast.show( <View style={{
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
    width:300,
    minHeight:60,
    borderRadius:50
  }}>
    {icon &&
    <Ionicons
      name={!error ? 'checkmark-circle' : 'alert-circle'}
      color={!error ? Colors.white : Colors.red}
      size={30}
      style={{
        marginLeft:20
      }}
    />
    }
    <Text style={{
      color:Colors.white,
      paddingLeft:10,
      fontSize:15,
      flex:1,
      flexWrap:'wrap'
    }}>
      {message.length > 100  ? `${message.substring( 0, 100 )}...` : message}
    </Text>
  </View>, {
    duration: Toast.durations.SHORT,
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
