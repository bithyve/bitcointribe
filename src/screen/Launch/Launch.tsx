import React, { Component } from "react";
import {
  View,
  AsyncStorage,
  StyleSheet,
  ImageBackground,
  Animated,
  Easing
} from "react-native";

import { colors, images, asyncStorageKeys } from "hexaConstants";
import Singleton from "HexaWallet/src/app/constants/Singleton";


//TODO: Custome Object
import { StatusBar } from "hexaComponent/StatusBar";



import * as Keychain from "react-native-keychain";

interface Props {
  onComplited: Function;
}


export default class Launch extends Component<Props, any> {
  constructor ( props: any ) {
    super( props );
    this.state = ( {
      centerLogo: null,
      centerLogoOpticy: new Animated.Value( 0 )
    } )
  }

  async componentDidMount() {
    let commonData = Singleton.getInstance();
    let value = await AsyncStorage.getItem( asyncStorageKeys.flag_PasscodeCreate );
    let rootViewController = await AsyncStorage.getItem( asyncStorageKeys.rootViewController );
    console.log( { value, rootViewController } );
    let status = JSON.parse( value );
    const credentials = await Keychain.getGenericPassword();
    commonData.setPasscode( credentials.password );
    setTimeout( () => {
      if ( rootViewController == "PasscodeConfirm" ) {
        this.props.onComplited( false, rootViewController );
      }
      else if ( status ) {
        this.props.onComplited( false, "Passcode" );
      }
      else {
        this.props.onComplited( false, "OnBoardingNavigator" );
      }
    }, 3000 );

    Animated.timing( this.state.centerLogoOpticy, {
      toValue: 1,
      duration: 100,
      easing: Easing.bounce
    } ).start();

    setTimeout( () => {
      this.setState( { centerLogo: images.LaunchScreen.hexaBaseCard } )
    }, 1000 );
    setTimeout( () => {
      this.setState( { centerLogo: images.LaunchScreen.hexaLogo } )
    }, 2000 );
  }


  render() {
    const animatedOpcity = { opacity: this.state.centerLogoOpticy }
    return (
      <View style={ styles.container }>
        <ImageBackground
          source={ images.LaunchScreen.img1 }
          style={ styles.backgroundImage }
          imageStyle={ {
            resizeMode: "cover" // works only here!
          } }
        >
          <Animated.Image
            source={ this.state.centerLogo }
            style={ [ animatedOpcity, { height: 400, width: 400 } ] }
          />
        </ImageBackground>
        <StatusBar backgroundColor={ colors.white } hidden={ true } barStyle="dark-content" />
      </View>
    );
  }
}


const styles = StyleSheet.create( {
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
} );
