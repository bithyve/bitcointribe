import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet } from 'react-native';
import { Button, Icon, Text } from "native-base";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
export default class ModelBackupYourWallet extends Component {
    render() {
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
                        <View style={ { flexDirection: "row", flex: 0.8 } }>
                            <Text style={ { fontWeight: "bold", fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10 } }>Backup your Wallet</Text>
                            <Button light iconLeft style={ { width: 40, height: 40, borderRadius: 20 } } onPress={ () => this.props.closeModal() }>
                                <Icon name='close' style={ { alignSelf: "center" } } />
                            </Button>
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                            <Text note style={ { textAlign: "center" } }>Some information comes here, that explains the user why they need to select trusted contacts</Text>
                        </View>
                        <View style={ { flex: 1, justifyContent: "flex-end" } }>
                            <Button
                                onPress={ () => this.props.click_UseOtherMethod() }
                                style={ {
                                    backgroundColor: "#838383", borderRadius: 10, margin: 5,
                                    height: 50,
                                } }
                                full>
                                <Text>Use other methods</Text>
                            </Button>
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_Confirm() }
                                title="Back up via Trusted Contacts"
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
        flex: 0.6,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );