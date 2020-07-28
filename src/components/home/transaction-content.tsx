import React, { memo } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../common/Colors';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fonts from './../../common/Fonts';
import moment from 'moment';
import { UsNumberFormat } from '../../common/utilities';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FAST_BITCOINS } from '../../common/constants/serviceTypes';

interface transaction {
  transactionType?: string;
  accountType?: any;
  date?: string;
  amount?: string;
  confirmations?: number;
}

const TransactionsContent = ({
  transactions,
  TransactionDetailsBottomSheet,
  AtCloseEnd,
  setTransactionItem,
  setTabBarZIndex,
  transactionLoading,
  isFromAccount,
  infoBoxInfoText,
}) => {
  if (transactionLoading) {
    return (
      <View style={styles.modalContentContainer}>
        <View
          style={{
            flex: 1,
          }}
        >
          {[1, 2, 3, 4, 5].map((value) => {
            return (
              <View key={value} style={styles.view}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.view1} />
                  <View>
                    <View style={styles.view2} />
                    <View style={styles.view3} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.view4} />
                  <View style={styles.view1} />
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ backgroundColor: Colors.white }}>
          <View
            style={{
              ...styles.viewTransaction,
              marginBottom: isFromAccount ? hp('3%') : hp('12%') + 15,
            }}
          >
            <Text style={styles.viewTransactionText}>
              View your transactions here
            </Text>
            <Text style={styles.textNote}>
              {infoBoxInfoText
                ? infoBoxInfoText
                : 'All your recent transactions across the accounts appear here'}
            </Text>
          </View>
        </View>
      </View>
    );
  } else {
    if (transactions.length > 0) {
      return (
        <View style={styles.modalContentContainer}>
          <View style={{ flex: 1 }}>
            <View
              style={{ height: 'auto', marginTop: 10, marginBottom: hp('13%') }}
            >
              <FlatList
                data={transactions}
                ItemSeparatorComponent={() => (
                  <View style={{ backgroundColor: Colors.white }}>
                    <View style={styles.separatorView} />
                  </View>
                )}
                renderItem={({ item }: { item: transaction }) => (
                  <AppBottomSheetTouchableWrapper
                    onPress={
                      () => {
                        (TransactionDetailsBottomSheet as any).snapTo(1);
                        setTimeout(() => {
                          setTransactionItem(item);
                          setTabBarZIndex(0);
                        }, 10);
                      }
                      //props.navigation.navigate('TransactionDetails', { item })
                    }
                    style={{
                      ...styles.transactionModalElementView,
                      backgroundColor: Colors.white,
                    }}
                  >
                    <View style={styles.modalElementInfoView}>
                      <View style={{ justifyContent: 'center' }}>
                        <FontAwesome
                          name={
                            item.transactionType == 'Received'
                              ? 'long-arrow-down'
                              : 'long-arrow-up'
                          }
                          size={15}
                          color={
                            item.transactionType == 'Received'
                              ? Colors.green
                              : Colors.red
                          }
                        />
                      </View>
                      <View
                        style={{ justifyContent: 'center', marginLeft: 10 }}
                      >
                        <Text style={styles.transactionModalTitleText}>
                          {item.accountType == FAST_BITCOINS
                            ? 'FastBitcoins'
                            : item.accountType}{' '}
                        </Text>
                        <Text style={styles.transactionModalDateText}>
                          {moment(item.date).utc().format('DD MMMM YYYY')}{' '}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionModalAmountView}>
                      {item.accountType == FAST_BITCOINS && (
                        <View style={styles.view5}>
                          <Image
                            source={require('../../assets/images/icons/fastbitcoin_dark.png')}
                            style={{
                              width: wp('5%'),
                              height: wp('5%'),
                              resizeMode: 'contain',
                            }}
                          />
                        </View>
                      )}
                      <Text
                        style={{
                          ...styles.transactionModalAmountText,
                          color:
                            item.transactionType == 'Received'
                              ? Colors.green
                              : Colors.red,
                        }}
                      >
                        {UsNumberFormat(item.amount)}
                      </Text>
                      <Text style={styles.transactionModalAmountUnitText}>
                        {item.accountType === 'Test Account'
                          ? item.confirmations < 6
                            ? item.confirmations
                            : item.confirmations === '-' // for testnet faucet tx
                            ? item.confirmations
                            : '6+'
                          : item.confirmations < 6
                          ? item.confirmations
                          : '6+'}
                      </Text>
                      <Ionicons
                        name="ios-arrow-forward"
                        color={Colors.textColorGrey}
                        size={12}
                        style={{ marginLeft: 20, alignSelf: 'center' }}
                      />
                    </View>
                  </AppBottomSheetTouchableWrapper>
                )}
              />
            </View>
          </View>
          {transactions.length <= 1 && (
            <View
              style={{
                marginBottom: isFromAccount
                  ? hp('3%')
                  : AtCloseEnd
                  ? hp('12%') + 15
                  : hp('30%') + 15,
                ...styles.viewTransaction,
              }}
            >
              <Text style={styles.viewTransactionText}>
                View your transactions here
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                {infoBoxInfoText
                  ? infoBoxInfoText
                  : 'All your recent transactions across the accounts appear here'}
              </Text>
            </View>
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.modalContentContainer}>
          <View style={{ flex: 1 }}></View>
          <View style={{ backgroundColor: Colors.white }}>
            <View
              style={{
                ...styles.viewTransaction,
                marginBottom: isFromAccount ? hp('3%') : hp('12%') + 15,
              }}
            >
              <Text style={styles.viewTransactionText}>
                View your transactions here
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                {infoBoxInfoText
                  ? infoBoxInfoText
                  : 'All your recent transactions across the accounts appear here'}
              </Text>
            </View>
          </View>
        </View>
      );
    }
  }
};

export default memo(TransactionsContent);

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  view: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: wp('5%'),
    paddingBottom: wp('5%'),
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
  },
  view1: {
    backgroundColor: Colors.backgroundColor,
    height: wp('5%'),
    width: wp('5%'),
    borderRadius: wp('5%') / 2,
    marginLeft: 10,
    marginRight: 10,
  },
  view2: {
    backgroundColor: Colors.backgroundColor,
    height: wp('5%'),
    width: wp('25%'),
    borderRadius: 10,
  },
  view3: {
    backgroundColor: Colors.backgroundColor,
    height: wp('5%'),
    width: wp('35%'),
    marginTop: 5,
    borderRadius: 10,
  },
  view4: {
    backgroundColor: Colors.backgroundColor,
    height: wp('7%'),
    width: wp('20%'),
    borderRadius: 10,
  },
  view5: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: wp('8%') / 2,
    width: wp('8%'),
    height: wp('8%'),
    backgroundColor: Colors.white,
  },
  viewTransaction: {
    margin: 15,
    backgroundColor: Colors.backgroundColor,
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 7,
  },
  textNote: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
  },
  viewTransactionText: {
    color: Colors.blue,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
  },
  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 1,
    backgroundColor: Colors.borderColor,
  },
  transactionModalElementView: {
    backgroundColor: Colors.backgroundColor,
    padding: hp('1%'),
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
  },
  modalElementInfoView: {
    padding: hp('1%'),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(12),
    marginBottom: 3,
    fontFamily: Fonts.FiraSansRegular,
  },
  transactionModalDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
  },
  transactionModalAmountView: {
    padding: 10,
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  transactionModalAmountText: {
    marginLeft: 5,
    marginRight: 5,
    fontSize: RFValue(20),
    fontFamily: Fonts.OpenSans,
  },
  transactionModalAmountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(10),
    fontFamily: Fonts.OpenSans,
  },
});
