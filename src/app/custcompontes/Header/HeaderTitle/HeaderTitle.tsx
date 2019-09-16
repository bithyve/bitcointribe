import React, { Component } from "react";
import {
    Platform
} from "react-native";
import {
    Header,
    Title,
    Button,
    Left,
    Right,
    Body
} from "native-base";
import { SvgIcon } from "@up-shared/components";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manage/Global/StyleSheet/Style";



export default class HeaderTitle extends Component<any, any> {
    constructor ( props: any ) {
        super( props );
    }
    render() {
        return (
            <Header transparent>
                <Left style={ { flex: 0.8 } }>
                    <Button
                        transparent
                        onPress={ () => this.props.pop() }
                    >
                        <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 22 : 20 } color="#000000" />
                    </Button>
                </Left>
                <Body style={ { flex: 8 } }>
                    <Title style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 18, alignSelf: "flex-start" } ] }>{ this.props.title }</Title>
                </Body>
                <Right />
            </Header>
        );
    }
}
