import React, { Component } from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

//TODO: Custome Compontes
import { CustomStatusBar } from 'hexaCustStatusBar';

//TODO: Custome Models
import {
    ModelRestoreWalletFirstQuestion,
    ModelRestoreWalletSuccessfullyUsingTrustedContact
} from 'hexaCustModel';

//TODO: Custome Object
import { colors, images } from 'hexaConstants';

//TODO: Common Funciton
var comFunDBRead = require('hexaCommonDBReadData');

export default class RestoreWalletUsingTrustedContactQueAndAnw extends Component {
    constructor(props: any) {
        super(props);
        this.state = {
            arr_WalletDetail: [],
            arr_SSSDetails: [],
            arr_ModelRestoreWalletFirstQuestion: [],
            arr_ModelRestoreWalletSecoundQuestion: [],
            arr_QuestionAndAnwserDetails: [],
            arr_ModelRestoreWalletSuccessfullyUsingTrustedContact: [],
            flag_Loading: false
        };
    }

    async componentDidMount() {
        let arr_WalletDetail = await comFunDBRead.readTblWallet();
        let arr_SSSDetails = await comFunDBRead.readTblSSSDetails();
        console.log({ arr_WalletDetail });
        this.setState({
            arr_WalletDetail,
            arr_SSSDetails,
            arr_ModelRestoreWalletFirstQuestion: [
                {
                    modalVisible: true
                }
            ]
        });
    }

    //TODO: Secound question click Next
    click_Next = async (data: any) => {
        this.setState({
            arr_ModelRestoreWalletFirstQuestion: [
                {
                    modalVisible: false
                }
            ],
            arr_ModelRestoreWalletSuccessfullyUsingTrustedContact: [
                {
                    modalVisible: true,
                    walletName: data.walletName,
                    balR: data.balR,
                    balS: data.balS
                }
            ]
        });
    };

    //TODO: Success Wallet Setup then skip button on click
    click_Skip() {
        const resetAction = StackActions.reset({
            index: 0, // <-- currect active route from actions array
            key: null,
            actions: [NavigationActions.navigate({ routeName: 'TabbarBottom' })]
        });
        this.props.navigation.dispatch(resetAction);
    }

    render() {
        //flag
        let { flag_Loading } = this.state;
        //array
        let {
            arr_QuestionList,
            arr_ModelRestoreWalletFirstQuestion,
            arr_ModelRestoreWalletSuccessfullyUsingTrustedContact
        } = this.state;
        return (
            <View style={styles.container}>
                <ImageBackground
                    source={
                        images.WalletSetupScreen.WalletScreen.backgoundImage
                    }
                    style={styles.container}
                >
                    <SafeAreaView
                        style={[
                            styles.container,
                            { backgroundColor: 'transparent' }
                        ]}
                    >
                        <KeyboardAwareScrollView
                            enableAutomaticScroll
                            automaticallyAdjustContentInsets={true}
                            keyboardOpeningTime={0}
                            enableOnAndroid={true}
                            contentContainerStyle={{ flexGrow: 1 }}
                        >
                            <ModelRestoreWalletFirstQuestion
                                data={arr_ModelRestoreWalletFirstQuestion}
                                click_Next={(data: any) => {
                                    this.click_Next(data);
                                }}
                                pop={() => {
                                    this.setState({
                                        arr_ModelRestoreWalletFirstQuestion: [
                                            {
                                                modalVisible: false
                                            }
                                        ]
                                    });
                                    this.props.navigation.pop();
                                }}
                            />
                            <ModelRestoreWalletSuccessfullyUsingTrustedContact
                                data={
                                    arr_ModelRestoreWalletSuccessfullyUsingTrustedContact
                                }
                                click_Skip={() => {
                                    this.click_Skip();
                                }}
                            />
                        </KeyboardAwareScrollView>
                    </SafeAreaView>
                </ImageBackground>
                <CustomStatusBar
                    backgroundColor={colors.white}
                    hidden={false}
                    barStyle="dark-content"
                />
            </View>
        );
    }
}

let styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F8BCD'
    },
    viewSetupWallet: {
        flex: 4,
        margin: 10
    },
    viewAppLogo: {
        marginTop: 20,
        flex: 1,
        alignItems: 'center'
    },
    imgAppLogo: {
        height: 70,
        width: 70
    },
    txtWhiteColor: {
        color: '#ffffff'
    }
});
