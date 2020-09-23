import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Colors from '../../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import Fonts from './../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { UsNumberFormat } from '../../common/utilities';
import CardView from 'react-native-cardview';
import Entypo from 'react-native-vector-icons/Entypo';
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  DONATION_ACCOUNT,
} from '../../common/constants/serviceTypes';

const AccountsListSend = ({
  balances,
  accounts,
  onSelectContact,
  checkedItem,
}) => {
  // console.log("Items,", accounts);
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
            resizeMode={'contain'}
          />
          <Text
            style={{
              ...styles.accountName,
              color: checkedItem ? Colors.white : Colors.black,
            }}
          >
            {accounts.account_name}
          </Text>
          <Text
            style={{
              ...styles.accountBalance,
              color: checkedItem ? Colors.white : Colors.borderColor,
            }}
          >
            {accounts.id === REGULAR_ACCOUNT
              ? '$' + UsNumberFormat(balances.regularBalance)
              : accounts.id === SECURE_ACCOUNT
              ? '$' + UsNumberFormat(balances.secureBalance)
              : accounts.id === DONATION_ACCOUNT && balances.donationsBalance
              ? '$' +
                UsNumberFormat(
                  balances.donationsBalance[
                    accounts.type + accounts.account_number
                  ],
                )
              : 0}
          </Text>
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
    resizeMode: 'center',
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
