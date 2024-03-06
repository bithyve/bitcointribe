import AsyncStorage from '@react-native-async-storage/async-storage'
import idx from 'idx'
import React, { Component } from 'react'
import {
  AppState, Linking, Platform, StatusBar, StyleSheet, View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {
  heightPercentageToDP as hp
} from 'react-native-responsive-screen'
import Video from 'react-native-video'
import { connect } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import { predefinedMainnetNodes, predefinedTestnetNodes } from '../bitcoin/electrum/predefinedNodes'
import { default as TestElectrumClient, default as TestnetElectrumClient } from '../bitcoin/electrum/test-client'
import { NetworkType } from '../bitcoin/utilities/Interface'
import Colors from '../common/Colors'
import { processDeepLink } from '../common/CommonFunctions'
import { LocalizationContext } from '../common/content/LocContext'
import ErrorModalContents from '../components/ErrorModalContents'
import ModalHeader from '../components/ModalHeader'
import {
  getMessages
} from '../store/actions/notifications'
// import RestClient from '../services/rest/RestClient'
import config from '../bitcoin/HexaConfig'

type LaunchScreenProps = {
  navigation: any;
  lastSeen: any;
  databaseInitialized: Boolean;
  getMessages: any;
  walletId: any;
  walletExists: Boolean,
  torEnabled: boolean,
}

type LaunchScreenState = { }

class Launch extends Component<LaunchScreenProps, LaunchScreenState> {
  static contextType = LocalizationContext

  errorBottomSheet: any;
  url: any;
  appStateSubscribe:any;
  linkStateSubscribe:any;
  constructor( props ) {
    super( props )
    this.errorBottomSheet = React.createRef()
  }


  componentDidMount = async() => {
    TestElectrumClient.connect()
    setTimeout( ()=>{
      this.postSplashScreenActions()
    }, 4000 )
    this.context.initializeAppLanguage()
  };

   handleDeepLinkEvent = async ( { url } ) => {
     this.handleDeepLinking( url )
   }

   handleDeepLinking = async ( url: string | null ) => {
     if ( url == null ) {
       return
     }
     this.url=url
   }



  handleAppStateChange = ( nextAppState ) => {
    // no need to trigger login screen if accounts are not synced yet
    // which means user hasn't logged in yet
    if ( !this.props.walletExists ) return
  };

  postSplashScreenActions = async () => {
    try {
      if( this.props.walletId ){
        this.props.getMessages()
      }
      const url = await Linking.getInitialURL()

      const hasCreds = await AsyncStorage.getItem( 'hasCreds' )
      // enable tor status
      // RestClient.setUseTor(this.props.torEnabled);
      // scenario based navigation
      if ( hasCreds ) {
        const now: any = new Date()
        const diff = Math.abs( now - this.props.lastSeen )
        const isHomePageOpen = Number( diff ) < Number( 20000 )
        if( isHomePageOpen ){
          if ( !this.url ){
            this.props.navigation.replace( 'App', {
              screen: 'Home',
            } )
          } else {
            const processedLink = await processDeepLink( this.url )
            this.props.navigation.replace( 'App', {
              screen: 'Home',
              params: {
                trustedContactRequest: processedLink ? processedLink.trustedContactRequest: null,
                giftRequest: processedLink ? processedLink.giftRequest: null,
                swanRequest: processedLink ? processedLink.swanRequest: null,
              }
            } )
          }
        } else if ( !this.url ){
          this.props.navigation.replace( 'Login' )
        } else {
          const processedLink = await processDeepLink( this.url )
          this.props.navigation.replace( 'Login', {
            trustedContactRequest: processedLink ? processedLink.trustedContactRequest: null,
            giftRequest: processedLink ? processedLink.giftRequest: null,
            swanRequest: processedLink ? processedLink.swanRequest: null,
          } )
        }

      } else {
        this.props.navigation.replace( 'PasscodeConfirm' )
      }

    } catch ( err ) {
      ( this.errorBottomSheet as any ).current.snapTo( 1 )
    }
  };

   setupElectrumClients = () => {
     const defaultNodes = config.NETWORK_TYPE === NetworkType.TESTNET
       ? predefinedTestnetNodes
       : predefinedMainnetNodes

     ElectrumClient.setActivePeer( defaultNodes, this.props.personalNodes )
     ElectrumClient.connect()

     // simultaneous instance for test account
     TestnetElectrumClient.setActivePeer( predefinedTestnetNodes, this.props.personalNodes )
     TestElectrumClient.connect()
   }

   render() {
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
           ref={this.errorBottomSheet as any}
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
                 ( this.errorBottomSheet as any ).current.snapTo( 0 )
               }}
               onPressIgnore={() => {
                 ( this.errorBottomSheet as any ).current.snapTo( 0 )
               }}
               isBottomImage={true}
               bottomImage={require( '../assets/images/icons/errorImage.png' )}
             />
           )}
           renderHeader={() => (
             <ModalHeader
               onPressHeader={() => {
                 ( this.errorBottomSheet as any ).current.snapTo( 0 )
               }}
             />
           )}
         />
       </View>
     )
   }
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
