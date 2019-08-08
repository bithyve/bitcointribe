import React from "react";
import { StyleSheet, ImageBackground, View, Platform, SafeAreaView } from "react-native";
import {
    Container,
    Header,
    Title,
    Content,
    Item,
    Input,
    Button,
    Left,
    Right,
    Body,
    Text
} from "native-base";
import { Icon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//NsNotification
import BackboneEvents from "backbone-events-standalone";
// global event bus
window.EventBus = BackboneEvents.mixin( {} );

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );

export default class WalletNameScreen extends React.Component<any, any> {

    constructor ( props: any ) {
        super( props )
        this.state = ( {
            walletName: null,
            flag_ProceedBtnDisable: true
        } );
    }

    //TODO: Wallet Name
    ckeckWalletName( val: string ) {
        if ( val.length >= 0 ) {
            this.setState( {
                flag_ProceedBtnDisable: false
            } )
        } else {
            this.setState( {
                flag_ProceedBtnDisable: true
            } )
        }
    }

    //TODO: func click_Proceed
    async click_Proceed() {
        let walletName = this.state.walletName;
        var n = walletName.includes( "Wallet" ) || walletName.includes( "wallet" );
        if ( !n ) {
            walletName = walletName + " Wallet";
        }
        let SetUpDetails = {};
        SetUpDetails.walletName = walletName;
        await utils.setSetupWallet( SetUpDetails );
        window.EventBus.trigger( "swipeScreen", "optional event info" );
    }


    render() {
        return (
            <View style={ styles.container }>
                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={ 40 }
                    contentContainerStyle={ { flexGrow: 1, } }
                >
                    <View style={ styles.viewPagination }>
                        <Text style={ [ globalStyle.ffFiraSansMedium, { fontSize: 22, textAlign: "center" } ] }>Give it a name</Text>
                        <Text note style={ [ globalStyle.ffFiraSansMedium, { marginTop: 20, textAlign: "center" } ] }>You can put anything here - a nick name, the name of your fav character, or anything random.</Text>
                    </View>
                    <View style={ styles.viewInputFiled }>
                        <Item rounded style={ styles.itemInputWalletName }>
                            <Input
                                keyboardType="default"
                                autoCapitalize='sentences'
                                placeholder='Enter a name for your wallet'
                                style={ [ globalStyle.ffFiraSansMedium ] }
                                placeholderTextColor="#B7B7B7"
                                onChangeText={ ( val ) => {
                                    this.setState( {
                                        walletName: val
                                    } )
                                    this.ckeckWalletName( val )
                                } }
                            />
                        </Item>
                    </View>
                    <View style={ styles.viewProcedBtn }>
                        <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center", marginLeft: 20, marginRight: 20, marginBottom: 20 } ] } numberOfLines={ 3 }>We don't store this information. This is so that your contacts can recognize the sender when they get a request or message from the hexa app.</Text>
                        <FullLinearGradientButton title="Proceed" disabled={ this.state.flag_ProceedBtnDisable } style={ [ this.state.flag_ProceedBtnDisable == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] } click_Done={ () => this.click_Proceed() } />
                    </View>
                </KeyboardAwareScrollView>
            </View>

        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    viewPagination: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30
    },
    viewInputFiled: {
        flex: 3,
        alignItems: "center",
        margin: 10
    },
    itemInputWalletName: {
        borderWidth: 0,
        borderRadius: 10,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'gray',
        shadowOpacity: 0.3,
        backgroundColor: '#FFFFFF'

    },
    viewProcedBtn: {
        flex: 2,
        justifyContent: "flex-end"
    }
} );
