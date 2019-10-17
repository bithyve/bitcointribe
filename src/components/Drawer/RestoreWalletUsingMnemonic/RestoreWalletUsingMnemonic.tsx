import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { Text } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

//TODO: Custome Pages
import { CustomStatusBar } from 'hexaCustStatusBar';
import { ModelLoader } from 'hexaLoader';

//TODO: Custome Object
import { colors, images } from 'hexaConstants';

export default class RestoreWalletUsingMnemonic extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      arr_ModelWalletName: [],
      arr_ConfirmPassphrase: [],
      arr_ModelRestoreSucess: [],
      wallerName: '',
      flag_Loading: false,
    };
  }

  componentDidMount() {
    // this.setState( {
    //     arr_ModelWalletName: [
    //         {
    //             modalVisible: true
    //         }
    //     ]
    // } )
  }

  // //TODO: func click_getWalletDetails
  // getWalletDetails = async ( mnemonic: string, bal: any ) => {
  //     const dateTime = Date.now();
  //     // const fulldate = Math.floor( dateTime / 1000 );
  //     let walletName = this.state.wallerName;
  //     await dbOpration.insertWallet(
  //         localDB.tableName.tblWallet,
  //         dateTime,
  //         mnemonic,
  //         "",
  //         "",
  //         "",
  //         walletName,
  //         ""
  //     );
  //     let secureAccount = await utils.getSecureAccountObject();
  //     // const secureAccount = new SecureAccount( mnemonic );
  //     const resSetupSecureAccount = await secureAccount.setupSecureAccount();

  //     const res = await comAppHealth.check_AppHealthStausUsingMnemonic( 0, 0, null, dateTime, "mnemonic" );
  //     if ( res ) {
  //         await dbOpration.insertCreateAccount(
  //             localDB.tableName.tblAccount,
  //             dateTime,
  //             "",
  //             bal,
  //             "BTC",
  //             "Daily Wallet",
  //             "Daily Wallet",
  //             ""
  //         );
  //         const secondaryMnemonic = await secureAccount.getRecoveryMnemonic();
  //         let arr_SecureDetails = [];
  //         let secureDetails = {};
  //         secureDetails.setupData = resSetupSecureAccount.data.setupData;
  //         secureDetails.secondaryXpub = resSetupSecureAccount.data.secondaryXpub;
  //         secureDetails.secondaryMnemonic = secondaryMnemonic;
  //         secureDetails.backupDate = dateTime;
  //         secureDetails.title = "Active Now";
  //         secureDetails.addInfo = "";
  //         arr_SecureDetails.push( secureDetails );
  //         await dbOpration.insertCreateAccount(
  //             localDB.tableName.tblAccount,
  //             dateTime,
  //             "",
  //             "0.0",
  //             "BTC",
  //             "Secure Account",
  //             "Secure Account",
  //             arr_SecureDetails
  //         );
  //         AsyncStorage.setItem(
  //             asyncStorageKeys.rootViewController,
  //             "TabbarBottom"
  //         );
  //     } else {
  //         Alert.alert( "App health staus not updated." )
  //     }
  // }

  // //TODO: Sucess Model
  // click_Skip() {
  //     const resetAction = StackActions.reset( {
  //         index: 0, // <-- currect active route from actions array
  //         key: null,
  //         actions: [
  //             NavigationActions.navigate( { routeName: "TabbarBottom" } )
  //         ]
  //     } );
  //     this.props.navigation.dispatch( resetAction );
  // }
  _renderItem = ({ item, index }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        margin: 5,
      }}
    >
      <TextInput style={{ height: 30 }} placeholder={'Word ' + (index + 1)} />
    </View>
  );
  render() {
    return (
      <View style={styles.container}>
        <CustomStatusBar
          backgroundColor={colors.white}
          flagShowStatusBar={false}
          barStyle="dark-content"
        />
        <SafeAreaView style={styles.container}>
          <ImageBackground
            source={images.WalletSetupScreen.WalletScreen.backgoundImage}
            style={styles.container}
          >
            <KeyboardAwareScrollView
              enableAutomaticScroll
              automaticallyAdjustContentInsets={true}
              keyboardOpeningTime={0}
              enableOnAndroid={true}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View>
                <View />
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: '600',
                  }}
                >
                  Enter the Mnemonic
                </Text>
              </View>
              <Text style={{ textAlign: 'center', padding: 10 }}>
                Enter the mnemonic in the order
              </Text>
              <FlatList
                style={{ flex: 1 }}
                data={[
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9,
                  10,
                  11,
                  12,
                  13,
                  14,
                  15,
                  16,
                  17,
                  18,
                  19,
                  20,
                  21,
                  22,
                  23,
                  24,
                ]}
                renderItem={this._renderItem}
                numColumns={3}
              />
              <ModelLoader
                loading={this.state.flag_Loading}
                color={colors.appColor}
                size={30}
              />
            </KeyboardAwareScrollView>
          </ImageBackground>
        </SafeAreaView>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(252,252,252,1)',
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
