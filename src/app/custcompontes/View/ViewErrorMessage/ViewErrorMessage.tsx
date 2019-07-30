import React, { Component } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import IconFontAwe from "react-native-vector-icons/FontAwesome";


import {
    colors,
    images,
    localDB,
    errorMessage
} from "HexaWallet/src/app/constants/Constants";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
export default class ViewErrorMessage extends Component<any, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            data: [],
            type: ""
        } )
    }

    componentWillReceiveProps = ( nextProps: any ) => {
        let data = nextProps.data;
        console.log( { data } );
        if ( data != undefined ) {
            this.setState( {
                data: data[ 0 ].data[ 0 ],
                type: data[ 0 ].type
            } )
        }

    }

    render = () => {
        //array 
        let { data, type } = this.state;
        return (
            <View>
                { renderIf( type == "offline" )(
                    <View style={ { backgroundColor: data.bgColor, flexDirection: "row", alignItems: "center", padding: 10 } }>
                        <Text style={ { textAlign: "center", flex: 1, color: data.color } }>{ data.message }</Text>
                        <IconFontAwe name="refresh" size={ 20 } color={ data.color } style={ { flex: 0.1 } } />
                    </View>
                ) }
                { renderIf( type == "asyncTask" )(
                    <View style={ { backgroundColor: data.bgColor, flexDirection: "row", alignItems: "center", padding: 10 } }>
                        <Text style={ { textAlign: "center", flex: 1, color: data.color } }>{ data.message }</Text>
                        <ActivityIndicator size="small" color={ data.color } />
                    </View>
                ) }
            </View>
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
