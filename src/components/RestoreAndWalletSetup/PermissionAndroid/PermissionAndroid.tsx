import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    AsyncStorage,
    Image,
    Alert,
    ImageBackground,
    SafeAreaView,
    PermissionsAndroid
} from 'react-native';
import { Text } from 'native-base';
import { StackActions, NavigationActions } from 'react-navigation';
import IconFontAwe from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

//TODO: Custome Pages
import { CustomStatusBar } from 'hexaCustStatusBar';
import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';

//TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

//TODO: Custome Object
import { colors, images, asyncStorageKeys } from 'hexaConstants';

export default class PermissionAndroid extends Component {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    _isContains(json: any, value: any) {
        try {
            let contains = false;
            Object.keys(json).some(key => {
                contains =
                    typeof json[key] === 'object'
                        ? this._isContains(json[key], value)
                        : json[key] === value;
                return contains;
            });
            return contains;
        } catch (error) {
            Alert.alert(error);
        }
    }

    click_GetPermisson = async () => {
        try {
            const { navigation } = this.props;
            try {
                const grantedWrite = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
                    PermissionsAndroid.PERMISSIONS.SEND_SMS,
                    PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
                    PermissionsAndroid.PERMISSIONS.READ_SMS
                ]);
                console.log({ grantedWrite });
                let flat_Perm = this._isContains(grantedWrite, 'granted');
                console.log({ flat_Perm });
                if (flat_Perm) {
                    if (navigation.getParam('flow') == 'New Wallet')
                        this.gotoWallet();
                    else
                        this.props.navigation.push(
                            'RestoreSelectedContactsList'
                        );
                } else {
                    this.click_GetPermisson();
                }
            } catch (err) {
                console.warn(err);
            }
        } catch (error) {
            Alert.alert(error);
        }
    };

    //TODO: func goNextScreen
    gotoWallet() {
        try {
            const resetAction = StackActions.reset({
                index: 0, // <-- currect active route from actions array
                key: null,
                actions: [
                    NavigationActions.navigate({ routeName: 'TabbarBottom' })
                ]
            });
            AsyncStorage.setItem(
                asyncStorageKeys.rootViewController,
                'TabbarBottom'
            );
            this.props.navigation.dispatch(resetAction);
        } catch (error) {
            console.log(error);
        }
    }
    render() {
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
                            <View style={styles.viewAppLogo}>
                                <Image
                                    style={styles.imgAppLogo}
                                    source={images.appIcon}
                                />
                                <Text
                                    style={[
                                        FontFamily.ffFiraSansBold,
                                        { color: '#000000', marginTop: 20 }
                                    ]}
                                >
                                    Welcome to Hexa Wallet
                                </Text>
                                <Text
                                    note
                                    style={{ textAlign: 'center', margin: 10 }}
                                >
                                    Hexa wallet app permission.
                                </Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <View>
                                    <Text
                                        style={[FontFamily.ffFiraSansRegular]}
                                    >
                                        <IconFontAwe
                                            name="circle"
                                            size={10}
                                            color={colors.appColor}
                                        />{' '}
                                        Camera (for scanning QR)
                                    </Text>
                                    <Text
                                        style={[FontFamily.ffFiraSansRegular]}
                                    >
                                        <IconFontAwe
                                            name="circle"
                                            size={10}
                                            color={colors.appColor}
                                        />{' '}
                                        Files (for reading PDF)
                                    </Text>
                                    <Text
                                        style={[FontFamily.ffFiraSansRegular]}
                                    >
                                        <IconFontAwe
                                            name="circle"
                                            size={10}
                                            color={colors.appColor}
                                        />{' '}
                                        Contacts (for SSS and Guardians)
                                    </Text>
                                    <Text
                                        style={[FontFamily.ffFiraSansRegular]}
                                    >
                                        <IconFontAwe
                                            name="circle"
                                            size={10}
                                            color={colors.appColor}
                                        />{' '}
                                        SMS (for drafting SMS)
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.viewBtnProceed}>
                                <FullLinearGradientButton
                                    style={[{ opacity: 1, borderRadius: 5 }]}
                                    disabled={false}
                                    title="ALLOW"
                                    click_Done={() => this.click_GetPermisson()}
                                />
                            </View>
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
        flex: 1
    },
    viewAppLogo: {
        marginTop: 40,
        flex: 4,
        alignItems: 'center'
    },
    imgAppLogo: {
        height: 130,
        width: 130
    },
    viewBtnProceed: {
        flex: 3,
        justifyContent: 'flex-end',
        marginBottom: 20
    }
});
