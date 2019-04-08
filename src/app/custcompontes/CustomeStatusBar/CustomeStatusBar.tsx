import React, { Component } from "react";
import {
    View,
    Platform,
    StatusBar
} from "react-native";


//TODO: Custome object
import {
    colors
} from "bithyve/src/app/constants/Constants";
var utils = require( "bithyve/src/app/constants/Utils" );


export default class CustomeStatusBar extends Component<any, any> {
    constructor ( props: any ) {
        super( props );
    }

    render() {
        return (
            <View
                style={ {
                    backgroundColor: colors.appColor,
                    height: Platform.OS === 'ios' ? utils.getStatusBarHeight() : StatusBar.currentHeight,
                } }>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor={ colors.appColor }
                    translucent={ false }
                />
            </View>
        );
    }
}
