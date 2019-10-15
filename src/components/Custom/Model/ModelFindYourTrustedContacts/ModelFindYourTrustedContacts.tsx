import React, { Component } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Button, Icon, Text } from "native-base";

import { FullLinearGradientButton } from "hexaCustomeLinearGradientButton";
import { SvgIcon } from "@up-shared/components";

//TODO: Custome StyleSheet Files       
import FontFamily from "hexaStyles";

export default class ModelFindYourTrustedContacts extends Component {
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
                        <View style={ { flexDirection: "row", flex: 0.6 } }>
                            <Text style={ [ FontFamily.ffFiraSansMedium, {
                                fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10,
                                marginLeft: 20, marginRight: 20
                            } ] }>Find your trusted contacts</Text>
                            <Button light iconLeft style={ { width: 40, height: 40, borderRadius: 20 } } onPress={ () => this.props.closeModal() }>
                                <Icon name='close' style={ { alignSelf: "center" } } />
                            </Button>
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                            <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center" } ] }>Hexa requires access to phone contacts to split and share information about your wallet backup with contacts you choose to trust</Text>
                            <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center", marginLeft: 40, marginRight: 40, marginTop: 20 } ] }>allow hexa to access your phone contacts</Text>
                        </View>
                        <View
                            style={ {
                                flex: 2,
                                justifyContent: "center",
                                alignItems: "center"
                            } }
                        >
                            <SvgIcon name="icon_contacts" size={ 40 } color="#006EB1" />
                        </View>

                        <View style={ { flex: 0.5, alignItems: "center", justifyContent: "flex-end" } }>
                            <Text note style={ [ FontFamily.ffFiraSansMedium, { textAlign: "center" } ] }>Hexa does not store your contacts</Text>
                        </View>
                        <View style={ { flex: 1, justifyContent: "flex-end" } }>
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_Confirm() }
                                title="Connect Contacts"
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
        justifyContent: 'center',

    },
    viewModelBody: {
        flex: 0.6,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );