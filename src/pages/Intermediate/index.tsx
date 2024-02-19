import idx from 'idx'
import React, { Component } from 'react'
import { ImageBackground, View, StyleSheet, AppState, Platform, Linking } from 'react-native'
import Loader from '../../components/loader'
import { connect } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  getMessages,
} from '../../store/actions/notifications'
import { processDeepLink } from '../../common/CommonFunctions'

interface IntermediatePropsTypes {
  navigation: any;
  lastSeen: any;
  databaseInitialized: Boolean;
  getMessages: any;
  walletId: any;
  walletExists: Boolean;
}

interface IntermediateStateTypes {
    isLocked: boolean,
    canLock: boolean
}


class Intermediate extends Component<IntermediatePropsTypes, IntermediateStateTypes> {
  url: any;
  constructor( props ) {
    super( props )
    this.state = {
      isLocked: false,
      canLock: true
    }
  }

    componentDidMount = () => {
      // this.appStateListener = AppState.addEventListener( 'change', this.handleAppStateChange )
      // Linking.addEventListener( 'url', this.handleDeepLinkEvent )
      // Linking.getInitialURL().then( ( url )=> this.handleDeepLinkEvent( {
      //   url
      // } ) )
      setTimeout( () => {
        this.postSplashScreenActions()
      }, 2 )

      // AppState.addEventListener( 'change', this.handleAppStateChange )
      // // this.handleLockCheck()
      // this.props.updateLastSeen()
    };

    handleAppStateChange = async ( nextAppState ) => {
      // no need to trigger login screen if accounts are not synced yet
      // which means user hasn't logged in yet
      if ( !this.props.walletExists ) return
    };

    handleDeepLinkEvent = async ( { url } ) => {
      this.handleDeepLinking( url )
    }

    handleDeepLinking = async ( url: string | null ) => {
      //console.log( 'Launch::handleDeepLinkEvent::URL: ', url )
      if ( url == null ) {
        return
      }
      this.url=url
    }

    postSplashScreenActions = async () => {
      try {
        console.log( 'walletId', this.props.walletId )
        if( this.props.walletId ){
          this.props.getMessages()
        }
        const url = await Linking.getInitialURL()
        //console.log( 'url', url )

        const hasCreds = await AsyncStorage.getItem( 'hasCreds' )

        // scenario based navigation
        if ( hasCreds ) {
          const now: any = new Date()
          const diff = Math.abs( now - this.props.lastSeen )
          const isHomePageOpen = Number( diff ) < Number( 20000 )
          if( !isHomePageOpen ){
            if ( !this.url ){
              this.props.navigation.replace( 'Login' )
            } else {
              const processedLink = await processDeepLink( this.url )
              this.props.navigation.replace( 'Login', {
                trustedContactRequest: processedLink ? processedLink.trustedContactRequest: null,
                giftRequest: processedLink ? processedLink.giftRequest: null,
                swanRequest: processedLink ? processedLink.swanRequest: null,
              } )
            }
          }
        } else {
          this.props.navigation.replace( 'PasscodeConfirm' )
        }
      } catch ( err ) {
        console.log( 'err', err )
      }
    };



    render() {
      return (
        <ImageBackground source={require( '../../assets/images/intermediate-bg.png' )} style={styles.wrapper}>
        </ImageBackground>
      )
    }
}




const styles = StyleSheet.create( {
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    resizeMode: 'contain'
  }
} )



const mapStateToProps = ( state ) => {
  return {
    databaseInitialized: idx( state, ( _ ) => _.storage.databaseInitialized ),
    lastSeen: idx( state, ( _ ) => _.preferences.lastSeen ),
    walletId: idx( state, ( _ ) => _.preferences.walletId ),
    walletExists: idx( state, ( _ ) => _.storage.walletExists )
  }
}

export default connect( mapStateToProps, {
  getMessages
} )( Intermediate )
