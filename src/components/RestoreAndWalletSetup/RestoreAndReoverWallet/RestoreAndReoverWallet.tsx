import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Alert,
  ImageBackground,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { RkCard } from 'react-native-ui-kitten';
import { Text } from 'native-base';
import { SvgIcon } from '@up-shared/components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// TODO: Custome Pages
import { CustomStatusBar } from 'hexaCustStatusBar';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
import { colors, images, localDB } from 'hexaConstants';
import utils from 'hexaUtils';

const dbOpration = require('hexaDBOpration');

// TODO: Common Funciton
const comFunDBRead = require('hexaCommonDBReadData');

export default class RestoreAndReoverWallet extends Component<Props, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      arr_SecoundMenu: [],
    };
  }

  async componentWillMount() {
    try {
      this.willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        () => {
          this.loadData();
        },
      );
    } catch (error) {
      Alert.alert(error);
    }
  }

  componentWillUnmount() {
    try {
      this.willFocusSubscription.remove();
    } catch (error) {
      Alert.alert(error);
    }
  }

  loadData = async () => {
    try {
      let resSSSDetails = await dbOpration.readTablesData(
        localDB.tableName.tblSSSDetails,
      );
      resSSSDetails = resSSSDetails.temp;
      console.log({ resSSSDetails });
      await utils.setSSSDetails(resSSSDetails);
      let temp = [];
      if (resSSSDetails.length > 0) {
        temp = ['Continue restoring wallet using trusted source'];
      } else {
        temp = ['Restore wallet using trusted source'];
      }
      this.setState({
        arr_SecoundMenu: temp,
      });
    } catch (error) {
      Alert.alert(error);
    }
  };

  // TODO: func click on list card item
  click_Card(item: any) {
    try {
      if (item == 'Set up as a New Wallet') {
        this.props.navigation.push('WalletSetup');
      } else if (item == 'Restore wallet using trusted source') {
        this.createSSSDetailsTableStructure();
      } else if (item == 'Continue restoring wallet using trusted source') {
        this.props.navigation.push('RestoreWalletUsingTrustedContactNavigator');
      } else {
        this.props.navigation.push('RestoreWalletUsingMnemonicNavigator');
      }
    } catch (error) {
      Alert.alert(error);
    }
  }

  createSSSDetailsTableStructure = async () => {
    try {
      const dateTime = Date.now();
      const keeperInfo = [
        { info: null },
        { info: null },
        { info: null },
        { info: null },
        { info: null },
      ];
      const encryptedMetaShare = [
        { metaShare: null },
        { metaShare: null },
        { metaShare: null },
        { metaShare: null },
        { metaShare: null },
      ];
      const arrTypes = [
        { type: 'Trusted Contacts 1' },
        { type: 'Trusted Contacts 2' },
        { type: 'Self Share 1' },
        { type: 'Self Share 2' },
        { type: 'Self Share 3' },
      ];
      const temp = [
        {
          date: dateTime,
          share: null,
          shareId: null,
          keeperInfo,
          encryptedMetaShare,
          type: arrTypes,
        },
      ];
      console.log({ temp });
      const resDeleteTableData = await dbOpration.deleteTableData(
        localDB.tableName.tblSSSDetails,
      );
      if (resDeleteTableData) {
        const resInsertSSSShare = await dbOpration.insertSSSShareDetails(
          localDB.tableName.tblSSSDetails,
          temp,
        );
        console.log({ resInsertSSSShare });
        if (resInsertSSSShare) {
          await comFunDBRead.readTblSSSDetails();
          if (Platform.OS == 'android')
            this.props.navigation.push(
              'RestoreWalletUsingTrustedContactAndroidNavigator',
              { flow: 'Restore Wallet Using Trusted Contact' },
            );
          else
            this.props.navigation.push(
              'RestoreWalletUsingTrustedContactNavigator',
            );
        }
      }
    } catch (error) {
      Alert.alert(error);
    }
  };

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
              <View style={styles.viewSetupWallet}>
                <Text
                  style={[
                    FontFamily.ffFiraSansBold,
                    {
                      color: '#ffffff',
                      marginTop: 50,
                      fontSize: 26,
                      textAlign: 'center',
                    },
                  ]}
                >
                  New Wallet
                </Text>
                <TouchableOpacity
                  onPress={() => this.click_Card('Set up as a New Wallet')}
                >
                  <RkCard
                    rkType="shadowed"
                    style={{
                      flex: 0.1,
                      borderRadius: 8,
                      marginTop: 40,
                    }}
                  >
                    <View
                      rkCardHeader
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text style={[FontFamily.ffFiraSansMedium, { flex: 6 }]}>
                        Set up as a New Wallet
                      </Text>
                      <SvgIcon
                        name="icon_forword"
                        color="#BABABA"
                        size={20}
                        style={{
                          flex: 0.25,
                          alignSelf: 'center',
                        }}
                      />
                    </View>
                  </RkCard>
                </TouchableOpacity>
              </View>
              <View style={styles.viewAppLogo}>
                <Text
                  style={[
                    FontFamily.ffFiraSansBold,
                    {
                      color: '#ffffff',
                      marginTop: 20,
                      marginBottom: 20,
                      fontSize: 26,
                    },
                  ]}
                >
                  Restore Wallet
                </Text>
              </View>
              <View style={{ flex: 1, margin: 10 }}>
                <FlatList
                  data={this.state.arr_SecoundMenu}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => this.click_Card(item)}>
                      <RkCard
                        rkType="shadowed"
                        style={{
                          flex: 1,
                          borderRadius: 8,
                          marginBottom: 10,
                        }}
                      >
                        <View
                          rkCardHeader
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={[FontFamily.ffFiraSansMedium, { flex: 6 }]}
                          >
                            {item}
                          </Text>
                          <SvgIcon
                            name="icon_forword"
                            color="#BABABA"
                            size={20}
                            style={{
                              flex: 0.25,
                              alignSelf: 'center',
                            }}
                          />
                        </View>
                      </RkCard>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
              <View
                style={{
                  flex: 3,
                  alignItems: 'center',
                  margin: 20,
                }}
              >
                <Text
                  style={[
                    styles.txtWhiteColor,
                    FontFamily.ffFiraSansBold,
                    { fontSize: 20 },
                  ]}
                >
                  Restoring a wallet
                </Text>
                <Text
                  style={[
                    styles.txtWhiteColor,
                    FontFamily.ffFiraSansRegular,
                    { textAlign: 'center', margin: 10 },
                  ]}
                >
                  Restoring a previously used wallet gives you back the access
                  to your funds.
                </Text>
                <Text
                  style={[
                    styles.txtWhiteColor,
                    FontFamily.ffFiraSansRegular,
                    { textAlign: 'center', margin: 10 },
                  ]}
                >
                  You can restore Hexa wallets using any of the methods and
                  restore other wallet by using the mnemonic
                </Text>
              </View>
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </ImageBackground>
        <CustomStatusBar
          backgroundColor={colors.appColor}
          hidden={false}
          barStyle="light-content"
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
