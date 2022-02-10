import { heightPercentageToDP } from 'react-native-responsive-screen'
import Toast from 'react-native-root-toast'
import Colors from '../common/Colors'

export default ( message, toastPosition=-15 ) => {
  return Toast.show( message, {
    duration: Toast.durations.LONG,
    position: heightPercentageToDP( toastPosition ),
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    opacity: 0.9,
    backgroundColor: 'rgba(0, 108, 180, 0.5)',
    textColor: Colors.white,
  } )
}