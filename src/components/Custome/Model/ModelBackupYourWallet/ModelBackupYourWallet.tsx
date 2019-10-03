import React, { Component } from 'react';
import { Modal, View, StyleSheet, Platform, Image } from 'react-native';
import { Button, Icon, Text } from "native-base";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome Object
import {
    images
} from "HexaWallet/src/app/constants/Constants";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manage/Global/StyleSheet/Style";

interface Props {
    click_UseOtherMethod: Function;
    closeModal: Function;
    click_Confirm: Function
}

export default class ModelBackupYourWallet extends Component<Props, any> {
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
                        <View style={ { flexDirection: "row", flex: 0.4 } }>
                            <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10 } ] }>Backup your Wallet</Text>
                            <Button light iconLeft style={ { width: 40, height: 40, borderRadius: 20 } } onPress={ () => this.props.closeModal() }>
                                <Icon name='close' style={ { alignSelf: "center" } } />
                            </Button>
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", margin: 15 } ] }>it's highly recommended to backup your wallet, to restore funds in case of device loss</Text>
                            <Image style={ styles.imgAppLogo } source={ images.RestoreWalletUsingMnemonic.walletrestored } />
                        </View>
                        <View style={ { flex: 1, justifyContent: "flex-end" } }>
                            <Button
                                onPress={ () => this.props.click_UseOtherMethod() }
                                style={ [ globalStyle.ffFiraSansSemiBold, {
                                    backgroundColor: "#838383", borderRadius: 10, margin: 5,
                                    height: 50,
                                } ] }
                                full>
                                <Text>Use other methods</Text>
                            </Button>
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_Confirm() }
                                title="Backup via trusted source"
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
    imgAppLogo: {
        width: 150,
        height: 170
    },
    viewModelBody: {
        flex: Platform.OS == "ios" ? 0.8 : 0.9,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );