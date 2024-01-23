import React, { useRef, useContext, useEffect } from 'react'
import {
  View,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Video from 'react-native-video'
import Colors from '../common/Colors'
import BottomSheet from 'reanimated-bottom-sheet'
import DeviceInfo from 'react-native-device-info'
import ErrorModalContents from '../components/ErrorModalContents'
import ModalHeader from '../components/ModalHeader'
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import idx from 'idx'
import {
  getMessages,
} from '../store/actions/notifications'
import { LocalizationContext } from '../common/content/LocContext'
import TestElectrumClient from '../bitcoin/electrum/test-client'

type LaunchScreenProps = {
  navigation: any;
  lastSeen: any;
  databaseInitialized: Boolean;
  getMessages: any;
  walletId: any;
  walletExists: Boolean,
  torEnabled: boolean,
}


const Launch =(props:LaunchScreenProps)=> {
  const localizationContext = useContext(LocalizationContext);
  const errorBottomSheet =useRef<BottomSheet>()
  useEffect( () => {
    setTimeout( ()=>{
      TestElectrumClient.connect()
      postSplashScreenActions()
    }, 4000 )
  }, [] )

  useEffect(() => {
    localizationContext.initializeAppLanguage();
  }, [localizationContext]); 
 

  const postSplashScreenActions = async () => {
    try {
      if( props.walletId ){
        props.getMessages()
      }
      const hasCreds = await AsyncStorage.getItem( 'hasCreds' )
      if ( hasCreds ) {
        const now: any = new Date()
        const diff = Math.abs( now - props.lastSeen )
        const isHomePageOpen = Number( diff ) < Number( 20000 )
        if( isHomePageOpen ){
            props.navigation.replace( 'App', {
              screen: 'Home',
            } )
          }
        else {
          props.navigation.replace( 'Login' )
        }
      } else {
        props.navigation.replace( 'PasscodeConfirm' )
      }
    } catch ( err ) {
      errorBottomSheet.current.snapTo( 1 )
    }
  };

   return (
       <View style={styles.container}>
         <Video
           source={require( './../assets/video/splash_animation.mp4' )}
           style={{
             flex: 1,
           }}
           muted={true}
           repeat={false}
           resizeMode={'cover'}
           rate={1.0}
           ignoreSilentSwitch={'obey'}

         />
         <StatusBar
           backgroundColor={'white'}
           hidden={true}
           barStyle="dark-content"
         />
         <BottomSheet
           enabledInnerScrolling={true}
           ref={errorBottomSheet as any}
           snapPoints={[
             -50,
             Platform.OS == 'ios' && DeviceInfo.hasNotch()
               ? hp( '35%' )
               : hp( '40%' ),
           ]}
           renderContent={() => (
             <ErrorModalContents
               title={'Login error'}
               info={'Error while loging in, please try again'}
               proceedButtonText={'Open Setting'}
               isIgnoreButton={true}
               onPressProceed={() => {
                errorBottomSheet.current.snapTo( 0 )
               }}
               onPressIgnore={() => {
                errorBottomSheet.current.snapTo( 0 )
               }}
               isBottomImage={true}
               bottomImage={require( '../assets/images/icons/errorImage.png' )}
             />
           )}
           renderHeader={() => (
             <ModalHeader
               onPressHeader={() => {
                errorBottomSheet.current.snapTo( 0 )
               }}
             />
           )}
         />
       </View>
     )
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
} )



const mapStateToProps = ( state ) => {
  return {
    lastSeen: idx( state, ( _ ) => _.preferences.lastSeen ),
    walletId: idx( state, ( _ ) => _.preferences.walletId ),
    walletExists: idx( state, ( _ ) => _.storage.walletExists ),
    torEnabled: idx( state, ( _ ) => _.preferences.torEnabled ),
  }
}

export default connect( mapStateToProps, {
  getMessages,
} )( Launch )
