import React, { useState, useEffect, useCallback, Component } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
  ActivityIndicator,
} from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import DeviceInfo from 'react-native-device-info'
import BottomSheet from 'reanimated-bottom-sheet'

import AntDesign from 'react-native-vector-icons/AntDesign'
import { UsNumberFormat } from '../../common/utilities'
import { ScrollView } from 'react-native-gesture-handler'
import {
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  TRUSTED_CONTACTS,
  TEST_ACCOUNT,
} from '../../common/constants/wallet-service-types'

import config from '../../bitcoin/HexaConfig'
import { connect } from 'react-redux'
import { withNavigationFocus } from 'react-navigation'
import idx from 'idx'
import ModalHeader from '../../components/ModalHeader'
import RemoveSelectedAcoount from './RemoveSelectedAccount'
import BottomInfoBox from '../../components/BottomInfoBox'

interface SweepFundsPropsTypes {
  navigation: any;
  service: any;
  transfer: any;
  accounts: any;
  loading: any;
  transferST1: any;
  removeTransferDetails: any;
  clearTransfer: any;
  addTransferDetails: any;
  currencyCode: any;
  currencyToggleValue: any;
  setCurrencyToggleValue: any;
  averageTxFees: any;
  setAverageTxFee: any;
}

interface SweepFundsStateTypes {
  RegularAccountBalance: any;
  SavingAccountBalance: any;
  exchangeRates: any[];
  removeItem: any;
  recipients: any[];
  spendableBalances: any;
  address: any;
  totalAmount: any;
  accountData: any[];
}

class SweepFunds extends Component<SweepFundsPropsTypes, SweepFundsStateTypes> {
  constructor( props ) {
    super( props )
    this.state = {
      RegularAccountBalance: 0,
      SavingAccountBalance: 0,
      exchangeRates: null,
      address: this.props.navigation.getParam( 'address' ),
      removeItem: {
      },
      recipients: [],
      spendableBalances: {
        testBalance: 0,
        regularBalance: 0,
        secureBalance: 0,
      },
      totalAmount: 0,
      accountData: [
        {
          id: 1,
          account_name: 'Checking Account',
          type: REGULAR_ACCOUNT,
          checked: false,
          image: require( '../../assets/images/icons/icon_regular_account.png' ),
        },
        {
          id: 2,
          account_name: 'Savings Account',
          type: SECURE_ACCOUNT,
          checked: false,
          image: require( '../../assets/images/icons/icon_secureaccount_white.png' ),
        },
      ],
    }
  }

  componentDidMount = () => {
    this.getBalance()
    BackHandler.addEventListener( 'hardwareBackPress', () => {} )
  };

  componentDidUpdate = ( prevProps, prevState ) => {};

  getBalance = () => {
    const { accounts } = this.props
    const testBalance = accounts[ TEST_ACCOUNT ].service
      ? accounts[ TEST_ACCOUNT ].service.hdWallet.balances.balance
      : // +  accounts[TEST_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      0

    let regularBalance = accounts[ REGULAR_ACCOUNT ].service
      ? accounts[ REGULAR_ACCOUNT ].service.hdWallet.balances.balance
      : // +  accounts[REGULAR_ACCOUNT].service.hdWallet.balances.unconfirmedBalance
      0

    // regular derivative accounts
    for ( const dAccountType of Object.keys( config.DERIVATIVE_ACC ) ) {
      const derivativeAccount =
        accounts[ REGULAR_ACCOUNT ].service.hdWallet.derivativeAccounts[
          dAccountType
        ]
      if ( derivativeAccount.instance.using ) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          if ( derivativeAccount[ accountNumber ].balances ) {
            regularBalance += derivativeAccount[ accountNumber ].balances.balance
            // + derivativeAccount[accountNumber].balances.unconfirmedBalance;
          }
        }
      }
    }

    let secureBalance = accounts[ SECURE_ACCOUNT ].service
      ? accounts[ SECURE_ACCOUNT ].service.secureHDWallet.balances.balance
      : // + accounts[SECURE_ACCOUNT].service.secureHDWallet.balances
    //      .unconfirmedBalance
      0

    // secure derivative accounts
    for ( const dAccountType of Object.keys( config.DERIVATIVE_ACC ) ) {
      if ( dAccountType === TRUSTED_CONTACTS ) continue

      const derivativeAccount =
        accounts[ SECURE_ACCOUNT ].service.secureHDWallet.derivativeAccounts[
          dAccountType
        ]
      if ( derivativeAccount.instance.using ) {
        for (
          let accountNumber = 1;
          accountNumber <= derivativeAccount.instance.using;
          accountNumber++
        ) {
          if ( derivativeAccount[ accountNumber ].balances ) {
            secureBalance += derivativeAccount[ accountNumber ].balances.balance
            // +derivativeAccount[accountNumber].balances.unconfirmedBalance;
          }
        }
      }
    }
    this.setState( {
      spendableBalances: {
        testBalance,
        regularBalance,
        secureBalance,
      },
      RegularAccountBalance: regularBalance,
      SavingAccountBalance: secureBalance,
    } )
  };

  render() {
    const {
      address,
      accountData,
      spendableBalances,
      SavingAccountBalance,
      RegularAccountBalance,
      removeItem,
    } = this.state

    return (
      <View
        style={{
          height: hp( '100%' ),
          backgroundColor: Colors.white,
        }}
      >
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={styles.view}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.goBack()
              }}
              style={styles.backArrow}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>

            <View style={{
              marginLeft: wp( '2.5%' )
            }}>
              <Text style={styles.modalHeaderTitleText}>{'Sweep Funds'}</Text>
              <Text style={styles.sendText}>
                {'Sweeping to: '}
                <Text style={styles.availableToSpendText}>
                  {'Address '}
                  <Text style={styles.addessText}>
                    {address ? address : ''}
                  </Text>
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.totalMountView}>
          <View>
            <Text style={styles.totalAmountText}>Use Available Funds</Text>
            <Text style={styles.totalAmountSubText}>
              Lorem ipsum dolor sit amet
            </Text>
          </View>
          <View style={styles.totalAmountOuterView}>
            <View style={styles.totalAmountInnerView}>
              <View style={styles.amountInputImage}>
                <Image
                  style={styles.textBoxImage}
                  source={require( '../../assets/images/icons/icon_bitcoin_gray.png' )}
                />
              </View>
              <View style={styles.totalAmountView} />
              <Text style={styles.amountText}>
                {UsNumberFormat( spendableBalances )}
                {/* {totalAmount} */}
              </Text>
              <Text style={styles.amountUnitText}>{' sats'}</Text>
            </View>
          </View>
        </View>
        <View style={{
          width: wp( '85%' ), alignSelf: 'center'
        }}>
          <ScrollView horizontal={true}>
            {accountData.map( ( item ) => {
              return (
                <View style={styles.view1}>
                  <View style={{
                    flexDirection: 'row'
                  }}>
                    <Image source={item.image} style={styles.circleShapeView} />
                    <TouchableOpacity
                      style={styles.closeMarkStyle}
                      onPress={() => {
                        setTimeout( () => {
                          this.setState( {
                            removeItem: item
                          } )
                        }, 2 );
                        ( this.refs.RemoveBottomSheet as any ).snapTo( 1 )
                      }}
                    >
                      <AntDesign
                        size={16}
                        color={Colors.blue}
                        name={'closecircle'}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.account_name}
                  </Text>
                  <Text
                    style={{
                      ...styles.amountText,
                      fontSize: RFValue( 10 ),
                      color: Colors.blue,
                    }}
                  >
                    {item.type == REGULAR_ACCOUNT
                      ? RegularAccountBalance
                      : item.type == SECURE_ACCOUNT
                        ? SavingAccountBalance
                        : '' + 'sats'}
                  </Text>
                </View>
              )
            } )}
          </ScrollView>
        </View>
        <View style={styles.dividerView} />
        <View style={styles.parentView}>
          <TouchableOpacity style={{
            marginLeft: 25,
            marginRight: 25,
            paddingBottom: 10,
            paddingTop: 10,
          }}
          onPress={()=> {this.props.navigation.replace( 'SweepFundsEnterAmount' )}}>
            <Text
              style={{
                fontFamily: Fonts.FiraSansMediumItalic,
                fontWeight: 'bold',
                fontStyle: 'italic',
                fontSize: RFValue( 13 ),
                color: Colors.blue,
              }}
              onPress={()=> {this.props.navigation.replace( 'SweepFundsEnterAmount' )}}
            >
                or Enter Amount
            </Text>
            <Text
              style={{
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue( 12 ),
                color: Colors.textColorGrey,
              }}
            >
                Lorem ipsum dolor sit
            </Text>
          </TouchableOpacity>
          <View style={styles.dividerView} />
          <View style={{
            marginTop: 'auto'
          }}>
            <View
              style={{
                marginTop: wp( '1.5%' ),
                marginBottom: -25,
                padding: -20,
                marginLeft: -20,
                marginRight: -20,
              }}
            >
              <BottomInfoBox
                backgroundColor={Colors.white}
                title={'Note'}
                infoText={
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'
                }
              />
            </View>
            <View style={styles.confirmView}>
              <TouchableOpacity
                onPress={() => {this.props.navigation.navigate( 'SweepFundUseExitKey' )}}
                style={{
                  ...styles.confirmButtonView,
                  backgroundColor: Colors.blue,
                  elevation: 10,
                  shadowColor: Colors.shadowBlue,
                  shadowOpacity: 1,
                  shadowOffset: {
                    width: 15, height: 15
                  },
                }}
              >
                <Text style={styles.buttonText}>{'Confirm & Proceed'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'RemoveBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '50%' )
              : hp( '50%' ),
          ]}
          renderContent={() => {
            if (
              Object.keys( removeItem ).length != 0 &&
              removeItem.constructor === Object
            ) {
              return (
                <RemoveSelectedAcoount
                  selectedAccount={removeItem}
                  onPressBack={() => {
                    if ( this.refs.RemoveBottomSheet )
                      ( this.refs.RemoveBottomSheet as any ).snapTo( 0 )
                  }}
                  onPressDone={() => {
                    // setTimeout(() => {
                    //   removeTransferDetails(serviceType, removeItem);
                    // }, 2);
                    ( this.refs.RemoveBottomSheet as any ).snapTo( 0 )
                  }}
                />
              )
            }
          }}
          renderHeader={() => {
            return (
              <ModalHeader
                onPressHeader={() => {
                  if ( this.refs.RemoveBottomSheet )
                    ( this.refs.RemoveBottomSheet as any ).snapTo( 0 )
                }}
              />
            )
          }
          }
        />
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    service: idx( state, ( _ ) => _.accounts ),
    transfer: idx( state, ( _ ) => _.accounts ),
    loading: idx( state, ( _ ) => _.accounts ),
    accounts: state.accounts || [],
    averageTxFees: idx( state, ( _ ) => _.accounts.averageTxFees ),
  }
}

export default withNavigationFocus( connect( mapStateToProps, {
} )( SweepFunds ) )

const styles = StyleSheet.create( {
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  view: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  view1: {
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '15%' ),
  },
  name: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    marginTop: 5,
    width: wp( '15%' ),
  },
  amountText: {
    color: Colors.black,
    fontSize: RFValue( 21 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  dividerView: {
    alignSelf: 'center',
    width: wp( '90%' ),
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    marginBottom: hp( '1%' ),
    marginTop: hp( '2%' ),
  },
  parentView: {
    flex:1,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: wp( '5%' ),
  },
  backArrow: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  sendText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12 ),
    marginTop: 5,
  },
  confirmView: {
    flexDirection: 'row',
    marginTop: hp( '2%' ),
    marginBottom: hp( '4%' ),
  },
  currencyImageView: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  convertText: {
    width: 2,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
  enterAmountView: {
    width: 2,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
  toggleSwitchView: {
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfoView: {
    marginTop: wp( '1.5%' ),
    marginBottom: -25,
    padding: -20,
    marginLeft: -20,
    marginRight: -20,
  },
  availableToSpendView: {
    alignSelf: 'center',
    width: wp( '90%' ),
    marginBottom: hp( '2%' ),
    marginTop: hp( '2%' ),
    flexDirection: 'row',
    paddingBottom: hp( '1.5%' ),
    paddingTop: hp( '1%' ),
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
    textAlign: 'center',
  },
  addessText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
  },
  textTsats: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 7 ),
    fontFamily: Fonts.FiraSansMediumItalic,
  },
  errorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.red,
    fontSize: RFValue( 11 ),
    fontStyle: 'italic',
    marginRight: 10,
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp( '1.5%' ),
    paddingTop: hp( '1%' ),
    marginBottom: hp( '0.5%' ),
    width: wp( '90%' ),
  },
  textBoxView: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.borderColor,
  },
  inputBoxFocused: {
    borderRadius: 10,
    elevation: 10,
    borderColor: Colors.borderColor,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowColor: Colors.borderColor,
    backgroundColor: Colors.white,
  },
  textBoxImage: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: wp( '13%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
  },
  confirmButtonView: {
    width: wp( '50%' ),
    height: wp( '13%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  circleShapeView: {
    width: wp( '14%' ),
    height: wp( '14%' ),
    borderRadius: wp( '14%' ) / 2,
    borderColor: Colors.white,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    elevation: 10,
  },
  closeMarkStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    elevation: 10,
  },
  totalMountView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp( '2%' ),
    marginBottom: hp( '2%' ),
    marginRight: wp( '6%' ),
    marginLeft: wp( '6%' ),
    paddingBottom: hp( '1%' ),
    // paddingTop: hp('1.5%'),
  },
  totalAmountText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  totalAmountSubText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  totalAmountOuterView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  totalAmountInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  totalAmountView: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.borderColor,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'center',
  },
  amountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: 5,
  },
} )
