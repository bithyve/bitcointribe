import React, { PureComponent } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  AsyncStorage,
  Linking,
  Alert,
} from 'react-native';
import Fonts from '../../common/Fonts';
import BottomSheet from 'reanimated-bottom-sheet';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../common/Colors';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  SECURE_ACCOUNT,
  REGULAR_ACCOUNT,
  DONATION_ACCOUNT
} from '../../common/constants/serviceTypes';
import AccountsListSend from './AccountsListSend';
import ModalHeader from '../../components/ModalHeader';
import { ScrollView } from 'react-native-gesture-handler';
import CheckBox from '../../components/CheckBox';

interface AddNewAccountStateTypes {
  selectedAccount: any;
  accountName: string;
  isValid: boolean;
  modelDescription: string;
  modelTitle: string;
  modelButtonIsValid: boolean;
  is2FAEnable: boolean;
}

interface AddNewAccountPropsTypes {
  navigation: any;
}
const accountData = [
  {
    id: REGULAR_ACCOUNT,
    account_name: 'Checking Account',
    type: REGULAR_ACCOUNT,
    checked: false,
    image: require('../../assets/images/icons/icon_regular_account.png'),
  },
  {
    id: SECURE_ACCOUNT,
    account_name: 'Savings Account',
    type: SECURE_ACCOUNT,
    checked: false,
    image: require('../../assets/images/icons/icon_secureaccount_white.png'),
  },
  {
    id: DONATION_ACCOUNT,
    account_name: 'Donation Account',
    type: DONATION_ACCOUNT,
    checked: false,
    image: require('../../assets/images/icons/icon_donation_account.png'), //icon_donation_white
  },
]
class AddNewAccount extends PureComponent<AddNewAccountPropsTypes, AddNewAccountStateTypes> {
  AccountDetailBottomSheet: any;

  constructor(props) {
    super(props);
    this.state = {
      selectedAccount: '',
      accountName: '',
      isValid: true,
      modelTitle: '',
      modelDescription: '',
      modelButtonIsValid: true,
      is2FAEnable: false,
    }
    this.AccountDetailBottomSheet = React.createRef();
  }

  onSelectContact = (item) => {
    this.setState({
      selectedAccount: item,
    });
  }

  handleOnTextChange = (name, text) => {
    if (name === 'modelTitle') {
      this.setState({
        modelTitle: text
      });
    } else if (name === 'modelDescription') {
      this.setState({
        modelDescription: text
      });
    }
    text.trim().length > 0 ? this.setState({ modelButtonIsValid: false }) : this.setState({ modelButtonIsValid: true });
  }

  renderAccountDetailModalHeader = () => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (this.AccountDetailBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  };

  renderAccountDetailModalContent = () => {
    return (
      <ScrollView style={{ height: '100%' }}>
        <View style={{ ...styles.modalContentContainer, height: '100%' }}>
          <View style={{ height: '100%', marginHorizontal: wp('8%') }}>
            <View style={styles.successModalHeaderView}>
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue(18),
                  fontFamily: Fonts.FiraSansMedium,
                }}
              >
                Enter details for Donation Account
            </Text>
              <Text
                style={{
                  ...styles.modalInfoText,
                  marginTop: wp('1.5%'),
                  color: Colors.lightTextColor,
                }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </Text>
            </View>
            <View style={styles.modalTextBoxView}>
              <TextInput
                style={styles.textBox}
                placeholder={'Enter account name'}
                keyboardType={
                  Platform.OS == 'ios'
                    ? 'ascii-capable'
                    : 'visible-password'
                }
                value={this.state.modelTitle}
                onChangeText={(text) => {
                  this.handleOnTextChange('modelTitle', text);
                }}
                placeholderTextColor={Colors.borderColor}
                returnKeyType="done"
                returnKeyLabel="Done"
              />
            </View>
            <View style={styles.modalTextBoxView}>
              <TextInput
                style={styles.textBox}
                placeholder={'Enter a description'}
                keyboardType={
                  Platform.OS == 'ios'
                    ? 'ascii-capable'
                    : 'visible-password'
                }
                value={this.state.modelDescription}
                onChangeText={(text) => {
                  this.handleOnTextChange('modelDescription', text);
                }}
                placeholderTextColor={Colors.borderColor}
                returnKeyType="done"
                returnKeyLabel="Done"
              />
            </View>
            <View style={styles.greyBoxView}>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20 }}>
                <Text style={styles.modalInfoText}>Enable 2 Factor Aunthentication</Text>
                <CheckBox
                  size={26}
                  borderRadius={5}
                  color={Colors.lightBlue}
                  borderColor={Colors.borderColor}
                  isChecked={this.state.is2FAEnable}
                  onpress={() => {
                    this.setState({
                      is2FAEnable: !this.state.is2FAEnable
                    });
                  }} />
              </View>
            </View>
            <View style={{ marginVertical: 15, marginLeft: 10 }}>
              <Text style={styles.modalInfoText}>
                By clicking proceed you agree to our{' '}
                <Text style={{
                  fontFamily: Fonts.FiraSansItalic,
                  color: Colors.blue,
                  fontSize: RFValue(11),
                }}>
                  Terms and Conditions
            </Text>
              </Text>
            </View>
            <View
              style={{
                marginVertical: 20,
              }}
            >
              <AppBottomSheetTouchableWrapper
                style={{
                  ...styles.bottomButtonView, backgroundColor: this.state.modelButtonIsValid
                    ? Colors.lightBlue
                    : Colors.blue,
                }}
                disabled={this.state.modelButtonIsValid}
                onPress={() => {
                  this.props.navigation.navigate('Accounts');
                }}
              >
                <Text style={styles.buttonText}>Proceed</Text>
              </AppBottomSheetTouchableWrapper>
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar
          backgroundColor={Colors.backgroundColor}
          barStyle="dark-content"
        />
        <View style={styles.modalHeaderTitleView}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={{
                height: 30,
                width: 30,
                justifyContent: 'center',
              }}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <View style={{ marginLeft: wp('2.5%') }}>
              <Text style={styles.modalHeaderTitleText}>Add New Account</Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.FiraSansRegular,
                  fontSize: RFValue(12),
                }}
              >
                Select an account type and enter a name
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            borderRadius: 10,
            marginHorizontal: 16,
            marginVertical: 20,
            paddingRight: 10,
            height: wp('40%'),
            alignItems: 'center',
            backgroundColor: Colors.backgroundColor,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: Colors.white,
              height: wp('12%'),
              width: wp('6%'),
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              borderRadius: 5,
              marginLeft: 10,
            }}
          >
            <Ionicons
              name={'ios-arrow-back'}
              size={RFValue(20)}
              color={Colors.borderColor}
            />
          </TouchableOpacity>
          <FlatList
            data={accountData}
            horizontal
            nestedScrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={(Items) => {
              const checked = Items.item.id === this.state.selectedAccount.id ? true : false;
              return (
                <AccountsListSend
                  accounts={Items.item}
                  balances={0}
                  checkedItem={checked}
                  onSelectContact={this.onSelectContact}
                />
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            extraData={this.state.selectedAccount}
          />
        </View>
        <View style={styles.textBoxView}>
          <TextInput
            style={styles.textBox}
            placeholder={'Enter account name'}
            keyboardType={
              Platform.OS == 'ios'
                ? 'ascii-capable'
                : 'visible-password'
            }
            value={this.state.accountName}
            onChangeText={(text) => {
              text.trim().length > 0 ? this.setState({ isValid: false }) : this.setState({ isValid: true });
              this.setState({
                accountName: text,
              });
            }}
            placeholderTextColor={Colors.borderColor}
            returnKeyType="done"
            returnKeyLabel="Done"
          />
        </View>
        <View
          style={{
            marginHorizontal: 16,
            marginVertical: 20,
          }}
        >
          <AppBottomSheetTouchableWrapper
            style={{
              ...styles.bottomButtonView, backgroundColor: this.state.isValid
                ? Colors.lightBlue
                : Colors.blue,
            }}
            disabled={this.state.isValid}
            onPress={() => {
              (this.AccountDetailBottomSheet as any).current.snapTo(1);
            }}
          >
            <Text style={styles.buttonText}>Proceed</Text>
          </AppBottomSheetTouchableWrapper>
        </View>
        <BottomSheet
          enabledInnerScrolling={true}
          ref={this.AccountDetailBottomSheet as any}
          snapPoints={[
            -50, hp('85%'),
          ]}
          renderContent={this.renderAccountDetailModalContent}
          renderHeader={this.renderAccountDetailModalHeader}
        />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: wp('13%'),
    marginHorizontal: 16,
    marginVertical: 20
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
  bottomButtonView: {
    height: 50,
    width: wp('40%'),
    backgroundColor: Colors.blue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    marginBottom: 20,
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginTop: wp('6%'),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalTextBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: wp('13%'),
    marginVertical: 10
  },
  greyBoxView: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    height: wp('13%'),
    marginVertical: 10
  },
})
export default AddNewAccount;