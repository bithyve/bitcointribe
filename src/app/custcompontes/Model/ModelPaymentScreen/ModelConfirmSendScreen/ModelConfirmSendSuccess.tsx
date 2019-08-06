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
    click_GoToDailyAccount: Function;
}

export default class ModelConfirmSendSuccess extends Component<Props, any> {
    constructor ( props: any ) {
        super( props )
        this.state = ( {
            details: []
        } )
    }

    componentWillReceiveProps = ( nextProps: any ) => {
        let data = nextProps.data;
        if ( data.length != 0 ) {
            this.setState( {
                details: data[ 0 ].data[ 0 ]
            } )
        }
    }

    render() {
        let data = this.props.data.length != 0 ? this.props.data : [];
        //array
        let { details } = this.state;
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
                        <View style={ { flexDirection: "row", flex: 0.6, margin: 20 } }>
                            <Text style={ [ globalStyle.ffFiraSansMedium, {
                                fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10,
                                marginLeft: 20, marginRight: 20
                            } ] }>Send Successful</Text>
                        </View>
                        <View style={ { flex: 3, alignItems: "center", justifyContent: "flex-start" } }>
                            <Image style={ styles.imgAppLogo } source={ images.RestoreWalletUsingMnemonic.walletrestored } />
                        </View>
                        <View style={ { flex: 1.2, alignItems: "center" } }>
                            <View style={ { flexDirection: "row", alignItems: "center", margin: 5 } }>
                                <SvgIcon
                                    name="icon_bitcoin"
                                    color="#D0D0D0"
                                    size={ 25 }
                                />
                                <Text style={ { fontSize: 22, marginLeft: 4, fontWeight: 'bold' } }>{ details != undefined ? details.amount : "" }</Text>
                            </View>
                            <View style={ { flexDirection: "row", alignItems: "center" } }>
                                <Text note style={ [ { fontSize: 12 } ] }>Transaction Fee</Text>
                                <SvgIcon
                                    name="icon_bitcoin"
                                    color="#D0D0D0"
                                    size={ 15 }
                                />
                                <Text note style={ { fontSize: 12, marginLeft: -0.01 } }>{ details != undefined ? details.tranFee : "" }</Text>

                            </View>
                        </View>
                        <View style={ { flex: 1, alignItems: "center" } }>
                            <Text note>Transferred Successfully to</Text>
                            <Text>{ details != undefined ? details.accountName : "" }</Text>
                        </View>
                        <View style={ { flex: 2, alignItems: "center" } }>
                            <Text note style={ { marginBottom: -15 } }>Wallet Transactions id</Text>
                            <Text style={ { textAlign: "center", marginLeft: 10, marginRight: 10 } }> { details != undefined ? details.txid : "" }</Text>
                            <Text note>{ details != undefined ? details.date : "" }</Text>
                        </View>
                        <View style={ { flex: 1, justifyContent: "flex-end" } }>
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_GoToDailyAccount() }
                                title="Go to Regular Account"
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
    viewModelBody: {
        flex: utils.getIphoneSize() == "iphone X" ? 0.7 : 0.9,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );