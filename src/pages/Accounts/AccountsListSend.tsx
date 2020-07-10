import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
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
  } from '../../common/constants/serviceTypes';
  
const AccountsListSend = ({ balances, accounts, onSelectContact, checkedItem }) => {
   // console.log("Items,", accounts);
  return (
    <TouchableOpacity
          style={{
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
          }}
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
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                marginLeft: 2,
                marginRight: 2,
              }}
            >
              <Image
                style={{
                  width: wp('10%'),
                  height: wp('10%'),
                  alignSelf: 'center',
                }}
                source={accounts.image}
              />
              <Text
                style={{
                  color: checkedItem ? Colors.white : Colors.black,
                  fontSize: RFValue(10),
                  fontWeight: '500',
                  textAlign: 'center',
                  alignSelf: 'center',
                }}
              >
                {accounts.account_name}
              </Text>
              <Text
                style={{
                  color: checkedItem ? Colors.white : Colors.borderColor,
                  fontSize: RFValue(10),
                  fontFamily: Fonts.FiraSansRegular,
                  textAlign: 'center',
                  marginTop: 5,
                  alignSelf: 'center',
                }}
              >
                {accounts.type === REGULAR_ACCOUNT
                  ? '$' + UsNumberFormat(balances.regularBalance)
                  : '$' + UsNumberFormat(balances.secureBalance)}
              </Text>
              <View style={{ marginTop: wp('5%'), marginBottom: 7 }}>
                <TouchableOpacity
                  onPress={() => onSelectContact(accounts)}
                  style={{
                    height: wp('5%'),
                    width: wp('5%'),
                    borderRadius: wp('5%') / 2,
                    borderWidth: 1,
                    borderColor: checkedItem ? Colors.blue : Colors.borderColor,
                    justifyContent: 'center',
                    alignItems: 'center',
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
});

export default memo(AccountsListSend);
