import React, { Component } from "react";
import { StyleSheet, Text, TouchableOpacity, Animated, ImageBackground, Easing } from "react-native";
import { AnimatedCircularProgress } from 'react-native-circular-progress';


import {
    colors,
    images,
    localDB,
    errorMessage
} from "HexaWallet/src/app/constants/Constants";
export default class ViewShieldIcons extends Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            progressFill: ""
        } )
    }

    componentDidMount() {
        let { progressFill } = this.state;
        this.circularProgress.animate( progressFill, 1500, Easing.quad );
    }

    componentWillReceiveProps( nextProps: any ) {
        console.log( { nextProps } );
        let data = nextProps.data;
        if ( data.length != 0 ) {
            this.setState( {
                progressFill: data[ 0 ].progressFill
            } );
        }
    }

    render = ( { children } = this.props ) => {
        let { progressFill } = this.state;
        return (
            <TouchableOpacity onPress={ () => this.props.click_Image()
            }>
                <ImageBackground source={ images.walletScreen[ this.props.data.length != 0 ? this.props.data[ 0 ].image : images.walletScreen.shield ] }
                    style={ [
                        {
                            height: this.props.data.length != 0 ? this.props.data[ 0 ].imageHeight : 100,
                            width: this.props.data.length != 0 ? this.props.data[ 0 ].imageWidth : 100,
                        }, {
                            alignItems: "center",
                            justifyContent: "center"
                        }
                    ] }
                >
                    <AnimatedCircularProgress
                        ref={ ( ref ) => this.circularProgress = ref }
                        size={ 50 }
                        width={ 2 }
                        fill={ progressFill }
                        tintColor="#ffffff"
                        onAnimationComplete={ () => console.log( 'onAnimationComplete' ) }
                        backgroundColor="gray"
                    >
                        {
                            ( fill: any ) => (
                                <Text style={ { color: "#ffffff", fontSize: 10, textAlign: "center" } }>
                                    { progressFill }%
                    </Text>
                            )
                        }
                    </AnimatedCircularProgress>
                </ImageBackground>
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
