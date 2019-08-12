/** @format */
import React from "react";
import { createAppContainer } from "react-navigation";
import { AsyncStorage, AppState, AppRegistry, Linking, StatusBar, Alert, SafeAreaView, StyleSheet } from "react-native";
import DeepLinking from "react-native-deep-linking";
import "HexaWallet/shim";
import { name as appName } from "HexaWallet/app.json";
import { createRootNavigator } from "HexaWallet/src/app/router/router";
import LaunchScreen from "HexaWallet/src/screens/LaunchScreen/LaunchScreen";


//TODO: Redux
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import allReducers from './src/redux/reducers';
const store = createStore( allReducers );


import { asyncStorageKeys } from "HexaWallet/src/app/constants/Constants";

//TODO: Custome Object
var utils = require( "HexaWallet/src/app/constants/Utils" );
export default class HexaWallet extends React.Component
{
  constructor ( props )
  {
    super( props );
    this.state = {
      status: true,
      isStartPage: "OnBoardingNavigator",
      appState: AppState.currentState
    };
    StatusBar.setBarStyle( 'light-content', true );
  }


  async componentDidMount ()    
  {
    try   
    {
      // AppState.addEventListener( "change", this._handleAppStateChange );
      // AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );

      Linking.getInitialURL()
        .then( ( url ) =>
        {
          if ( url )
          {
            // Alert.alert('GET INIT URL','initial url  ' + url)
            this.resetStackToProperRoute( url )
          }
        } )
        .catch( ( e ) => { } )

      // This listener handles the case where the app is woken up from the Universal or Deep Linking
      Linking.addEventListener( 'url', this.appWokeUp );


      //TODO: Deep Linking
      DeepLinking.addScheme( "https://" );
      DeepLinking.addRoute(
        "/prime-sign-230407.appspot.com/sss/:pageName/:script",
        response =>
        {
          console.log( {
            response
          } );
          var pageName;
          var type;
          if ( response.pageName === "bk" )
          {
            console.log( 'nice' );

            pageName = "TabbarBottom";
            type = "SSS Recovery SMS/EMAIL";
          }
          else if ( response.pageName == "req" )  
          {
            pageName = "TrustedPartyShareSecretNavigator";
            type = "SSS Restore SMS/EMAIL";
          } else if ( response.pageName == "res" )   
          {
            pageName = "OTPScreenNavigator";
            type = "SSS Restore SMS/EMAIL";
          } else
          {
            Alert.alert( "Working" );
          }
          utils.setRootViewController( pageName );
          var script = response.script;
          script = script.split( "_+_" ).join( "/" );
          console.log( { script } );
          var decpScript = utils.decrypt( script, "122334" )
          decpScript = JSON.parse( decpScript );
          console.log( { decpScript } );
          utils.setDeepLinkingUrl( decpScript );
          utils.setDeepLinkingType( type );
        }
      );


    } catch ( error )
    {
      console.log( {
        error
      } );
    }
  }

  appWokeUp = ( event ) =>
  {
    // this handles the use case where the app is running in the background and is activated by the listener...
    Alert.alert( 'Linking Listener', 'url  ' + event.url );
    this.resetStackToProperRoute( event.url )
  }

  resetStackToProperRoute = ( url ) =>
  {
    DeepLinking.evaluateUrl( url );
  }


  componentWillUnmount ()
  {
    try
    {
      Linking.removeEventListener( 'url', this.appWokeUp );
      //  AppState.removeEventListener( "change", this._handleAppStateChange );
    } catch ( e )  
    {
      console.log( {
        e
      } );
    }
  }

  // _handleAppStateChange = async nextAppState =>
  // {
  //   try     
  //   {
  //     var status = JSON.parse(
  //       await AsyncStorage.getItem( asyncStorageKeys.flag_PasscodeCreate )
  //     );
  //     let flag_BackgoundApp = JSON.parse(
  //       await AsyncStorage.getItem( asyncStorageKeys.flag_BackgoundApp )
  //     );
  //     if ( status && flag_BackgoundApp )
  //     {
  //       this.setState( {
  //         appState: AppState.currentState
  //       } );
  //       if ( this.state.appState.match( /inactive|background/ ) )
  //       {
  //         console.log( {
  //           status
  //         } );
  //         this.setState( {
  //           status: true
  //         } );
  //         console.log(
  //           "forgound = " + this.state.status,
  //           this.state.isStartPage
  //         );
  //       }
  //     }
  //   } catch ( e )
  //   {
  //     console.log( {
  //       e
  //     } );
  //   }
  // };

  onComplited ( status, pageName )
  {
    try
    {
      this.setState( {
        status: status,
        isStartPage: pageName
      } );
    } catch ( e )
    {
      console.log( {
        e
      } );
    }
  }

  addFriend = ( index ) =>
  {
    // ...
  }

  render ()
  {
    const Layout = createRootNavigator(
      this.state.status,
      this.state.isStartPage
    );
    console.log( "first = " + this.state.status, this.state.isStartPage );
    const AppContainer = createAppContainer( Layout );
    return this.state.status ? (
      <Provider store={ store }>

        <LaunchScreen
          screenProps={ {
            currentFriends: this.state.currentFriends,
            possibleFriends: this.state.possibleFriends,
            addFriend: this.addFriend,
          } }
          onComplited={ ( status: boolean, pageName: string ) =>
            this.onComplited( status, pageName )
          }
        />

      </Provider>
    ) : (
        <Provider store={ store }>

          <AppContainer
            screenProps={ {
              currentFriends: this.state.currentFriends,
              possibleFriends: this.state.possibleFriends,
              addFriend: this.addFriend,
            } }
          />

        </Provider>
      );
  }
}

console.disableYellowBox = true;
AppRegistry.registerComponent( appName, () => HexaWallet );
