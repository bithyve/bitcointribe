import React from 'react';
import {
  StyleSheet,
  ImageBackground,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { Container, Text } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SvgIcon } from '@up-shared/components';

// TODO: Custome Image

import { ImageSVG } from 'hexaCustImage';
// TODO: Custome view
import { CustomStatusBar } from 'hexaCustStatusBar';

// TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

// TODO: Custome Pages
import { localDB, images, colors, svgIcon } from 'hexaConstants';

// TODO: Custome Pages
import { ModelLoader } from 'hexaLoader';

// TODO: ModalAllTransaction
import { ModalAllTransactionDetails } from 'hexaCustModel';

// TODO: Custome Alert
import { AlertSimple } from 'hexaCustAlert';

const dbOpration = require('hexaDBOpration');

const alert = new AlertSimple();

// TODO: Common Funciton
const comFunDBRead = require('hexaCommonDBReadData');

// TODO: Bitcoin Class
const bitcoinClassState = require('hexaClassState');

export default class AllTransaction extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      modalVisible: false,
      detailsArray: [
        { title: 'To Address', value: '8572308235034623' },
        { title: 'From Address', value: '234255609325230' },
        { title: 'Amount', value: '0' },
        { title: 'Fees', value: '0' },
        { title: 'Transaction ID', value: '' },
        { title: 'Confirmations', value: '' },
      ],
      selectedTransaction: {
        transactionType: '',
        totalReceived: 0,
        time: '-',
        NumberofConfirmations: '',
      },
      recentRegularTransactions: [],
      recentSecureTransactions: [],
      recentTransactions: [],
      flag_Loading: false,
    };
  }

  componentWillMount() {
    this.getTransaction();
  }

  getTransaction = async () => {
    const resTranList = await comFunDBRead.readTblTransaction();
    this.dbDataShow(resTranList);
  };

  dbDataShow(resTranList: any) {
    this.setState({
      recentTransactions: resTranList,
    });
  }

  getReloadData = async () => {
    this.setState({ flag_Loading: true });
    await this.getAccountTransaction();
    this.filterTransaction();
  };

  async getAccountTransaction() {
    const regularAccount = await bitcoinClassState.getRegularClassState();
    let regularAccountTransactions = await regularAccount.getTransactions();
    if (regularAccountTransactions.status == 200) {
      await bitcoinClassState.setRegularClassState(regularAccount);
      regularAccountTransactions = regularAccountTransactions.data;
      this.setState({
        recentRegularTransactions:
          regularAccountTransactions.transactions.transactionDetails,
      });
    } else {
      alert.simpleOkAction(
        'Oops',
        regularAccountTransactions.err,
        this.click_StopLoader,
      );
    }
    const secureAccount = await bitcoinClassState.getSecureClassState();
    let secureAccountTransactions = await secureAccount.getTransactions();
    if (secureAccountTransactions.status == 200) {
      await bitcoinClassState.setSecureClassState(secureAccount);
      secureAccountTransactions = secureAccountTransactions.data;
      this.setState({
        recentSecureTransactions:
          secureAccountTransactions.transactions.transactionDetails,
      });
    } else {
      alert.simpleOkAction(
        'Oops',
        secureAccountTransactions.err,
        this.click_StopLoader,
      );
    }
  }

  filterTransaction = async () => {
    const dateTime = Date.now();
    let results = [
      ...this.state.recentRegularTransactions,
      ...this.state.recentSecureTransactions,
    ];
    results = results.sort((a, b) => {
      return a.confirmations - b.confirmations;
    });
    const resStoreTrna = await dbOpration.insertTblTransation(
      localDB.tableName.tblTransaction,
      results,
      dateTime,
    );
    if (resStoreTrna) {
      this.setState({
        flag_Loading: false,
        recentTransactions: results,
      });
    }
  };

  click_StopLoader = () => {
    this.setState({ flag_Loading: false });
  };

  setModalVisible(modalVisible: any) {
    this.setState({ modalVisible });
  }

  updateModalData(item: any) {
    const detailsArray = [
      {
        title: 'To',
        value:
          item.transactionType === 'Sent'
            ? item.recipientAddresses
            : `${item.accountType} Account`,
      },
      {
        title: 'From',
        value:
          item.transactionType === 'Received'
            ? item.senderAddresses
            : `${item.accountType} Account`,
      },
      { title: 'Amount', value: item.amount },
      { title: 'Fees', value: item.fee },
      { title: 'Transaction ID', value: item.txid },
      { title: 'Confirmations', value: item.confirmations },
    ];
    const selectedTransaction = {
      transactionType: item.transactionType,
      amount: item.amount,
      time: '-',
      confirmations: item.confirmations,
      recipientAddresses: item.recipientAddresses,
      senderAddresses: item.senderAddresses,
      accountType: item.accountType,
    };
    this.setState({ detailsArray, selectedTransaction });
  }

  // Recent Transaction Item view
  _renderItem = ({ item, index }) => {
    return (
      <View style={{ padding: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View>
            <ImageSVG
              size={50}
              source={
                svgIcon.walletScreen[
                  item.accountType == 'Regular'
                    ? Platform.OS == 'ios'
                      ? 'dailyAccountSVG'
                      : 'dailyAccountPNG'
                    : Platform.OS == 'ios'
                    ? 'secureAccountSVG'
                    : 'secureAccountPNG'
                ]
              }
            />
          </View>
          <View style={{ flex: 1, padding: 5 }}>
            <Text
              style={{
                color: '#151515',
                fontWeight: '600',
                fontSize: 14,
                paddingVertical: 3,
              }}
            >
              {item.transactionType === 'Received'
                ? `To ${item.accountType} Account`
                : `From ${item.accountType} Account`}
            </Text>
            <Text
              style={{
                color: '#8B8B8B',
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {'-'}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Icon
              name={
                item.transactionType === 'Received'
                  ? 'long-arrow-down'
                  : 'long-arrow-up'
              }
              color={
                item.transactionType === 'Received' ? '#51B48A' : '#E64545'
              }
              size={25}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 5,
          }}
        >
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SvgIcon name="icon_more" color="#E2E2E2" size={50} />
          </View>
          <TouchableOpacity
            style={styles.amountView}
            activeOpacity={1}
            onPress={() => {
              this.updateModalData(item);
              this.setModalVisible(true);
            }}
          >
            <SvgIcon name="icon_bitcoin" color="#d0d0d0" size={30} />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  color: '#2F2F2F',
                  fontSize: 20,
                  fontWeight: 'bold',
                }}
              >
                {item.amount}
                <Text note> sats</Text>
              </Text>
              <Text
                style={{
                  color: '#D0D0D0',
                  fontSize: 15,
                  fontWeight: '600',
                  paddingHorizontal: 10,
                }}
              >
                {item.confirmations}
              </Text>
            </View>

            <SvgIcon name="icon_forword" color="#C4C4C4" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    return (
      <Container>
        <ImageBackground
          source={images.WalletSetupScreen.WalletScreen.backgoundImage}
          style={styles.container}
        >
          <SafeAreaView
            style={[styles.container, { backgroundColor: 'transparent' }]}
          >
            <View style={{ margin: 10, marginTop: 30 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={[
                    FontFamily.ffFiraSansMedium,
                    {
                      color: '#2F2F2F',
                      fontSize: 28,
                      fontWeight: '600',
                      flex: 1,
                    },
                  ]}
                >
                  {'Transactions'}
                </Text>
                <View style={styles.filterView}>
                  <Icon name="filter" color="#8B8B8B" size={20} />
                  <Text
                    style={{
                      color: '#838383',
                      paddingHorizontal: 5,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {'Filter Transactions'}
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.subTitleText}>{'Recent Transactions'}</Text>
              </View>
            </View>
            <KeyboardAwareScrollView
              enableAutomaticScroll
              automaticallyAdjustContentInsets={true}
              keyboardOpeningTime={0}
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={() => {
                    this.getReloadData();
                  }}
                />
              }
              enableOnAndroid={true}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              {!this.state.flag_Loading &&
              this.state.recentTransactions.length === 0 ? (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                    paddingTop: 50,
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#838383',
                      marginBottom: 10,
                    }}
                  >
                    {
                      'Start transactions to see your recent transactions history.'
                    }
                  </Text>
                  <Text
                    style={[
                      FontFamily.ffFiraSansRegular,
                      {
                        textAlign: 'center',
                        marginTop: 10,
                      },
                    ]}
                  >
                    Please pull down to refresh, if all transactions are not
                    visible.
                  </Text>
                </View>
              ) : null}
              <FlatList
                style={{ flex: 1, padding: 10 }}
                data={this.state.recentTransactions}
                renderItem={this._renderItem}
                keyExtractor={(item, index) => index.toString()}
                refreshControl={
                  <RefreshControl
                    onRefresh={() => {
                      this.getReloadData();
                    }}
                    refreshing={false}
                  />
                }
              />
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </ImageBackground>
        <ModalAllTransactionDetails
          setModalVisible={this.setModalVisible.bind(this)}
          modalData={{
            selectedTransaction: this.state.selectedTransaction,
            detailsArray: this.state.detailsArray,
            modalVisible: this.state.modalVisible,
          }}
        />
        <ModelLoader
          loading={this.state.flag_Loading}
          color={colors.appColor}
          size={30}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  amountView: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderColor: '#EFEFEF',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowOffset: { width: 5, height: 5 },
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  filterView: {
    flexDirection: 'row',
    padding: 5,
    borderColor: '#D0D0D0',
    borderWidth: 0.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  subTitleText: {
    color: '#B7B7B7',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
    paddingVertical: 10,
  },
});
