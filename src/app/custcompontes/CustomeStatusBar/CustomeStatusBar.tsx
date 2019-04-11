import React, { Component } from "react";
import {
    View,
    Platform,
    StatusBar
} from "react-native";
//TODO: Custome object
import {
    colors
} from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );


export default class CustomeStatusBar extends Component<any, any> {
    constructor ( props: any ) {
        super( props );
    }
    render() {
        return (
            <View
                style={ {
                    backgroundColor: this.props.backgroundColor,
                    height: Platform.OS === 'ios' && this.props.flagShowStatusBar == true ? utils.getStatusBarHeight() : 0,
                } }>
                <StatusBar
                    barStyle={ this.props.barStyle }
                    backgroundColor={ this.props.backgroundColor }
                    translucent={ true }
                />
            </View>
            // <View
            //     style={ {
            //         backgroundColor: this.props.backgroundColor,
            //         height: Platform.OS === 'ios' && this.props.flagShowStatusBar == true ? utils.getStatusBarHeight() : 0,
            //     } }>
            //     <StatusBar
            //         barStyle={ this.props.barStyle }
            //         backgroundColor={ this.props.backgroundColor }
            //         translucent={ true }
            //     />
            // </View>
        );
    }
}
