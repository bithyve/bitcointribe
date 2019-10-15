import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Platform,
    SafeAreaView,
    ImageBackground
} from 'react-native';
import { Text } from 'native-base';
import CodeInput from 'react-native-confirmation-code-input';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

//TODO: Custome Pages
import { ModelLoader } from 'hexaLoader';
import { CustomStatusBar } from 'hexaCustStatusBar';
import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';
import { HeaderTitle } from 'hexaCustHeader';

//TODO: Custome Model
import { ModelRestoreAssociateContactList } from 'hexaCustModel';

//TODO: Custome Object
import { colors, images, localDB } from 'hexaConstants';
import utils from 'hexaUtils';
var dbOpration = require('hexaDBOpration');
import { renderIf } from 'hexaValidation';

//TODO: Custome Alert
import { AlertSimple } from 'hexaCustAlert';
let alert = new AlertSimple();

//TODO: Bitcoin Files
import { S3Service } from 'hexaBitcoin';

//TODO: Common Funciton
var comFunDBRead = require('hexaCommonDBReadData');

export default class OTP extends Component {
    constructor(props: any) {
        super(props);
        this.state = {
            status: false,
            otp: '000000',
            success: 'Passcode does not match!',
            passcodeStyle: [
                {
                    activeColor: colors.black,
                    inactiveColor: colors.black,
                    cellBorderWidth: 0
                }
            ],
            statusConfirmBtnDisable: true,
            flag_Loading: false,
            keeperInfo: [],
            arr_ResDownShare: [],
            arr_ModelRestoreAssociateContactList: [],
            tableId: ''
        };
    }

    async componentDidMount() {
        let script = utils.getDeepLinkingUrl();
        //console.log( { script } );
        let resSSSDetails = await comFunDBRead.readTblSSSDetails();
        //console.log( { resSSSDetails } );
        let arr_KeeperInfo = [];
        for (let i = 0; i < resSSSDetails.length; i++) {
            let data = {};
            let fullInfo = resSSSDetails[i];
            //console.log( { fullInfo } );
            if (
                resSSSDetails[i].keeperInfo != '' &&
                (fullInfo.type == 'Trusted Contacts 1' ||
                    fullInfo.type == 'Trusted Contacts 2')
            ) {
                let keerInfo = JSON.parse(resSSSDetails[i].keeperInfo);
                data.id = resSSSDetails[i].id;
                data.thumbnailPath = keerInfo.thumbnailPath;
                data.givenName = keerInfo.givenName;
                data.familyName = keerInfo.familyName;
                data.phoneNumbers = keerInfo.phoneNumbers;
                data.emailAddresses = keerInfo.emailAddresses;
                data.recordId = fullInfo.recordId;
                arr_KeeperInfo.push(data);
            }
        }
        if (arr_KeeperInfo.length > 0) {
            this.setState({
                arr_ModelRestoreAssociateContactList: [
                    {
                        modalVisible: true,
                        item: arr_KeeperInfo
                    }
                ]
            });
        } else {
            alert.simpleOkAction(
                'Oops',
                'Please select any one trusted contact and close app and agian click link.',
                this.click_GoTrusteContactScreen
            );
        }
    }

    //TODO: if not sss trusted contact to going trusted contact screen for select perosn
    click_GoTrusteContactScreen = () => {
        utils.setDeepLinkingType('');
        utils.setDeepLinkingUrl('');
        this.props.navigation.navigate(
            'RestoreWalletUsingTrustedContactNavigator'
        );
    };

    _onFinishCheckingCode = async (code: string) => {
        //console.log( { code } );
        if (code.length == 6) {
            this.setState({
                otp: code,
                statusConfirmBtnDisable: false
            });
        }
    };

    onSuccess = async () => {
        const dateTime = Date.now();
        this.setState({
            flag_Loading: true
        });
        let flag_Loading = true;
        let enterOtp = this.state.otp;
        let script = utils.getDeepLinkingUrl();
        let tableId = this.state.tableId;
        var resDecryptViaOTP = await S3Service.decryptViaOTP(
            script.key,
            enterOtp
        );
        if (resDecryptViaOTP.status == 200) {
            resDecryptViaOTP = resDecryptViaOTP.data;
        } else {
            this.setState({ flag_Loading: !flag_Loading });
            setTimeout(() => {
                alert.simpleOkAction(
                    'Oops',
                    resDecryptViaOTP.err,
                    this.click_StopLoading
                );
            }, 100);
        }
        //console.log( { resDecryptViaOTP } );
        var resDownShare = await S3Service.downloadShare(
            resDecryptViaOTP.decryptedData
        );
        if (resDownShare.status == 200) {
            resDownShare = resDownShare.data;
        } else {
            this.setState({ flag_Loading: !flag_Loading });
            setTimeout(() => {
                alert.simpleOkAction(
                    'Oops',
                    resDownShare.err,
                    this.click_StopLoading
                );
            }, 100);
        }
        //console.log( { resDownShare } );
        let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare(
            resDownShare.encryptedMetaShare,
            resDecryptViaOTP.decryptedData
        );
        //console.log( { resDecryptEncMetaShare } );
        if (resDecryptEncMetaShare.status == 200) {
            //console.log( { resDecryptEncMetaShare } );
            const resUpdateSSSRetoreDecryptedShare = await dbOpration.updateSSSRetoreDecryptedShare(
                localDB.tableName.tblSSSDetails,
                resDecryptEncMetaShare.data.decryptedMetaShare,
                dateTime,
                parseInt(tableId)
            );
            //console.log( { resUpdateSSSRetoreDecryptedShare } );
            if (resUpdateSSSRetoreDecryptedShare) {
                this.setState({ flag_Loading: !flag_Loading });
                utils.setDeepLinkingType('');
                utils.setDeepLinkingUrl('');
                await comFunDBRead.readTblSSSDetails();
                this.props.navigation.navigate(
                    'RestoreWalletUsingTrustedContactNavigator'
                );
            }
        } else {
            this.setState({ flag_Loading: !flag_Loading });
            setTimeout(() => {
                alert.simpleOkAction(
                    'Oops',
                    resDecryptEncMetaShare.err,
                    this.click_StopLoading
                );
            }, 100);
        }
    };

    click_StopLoading = () => {
        this.setState({
            flag_Loading: false
        });
    };

    render() {
        //flag
        let { flag_Loading } = this.state;
        return (
            <View style={styles.container}>
                <ImageBackground
                    source={
                        images.WalletSetupScreen.WalletScreen.backgoundImage
                    }
                    style={styles.container}
                >
                    <HeaderTitle
                        title="Accept Secret via OTP"
                        pop={() =>
                            this.props.navigation.push(
                                'RestoreWalletUsingTrustedContactNavigator'
                            )
                        }
                    />
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
                            <Text
                                note
                                style={{
                                    textAlign: 'center',
                                    marginTop: 10,
                                    marginRight: 10
                                }}
                            >
                                Please enter the six digit OTP the owner of
                                secret shared with you
                            </Text>
                            <View style={styles.viewPasscode}>
                                <Text
                                    style={{
                                        marginTop: 100,
                                        fontWeight: 'bold',
                                        color: '#8B8B8B'
                                    }}
                                >
                                    Enter OTP
                                </Text>
                                <CodeInput
                                    ref="codeInputRef1"
                                    secureTextEntry
                                    keyboardType="default"
                                    autoCapitalize="sentences"
                                    codeLength={6}
                                    activeColor={
                                        this.state.passcodeStyle[0].activeColor
                                    }
                                    inactiveColor={
                                        this.state.passcodeStyle[0]
                                            .inactiveColor
                                    }
                                    className="border-box"
                                    cellBorderWidth={
                                        this.state.passcodeStyle[0]
                                            .cellBorderWidth
                                    }
                                    autoFocus={false}
                                    inputPosition="center"
                                    space={5}
                                    size={50}
                                    codeInputStyle={{
                                        borderRadius: 5,
                                        backgroundColor: '#F1F1F1'
                                    }}
                                    containerStyle={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: Platform.OS == 'ios' ? 0 : 40
                                    }}
                                    onFulfill={code =>
                                        this._onFinishCheckingCode(code)
                                    }
                                    type="characters"
                                />
                                {renderIf(
                                    this.state.passcodeStyle[0].activeColor ==
                                        'red'
                                )(
                                    <Text
                                        style={{ color: 'red', marginTop: 44 }}
                                    >
                                        {this.state.success}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.viewBtnProceed}>
                                <Text
                                    note
                                    style={{
                                        textAlign: 'center',
                                        marginBottom: 30
                                    }}
                                />
                                <FullLinearGradientButton
                                    style={[
                                        this.state.statusConfirmBtnDisable ==
                                        true
                                            ? { opacity: 0.4 }
                                            : { opacity: 1 },
                                        { borderRadius: 5 }
                                    ]}
                                    disabled={
                                        this.state.statusConfirmBtnDisable
                                    }
                                    title="Confirm & Proceed"
                                    click_Done={() => this.onSuccess()}
                                />
                            </View>
                        </KeyboardAwareScrollView>
                    </SafeAreaView>
                </ImageBackground>
                <ModelRestoreAssociateContactList
                    data={this.state.arr_ModelRestoreAssociateContactList}
                    click_Confirm={(tableId: string) => {
                        this.setState({
                            tableId,
                            arr_ModelRestoreAssociateContactList: [
                                {
                                    modalVisible: false,
                                    item: ''
                                }
                            ]
                        });
                    }}
                />
                <ModelLoader
                    loading={flag_Loading}
                    color={colors.appColor}
                    size={30}
                />
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
        flex: 1
    },
    viewPagination: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 30,
        marginRight: 30
    },
    viewAppLogo: {
        flex: 1,
        alignItems: 'center',
        marginTop: 50
    },
    imgAppLogo: {
        height: 150,
        width: 150
    },
    viewPasscode: {
        flex: 1,
        alignItems: 'center'
    },
    viewBtnProceed: {
        flex: 3,
        justifyContent: 'flex-end',
        marginBottom: 20
    }
});
