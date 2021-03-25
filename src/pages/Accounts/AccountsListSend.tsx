import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Colors from '../../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import Fonts from './../../common/Fonts';
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import CardView from 'react-native-cardview';
import Entypo from 'react-native-vector-icons/Entypo';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
} from '../../common/constants/wallet-service-types';
import config from '../../bitcoin/HexaConfig';
import LabeledBalanceDisplay from '../../components/LabeledBalanceDisplay';

const AccountsListSend = ({
  balances,
  accounts,
  onSelectContact,
  checkedItem,

  // TODO: This component shouldn't be concerned about the screen it came from.
  // (And a screen called "AddNewAccount" probably shouldn't be trying to use something
  // called "AccountsListSend" 😃).
  fromAddNewAccount,
}) => {

  const balance = useMemo(() => {
    if (accounts.id === REGULAR_ACCOUNT) {
      return balances.regularBalance;
    } else if (accounts.id === SECURE_ACCOUNT) {
      return balances.secureBalance;
    } else if (
      config.EJECTED_ACCOUNTS.includes(accounts.id) &&
      balances.additionalBalances
    ) {
      return balances.additionalBalances[
        accounts.type + accounts.id + accounts.account_number
      ];
    } else {
      return 0;
    }
  }, [accounts]);

  const balanceTextStyle = useMemo(() => {
    return {
      ...styles.accountBalance,
      color: checkedItem ? Colors.white : Colors.borderColor,
    };
  }, [accounts]);

  return (
    <TouchableOpacity
      style={styles.accountView}
      onPress={() => onSelectContact(accounts)}
    >
      <CardView
        cornerRadius={10}
        opacity={1}
        style={{
          ...styles.card,
          backgroundColor: checkedItem ? Colors.lightBlue : Colors.white,
        }}
      >
        <View style={styles.imageView}>
          <Image
            style={styles.image}
            source={accounts.image}
          />
          <Text
            style={{
              ...styles.accountName,
              color: checkedItem ? Colors.white : Colors.black,
            }}
          >
            {accounts.account_name}
          </Text>

          {!fromAddNewAccount && (
            <LabeledBalanceDisplay
              balance={balance}
              currencyImageStyle={balanceTextStyle}
              amountTextStyle={balanceTextStyle}
              unitTextStyle={balanceTextStyle}
            />
          )}

          <View style={{ marginTop: wp('5%'), marginBottom: 7 }}>
            <TouchableOpacity
              onPress={() => onSelectContact(accounts)}
              style={{
                ...styles.checkedItem,
                borderColor: checkedItem ? Colors.blue : Colors.borderColor,
                backgroundColor: checkedItem ? Colors.blue : Colors.white,
              }}
            >
              {checkedItem && (
                <Entypo
                  name={'check'}
                  size={RFValue(12)}
                  color={Colors.white}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CardView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: wp('30%'),
    height: wp('35%'),
    marginLeft: 15,
    flexDirection: 'row',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountView: {
    height: wp('40%'),
    justifyContent: 'center',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  imageView: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 2,
    marginRight: 2,
  },
  image: {
    width: wp('10%'),
    height: wp('10%'),
    alignSelf: 'center',
    resizeMode: "contain",
  },
  accountName: {
    fontSize: RFValue(10),
    fontWeight: '500',
    textAlign: 'center',
    alignSelf: 'center',
  },
  accountBalance: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    marginTop: 5,
    alignSelf: 'center',
  },
  checkedItem: {
    height: wp('5%'),
    width: wp('5%'),
    borderRadius: wp('5%') / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(AccountsListSend);
