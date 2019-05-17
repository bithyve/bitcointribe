import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet } from 'react-native';
import { Button, Icon, Text } from "native-base";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import { Avatar } from 'react-native-elements';


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

export default class ModelAcceptSecret extends Component {
    render() {
        let name = this.props.data.length != 0 ? this.props.data[ 0 ].name : "temp"
        return (
            <Modal
                transparent
                animationType={ 'none' }
                visible={ this.props.data.length != 0 ? this.props.data[ 0 ].modalVisible : false }
                onRequestClose={ () =>
                    this.props.closeModal()
                }
            >
                <View style={ [
                    styles.modalBackground,
                    { backgroundColor: `rgba(0,0,0,0.4)` }
                ] }>
                    <View style={ styles.viewModelBody }>
                        <View style={ { flexDirection: "row", flex: 0.5 } }>
                            <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 5, textAlign: "center", marginTop: 10 } ] }>{ name } has selected you as his trusted contact</Text>
                            <Button light iconLeft style={ { width: 40, height: 40, borderRadius: 20 } } onPress={ () => this.props.closeModal() }>
                                <Icon name='close' style={ { alignSelf: "center" } } />
                            </Button>
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", fontSize: 12, marginBottom: 20 } ] }>Some information about the importance secret keeping</Text>
                            <Avatar medium rounded title={ name.charAt( 0 ) } />
                            <Text style={ globalStyle.ffFiraSansMedium }>{ name }</Text>
                        </View>
                        <View style={ { flex: 1, justifyContent: "flex-end" } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", fontSize: 12 } ] }>You will need to open the Hexa application on your device once in two weeks to make sure the secret is still accessible</Text>
                            <Button
                                onPress={ () => this.props.click_RejectSecret() }
                                style={ [ globalStyle.ffFiraSansSemiBold, {
                                    backgroundColor: "#838383", borderRadius: 10, margin: 5,
                                    height: 50,
                                } ] }
                                full>
                                <Text>Reject Secret</Text>
                            </Button>
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_AcceptSecret() }
                                title="Accept Secret"
                                disabled={ false }
                                style={ [ { borderRadius: 10 } ] } />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        justifyContent: 'center'
    },
    viewModelBody: {
        flex: 0.7,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );