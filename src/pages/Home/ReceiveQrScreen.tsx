import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import QRCode from 'react-native-qrcode-svg';
import { REGULAR_ACCOUNT, SECURE_ACCOUNT, TEST_ACCOUNT, TRUSTED_CONTACTS } from '../../common/constants/serviceTypes';
import config from '../../bitcoin/HexaConfig'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import { UsNumberFormat } from '../../common/utilities';
import AccountShell from '../../common/data/models/AccountShell';
import SubAccountKind from '../../common/data/enums/SubAccountKind';
import Entypo from 'react-native-vector-icons/Entypo'
import CopyThisText from '../../components/CopyThisText';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import Ionicons from 'react-native-vector-icons/Ionicons'
import BottomInfoBox from '../../components/BottomInfoBox';
import { ScrollView } from 'react-native-gesture-handler';
import { DerivativeAccountTypes } from '../../bitcoin/utilities/Interface';
import { ExternalServiceSubAccountDescribing } from '../../common/data/models/SubAccountInfo/Interfaces';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import SecureAccount from '../../bitcoin/services/accounts/SecureAccount';
import { getAllAccountsData } from '../../store/actions/accounts';

export type Props = {
  navigation: any;
};

const ReceiveQrScreen: React.FC<Props> = ({
  navigation,
}: Props) => {
  const dispatch = useDispatch();
  const [receivingAddress, setReceivingAddress] = useState("sdfsfsdfsdf")
  const [hideShow, setHideShow] = useState(false)
  
  const allAccounts = useSelector(
    (state) => state.accounts.accounts,
  )
console.log(allAccounts);
  const [balances, setBalances] = useState({
    regularBalance: 0,
    secureBalance: 0,
  })
  const [selectedAccount, setSelectedAccount] = useState(null)

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
   dispatch(getAllAccountsData());
  }, [])

useEffect(() => {
  console.log("allAccounts",allAccounts, typeof allAccounts);
    setAccounts(allAccounts);
    //setSelectedAccount(allAccounts[0]);
}, [allAccounts])

  return (
    <View style={styles.rootContainer}>
      <ScrollView>
        <View style={styles.QRView}>
          <QRCode value={selectedAccount ? selectedAccount.receivingAddress : 'eert'} size={hp('27%')} />
        </View>

        <CopyThisText
          backgroundColor={Colors.white}
          text={selectedAccount ? selectedAccount.receivingAddress : ''}
        />

        <AppBottomSheetTouchableWrapper
          onPress={() => { }}
          style={styles.selectedView}
        >
          <View
            style={styles.text}
          >
            <Text style={styles.titleText}>{"Enter Amount to Receive"}</Text>
          </View>

          <View style={{
            marginLeft: 'auto'
          }}>
            <Ionicons
              name="chevron-forward"
              color={Colors.textColorGrey}
              size={15}
              style={styles.forwardIcon}
            />
          </View>
        </AppBottomSheetTouchableWrapper>

        {hideShow ? (
          <View style={styles.dropDownView}>
            {accounts.map((value) => {
              return (
                <AppBottomSheetTouchableWrapper activeOpacity={10} onPress={() => {
                  setHideShow(false)
                  setSelectedAccount(value)
                }}
                  style={{
                    ...styles.dropDownElement,
                  }}>
                  <View style={styles.imageView}>
                    <Image source={value.accountImage} style={{
                        width: wp('8%'), height: wp('8%')
                      }} />

                  </View>
                  <View style={{
                    marginLeft: wp('2%'), alignSelf: 'center',
                  }}>
                    <Text style={styles.accountName}>{value.accountName}</Text>
                    <Text style={styles.balanceText}>Balance {UsNumberFormat(value.balance)} sats</Text>
                  </View>
                </AppBottomSheetTouchableWrapper>
              )
            })}
          </View>
        ) : null}

        <View style={styles.text1}>
          <Text style={styles.titleText}>{"Receiving To: "}</Text>
        </View>
       {selectedAccount && <View
          style={{
            marginBottom: hp('2%'),
          }}
        >
          <AppBottomSheetTouchableWrapper activeOpacity={10} onPress={() => setHideShow(!hideShow)}
            style={{
              ...styles.dropDownElement,
              borderRadius: 10,
              borderColor: Colors.borderColor,
              borderWidth: 1,
              marginLeft: 20,
              marginRight: 20,
              marginBottom: 20,
            }}>
            <View style={styles.imageView}>
              <Image source={selectedAccount && selectedAccount.accountImage} style={{
                width: wp('10%'), height: wp('10%')
              }} />
            </View>
            <View style={{
              marginLeft: wp('2%'), alignSelf: 'center',
            }}>
              <Text style={styles.accountName}>{selectedAccount && selectedAccount.accountName
                ? selectedAccount.accountName
                : ''}</Text>
              <Text style={styles.balanceText}>Balance {selectedAccount ? selectedAccount.balance : ''} sats</Text>
            </View>
            <View style={{
              marginLeft: 'auto'
            }}>
              <Ionicons
                name="chevron-down-sharp"
                color={Colors.textColorGrey}
                size={15}
                style={styles.forwardIcon}
              />
            </View>
          </AppBottomSheetTouchableWrapper>

          </View> }
      </ScrollView>
      <View style={{ marginTop: 'auto' }}>
        <BottomInfoBox
          backgroundColor={Colors.white}
          title="Note"
          infoText="
          Scan a bitcoin address, a Hexa Friends and Family request, a Hexa Keeper request, or a restore request
        "
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColor1
  },
  text: {
    justifyContent: 'center', marginRight: 10, marginLeft: 10, flex: 1
  },
  text1: {
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    marginBottom: wp('5%')
  },
  forwardIcon: {
    marginLeft: wp('3%'),
    marginRight: wp('3%'),
    alignSelf: 'center',
  },
  QRView: {
    height: hp('30%'),
    justifyContent: 'center',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp('3%')
  },
  proceedButtonContainer: {
    zIndex: 2,
    elevation: 2,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  dropDownElement: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: wp('2%'),
    paddingBottom: wp('2%'),
    paddingLeft: wp('3%'),
    paddingRight: wp('3%'),
    width: wp('90%'),

  },
  dropDownElementTitleText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    marginBottom: 5,
  },
  cardBitCoinImage: {
    width: wp('4%'),
    height: wp('4%'),
    marginRight: 5,
    resizeMode: 'contain',
    marginBottom: wp('1%'),
  },
  cardAmountText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(17),
    marginRight: 5,
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  cardAmountUnitText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginTop: 'auto',
    lineHeight: RFValue(17),
  },
  dropDownView: {
    marginBottom: 10,
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
    backgroundColor: Colors.white,
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    overflow: 'hidden',
  },
  selectedView: {
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
    marginBottom: hp(4),
    marginTop: hp(2),
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  imageView: {
    width: wp('17%'), height: wp('17%'), backgroundColor: Colors.backgroundColor, borderRadius: wp('17%') / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    shadowRadius: 5,
    elevation: 10
  },
  accountName: {
    color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue(18)
  },
  balanceText: {
    color: Colors.blue, fontFamily: Fonts.FiraSansMediumItalic, fontSize: RFValue(10), marginTop: 5
  }
});


export default ReceiveQrScreen;


