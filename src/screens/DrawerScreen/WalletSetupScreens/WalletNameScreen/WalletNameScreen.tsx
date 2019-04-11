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


//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";




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
        if ( val.length >= 6 ) {
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
    click_Proceed() {
        this.props.navigation.push( "FirstSecretQuestionScreen", {
            walletName: this.state.walletName,
            walletDetails: this.props.navigation.getParam( "walletDetails" )
        } )
    }

    render() {
        return (
            <View style={ styles.container }>
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <Icon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0, fontFamily: "FiraSans-Medium" } }>Set up your wallet</Text>
                            </Button>
                        </View>
                        <KeyboardAwareScrollView
                            enableOnAndroid
                            extraScrollHeight={ 40 }
                            contentContainerStyle={ { flexGrow: 1, } }
                        >
                            <View style={ styles.viewPagination }>
                                <Text style={ { fontWeight: "bold", fontFamily: "FiraSans-Medium", fontSize: 22, textAlign: "center" } }>Step 1: What do you want to call your Wallet?</Text>
                                <Text note style={ { marginTop: 20, textAlign: "center" } }>This name will display on you wallet.</Text>
                            </View>
                            <View style={ styles.viewInputFiled }>
                                <Item rounded style={ styles.itemInputWalletName }>
                                    <Input
                                        keyboardType="default"
                                        autoCapitalize='sentences'
                                        placeholder='Enter a name for your wallet'
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
                                <Text note style={ { textAlign: "center", marginLeft: 20, marginRight: 20, marginBottom: 20 } } numberOfLines={ 1 }>Lorem ipsum dolor sit amet, consectetur adipiscing </Text>
                                <FullLinearGradientButton title="Proceed" disabled={ this.state.flag_ProceedBtnDisable } style={ [ this.state.flag_ProceedBtnDisable == true ? { opacity: 0.4 } : { opacity: 1 }, { borderRadius: 10 } ] } click_Done={ () => this.click_Proceed() } />
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
            </View>

        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#FCFCFC",
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
