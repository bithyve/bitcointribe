import React, { Component } from 'react';
import { Modal, View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text } from "native-base";

import { FullLinearGradientButton } from "hexaComponent/LinearGradient/Buttons";



//TODO: Custome StyleSheet Files       
import FontFamily from "hexaComponent/Styles/FontFamily";

//TODO: Custome Object
import {
    images
} from "hexaConstants";
var utils = require( "hexaUtils" );

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
        if ( val.length >= 3 ) {
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
                            <Text style={ [ FontFamily.ffFiraSansMedium, {
                                fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10,
                                marginLeft: 20, marginRight: 20
                            } ] }>Wallet Successfully Restored</Text>
                        </View>
                        <View style={ { flex: 2, alignItems: "center", justifyContent: "flex-start" } }>
                            <Image style={ styles.imgAppLogo } source={ images.RestoreWalletUsingTrustedContact.successImage } />
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-end" } }>
                            <Text note style={ [ styles.txtNotes, { textAlign: "center" } ] }>Congratulations! Your wallet is successfully restored</Text>
                            <Text note>{ data.length != 0 ? data[ 0 ].walletName : "Hexa Wallet" }</Text>
                            <Text note style={ [ styles.txtNotes, { textAlign: "center" } ] }>Restore your secure account now You can opt to do it later</Text>
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
        width: Dimensions.get( 'screen' ).width - 80,
        height: 250
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