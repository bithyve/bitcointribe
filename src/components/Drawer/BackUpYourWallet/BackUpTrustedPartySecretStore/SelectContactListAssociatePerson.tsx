import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Container, Item, Input, Text, Icon } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Contacts from 'react-native-contacts';
import { Avatar } from 'react-native-elements';

// TODO: Custome Pages
import { ModelLoader } from 'hexaLoader';
import { CustomStatusBar } from 'hexaCustStatusBar';
import { HeaderTitle } from 'hexaCustHeader';

// TODO: Custome Alert
import { AlertSimple } from 'hexaCustAlert';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Object
import { colors, images, localDB } from 'hexaConstants';
import { renderIf } from 'hexaValidation';

import { S3Service } from 'hexaBitcoin';

const alert = new AlertSimple();
const dbOpration = require('hexaDBOpration');
const utils = require('hexaUtils');

// TODO: Bitcoin Class
const bitcoinClassState = require('hexaClassState');

// TODO: Common Funciton
const comFunDBRead = require('hexaCommonDBReadData');

export default class SelectContactListAssociatePerson extends React.Component<
  any,
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      arr_ContactList: [],
      arr_SelectedItem: [],
      SelectedFakeContactList: [],
      arr_ModelAcceptOrRejectSecret: [],
      flag_NextBtnDisable: true,
      flag_NextBtnDisable1: false,
      flag_Loading: false,
      flag_MaxItemSeletedof3: true,
    };
  }

  UNSAFE_componentWillMount() {
    Contacts.getAll((err, contacts) => {
      if (err) {
        throw err;
      }
      // console.log( { contacts } );
      this.setState({
        data: contacts,
        arr_ContactList: contacts,
      });
    });
  }

  press = (item: any) => {
    // console.log( { item } );
    const givenName = item.givenName != '' ? item.givenName : '';
    const familyName = item.familyName != '' ? item.familyName : '';
    const name = `${givenName} ${familyName}`;
    // console.log( { name } );
    this.setState({
      arr_SelectedItem: item,
    });
    const urlType = utils.getDeepLinkingType();
    Alert.alert(
      'Are you sure?',
      `you want to associate ${name}?`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            if (urlType == 'SSS Recovery SMS/EMAIL') {
              this.props.navigation.push('TrustedContactAcceptOtp', {
                data: this.state.arr_SelectedItem,
              });
            } else {
              this.downloadDescShare();
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  goBack = () => {
    utils.setDeepLinkingType('');
    utils.setDeepLinkingUrl('');
    this.props.navigation.navigate('TabbarBottom');
  };

  // TODO: Qrcode Scan SSS Details Download Desc Sahre
  downloadDescShare = async () => {
    this.setState({
      flag_Loading: true,
    });
    const keeperInfo = this.state.arr_SelectedItem;
    let flag_Loading = true;
    const dateTime = Date.now();
    const urlScriptDetails = utils.getDeepLinkingUrl();
    // console.log( { urlScriptDetails } );
    const urlScript = {};
    urlScript.walletName = urlScriptDetails.wn;
    urlScript.data = urlScriptDetails.data;
    const walletDetails = utils.getWalletDetails();
    const sss = await bitcoinClassState.getS3ServiceClassState();
    const resDownlaodShare = await S3Service.downloadShare(
      urlScriptDetails.data,
    );
    // console.log( { resDownlaodShare } );
    if (resDownlaodShare.status == 200) {
      const regularAccount = await bitcoinClassState.getRegularClassState();
      let resGetWalletId = await regularAccount.getWalletId();
      if (resGetWalletId.status == 200) {
        await bitcoinClassState.setRegularClassState(regularAccount);
        resGetWalletId = resGetWalletId.data;
      } else {
        alert.simpleOk('Oops', resGetWalletId.err);
      }
      const resTrustedParty = await comFunDBRead.readTblTrustedPartySSSDetails();
      const arr_DecrShare = [];
      for (let i = 0; i < resTrustedParty.length; i++) {
        arr_DecrShare.push(JSON.parse(resTrustedParty[i].decrShare));
      }

      const resDecryptEncMetaShare = await S3Service.decryptEncMetaShare(
        resDownlaodShare.data.encryptedMetaShare,
        urlScriptDetails.data,
        resGetWalletId.walletId,
        arr_DecrShare,
      );
      if (resDecryptEncMetaShare.status == 200) {
        // console.log( { resDecryptEncMetaShare } );
        arr_DecrShare.length != 0
          ? arr_DecrShare.push(resDecryptEncMetaShare.data.decryptedMetaShare)
          : arr_DecrShare.push(resDecryptEncMetaShare.data.decryptedMetaShare);
        // console.log( { arr_DecrShare } );
        const resUpdateHealth = await S3Service.updateHealth(arr_DecrShare);
        // console.log( { resUpdateHealth } );
        if (resUpdateHealth.status == 200) {
          await bitcoinClassState.setS3ServiceClassState(sss);
          const resTrustedParty = await dbOpration.insertTrustedPartyDetails(
            localDB.tableName.tblTrustedPartySSSDetails,
            dateTime,
            keeperInfo,
            urlScript,
            resDecryptEncMetaShare.data.decryptedMetaShare,
            resDecryptEncMetaShare.data.decryptedMetaShare.meta,
            resDecryptEncMetaShare.data.decryptedMetaShare
              .encryptedStaticNonPMDD,
          );
          if (resTrustedParty) {
            flag_Loading = false;
            setTimeout(() => {
              alert.simpleOkAction(
                'Success',
                'Share stored successfully',
                this.goBack,
              );
            }, 100);
          }
        }
      } else {
        flag_Loading = false;
        setTimeout(() => {
          alert.simpleOk('Oops', resDecryptEncMetaShare.err);
        }, 100);
      }
    } else {
      flag_Loading = false;
      setTimeout(() => {
        alert.simpleOk('Oops', resDownlaodShare.err);
      }, 100);
    }
    this.setState({
      flag_Loading,
    });
  };

  // TODO: Searching Contact List
  searchFilterFunction = (text: string) => {
    if (text.length > 0) {
      const newData = this.state.data.filter(item => {
        const itemData = `${item.givenName != null &&
          item.givenName.toUpperCase()}   
    ${item.familyName != null && item.familyName.toUpperCase()}`;
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });

      this.setState({ data: newData });
    } else {
      this.setState({
        data: this.state.arr_ContactList,
      });
    }
  };

  render() {
    return (
      <Container>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <HeaderTitle
            title="Contacts"
            pop={() => {
              utils.setDeepLinkingType('');
              utils.setDeepLinkingUrl('');
              this.props.navigation.pop();
            }}
          />
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={40}>
              <View style={{ flex: 0.2 }}>
                <View
                  style={{
                    marginLeft: 10,
                    marginRight: 10,
                    backgroundColor: '#EDEDED',
                    borderRadius: 10,
                  }}
                >
                  <Item
                    style={{
                      borderColor: 'transparent',
                      marginLeft: 10,
                    }}
                  >
                    <Icon name="ios-search" color="#B7B7B7" />
                    <Input
                      placeholder="Enter a name to begin search"
                      style={[FontFamily.ffFiraSansMedium]}
                      placeholderTextColor="#B7B7B7"
                      onChangeText={text => this.searchFilterFunction(text)}
                      autoCorrect={false}
                    />
                  </Item>
                </View>
                <Text
                  note
                  style={[
                    FontFamily.ffFiraSansMedium,
                    {
                      marginLeft: 10,
                      marginRight: 10,
                      marginBottom: 20,
                    },
                  ]}
                >
                  Search contact
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <FlatList
                  data={this.state.data}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{}}
                      onPress={() => {
                        this.press(item);
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: '#ffffff',
                          marginLeft: 10,
                          marginRight: 10,
                          marginBottom: 10,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            backgroundColor: '#ffffff',
                            margin: 5,
                            borderRadius: 10,
                          }}
                        >
                          {renderIf(item.thumbnailPath != '')(
                            <Avatar
                              medium
                              rounded
                              source={{
                                uri: item.thumbnailPath,
                              }}
                            />,
                          )}
                          {renderIf(item.thumbnailPath == '')(
                            <Avatar
                              medium
                              rounded
                              title={
                                item.givenName != null &&
                                item.givenName.charAt(0)
                              }
                            />,
                          )}
                          <Text
                            style={[
                              FontFamily.ffFiraSansRegular,
                              {
                                alignSelf: 'center',
                                marginLeft: 10,
                              },
                            ]}
                          >
                            {item.givenName} {item.familyName}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.recordID}
                  extraData={this.state}
                />
              </View>
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </ImageBackground>
        <ModelLoader
          loading={this.state.flag_Loading}
          color={colors.appColor}
          size={30}
          message="Loading"
        />
        <CustomStatusBar
          backgroundColor={colors.white}
          hidden={false}
          barStyle="dark-content"
        />
      </Container>
    );
  }
}

const darkGrey = '#bdc3c7';
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
