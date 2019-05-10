import React, { Component } from "react";
import {
    StyleSheet,
    View,
    AsyncStorage,
    Platform,
    Dimensions,
    Image,
    Keyboard,
    StatusBar,
    Linking,
    Alert,
    ImageBackground,
    SafeAreaView,
    FlatList,
    TouchableOpacity
} from "react-native";
import { RkCard } from "react-native-ui-kitten";
import { Container, Header, Content, List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
import { StackActions, NavigationActions } from "react-navigation";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import Permissions from 'react-native-permissions'
import { SvgIcon } from "@up-shared/components";


import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome Object
import {
    colors,
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
import utils from "HexaWallet/src/app/constants/Utils";
import Singleton from "HexaWallet/src/app/constants/Singleton";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";

//localization
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

export default class RestoreAndReoverWalletScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
        };
    }

    async componentDidMount() {
        const resultWallet = await dbOpration.readTablesData(
            localDB.tableName.tblWallet
        );
        console.log( { resultWallet } );

        await utils.setWalletDetails( resultWallet.temp[ 0 ] );
    }

    //TODO: func click on list card item
    click_Card( item: any ) {
        if ( item == "Set up as a New Wallet" ) {
            this.props.navigation.push( "WalletSetupScreens" );
        } else if ( "Restore Wallet Using mnemonic" ) {
            this.props.navigation.push( "RestoreWalletUsingMnemonicNavigator" )
        } else {
            Alert.alert( "Working." );
        }
    }

    render() {
        return (
            <View style={ styles.container }>
                <SafeAreaView style={ styles.container }>
                    <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={ true }
                            keyboardOpeningTime={ 0 }
                            enableOnAndroid={ true }
                            contentContainerStyle={ { flexGrow: 1 } }
                        >
                            <View style={ styles.viewSetupWallet }>
                                <Text style={ [ globalStyle.ffFiraSansBold, { color: "#ffffff", marginTop: 50, fontSize: 26, textAlign: "center" } ] }>Setup Wallet</Text>
                                <TouchableOpacity
                                    onPress={ () => this.click_Card( "Set up as a New Wallet" ) }
                                >
                                    <RkCard
                                        rkType="shadowed"
                                        style={ {
                                            flex: 0.1,
                                            borderRadius: 8,
                                            marginTop: 40
                                        } }
                                    >
                                        <View
                                            rkCardHeader
                                            style={ {
                                                flex: 1,
                                            } }
                                        >
                                            <Text
                                                style={ [ globalStyle.ffFiraSansMedium ] }
                                            >
                                                Set up as a New Wallet
                                            </Text>
                                            <SvgIcon
                                                name="icon_forword"
                                                color="#BABABA"
                                                size={ 20 }
                                            />
                                        </View>
                                    </RkCard>
                                </TouchableOpacity>
                            </View>
                            <View style={ styles.viewAppLogo }>
                                <Image style={ styles.imgAppLogo } source={ images.RestoreRecoverScreen.restore } />
                                <Text
                                    style={ [ globalStyle.ffFiraSansBold, { color: "#ffffff", marginTop: 20, fontSize: 26 } ] }
                                >
                                    Restore & Reover
                               </Text>
                            </View>
                            <View style={ { flex: 1, margin: 10 } }>
                                <FlatList
                                    data={ [ "Restore Wallet Using Trusted Contacts", "Restore Wallet Using mnemonic" ] }
                                    showsVerticalScrollIndicator={ false }
                                    renderItem={ ( { item } ) => (
                                        <TouchableOpacity
                                            onPress={ () => this.click_Card( item ) }
                                        >
                                            <RkCard
                                                rkType="shadowed"
                                                style={ {
                                                    flex: 1,
                                                    borderRadius: 8,
                                                    marginBottom: 10
                                                } }
                                            >
                                                <View
                                                    rkCardHeader
                                                    style={ {
                                                        flex: 1,
                                                    } }
                                                >
                                                    <Text
                                                        style={ [ globalStyle.ffFiraSansMedium ] }
                                                    >
                                                        { item }
                                                    </Text>
                                                    <SvgIcon
                                                        name="icon_forword"
                                                        color="#BABABA"
                                                        size={ 20 }
                                                    />
                                                </View>
                                            </RkCard>
                                        </TouchableOpacity>
                                    ) }
                                    keyExtractor={ ( item, index ) => index }
                                />
                            </View>
                            <View style={ { flex: 3, alignItems: "center", margin: 20 } }>
                                <Text style={ [ styles.txtWhiteColor, globalStyle.ffFiraSansBold, { fontSize: 20 } ] }>What Does Restoring Do?</Text>
                                <Text style={ [ styles.txtWhiteColor, globalStyle.ffFiraSansRegular, { textAlign: "center", margin: 10 } ] }>Restore & recover funds in your Hexa or other Bitcoin Wallets</Text>
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
                </SafeAreaView>
            </View >
        );
    }
}

let styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#1F8BCD"
    },
    viewSetupWallet: {
        flex: 4,
        margin: 10
    },
    viewAppLogo: {
        marginTop: 20,
        flex: 1,
        alignItems: "center",
    },
    imgAppLogo: {
        height: 70,
        width: 70
    },
    txtWhiteColor: {
        color: "#ffffff"
    }

} );
