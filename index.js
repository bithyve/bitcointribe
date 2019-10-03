/** @format */
import React from "react";
import { createAppContainer } from "react-navigation";
import { AsyncStorage, AppState, AppRegistry, Linking, StatusBar, Alert, SafeAreaView, StyleSheet } from "react-native";
import DeepLinking from "react-native-deep-linking";
import "HexaWallet/shim";
import { name as appName } from "HexaWallet/app.json";

import { createRootNavigator } from "hexaRouter";
import { Launch } from "hexaCompLanch";


//TODO: Redux
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import allReducers from './src/redux/reducers';
const store = createStore( allReducers );


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


    componentDidMount ()
    {
        try
        {
            Linking.getInitialURL()
                .then( ( url ) =>
                {
                    if ( url )
                    {
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
                ( response: any ) =>
                {
                    console.log( {
                        response
                    } );
                    var pageName;
                    var type;
                    console.log( { response } );
                    if ( response.pageName === "bk" )
                    {
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



    appWokeUp = ( event: any ) =>
    {
        console.log( { url: event.url } );
        this.setState( {
            status: true
        } );
        utils.setDeepLinkingType( "" );
        utils.setDeepLinkingUrl( "" );
        this.resetStackToProperRoute( event.url )
    }

    resetStackToProperRoute = ( url: any ) =>
    {
        console.log( { resetStackToProperRoute: url } );
        DeepLinking.evaluateUrl( url );
    }


    componentWillUnmount ()
    {
        try
        {
            Linking.removeEventListener( 'url', this.appWokeUp );
        } catch ( e )
        {
            console.log( {
                e
            } );
        }
    }
    onComplited ( status: boolean, pageName: string )
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



    render ()
    {
        let { status, isStartPage } = this.state;
        const Layout = createRootNavigator(
            status,
            isStartPage
        );
        console.log( "first = " + status, isStartPage );
        const AppContainer = createAppContainer( Layout );
        return (
            <Provider store={ store }>
                { status ?
                    <Launch
                        onComplited={ ( status: boolean, pageName: string ) =>
                            this.onComplited( status, pageName )
                        }
                    />
                    :
                    <AppContainer
                    />
                }
            </Provider>
        )
    }
}

console.disableYellowBox = true;
AppRegistry.registerComponent( appName, () => HexaWallet );
