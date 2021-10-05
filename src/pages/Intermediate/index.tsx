import idx from 'idx'
import React, { Component } from 'react'
import { ImageBackground, View, StyleSheet, AppState, Platform, Linking } from 'react-native'
import { withNavigationFocus } from 'react-navigation'
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
      AppState.addEventListener( 'change', this.handleAppStateChange )
      Linking.addEventListener( 'url', this.handleDeepLinkEvent )
      Linking.getInitialURL().then( ( url )=> this.handleDeepLinkEvent( {
        url
      } ) )
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
          console.log( 'diff', diff, isHomePageOpen )
          if( isHomePageOpen ){
            if ( !this.url ){
              this.props.navigation.replace( 'Home', {
                screen: 'Home',
              } )
            } else {
              const requestName = await processDeepLink( this.url )
              this.props.navigation.replace( 'Home', {
                screen: 'Home',
                params: {
                  trustedContactRequest: requestName && requestName.trustedContactRequest ? requestName.trustedContactRequest : null,
                  swanRequest: requestName && requestName.swanRequest ? requestName.swanRequest : null,
                }
              } )
            }
          } else if ( !this.url ){
            this.props.navigation.replace( 'Login' )
          } else {
            const requestName = await processDeepLink( this.url )
            this.props.navigation.replace( 'Login', {
              trustedContactRequest: requestName && requestName.trustedContactRequest ? requestName.trustedContactRequest : null,
              swanRequest: requestName && requestName.swanRequest ? requestName.swanRequest : null,
            } )
          }

        } else {
          this.props.navigation.replace( 'PasscodeConfirm' )
        }

      } catch ( err ) {
        console.log( 'err', err )
      }
    };


    // handleLockCheck = () => {
    //   const interval = setInterval( () => {
    //     // check if it should be rendered
    //     const TIME_OUT = 15000
    //     const now: any = new Date()
    //     const diff = Math.abs( now - this.props.lastSeen )
    //     const { canLock } = this.state
    //     if ( diff > TIME_OUT ) {
    //       if ( canLock ) {
    //         this.setState( {
    //           canLock: false
    //         }, () => {
    //           this.props.navigation.push( 'ReLogin' )
    //           clearInterval( interval )
    //         } )
    //       }
    //     } else {
    //       this.props.navigation.pop()
    //       this.props.updateLastSeen()
    //     }
    //   }, 3000 )
    // }


    // handleAppStateChange = async ( nextAppState ) => {
    //   const TIME_OUT = 15000
    //   if ( ( Platform.OS === 'ios' && nextAppState === 'active' ) || ( Platform.OS === 'android' && nextAppState === 'background' ) ) {
    //     const now: any = new Date()
    //     const diff = Math.abs( now - this.props.lastSeen )
    //     const { canLock } = this.state
    //     if ( diff > TIME_OUT ) {
    //       if ( canLock ) {
    //         this.setState( {
    //           canLock: false
    //         }, () => this.props.navigation.push( 'ReLogin' ) )
    //       }
    //     } else {
    //       this.props.navigation.pop()
    //       this.props.updateLastSeen( new Date() )
    //     }
    //   }
    // };


    componentWillUnmount() {
      // AppState.removeEventListener( 'change', this.handleAppStateChange )
    }


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
} )( withNavigationFocus( Intermediate ) )
