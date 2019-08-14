import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet, Image, Platform } from 'react-native';
import { Button, Icon, Text } from "native-base";

var Mailer = require( 'NativeModules' ).RNMail;
import Share from "react-native-share";


//TODO: Custome Compontes  
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import FullLinearGradientIconButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientIconButton";
import { SvgIcon } from "@up-shared/components";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";
//TODO: Custome Object
import {
    colors,
    images
} from "HexaWallet/src/app/constants/Constants";

var utils = require( "HexaWallet/src/app/constants/Utils" );
interface Props {
    data: [];
    pop: Function;
    closeModal: Function;
    click_Next: Function;
}

export default class ModelRestoreSecureAccount extends Component<Props, any> {

    constructor ( props: any ) {
        super( props )
        this.state = ( {
            flag_NextBtnDisable: true
        } )
    }

    render() {
        let flag_NextBtnDisable = this.state.flag_NextBtnDisable;
        return (
            <Modal
                transparent
                animationType={ 'fade' }
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
                        <View style={ { flexDirection: "row", flex: 0.2 } }>
                            <Button
                                transparent
                                hitSlop={{top: 5, bottom: 8, left: 10, right: 15}}
                                onPress={ () => this.props.pop() }
                            >
                                <SvgIcon name="icon_back" size={ 25 } color="gray" />
                            </Button>
                            <Text style={ [ globalStyle.ffFiraSansMedium, {
                                fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10,
                                marginLeft: 20, marginRight: 20
                            } ] }>Backup Secure Wallet</Text>

                        </View>
                        <View style={ { flex: Platform.OS == "ios" ? 1.8 : 1, alignItems: "center", justifyContent: "flex-start" } }>
                            <Text note style={ { textAlign: "center", margin: 20 } }>To restore your secure account you will have to follow these steps.</Text>
                            <Image
                                style={ { flex: 1, width: "100%", height: "100%" } }
                                resizeMode="contain"
                                source={ images.retoreSeecureAccount.steps }
                            />
                        </View>
                        <View style={ { flex: 0.4, justifyContent: "flex-end" } }>
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_Next() }
                                title="Continue Restore"
                                disabled={ false }
                                style={ [ { opacity: 1 }, { borderRadius: 10 } ] } />
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
        flex: utils.getIphoneSize() == "iphone X" ? 0.9 : 1,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );