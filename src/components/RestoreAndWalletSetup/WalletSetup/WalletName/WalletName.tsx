import React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Item, Input, Text } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
//NsNotification
import BackboneEvents from 'backbone-events-standalone';
// global event bus
window.EventBus = BackboneEvents.mixin({});

//TODO: Custome Pages
import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';

//TODO: Custome Validation
import { validationService } from 'hexaValidation';

//TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

//TODO: Custome Object
var utils = require('hexaUtils');

export default class WalletName extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            inputs: {
                walletName: {
                    type: 'generic',
                    value: ''
                }
            },
            walletName: null,
            flag_ProceedBtnDisable: true
        };
        this.onInputChange = validationService.onInputChange.bind(this);
        this.getFormValidation = validationService.getFormValidation.bind(this);
    }

    //TODO: Wallet Name
    ckeckWalletName(val: string) {
        try {
            if (val.length > 0) {
                this.setState({
                    flag_ProceedBtnDisable: false
                });
            } else {
                this.setState({
                    flag_ProceedBtnDisable: true
                });
            }
        } catch (error) {
            Alert.alert(error);
        }
    }

    //TODO: func click_Proceed
    click_Proceed = async () => {
        try {
            this.getFormValidation();
            let walletName = this.state.walletName;
            var hasWallet =
                walletName.includes('Wallet') || walletName.includes('wallet');
            if (!hasWallet) {
                if (walletName.includes("'s") || walletName.includes('’s')) {
                    walletName = walletName + ' Wallet';
                } else {
                    walletName = walletName + "'s Wallet";
                }
            }
            let SetUpDetails = {};
            SetUpDetails.walletName = walletName;
            await utils.setSetupWallet(SetUpDetails);
            window.EventBus.trigger('swipeScreen', 'optional event info');
        } catch (error) {
            Alert.alert(error);
        }
    };

    renderError(id: any) {
        const { inputs } = this.state;
        if (inputs[id].errorLabel) {
            return (
                <Text style={validationService.styles.error}>
                    {inputs[id].errorLabel}
                </Text>
            );
        }
        return null;
    }

    render() {
        //values
        let { walletName } = this.state;
        return (
            <View style={styles.container}>
                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={40}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <View style={styles.viewPagination}>
                        <Text
                            style={[
                                FontFamily.ffFiraSansMedium,
                                { fontSize: 22, textAlign: 'center' }
                            ]}
                        >
                            Give it a name
                        </Text>
                        <Text
                            note
                            style={[
                                FontFamily.ffFiraSansMedium,
                                { marginTop: 20, textAlign: 'center' }
                            ]}
                        >
                            You can put anything here - a nick name, the name of
                            your fav character, or anything random.
                        </Text>
                    </View>
                    <View style={styles.viewInputFiled}>
                        <Item rounded style={styles.itemInputWalletName}>
                            <Input
                                keyboardType="default"
                                autoCapitalize="sentences"
                                value={walletName}
                                autoCorrect={false}
                                autoFocus={true}
                                placeholder="Enter a name for your wallet"
                                style={[FontFamily.ffFiraSansMedium]}
                                placeholderTextColor="#B7B7B7"
                                onChangeText={value => {
                                    this.setState(
                                        {
                                            walletName: value
                                        },
                                        () => this.ckeckWalletName(value)
                                    );
                                    this.onInputChange({
                                        id: 'walletName',
                                        value
                                    });
                                }}
                            />
                        </Item>
                        {this.renderError('walletName')}
                    </View>
                    <View style={styles.viewProcedBtn}>
                        <Text
                            note
                            style={[
                                FontFamily.ffFiraSansMedium,
                                {
                                    textAlign: 'center',
                                    marginLeft: 20,
                                    marginRight: 20,
                                    marginBottom: 20
                                }
                            ]}
                            numberOfLines={3}
                        >
                            We don't store this information. This is so that
                            your contacts can recognize the sender when they get
                            a request or message from the hexa app.
                        </Text>
                        <FullLinearGradientButton
                            title="Proceed"
                            disabled={this.state.flag_ProceedBtnDisable}
                            style={[
                                this.state.flag_ProceedBtnDisable == true
                                    ? { opacity: 0.4 }
                                    : { opacity: 1 },
                                { borderRadius: 10 }
                            ]}
                            click_Done={() => this.click_Proceed()}
                        />
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    viewPagination: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 30,
        marginRight: 30
    },
    viewInputFiled: {
        flex: 3,
        alignItems: 'center',
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
        justifyContent: 'flex-end'
    }
});
