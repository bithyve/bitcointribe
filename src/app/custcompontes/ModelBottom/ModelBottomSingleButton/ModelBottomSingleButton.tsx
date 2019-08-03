import React, { Component } from 'react';
import { TouchableHighlight, View, Alert, StyleSheet, TextInput } from 'react-native';
import { Button, Icon, Text, Textarea, Form } from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Modal from 'react-native-modalbox';

import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import { SvgIcon } from "@up-shared/components";

//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//TODO: Custome Object
import {
    colors,
    localDB
} from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );


interface Props {
    data: [];
    closeModal: Function;
    click_Done: Function;
    pop: Function;
}


//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Common Funciton
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );

//Bitcoin Files
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import SecureAccount from "HexaWallet/src/bitcoin/services/accounts/SecureAccount";

export default class ModelBottomSingleButton extends Component<Props, any> {

    constructor ( props: any ) {
        super( props );
        this.state = ( {
            data: []
        } )
    }


    componentWillReceiveProps = ( nextProps: any ) => {
        let data = nextProps.data;
        console.log( { data } );
        if ( data != undefined ) {
            this.setState( {
                data: data[ 0 ]
            } )
        }
    }


    click_Clsoe = () => {
        this.setState( {
            data: []
        } )
    }


    render() {
        let { data } = this.state;
        return (
            <Modal style={ [ styles.modal, styles.modal4 ] } position={ "bottom" } isOpen={ data.modalVisible } onClosed={ () => this.click_Clsoe() }>
                <View>
                    <View style={ { flexDirection: 'column', alignItems: "center", marginTop: 10, marginBottom: 15, borderBottomColor: "#EFEFEF", borderBottomWidth: 1 } }>
                        <Text style={ { fontSize: 16 } }>{ data.title }</Text>
                        <Text note style={ { fontSize: 14 } }>{ data.subTitle }</Text>
                    </View>
                    <View style={ { alignItems: "center", } }>
                        <View style={ { flexDirection: "row", marginBottom: 10 } }>
                            <Button transparent style={ { alignItems: "center", flex: 1 } } onPress={ () => this.props.click_Done() }>
                                <View style={ { alignItems: "center", marginLeft: "20%", flexDirection: "column" } }>
                                    <SvgIcon
                                        name="chat"
                                        color="#37A0DA"
                                        size={ 35 }
                                    />
                                    <Text style={ { marginTop: 5, fontSize: 12, color: "#006EB1" } }>Via SMS</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create( {
    //botom model
    modal: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    modal4: {
        height: 180
    }
} );