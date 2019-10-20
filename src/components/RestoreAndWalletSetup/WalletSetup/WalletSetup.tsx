import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  Platform,
  SafeAreaView,
  AsyncStorage,
  Alert,
} from 'react-native';
import { Container } from 'native-base';
import { StackActions, NavigationActions } from 'react-navigation';

// TODO: Custome Comp
import { CustomStatusBar } from 'hexaCustStatusBar';
import { WalletSetUpScrolling } from 'hexaCustOnBoarding';
import { HeaderTitle } from 'hexaCustHeader';

import { WalletName, FirstSecretQuestion } from 'hexaCompRestoreAndWalletSetup';

// TODO: Custome Object
import { colors, images, asyncStorageKeys } from 'hexaConstants';

export default class WalletSetup extends React.Component<any, any> {
  // TODO:click_GotoPermisionScrenn
  goToWallet() {
    try {
      if (Platform.OS == 'android') {
        this.props.navigation.push('PermissionAndroid', {
          flow: 'New Wallet',
        });
      } else {
        const resetAction = StackActions.reset({
          index: 0, // <-- currect active route from actions array
          key: null,
          actions: [
            NavigationActions.navigate({
              routeName: 'TabbarBottom',
            }),
          ],
        });
        AsyncStorage.setItem(
          asyncStorageKeys.rootViewController,
          'TabbarBottom',
        );
        this.props.navigation.dispatch(resetAction);
      }
    } catch (error) {
      Alert.alert(error);
    }
  }

  render() {
    return (
      <Container>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <HeaderTitle
            title="Set up your wallet"
            pop={() => this.props.navigation.pop()}
          />
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <WalletSetUpScrolling>
              {/* First screen */}
              <WalletName />
              {/* Second screen */}
              <FirstSecretQuestion click_Next={() => this.goToWallet()} />
            </WalletSetUpScrolling>
          </SafeAreaView>
        </ImageBackground>
        <CustomStatusBar
          backgroundColor={colors.white}
          hidden={false}
          barStyle="dark-content"
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
