import React, { Component } from 'react';
import { TouchableHighlight, View, Alert, StyleSheet, TextInput } from 'react-native';
import { Button, Icon, Text, Textarea, Form } from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Modal from 'react-native-modalbox';
import ImageSVG from 'react-native-remote-svg';

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
    localDB,
    svgIcon
} from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );

interface Props {
    data: [];
    closeModal: Function;
    click_Done: Function;
    click_Option1: Function;
    click_Option2: Function;
    pop: Function;
}

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: Common Funciton
var comAppHealth = require( "HexaWallet/src/app/manager/CommonFunction/CommonAppHealth" );

//Bitcoin Files
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import SecureAccount from "HexaWallet/src/bitcoin/services/accounts/SecureAccount";


export default class ModelBottomTwoButtons extends Component<Props, any> {


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
            <Modal style={ [ styles.modal, styles.modal4 ] } position={ "bottom" } isOpen={ data.modalVisible != undefined ? data.modalVisible : false } onClosed={ () => this.click_Clsoe() }>
                <View>
                    <View style={ { flexDirection: 'column', alignItems: "center", marginTop: 10, paddingBottom: 10, borderBottomColor: "#EFEFEF", borderBottomWidth: 1 } }>
                        <Text style={ { fontSize: 16 } }>{ data.title }</Text>
                        <Text note style={ { fontSize: 14 } }>{ data.subTitle }</Text>
                    </View>
                    <View>
                        <View style={ { flexDirection: "row", backgroundColor: colors.appColor, height: 80, margin: 20, borderRadius: 10 } }>
                            <Button
                                transparent
                                style={ { flex: 1, justifyContent: "center", alignSelf: "center", marginBottom: -10 } }
                                onPress={ () => this.props.click_Option1() }>
                                <View style={ { alignSelf: "center", justifyContent: "center", alignItems: "center" } }>
                                    <ImageSVG
                                        style={ { width: 40, height: 40 } }
                                        source={
                                            svgIcon.bottomModel[ data.svgIcon1 ]
                                        }
                                    />
                                    <Text style={ [ globalStyle.ffFiraSansBold, { fontSize: 12, color: "#ffffff" } ] }>{ data.btnTitle1 }</Text>
                                </View>
                            </Button>
                            <View
                                style={ {
                                    flex: 0.02,
                                    height: 50,
                                    width: 1,
                                    alignSelf: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#ffffff"
                                } }
                            />
                            <Button
                                transparent
                                style={ { flex: 1, justifyContent: 'center', alignSelf: "center", marginBottom: -10 } }
                                onPress={ () => this.props.click_Option2() }>
                                <View style={ { alignSelf: "center", justifyContent: "center", alignItems: "center" } }>
                                    <ImageSVG
                                        style={ { width: 45, height: 45 } }
                                        source={
                                            svgIcon.bottomModel[ data.svgIcon2 ]
                                        }
                                    />
                                    <Text style={ [ globalStyle.ffFiraSansBold, { fontSize: 12, color: "#ffffff" } ] }>{ data.btnTitle2 }</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal >
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