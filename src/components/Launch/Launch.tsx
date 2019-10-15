import React, { Component } from 'react';
import {
    View,
    AsyncStorage,
    StyleSheet,
    ImageBackground,
    Animated,
    Easing
} from 'react-native';

import { colors, images, asyncStorageKeys } from 'hexaConstants';
import Singleton from 'HexaWallet/src/app/constants/Singleton';

//TODO: Custom Object
import { CustomStatusBar } from 'hexaCustStatusBar';

import * as Keychain from 'react-native-keychain';

interface Props {
    onCompleted: Function;
}

export default class Launch extends Component<Props, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            centerLogo: null,
            centerLogoOpacity: new Animated.Value(0)
        };
    }

    async componentDidMount() {
        let commonData = Singleton.getInstance();
        let value = await AsyncStorage.getItem(
            asyncStorageKeys.flag_PasscodeCreate
        );
        let rootViewController = await AsyncStorage.getItem(
            asyncStorageKeys.rootViewController
        );
        console.log({ value, rootViewController });
        let status = JSON.parse(value);
        const credentials = await Keychain.getGenericPassword();
        commonData.setPasscode(credentials.password);

        setTimeout(() => {
            this.setState({ centerLogo: images.LaunchScreen.hexaLogo });
        }, 10);

        setTimeout(() => {
            if (rootViewController == 'PasscodeConfirm') {
                this.props.onCompleted(false, rootViewController);
            } else if (status) {
                this.props.onCompleted(false, 'Passcode');
            } else {
                this.props.onCompleted(false, 'OnBoardingNavigator');
            }
        }, 300);

        Animated.timing(this.state.centerLogoOpacity, {
            toValue: 1,
            duration: 10,
            easing: Easing.bounce
        }).start();
    }

    render() {
        const animatedOpacity = { opacity: this.state.centerLogoOpacity };
        return (
            <View style={styles.container}>
                <ImageBackground
                    source={images.LaunchScreen.img1}
                    style={styles.backgroundImage}
                    imageStyle={{
                        resizeMode: 'cover' // works only here!
                    }}
                >
                    <Animated.Image
                        source={this.state.centerLogo}
                        style={[animatedOpacity, { height: 400, width: 400 }]}
                    />
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

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    backgroundImage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
