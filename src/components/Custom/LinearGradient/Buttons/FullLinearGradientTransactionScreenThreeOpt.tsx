import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import { SvgIcon } from "@up-shared/components";

//TODO: Custome StyleSheet Files       
import FontFamily from "hexaStyles";

interface Props {
    title: string,
    style: any,
    disabled: Boolean,
    click_Sent: Function;
    click_Transfer: Function;
    click_Recieve: Function;
}

export default class FullLinearGradientTransactionScreenThreeOpt extends Component<Props, any> {
    render = ( { children } = this.props ) => {
        return (
            <LinearGradient
                colors={ [ "#37A0DA", "#0071BC" ] }
                start={ { x: 0, y: 0 } }
                end={ { x: 1, y: 0 } }
                style={ [ styles.btnDone, this.props.style ] }
            >
                <View style={ { flexDirection: "row" } }>
                    <View style={ { flex: 1, flexDirection: "column", alignItems: "center" } }>
                        <Button
                            transparent
                            style={ { alignSelf: "center" } }
                            onPress={ () => this.props.click_Sent() }
                        >
                            <SvgIcon name="send" color="#ffffff" size={ 25 } />
                        </Button>
                        <Text style={ [ FontFamily.ffFiraSansRegular, { color: "#ffffff", marginTop: -10 } ] }>Send</Text>
                    </View>
                    <View style={ { flex: 1, flexDirection: "column", alignItems: "center" } }>
                        <Button
                            transparent
                            style={ { alignSelf: "center" } }
                            onPress={ () => this.props.click_Transfer() }
                        >
                            <SvgIcon name="transfer" color="#ffffff" size={ 25 } />
                        </Button>
                        <Text style={ [ FontFamily.ffFiraSansRegular, { color: "#ffffff", marginTop: -10 } ] }>Transfer</Text>
                    </View>
                    <View style={ { flex: 1, flexDirection: "column", alignItems: "center" } }>
                        <Button
                            transparent
                            style={ { alignSelf: "center" } }
                            onPress={ () => this.props.click_Recieve() }
                        >
                            <SvgIcon name="receive" color="#ffffff" size={ 25 } />
                        </Button>
                        <Text style={ [ FontFamily.ffFiraSansRegular, { color: "#ffffff", marginTop: -10 } ] }>Receive</Text>
                    </View>
                </View>
            </LinearGradient>
        );
    };
}

const styles = StyleSheet.create( {
    textWhite: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "FiraSans-SemiBold",
        alignSelf: "center",
    },
    btnDone: {
        margin: 5,
        height: 50,
        justifyContent: "center"
    }
} );
