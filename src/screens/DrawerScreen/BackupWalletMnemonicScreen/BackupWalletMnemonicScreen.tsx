import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, AsyncStorage } from "react-native";
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
    Text,
    Tab, Tabs, ScrollableTab, Icon
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { StackActions, NavigationActions } from "react-navigation";

//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import ViewBackupWalletMnemonicScrolling from "HexaWallet/src/app/custcompontes/View/ViewBackupWalletMnemonicScrolling/ViewBackupWalletMnemonicScrolling";
import BackupWalletMnemonic6Screen from "./BackupWalletMnemonic6Screen";
import BackupWalletMnemonic7to12Screen from "./BackupWalletMnemonic7to12Screen";
import BackupWalletMnemonic13to18Screen from "./BackupWalletMnemonic13to18Screen";
import BackupWalletMnemonic19to24Screen from "./BackupWalletMnemonic19to24Screen";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";
//TODO: Custome Object  
import { colors, images, asyncStorageKeys } from "HexaWallet/src/app/constants/Constants";





//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

export default class BackupWalletMnemonicScreen extends React.Component<any, any> {

    constructor ( props: any ) {
        super( props );
        this.state = ( {
            arr_BackupWalletMnemonic6Screen: [],
            arr_BackupWalletMnemonic7to12Screen: [],
            arr_BackupWalletMnemonic13to18Screen: [],
            arr_BackupWalletMnemonic19to24Screen: []
        } )
    }

    async componentWillMount() {
        var resultWallet = await comFunDBRead.readTblWallet();
        let mnemonic = resultWallet.mnemonic;
        let arrMnemonic = mnemonic.split( ' ' );
        // let mnemonicLength = mnemonic.match( /\w+/g ).length;
        let words1to6 = [];
        let words7to12 = [];
        let words13to18 = [];
        let words19to24 = [];
        for ( let i = 0; i < arrMnemonic.length; i++ ) {
            let data = arrMnemonic[ i ];
            if ( i < 6 ) {
                words1to6.push( { index: i + 1, title: data } )
            } else if ( i >= 6 && i < 12 ) {
                words7to12.push( { index: i + 1, title: data } )
            } else if ( i >= 12 && i < 18 ) {
                words13to18.push( { index: i + 1, title: data } )
            } else {
                words19to24.push( { index: i + 1, title: data } )
            }
        }
        this.setState( {
            arr_BackupWalletMnemonic6Screen: words1to6,
            arr_BackupWalletMnemonic7to12Screen: words7to12,
            arr_BackupWalletMnemonic13to18Screen: words13to18,
            arr_BackupWalletMnemonic19to24Screen: words19to24
        } );
    }


    click_Next() {
        this.props.navigation.push( "BackupWalletMnemonicConfirmMnemonicScreen" );
    }

    render() {
        return (
            <Container>
                <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                <SafeAreaView style={ styles.container }>
                    <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                        <View style={ { marginLeft: 10 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0 } ] }>Backup Wallet Mnemonic</Text>
                            </Button>
                        </View>
                        <View style={ { flex: 1 } }>
                            <ViewBackupWalletMnemonicScrolling  >
                                {/* First screen */ }
                                <BackupWalletMnemonic6Screen data={ this.state.arr_BackupWalletMnemonic6Screen } />
                                {/* Second screen */ }
                                <BackupWalletMnemonic7to12Screen data={ this.state.arr_BackupWalletMnemonic7to12Screen } />
                                {/* Third screen */ }
                                <BackupWalletMnemonic13to18Screen data={ this.state.arr_BackupWalletMnemonic13to18Screen } />
                                {/* Fourth screen */ }
                                <BackupWalletMnemonic19to24Screen data={ this.state.arr_BackupWalletMnemonic19to24Screen } click_Next={ () => this.click_Next() } />
                            </ViewBackupWalletMnemonicScrolling>
                        </View>
                    </ImageBackground>
                </SafeAreaView>
            </Container >
        );
    }
}

const styles = StyleSheet.create( {
    container: {
        flex: 1,
        backgroundColor: "#F8F8F8",
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
