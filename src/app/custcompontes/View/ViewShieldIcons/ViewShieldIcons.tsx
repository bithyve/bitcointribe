import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, Animated, ImageBackground, Easing } from "react-native";

import {
    colors,
    images,
    localDB,
    errorMessage
} from "HexaWallet/src/app/constants/Constants";
export default class ViewShieldIcons extends Component<any, any> {
    constructor ( props: any ) {
        super( props )
    }

    render = ( { children } = this.props ) => {
        return (
            <TouchableOpacity onPress={ () => this.props.click_Image()
            }>
                <Animated.Image
                    source={ images.walletScreen[ this.props.data.length != 0 ? this.props.data[ 0 ].image : images.walletScreen.shield ] }
                    style={ [
                        {
                            height: this.props.data.length != 0 ? this.props.data[ 0 ].imageHeight : 100,
                            width: this.props.data.length != 0 ? this.props.data[ 0 ].imageWidth : 100,
                        }
                    ] }
                />

            </TouchableOpacity>
        );
    };
}

const styles = StyleSheet.create( {
    textWhite: {
        color: "#FFFFFF",
        fontSize: 16,
        alignSelf: "center",
        fontWeight: "bold",
        fontFamily: "Avenir"
    }
} );
