import React, { Component } from "react";
import {
    StyleSheet,
    View,
    ImageBackground,
    SafeAreaView
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
var converter = require( 'number-to-words' );


//TODO: Custome Compontes
import { CustomStatusBar } from "hexaCustStatusBar";

import {
    ModelConfirmMnemonic1of3, ModelConfirmMnemonic2of3,
    ModelConfirmMnemonic3of3, ModelWalletSuccessfullyBackedUp
} from "hexaCustModel";



//TODO: Custome Object
import {
    colors,
    images
} from "hexaConstants";
import utils from "hexaUtils";



//TODO: Common Funciton
var comFunDBRead = require( "hexaCommonDBReadData" );

export default class BackupWalletMnemonicConfirmMnemonic extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            arr_randomNo: [],
            arr_Mnemonic: [],
            arr_ModelConfirmMnemonic1of3: [],
            arr_ModelConfirmMnemonic2of3: [],
            arr_ModelConfirmMnemonic3of3: [],
            arr_ModelWalletSuccessfullyBackedUp: []
        };
    }
    async componentDidMount() {
        var resultWallet = await comFunDBRead.readTblWallet();
        let mnemonic = resultWallet.mnemonic;
        let arr_Mnemonic = mnemonic.split( ' ' );
        let arr_randomNo = utils.getRandomBetweenNumber( 1, arr_Mnemonic.length );
        //console.log( { arr_Mnemonic, arr_randomNo } );
        //console.log( arr_randomNo[ 0 ] - 1 );

        this.setState( {
            arr_randomNo,
            arr_Mnemonic,
            arr_ModelConfirmMnemonic1of3: [
                {
                    modalVisible: true,
                    number: converter.toOrdinal( arr_randomNo[ 0 ] ),
                    word: arr_Mnemonic[ arr_randomNo[ 0 ] - 1 ]
                }
            ]
        } )
    }

    render() {
        let arr_randomNo = this.state.arr_randomNo;
        let arr_Mnemonic = this.state.arr_Mnemonic;

        return (
            <View style={ styles.container }>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <KeyboardAwareScrollView
                        enableAutomaticScroll
                        automaticallyAdjustContentInsets={ true }
                        keyboardOpeningTime={ 0 }
                        enableOnAndroid={ true }
                        contentContainerStyle={ { flexGrow: 1 } }
                    >
                        <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
                            <ModelConfirmMnemonic1of3 data={ this.state.arr_ModelConfirmMnemonic1of3 } click_Next={ () => {
                                this.setState( {
                                    arr_ModelConfirmMnemonic1of3: [
                                        {
                                            modalVisible: false,
                                            number: converter.toOrdinal( arr_randomNo[ 0 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 0 ] - 1 ]
                                        }
                                    ],
                                    arr_ModelConfirmMnemonic2of3: [
                                        {
                                            modalVisible: true,
                                            number: converter.toOrdinal( arr_randomNo[ 1 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 1 ] - 1 ]
                                        }
                                    ]
                                } );
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelConfirmMnemonic1of3: [
                                            {
                                                modalVisible: false,
                                                number: converter.toOrdinal( arr_randomNo[ 0 ] ),
                                                word: arr_Mnemonic[ arr_randomNo[ 0 ] - 1 ]
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } }
                            />
                            <ModelConfirmMnemonic2of3 data={ this.state.arr_ModelConfirmMnemonic2of3 } click_Next={ () => {
                                this.setState( {
                                    arr_ModelConfirmMnemonic2of3: [
                                        {
                                            modalVisible: false,
                                            number: converter.toOrdinal( arr_randomNo[ 1 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 1 ] - 1 ]
                                        }
                                    ],
                                    arr_ModelConfirmMnemonic3of3: [
                                        {
                                            modalVisible: true,
                                            number: converter.toOrdinal( arr_randomNo[ 2 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 2 ] - 1 ]
                                        }
                                    ]
                                } );
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelConfirmMnemonic2of3: [
                                            {
                                                modalVisible: false,
                                                number: converter.toOrdinal( arr_randomNo[ 1 ] ),
                                                word: arr_Mnemonic[ arr_randomNo[ 1 ] - 1 ]
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } } />
                            <ModelConfirmMnemonic3of3 data={ this.state.arr_ModelConfirmMnemonic3of3 } click_Next={ () => {
                                this.setState( {
                                    arr_ModelConfirmMnemonic3of3: [
                                        {
                                            modalVisible: false,
                                            number: converter.toOrdinal( arr_randomNo[ 2 ] ),
                                            word: arr_Mnemonic[ arr_randomNo[ 2 ] - 1 ]
                                        }
                                    ],
                                    arr_ModelWalletSuccessfullyBackedUp: [
                                        {
                                            modalVisible: true,
                                        }
                                    ]
                                } );
                            } }
                                pop={ () => {
                                    this.setState( {
                                        arr_ModelConfirmMnemonic3of3: [
                                            {
                                                modalVisible: false,
                                                number: converter.toOrdinal( arr_randomNo[ 2 ] ),
                                                word: arr_Mnemonic[ arr_randomNo[ 2 ] - 1 ]
                                            }
                                        ]
                                    } );
                                    this.props.navigation.pop()
                                } } />
                            <ModelWalletSuccessfullyBackedUp data={ this.state.arr_ModelWalletSuccessfullyBackedUp } click_GoWallet={ () => {
                                this.setState( {
                                    arr_ModelWalletSuccessfullyBackedUp: [
                                        {
                                            modalVisible: false,
                                        }
                                    ]
                                } )
                                this.props.navigation.navigate( "TabbarBottom" );
                            } } />
                        </SafeAreaView>
                    </KeyboardAwareScrollView>
                </ImageBackground>
                <CustomStatusBar backgroundColor={ colors.appColor } hidden={ false } barStyle="light-content" />
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
