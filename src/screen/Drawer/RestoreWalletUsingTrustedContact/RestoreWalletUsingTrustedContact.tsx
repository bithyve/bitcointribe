import React, { Component } from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// TODO: Custome Compontes
import { StatusBar } from 'hexaComponent/StatusBar';
import { ModelWalletName, ModelContactPermission } from 'hexaComponent/Model';

// TODO: Custome Object
import { colors, images } from 'hexaConstants';

export default class RestoreWalletUsingTrustedContact extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      arr_ModelWalletName: [],
      arr_ModelContactPermission: [],
      walletName: '',
    };
  }

  componentDidMount() {
    this.setState({
      arr_ModelWalletName: [
        {
          modalVisible: true,
        },
      ],
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <KeyboardAwareScrollView
              enableAutomaticScroll
              automaticallyAdjustContentInsets={true}
              keyboardOpeningTime={0}
              enableOnAndroid={true}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <ModelWalletName
                data={this.state.arr_ModelWalletName}
                click_Confirm={val => {
                  console.log({ val });
                  this.setState({
                    walletName: val,
                    arr_ModelWalletName: [
                      {
                        modalVisible: false,
                      },
                    ],
                  });
                  this.props.navigation.push('RestoreSelectedContactsList', {
                    walletName: val,
                  });
                }}
                pop={() => {
                  this.setState({
                    arr_ModelWalletName: [
                      {
                        modalVisible: false,
                      },
                    ],
                  });
                  this.props.navigation.pop();
                }}
              />
              <ModelContactPermission
                data={this.state.arr_ModelContactPermission}
                click_Confirm={() => {
                  this.setState({
                    arr_ModelContactPermission: [
                      {
                        modalVisible: false,
                      },
                    ],
                  });
                }}
                pop={() => {
                  this.setState({
                    arr_ModelContactPermission: [
                      {
                        modalVisible: false,
                      },
                    ],
                    arr_ModelWalletName: [
                      {
                        modalVisible: true,
                      },
                    ],
                  });
                }}
              />
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </ImageBackground>
        <StatusBar
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
    backgroundColor: '#1F8BCD',
  },
  viewSetupWallet: {
    flex: 4,
    margin: 10,
  },
  viewAppLogo: {
    marginTop: 20,
    flex: 1,
    alignItems: 'center',
  },
  imgAppLogo: {
    height: 70,
    width: 70,
  },
  txtWhiteColor: {
    color: '#ffffff',
  },
});
