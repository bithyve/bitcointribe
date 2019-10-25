import React, { Component } from "react";
import {
    StatusBar as StBar
} from "react-native";


export default class StatusBar extends Component<any, any> {
    constructor ( props: any ) {
        super( props );
    }
    render() {
        return (
            <StBar
                barStyle={ this.props.barStyle }
                backgroundColor={ this.props.backgroundColor }
                translucent={ true }
                hidden={ this.props.hidden }
            />
        );
    }
}
