import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Image } from 'react-native';
import { Button, Icon, Text, Textarea, Form } from "native-base";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import { SvgIcon } from "@up-shared/components";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    images
} from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );

interface Props {
    data: [];
    closeModal: Function;
    click_Confirm: Function;
    click_RestoreSecureAccount: Function;
    click_Skip: Function;
}

export default class ModelRestoreWalletSuccessfullyUsingTrustedContact extends Component<Props, any> {

    constructor ( props: any ) {
        super( props );
        this.state = ( {
            walletName: null,
            flag_DisableBtnNext: true
        } )
    }

    //TODO: Wallet Name
    ckeckWalletName( val: string ) {
        if ( val.length >= 6 ) {
            this.setState( {
                flag_DisableBtnNext: false
            } )
        } else {
            this.setState( {
                flag_DisableBtnNext: true
            } )
        }
    }

    render() {
        let data = this.props.data.length != 0 ? this.props.data : [];
        return (
            <Modal
                transparent
                animationType="fade"
                visible={ data.length != 0 ? data[ 0 ].modalVisible : false }
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
                            <Text style={ [ globalStyle.ffFiraSansMedium, {
                                fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10,
                                marginLeft: 20, marginRight: 20
                            } ] }>Wallet Successfully Restored</Text>
                        </View>
                        <View style={ { flex: 2, alignItems: "center", justifyContent: "flex-start" } }>
                            <Image style={ styles.imgAppLogo } source={ images.RestoreWalletUsingMnemonic.walletrestored } />
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-end" } }>
                            <Text note style={ [ styles.txtNotes, { textAlign: "center" } ] }>Congratulations! Your wallet is successfully restored</Text>
                            <Text note>{ data.length != 0 ? data[ 0 ].walletName : "Hexa Wallet" }</Text>
                            <View style={ { flexDirection: "row", justifyContent: "center", alignItems: "center", margin: 10 } }>
                                <Text note style={ { fontSize: 16 } }>Daily Account: </Text>
                                <SvgIcon name="icon_bitcoin" color="#D0D0D0" size={ 20 } />
                                <Text style={ [ globalStyle.ffOpenSansBold, { fontSize: 20 } ] }>
                                    { data.length != 0 ? " " + data[ 0 ].balR : 0 }
                                </Text>
                            </View>
                            <View style={ { flexDirection: "row", justifyContent: "center", alignItems: "center", } }>
                                <Text note style={ { fontSize: 16 } }>Secure Account: </Text>
                                <SvgIcon name="icon_bitcoin" color="#D0D0D0" size={ 20 } />
                                <Text style={ [ globalStyle.ffOpenSansBold, { fontSize: 20 } ] }>
                                    { data.length != 0 ? " " + data[ 0 ].balS : 0 }
                                </Text>
                            </View>
                            <Text note style={ [ styles.txtNotes, { textAlign: "center" } ] }></Text>
                        </View>
                        <View style={ { flex: 0.4, justifyContent: "flex-end" } }>
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_Skip() }
                                title="Go to Wallet"
                                disabled={ false }
                                style={ [ { opacity: 1 }, { borderRadius: 10 } ] }
                            />
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
    imgAppLogo: {
        width: 150,
        height: 170
    },
    txtNotes: {
        margin: 20
    },
    viewModelBody: {
        flex: utils.getIphoneSize() == "iphone X" ? 0.7 : 0.9,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );