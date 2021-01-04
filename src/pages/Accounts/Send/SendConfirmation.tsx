import React, { Component } from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  AsyncStorage,
  Platform,
  Keyboard,
  FlatList,
} from 'react-native'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import {
  transferST2,
  clearTransfer,
  fetchBalanceTx,
  syncViaXpubAgent,
  fetchDerivativeAccBalTx,
  alternateTransferST2,
} from '../../../store/actions/accounts'
import { UsNumberFormat, timeConvertNear30 } from '../../../common/utilities'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../../components/ModalHeader'
import SendConfirmationContent from '../SendConfirmationContent'
import { createRandomString } from '../../../common/CommonFunctions/timeFormatter'
import moment from 'moment'
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
  DONATION_ACCOUNT,
} from '../../../common/constants/serviceTypes'
import RelayServices from '../../../bitcoin/services/RelayService'
import {
  INotification,
  notificationTag,
  notificationType,
} from '../../../bitcoin/utilities/Interface'
import { withNavigationFocus } from 'react-navigation'
import { connect } from 'react-redux'
import idx from 'idx'
import DeviceInfo from 'react-native-device-info'
import TestAccountHelperModalContents from '../../../components/Helper/TestAccountHelperModalContents'
import SmallHeaderModal from '../../../components/SmallHeaderModal'
import RadioButton from '../../../components/RadioButton'
import CustomPriorityContent from '../CustomPriorityContent'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import Loader from '../../../components/loader'
import {
  RecipientDescribing,
  makeSubAccountRecipientDescription,
  makeContactRecipientDescription,
} from '../../../common/data/models/interfaces/RecipientDescribing'
import ConfirmedRecipientCarouselItem from '../../../components/send/ConfirmedRecipientCarouselItem'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import { SATOSHIS_IN_BTC } from '../../../common/constants/Bitcoin'
import { processRecipients } from '../../../store/sagas/accounts'
import { AccountsState } from '../../../store/reducers/accounts'
import { NodeSettingsState } from '../../../store/reducers/nodeSettings'

interface SendConfirmationStateTypes {
  selectedRecipients: unknown[];
  CurrencyCode: string;
  totalAmount: any;
  sliderValue: any;
  sliderValueText: string;
  exchangeRates: any;
  transfer: any;
  loading: any;
  isConfirmDisabled: boolean;
  customFeePerByte: string;
  customEstimatedBlock: number;
  customFeePerByteErr: string;
  customTxPrerequisites: any;
  derivativeAccountDetails: { type: string; number: number };
  showLoader: boolean;
}

interface SendConfirmationPropsTypes {
  navigation: any;
  accounts: AccountsState;
  nodeSettings: NodeSettingsState;
  WALLET_SETUP: any;
  trustedContactsService: any;
  exchangeRates: any;
  fetchBalanceTx: any;
  syncViaXpubAgent: any;
  fetchDerivativeAccBalTx: any;
  clearTransfer: any;
  alternateTransferST2: any;
  transferST2: any;
  currencyCode: any;
  currencyKind: CurrencyKind;
}
class SendConfirmation extends Component<
  SendConfirmationPropsTypes,
  SendConfirmationStateTypes
> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  NoInternetBottomSheet: any;
  unsubscribe: any;
  serviceType: any;
  recipients: any;
  sweepSecure: any;
  donationId: string;
  spendableBalance: any;
  transfer: any;
  loading: any;
  viewRef: any;
  isSendMax: boolean;
  feeIntelAbsent: boolean;

  constructor( props ) {
    super( props )
    this.serviceType = this.props.navigation.getParam( 'serviceType' )
    this.recipients = this.props.navigation.getParam( 'recipients' )
    this.sweepSecure = props.navigation.getParam( 'sweepSecure' )
    this.spendableBalance = props.navigation.getParam( 'spendableBalance' )
    this.isSendMax = props.navigation.getParam( 'isSendMax' )
    this.donationId = props.navigation.getParam( 'donationId' )
    this.feeIntelAbsent =  this.props.navigation.getParam(
      'feeIntelAbsent',
    )
    if ( this.isSendMax ) {
      setTimeout( () => {
        this.onPrioritySelect( 'Low Fee' )
      }, 2 )
    }
    this.viewRef = React.createRef()

    this.state = {
      selectedRecipients: [],
      CurrencyCode: 'USD',
      totalAmount: 0,
      sliderValue: 0,
      sliderValueText: 'Low Fee',
      exchangeRates: this.props.exchangeRates,
      transfer: {
      },
      loading: {
      },
      isConfirmDisabled: false,
      customFeePerByte: '',
      customFeePerByteErr: '',
      customEstimatedBlock: 0,
      customTxPrerequisites: null,
      derivativeAccountDetails: this.props.navigation.getParam(
        'derivativeAccountDetails',
      ),
      showLoader: false,
    }
  }

  componentDidMount = () => {
    const { accounts } = this.props
    if ( accounts[ this.serviceType ].transfer.details ) {
      let totalAmount = 0
      accounts[ this.serviceType ].transfer.details.map( ( item ) => {
        totalAmount += parseInt( item.bitcoinAmount )
      } )
      if ( totalAmount ) this.setState( {
        totalAmount: totalAmount 
      } )
    }
    this.setState( {
      transfer: accounts[ this.serviceType ].transfer,
      selectedRecipients: accounts[ this.serviceType ].transfer.details,
      loading: accounts[ this.serviceType ].loading,
    } )
    this.onChangeInTransfer()
    this.setCurrencyCodeFromAsync()
  };

  componentDidUpdate = ( prevProps ) => {
    if ( prevProps.exchangeRates !== this.props.exchangeRates ) {
      this.setState( {
        exchangeRates: this.props.exchangeRates 
      } )
    }

    if (
      prevProps.accounts[ this.serviceType ].transfer !==
      this.props.accounts[ this.serviceType ].transfer
    ) {
      this.setState( {
        transfer: this.props.accounts[ this.serviceType ].transfer,
      } )
      setTimeout( () => {
        this.onChangeInTransfer()
      }, 10 )
    }

    if (
      prevProps.accounts[ this.serviceType ].loading !==
      this.props.accounts[ this.serviceType ].loading
    ) {
      this.setState( {
        loading: this.props.accounts[ this.serviceType ].loading 
      } )
    }
  };

  sendNotifications = () => {
    const { WALLET_SETUP, trustedContactsService } = this.props
    const { transfer } = this.state
    const receivers = []
    transfer.details.forEach( ( details ) => {
      if ( details.selectedContact && details.selectedContact.displayedName ) {
        const { displayedName } = details.selectedContact
        const contactName = displayedName.toLowerCase().trim()

        const recipient =
          trustedContactsService.tc.trustedContacts[ contactName ]
        if ( recipient.walletID && recipient.FCMs.length )
          receivers.push( {
            walletId: recipient.walletID,
            FCMs: recipient.FCMs,
          } )
      }
    } )
    const notification: INotification = {
      notificationType: notificationType.contact,
      title: 'Friends and Family notification',
      body: `You have a new transaction from ${WALLET_SETUP.walletName}`,
      data: {
      },
      tag: notificationTag.IMP,
    }
    RelayServices.sendNotifications( receivers, notification ).then( console.log )
  };

  onChangeInTransfer = () => {
    const { transfer } = this.state
    if ( transfer.details ) {
      let totalAmount = 0
      transfer.details.map( ( item ) => {
        totalAmount += parseInt( item.bitcoinAmount )
      } )
      if ( totalAmount ) this.setState( {
        totalAmount: totalAmount 
      } )
    }

    if ( transfer.stage2 && transfer.stage2.failed ) {
      this.setState( {
        isConfirmDisabled: false, showLoader: false 
      } )
      setTimeout( () => {
        ( this.refs.SendUnSuccessBottomSheet as any ).snapTo( 1 )
      }, 2 )
    } else if ( transfer.txid ) {
      if ( this.donationId ) {
        if ( transfer.details[ 0 ].note ) {
          const txNote = {
            txId: transfer.txid,
            note: transfer.details[ 0 ].note,
          }
          RelayServices.sendDonationNote( this.donationId, txNote )
        }
      }

      this.sendNotifications()

      this.storeTrustedContactsHistory( transfer.details )
      if ( this.state.derivativeAccountDetails ) {
        if ( this.state.derivativeAccountDetails.type === DONATION_ACCOUNT )
          this.props.syncViaXpubAgent(
            this.serviceType,
            this.state.derivativeAccountDetails.type,
            this.state.derivativeAccountDetails.number,
          )
        else
          this.props.fetchDerivativeAccBalTx(
            this.serviceType,
            this.state.derivativeAccountDetails.type,
            this.state.derivativeAccountDetails.number,
          )
      } else {
        this.props.fetchBalanceTx( this.serviceType, {
          loader: true,
          syncTrustedDerivative:
            this.serviceType === REGULAR_ACCOUNT ||
            this.serviceType === SECURE_ACCOUNT
              ? true
              : false,
        } )
      }
      this.setState( {
        showLoader: false 
      } )

      setTimeout( () => {
        ( this.refs.SendSuccessBottomSheet as any ).snapTo( 1 )
      }, 10 )
    } else if ( !transfer.txid && transfer.executed === 'ST2' ) {
      this.props.navigation.navigate( 'TwoFAToken', {
        serviceType: this.serviceType,
        recipientAddress: '',
        onTransactionSuccess: this.onTransactionSuccess,
      } )
    }
  };

  storeTrustedContactsHistory = async ( details ) => {
    if ( details && details.length > 0 ) {
      let IMKeeperOfHistory = JSON.parse(
        await AsyncStorage.getItem( 'IMKeeperOfHistory' ),
      )
      let OtherTrustedContactsHistory = JSON.parse(
        await AsyncStorage.getItem( 'OtherTrustedContactsHistory' ),
      )
      for ( let i = 0; i < details.length; i++ ) {
        const element = details[ i ]
        if ( element.selectedContact.contactName ) {
          const obj = {
            id: createRandomString( 36 ),
            title: 'Sent Amount',
            date: moment( Date.now() ).valueOf(),
            info: '',
            // 'Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit',
            selectedContactInfo: element,
          }
          if ( element.selectedContact.isWard ) {
            if ( !IMKeeperOfHistory ) IMKeeperOfHistory = []
            IMKeeperOfHistory.push( obj )
            await AsyncStorage.setItem(
              'IMKeeperOfHistory',
              JSON.stringify( IMKeeperOfHistory ),
            )
          }
          if (
            !element.selectedContact.isWard &&
            !element.selectedContact.isGuardian
          ) {
            if ( !OtherTrustedContactsHistory ) OtherTrustedContactsHistory = []
            OtherTrustedContactsHistory.push( obj )
            await AsyncStorage.setItem(
              'OtherTrustedContactsHistory',
              JSON.stringify( OtherTrustedContactsHistory ),
            )
          }
        }
      }
    }
  };

  handleCustomFee = async ( amount, customEstimatedBlock ) => {
    if ( parseInt( amount ) < 1 ) {
      this.setState( {
        customFeePerByte: '',
        customFeePerByteErr: 'Custom fee minimum: 1 sat/byte ',
      } )
      return
    }

    const { service, transfer } = this.props.accounts[ this.serviceType ]

    let outputs
    if( this.feeIntelAbsent ){
      // process recipients & generate outputs(normally handled by transfer ST1 saga)
      const processedRecipients = await processRecipients( this.recipients, this.serviceType, this.props.accounts, this.props.trustedContactsService )
      const outputsArray = []
      for ( const recipient of processedRecipients ) {
        outputsArray.push( {
          address: recipient.address,
          value: Math.round( recipient.amount ),
        } )
      }
      outputs = outputsArray
    } else {
      outputs = transfer.stage1.txPrerequisites[ 'low' ].outputs.filter(
        ( output ) => output.address,
      )
    }
   
    const customTxPrerequisites = service.calculateCustomFee(
      outputs,
      parseInt( amount ),
      this.state.derivativeAccountDetails,
    )

    if ( customTxPrerequisites.inputs ) {
      if ( this.refs.CustomPriorityBottomSheet as any )
        ( this.refs.CustomPriorityBottomSheet as any ).snapTo( 0 )
      this.onPrioritySelect( 'Custom Fee' )
      setTimeout( () => {
        this.setState( {
          customTxPrerequisites: customTxPrerequisites,
          customFeePerByte: customTxPrerequisites.fee,
          customFeePerByteErr: '',
          customEstimatedBlock,
        } )
      }, 2 )
    } else {
      // display err message
      this.setState( {
        customFeePerByte: '',
        customFeePerByteErr: `Insufficient balance to pay: amount ${this.state.totalAmount} + fee(${customTxPrerequisites.fee}) at ${amount} sats/byte`,
      } )
    }
  };

  onConfirm = () => {
    const { sliderValueText } = this.state
    this.props.clearTransfer( this.serviceType, 'stage2' )
    let txPriority
    switch ( sliderValueText ) {
        case 'Low Fee':
          txPriority = 'low'
          break
        case 'Medium Fee':
          txPriority = 'medium'
          break
        case 'High Fee':
          txPriority = 'high'
          break
        case 'Custom Fee':
          txPriority = 'custom'
          break
    }

    if (
      this.serviceType === SECURE_ACCOUNT &&
      this.props.accounts[ this.serviceType ].service.secureHDWallet
        .secondaryXpriv
    ) {
      this.props.alternateTransferST2(
        this.serviceType,
        txPriority,
        this.state.customTxPrerequisites,
        this.state.derivativeAccountDetails,
      )
    } else {
      this.props.transferST2(
        this.serviceType,
        txPriority,
        this.state.customTxPrerequisites,
        this.state.derivativeAccountDetails,
      )
    }
  };

  tapSliderHandler = ( evt ) => {
    if ( this.viewRef.current ) {
      this.viewRef.current.measure( ( fx, fy, width, height, px ) => {
        const location = ( evt.nativeEvent.locationX - px ) / width
        if ( location >= -0.1 && location <= 0.2 ) {
          this.setState( {
            sliderValue: 0 
          } )
        } else if ( location >= 0.3 && location <= 0.6 ) {
          this.setState( {
            sliderValue: 5 
          } )
        } else if ( location >= 0.7 && location <= 1 ) {
          this.setState( {
            sliderValue: 10 
          } )
        }
      } )
    }
  };

  getServiceTypeAccount = () => {
    const { derivativeAccountDetails } = this.state
    if ( derivativeAccountDetails ) {
      if ( derivativeAccountDetails.type === 'DONATION_ACCOUNT' )
        return 'Donation Account'
    }

    if ( this.serviceType == 'TEST_ACCOUNT' ) {
      return 'Test Account'
    } else if ( this.serviceType == 'SECURE_ACCOUNT' ) {
      return 'Savings Account'
    } else if ( this.serviceType == 'REGULAR_ACCOUNT' ) {
      return 'Checking Account'
    } else if ( this.serviceType == 'S3_SERVICE' ) {
      return 'S3 Service'
    }
  };

  onTransactionSuccess = () => {
    if ( this.refs.SendSuccessBottomSheet as any )
      ( this.refs.SendSuccessBottomSheet as any ).snapTo( 1 )
  };

  setCurrencyCodeFromAsync = async () => {
    const currencyCodeTmp = this.props.currencyCode

    this.setState( {
      CurrencyCode: currencyCodeTmp ? currencyCodeTmp : 'USD',
    } )
  };

  convertBitCoinToCurrency = ( value ) => {
    const { exchangeRates, CurrencyCode } = this.state

    if (
      this.serviceType === TEST_ACCOUNT ||
      this.props.currencyKind === CurrencyKind.BITCOIN
    ) {
      return UsNumberFormat( value )
    } else if ( exchangeRates !== undefined ) {
      return (
        ( value / SATOSHIS_IN_BTC ) *
        exchangeRates[ CurrencyCode ].last
      ).toFixed( 2 )
    } else {
      return null
    }
  };

  getCorrectCurrencySymbol = () => {
    const { CurrencyCode } = this.state

    if ( this.serviceType == TEST_ACCOUNT ) {
      return 't-sats'
    }

    return this.props.currencyKind === CurrencyKind.BITCOIN
      ? 'sats'
      : CurrencyCode.toLocaleLowerCase()
  };

  onPrioritySelect = ( priority ) => {
    this.setState( {
      sliderValueText: priority,
    } )
  };

  render() {
    const {
      CurrencyCode,
      totalAmount,
      isConfirmDisabled,
      transfer,
      showLoader,
      selectedRecipients,
    } = this.state
    const { navigation, exchangeRates, currencyKind } = this.props
    const prefersBitcoin = currencyKind === CurrencyKind.BITCOIN

    return (
      <View style={{
        flex: 1 
      }}>
        <SafeAreaView style={{
          flex: 0 
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center' 
          }}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack()
                this.props.clearTransfer( this.serviceType, 'stage1' )
              }}
              hitSlop={{
                top: 20, left: 20, bottom: 20, right: 20 
              }}
              style={{
                height: 30, width: 30, justifyContent: 'center' 
              }}
              disabled={isConfirmDisabled}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
            <Image
              source={
                this.state.derivativeAccountDetails &&
                this.state.derivativeAccountDetails.type === DONATION_ACCOUNT
                  ? require( '../../../assets/images/icons/icon_donation_account.png' )
                  : this.serviceType == TEST_ACCOUNT
                    ? require( '../../../assets/images/icons/icon_test.png' )
                    : this.serviceType == REGULAR_ACCOUNT
                      ? require( '../../../assets/images/icons/icon_regular.png' )
                      : require( '../../../assets/images/icons/icon_secureaccount.png' )
              }
              style={{
                width: wp( '10%' ), height: wp( '10%' ) 
              }}
            />
            <View style={{
              marginLeft: wp( '2.5%' ) 
            }}>
              <Text style={styles.modalHeaderTitleText}>
                {'Send Confirmation'}
              </Text>
              <Text style={styles.headerText}>
                How urgent is the transaction?
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                ( this.refs.KnowMoreBottomSheet as any ).snapTo( 1 )
              }}
              style={{
                marginLeft: 'auto' 
              }}
            >
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue( 12 ),
                }}
              >
                Know more
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          <View style={styles.availableBalanceView}>
            <Text style={styles.accountTypeTextBalanceView}>
              {this.getServiceTypeAccount()}
            </Text>
            <Text style={styles.availableToSpendText}>
              {' (Available to spend '}
              <Text style={styles.availableToSpendText}>
                {this.serviceType == TEST_ACCOUNT
                  ? UsNumberFormat( this.spendableBalance )
                  : prefersBitcoin
                    ? UsNumberFormat( this.spendableBalance )
                    : exchangeRates
                      ? (
                        ( this.spendableBalance / SATOSHIS_IN_BTC ) *
                      exchangeRates[ CurrencyCode ].last
                      ).toFixed( 2 )
                      : null}
              </Text>
              <Text style={styles.textTsats}>
                {this.serviceType == TEST_ACCOUNT
                  ? ' t-sats)'
                  : prefersBitcoin
                    ? ' sats)'
                    : ' ' + CurrencyCode.toLocaleLowerCase() + ' )'}
              </Text>
            </Text>
          </View>

          {this.serviceType === SECURE_ACCOUNT &&
            this.props.accounts[ this.serviceType ].service.secureHDWallet
              .secondaryXpriv && (
            <View
              style={{
                flex: 1,
                borderRadius: 8,
                marginTop: wp( '1%' ),
                marginBottom: wp( '2%' ),
                marginHorizontal: wp( '6%' ),
                backgroundColor: Colors.white,
                borderColor: Colors.backgroundColor,
                borderWidth: 2,
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: hp( '1.5%' ),
                  paddingHorizontal: hp( '1.5%' ),
                }}
              >
                <Text style={styles.accountTypeTextBalanceView}>
                    Exit key used
                </Text>
                <View
                  style={{
                    paddingHorizontal: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    style={{
                      width: 12,
                      height: 14,
                      resizeMode: 'contain',
                      marginLeft: 'auto',
                    }}
                    source={require( '../../../assets/images/icons/icon_check.png' )}
                  />
                </View>
              </View>
            </View>
          )}

          <FlatList
            horizontal
            contentContainerStyle={{
              paddingVertical: 16 
            }}
            // data={this.recipients}
            data={selectedRecipients}
            keyExtractor={( item ) => item.id}
            showsHorizontalScrollIndicator={false}
            contentOffset={{
              x: -14, y: 0 
            }}
            renderItem={( { item }: { item: unknown } ) => {
              const selectedContactData = {
                ...item.selectedContact,
                amount:
                  item.selectedContact.bitcoinAmount || item.bitcoinAmount, // https://bithyve-workspace.slack.com/archives/CEBLWDEKH/p1605722649345500?thread_ts=1605718686.340700&cid=CEBLWDEKH
              }

              // TODO: This should already be computed
              // ahead of time in the data passed to this screen.
              let recipient: RecipientDescribing

              // 🔑 This seems to be the way the backend is defining the "account kind".
              // This should be refactored to leverage the new accounts structure
              // in https://github.com/bithyve/hexa/tree/feature/account-management
              const accountKind = {
                'Checking Account': REGULAR_ACCOUNT,
                'Savings Account': SECURE_ACCOUNT,
                'Test Account': TEST_ACCOUNT,
                'Donation Account': DONATION_ACCOUNT,
              }[ selectedContactData.account_name || 'Checking Account' ]

              // 🔑 This seems to be the way the backend is distinguishing between
              // accounts and contacts.
              if ( selectedContactData.account_name != null ) {
                recipient = makeSubAccountRecipientDescription(
                  selectedContactData,
                  accountKind,
                )
              } else {
                recipient = makeContactRecipientDescription(
                  selectedContactData,
                )
              }

              return (
                <ConfirmedRecipientCarouselItem
                  containerStyle={{
                    marginHorizontal: 14 
                  }}
                  recipient={recipient}
                  accountKind={accountKind}
                />
              )
            }}
          />

          <View style={styles.totalMountView}>
            <Text style={styles.totalAmountText}>Total Amount</Text>
            <View style={styles.totalAmountOuterView}>
              <View style={styles.totalAmountInnerView}>
                <View style={styles.amountInputImage}>
                  <Image
                    style={styles.textBoxImage}
                    source={require( '../../../assets/images/icons/icon_bitcoin_gray.png' )}
                  />
                </View>
                <View style={styles.totalAmountView} />
                <Text style={styles.amountText}>
                  {this.serviceType == TEST_ACCOUNT
                    ? UsNumberFormat( totalAmount )
                    : prefersBitcoin
                      ? UsNumberFormat( totalAmount )
                      : exchangeRates
                        ? (
                          ( totalAmount / SATOSHIS_IN_BTC ) *
                        exchangeRates[ CurrencyCode ].last
                        ).toFixed( 2 )
                        : null}
                </Text>
                <Text style={styles.amountUnitText}>
                  {this.serviceType == TEST_ACCOUNT
                    ? ' t-sats'
                    : prefersBitcoin
                      ? ' sats'
                      : ' ' + CurrencyCode.toLocaleLowerCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.transactionPriorityView}>
            {this.feeIntelAbsent? null: <View>
              <Text style={styles.transactionPriorityText}>
              Transaction Priority
              </Text>

              <View style={styles.priorityTableHeadingContainer}>
                <View style={{
                  flex: 1, paddingLeft: 10 
                }}>
                  <Text style={styles.tableHeadingText}>Priority</Text>
                </View>
                <View style={styles.priorityDataContainer}>
                  <Text style={styles.tableHeadingText}>Arrival Time</Text>
                </View>
                <View style={styles.priorityDataContainer}>
                  <Text
                    style={{
                      ...styles.tableHeadingText, textAlign: 'center' 
                    }}
                  >
                  Total Fee
                  </Text>
                </View>
              </View>
              {!this.isSendMax ? (
                <View style={styles.priorityTableContainer}>
                  <View
                    style={{
                      ...styles.priorityDataContainer,
                      justifyContent: 'flex-start',
                    }}
                  >
                    <RadioButton
                      size={20}
                      color={Colors.lightBlue}
                      borderColor={Colors.borderColor}
                      isChecked={this.state.sliderValueText.includes( 'High' )}
                      onpress={() => this.onPrioritySelect( 'High Fee' )}
                    />
                    <Text style={{
                      ...styles.priorityTableText, marginLeft: 10 
                    }}>
                    High
                    </Text>
                  </View>
                  <View style={styles.priorityValueContainer}>
                    {transfer &&
                  transfer.stage1 &&
                  transfer.stage1.txPrerequisites ? (
                        <Text style={styles.priorityTableText}>
                      ~
                          {timeConvertNear30(
                            ( transfer.stage1.txPrerequisites[ 'high' ]
                              .estimatedBlocks +
                          1 ) *
                          10,
                          )}
                        </Text>
                      ) : null}
                  </View>
                  <View style={styles.priorityValueContainer}>
                    <Text style={styles.priorityTableText}>
                      {this.convertBitCoinToCurrency(
                        transfer.stage1 && transfer.stage1.txPrerequisites
                          ? transfer.stage1.txPrerequisites[ 'high' ].fee
                          : '',
                      )}
                      {' ' + this.getCorrectCurrencySymbol()}
                    </Text>
                  </View>
                </View>
              ) : null}
              {!this.isSendMax ? (
                <View style={styles.priorityTableContainer}>
                  <View
                    style={{
                      ...styles.priorityDataContainer,
                      justifyContent: 'flex-start',
                    }}
                  >
                    <RadioButton
                      size={20}
                      color={Colors.lightBlue}
                      borderColor={Colors.borderColor}
                      isChecked={this.state.sliderValueText.includes( 'Medium' )}
                      onpress={() => this.onPrioritySelect( 'Medium Fee' )}
                    />
                    <Text style={{
                      ...styles.priorityTableText, marginLeft: 10 
                    }}>
                    Medium
                    </Text>
                  </View>
                  <View style={styles.priorityValueContainer}>
                    {transfer &&
                  transfer.stage1 &&
                  transfer.stage1.txPrerequisites ? (
                        <Text style={styles.priorityTableText}>
                      ~
                          {timeConvertNear30(
                            ( transfer.stage1.txPrerequisites[ 'medium' ]
                              .estimatedBlocks +
                          1 ) *
                          10,
                          )}
                        </Text>
                      ) : null}
                  </View>
                  <View style={styles.priorityValueContainer}>
                    <Text style={styles.priorityTableText}>
                      {this.convertBitCoinToCurrency(
                        transfer.stage1 && transfer.stage1.txPrerequisites
                          ? transfer.stage1.txPrerequisites[ 'medium' ].fee
                          : '',
                      )}
                      {' ' + this.getCorrectCurrencySymbol()}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View
                style={{
                  ...styles.priorityTableContainer,
                  borderBottomWidth: this.state.customFeePerByte !== '' ? 0.5 : 0,
                }}
              >
                <View
                  style={{
                    ...styles.priorityDataContainer,
                    justifyContent: 'flex-start',
                  }}
                >
                  <RadioButton
                    size={20}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={this.state.sliderValueText.includes( 'Low' )}
                    onpress={() => this.onPrioritySelect( 'Low Fee' )}
                  />
                  <Text style={{
                    ...styles.priorityTableText, marginLeft: 10 
                  }}>
                  Low
                  </Text>
                </View>
                <View style={styles.priorityValueContainer}>
                  {!this.isSendMax ? (
                    transfer &&
                  transfer.stage1 &&
                  transfer.stage1.txPrerequisites ? (
                        <Text style={styles.priorityTableText}>
                      ~
                          {timeConvertNear30(
                            ( transfer.stage1.txPrerequisites[ 'low' ]
                              .estimatedBlocks +
                          1 ) *
                          10,
                          )}
                        </Text>
                      ) : null
                  ) : (
                    <View style={[ styles.priorityValueContainer ]}>
                      <Text style={styles.priorityTableText}>~6.5 hours</Text>
                    </View>
                  )}
                </View>
                <View style={styles.priorityValueContainer}>
                  <Text style={styles.priorityTableText}>
                    {this.convertBitCoinToCurrency(
                      transfer.stage1 && transfer.stage1.txPrerequisites
                        ? transfer.stage1.txPrerequisites[ 'low' ].fee
                        : '',
                    )}
                    {' ' + this.getCorrectCurrencySymbol()}
                  </Text>
                </View>
              </View>
            </View>} 

            {this.state.customFeePerByte !== '' && (
              <View
                style={{
                  ...styles.priorityTableContainer,
                  borderBottomWidth: 0,
                }}
              >
                <View
                  style={{
                    ...styles.priorityDataContainer,
                    justifyContent: 'flex-start',
                  }}
                >
                  <RadioButton
                    size={20}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={this.state.sliderValueText.includes( 'Custom' )}
                    onpress={() => this.onPrioritySelect( 'Custom Fee' )}
                  />
                  <Text style={{
                    ...styles.priorityTableText, marginLeft: 10 
                  }}>
                    Custom
                  </Text>
                </View>
                <View style={styles.priorityValueContainer}>
                  <Text style={styles.priorityTableText}>
                    ~
                    {timeConvertNear30(
                      ( this.state.customEstimatedBlock + 1 ) * 10,
                    )}
                  </Text>
                </View>
                <View style={styles.priorityValueContainer}>
                  <Text style={styles.priorityTableText}>
                    {this.convertBitCoinToCurrency( this.state.customFeePerByte )}
                    {' ' + this.getCorrectCurrencySymbol()}
                  </Text>
                </View>
              </View>
            )}
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 8,
                marginTop: hp( '1.2%' ),
                backgroundColor: Colors.white,
                borderColor: Colors.backgroundColor,
                borderWidth: 2,
                opacity: this.isSendMax ? 0.5 : 1,
              }}
              onPress={() => {
                ( this.refs.CustomPriorityBottomSheet as any ).snapTo( 1 )
              }}
              disabled={this.isSendMax}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: hp( '1.5%' ),
                  paddingHorizontal: hp( '1.5%' ),
                }}
              >
                <Text style={styles.accountTypeTextBalanceView}>
                  Custom Priority
                </Text>
                <View
                  style={{
                    paddingHorizontal: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={12}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomButtonView}>
            <TouchableOpacity
              onPress={() => {
                this.setState( {
                  isConfirmDisabled: true, showLoader: true 
                } )
                this.onConfirm()
              }}
              disabled={isConfirmDisabled}
              style={{
                ...styles.confirmButtonView,
                backgroundColor: isConfirmDisabled
                  ? Colors.lightBlue
                  : Colors.blue,
                elevation: 10,
                shadowColor: Colors.shadowBlue,
                shadowOpacity: 1,
                shadowOffset: {
                  width: 15, height: 15 
                },
              }}
            >
              {( !isConfirmDisabled &&
                this.props.accounts[ this.serviceType ].loading.transfer ) ||
              ( isConfirmDisabled &&
                this.props.accounts[ this.serviceType ].loading.transfer ) ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.buttonText}>{'Confirm & Send'}</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...styles.confirmButtonView,
                width: wp( '30%' ),
              }}
              disabled={isConfirmDisabled}
              onPress={() => {
                this.props.clearTransfer( this.serviceType, 'stage1' )
                navigation.goBack()
              }}
            >
              <Text style={{
                ...styles.buttonText, color: Colors.blue 
              }}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {showLoader ? <Loader isLoading={true} /> : null}

        <BottomSheet
          onCloseStart={() => {
            if ( this.refs.SendSuccessBottomSheet as any )
              ( this.refs.SendSuccessBottomSheet as any ).snapTo( 0 )

            this.props.clearTransfer( this.serviceType )

            navigation.dispatch(
              resetStackToAccountDetails( {
                serviceType: this.serviceType,
                index: this.state.derivativeAccountDetails
                  ? 3
                  : this.serviceType === TEST_ACCOUNT
                    ? 0
                    : this.serviceType === REGULAR_ACCOUNT
                      ? 1
                      : 2,
                spendableBalance: this.spendableBalance - totalAmount,
              } ),
            )
          }}
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'SendSuccessBottomSheet'}
          snapPoints={[ -50, hp( '65%' ) ]}
          renderContent={() => (
            <SendConfirmationContent
              title={'Sent Successfully'}
              info={'Transaction(s) successfully submitted'}
              infoText={
                'The transaction has been submitted to the Bitcoin network. View transactions on the account screen for details'
              }
              userInfo={transfer.details ? transfer.details : []}
              isFromContact={false}
              okButtonText={'View Account'}
              cancelButtonText={'Back'}
              isCancel={false}
              onPressOk={() => {
                if ( this.refs.SendSuccessBottomSheet as any )
                  ( this.refs.SendSuccessBottomSheet as any ).snapTo( 0 )

                this.props.clearTransfer( this.serviceType )
                const accountShellID = this.props.navigation.getParam(
                  'accountShellID',
                )

                navigation.dispatch(
                  resetStackToAccountDetails( {
                    accountShellID,
                  } ),
                )
              }}
              isSuccess={true}
              accountKind={this.serviceType}
            />
          )}
          renderHeader={() => <ModalHeader />}
        />

        <BottomSheet
          onCloseStart={() => {
            ( this.refs.SendUnSuccessBottomSheet as any ).snapTo( 0 )
          }}
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'SendUnSuccessBottomSheet'}
          snapPoints={[ -50, hp( '65%' ) ]}
          renderContent={() => {
            let errorMessage = 'Something went wrong, please try again'
            if( transfer && transfer.stage2 ){
              errorMessage = 'Something went wrong; ' + transfer.stage2.err

              // modifying the error message if user is connected to own/personal node
              const { nodeSettings } = this.props
              if( nodeSettings.activePersonalNode && nodeSettings.activePersonalNode.isConnectionActive ){
                errorMessage = `${errorMessage}\n\nPlease check the connection to the node you are connected to and try again`
              }
            }
            return (
              <SendConfirmationContent
                title={'Send Unsuccessful'}
                info={
                  errorMessage
                }
                userInfo={transfer.details ? transfer.details : []}
                isFromContact={false}
                okButtonText={'Try Again'}
                cancelButtonText={'Back'}
                isCancel={true}
                onPressOk={() => {
                  if ( this.refs.SendUnSuccessBottomSheet as any )
                    ( this.refs.SendUnSuccessBottomSheet as any ).snapTo( 0 )
                }}
                onPressCancel={() => {
                  this.props.clearTransfer( this.serviceType )
                  if ( this.refs.SendUnSuccessBottomSheet as any )
                    ( this.refs.SendUnSuccessBottomSheet as any ).snapTo( 0 )
                  navigation.navigate( 'AccountDetails' )
                }}
                isUnSuccess={true}
                accountKind={this.serviceType}
              /> )
          }}
          renderHeader={() => <ModalHeader />}
        />

        <BottomSheet
          onCloseStart={() => {
            ( this.refs.KnowMoreBottomSheet as any ).snapTo( 0 )
          }}
          enabledInnerScrolling={false}
          ref={'KnowMoreBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '20%' )
              : Platform.OS == 'android'
                ? hp( '21%' )
                : hp( '20%' ),
          ]}
          renderContent={() => (
            <TestAccountHelperModalContents
              topButtonText={'Note'}
              boldPara={''}
              helperInfo={
                'When you want to send bitcoin, you need the address of the receiver. For this you can either scan a QR code from their wallet/app or copy their address into the address field'
              }
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              borderColor={Colors.blue}
              backgroundColor={Colors.blue}
              onPressHeader={() => {
                ( this.refs.KnowMoreBottomSheet as any ).snapTo( 0 )
              }}
            />
          )}
        />
        <BottomSheet
          onCloseStart={() => {
            ( this.refs.CustomPriorityBottomSheet as any ).snapTo( 0 )
          }}
          enabledInnerScrolling={true}
          ref={'CustomPriorityBottomSheet'}
          snapPoints={[ -50, hp( '75%' ) ]}
          renderContent={() => (
            <CustomPriorityContent
              title={'Custom Priority'}
              info={'Enter the fee rate in sats per byte.'}
              err={this.state.customFeePerByteErr}
              service={this.props.accounts[ this.serviceType ].service}
              okButtonText={'Confirm'}
              cancelButtonText={'Back'}
              isCancel={true}
              onPressOk={( amount, customEstimatedBlock ) => {
                Keyboard.dismiss()
                this.handleCustomFee( amount, customEstimatedBlock )
              }}
              onPressCancel={() => {
                Keyboard.dismiss()
                if ( this.refs.CustomPriorityBottomSheet as any )
                  ( this.refs.CustomPriorityBottomSheet as any ).snapTo( 0 )
              }}
            />
          )}
          renderHeader={() => (
            <ModalHeader
              onPressHeader={() => {
                Keyboard.dismiss()
                if ( this.refs.CustomPriorityBottomSheet as any )
                  ( this.refs.CustomPriorityBottomSheet as any ).snapTo( 0 )
              }}
            />
          )}
        />
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    trustedContactsService: idx( state, ( _ ) => _.trustedContacts.service ),
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
    accounts: idx( state, ( _ ) => _.accounts ) || [],
    nodeSettings: idx( state, ( _ ) => _.nodeSettings ) || [],
    WALLET_SETUP: idx( state, ( _ ) => _.storage.database.WALLET_SETUP ) || '',
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    currencyKind: idx( state, ( _ ) => _.preferences.currencyKind ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchBalanceTx,
    syncViaXpubAgent,
    fetchDerivativeAccBalTx,
    clearTransfer,
    alternateTransferST2,
    transferST2,
  } )( SendConfirmation ),
)

const styles = StyleSheet.create( {
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp( '1.5%' ),
    paddingTop: hp( '1%' ),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp( '1.5%' ),
  },
  textBoxView: {
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: Colors.borderColor,
  },
  textBoxImage: {
    width: wp( '6%' ),
    height: wp( '6%' ),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
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
  headerText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12 ),
  },
  availableBalanceView: {
    paddingBottom: hp( '1%' ),
    paddingTop: hp( '0.7%' ),
    marginRight: wp( '6%' ),
    marginLeft: wp( '6%' ),
    marginBottom: hp( '1%' ),
    marginTop: hp( '1%' ),
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  accountTypeTextBalanceView: {
    color: Colors.blue,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansItalic,
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
    textAlign: 'center',
  },
  availableBalanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
  },
  availableBalanceUnitText: {
    color: Colors.blue,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansMediumItalic,
  },
  textTsats: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 7 ),
    fontFamily: Fonts.FiraSansMediumItalic,
  },
  totalMountView: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: hp('1.2%'),
    marginRight: wp( '6%' ),
    marginLeft: wp( '6%' ),
    // borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    paddingBottom: hp( '1%' ),
    // paddingTop: hp('1.5%'),
  },
  totalAmountText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
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
  amountText: {
    color: Colors.black,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 10,
  },
  amountUnitText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: 5,
  },
  transactionPriorityView: {
    marginRight: wp( '6%' ),
    marginLeft: wp( '6%' ),
    marginTop: hp( '2%' ),
  },
  transactionPriorityText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  transactionPriorityInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 5,
  },
  sliderTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'center',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 5,
  },
  bottomButtonView: {
    flexDirection: 'row',
    marginTop: hp( '3%' ),
    marginBottom: hp( '5%' ),
    marginLeft: wp( '6%' ),
    marginRight: wp( '6%' ),
  },
  tableHeadingText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  priorityTableText: {
    fontSize: RFValue( 12 ),
    lineHeight: RFValue( 12 ),
    color: Colors.textColorGrey,
    textAlign: 'right',
  },
  priorityTableHeadingContainer: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    marginTop: hp( '2%' ),
    paddingBottom: hp( '1.5%' ),
  },
  priorityTableContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    marginTop: hp( '1.5%' ),
    paddingBottom: hp( '1.5%' ),
  },
  priorityDataContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
} )
