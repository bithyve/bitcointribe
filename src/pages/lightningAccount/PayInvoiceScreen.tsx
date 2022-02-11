import * as React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import HeaderTitle from '../../components/HeaderTitle'
import { RFValue } from 'react-native-responsive-fontsize'
import InvoicesStore from '../../mobxstore/InvoicesStore'
import TransactionsStore from '../../mobxstore/TransactionsStore'
import UnitsStore from '../../mobxstore/UnitsStore'
import ChannelsStore from '../../mobxstore/ChannelsStore'
import SettingsStore from '../../mobxstore/SettingsStore'
import BalanceStore from '../../mobxstore/BalanceStore'
import BitcoinIcon from '../../assets/images/accIcons/bitcoin.svg'
import LightningHexa from '../../assets/images/accIcons/icon_ln.svg'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts.js'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import FormStyles from '../../common/Styles/FormStyles'
import SendConfirmationContent from '../Accounts/SendConfirmationContent'
import { translations } from '../../common/content/LocContext'
import ModalContainer from '../../components/home/ModalContainer'
import ListStyles from '../../common/Styles/ListStyles'

interface InvoiceProps {
    exitSetup: any;
    navigation: any;
    InvoicesStore: InvoicesStore;
    TransactionsStore: TransactionsStore;
    UnitsStore: UnitsStore;
    ChannelsStore: ChannelsStore;
    SettingsStore: SettingsStore;
    BalanceStore: BalanceStore
}

interface InvoiceState {
    setCustomAmount: boolean;
    customAmount: string;
    enableMultiPathPayment: boolean;
    maxParts: string;
    timeoutSeconds: string;
    feeLimitSat: string;
    outgoingChanIds: Array<string> | null;
    lastHopPubkey: string | null;
    common: object,
    strings: object,
    showTransactionStatusModal: boolean,
    transactionStatus: string
}


@inject(
  'InvoicesStore',
  'UnitsStore',
  'ChannelsStore',
  'SettingsStore',
  'TransactionsStore',
  'BalanceStore',
)
@observer
export default class PayInvoiceScreen extends React.Component<
    InvoiceProps,
    InvoiceState
> {
    state = {
      setCustomAmount: true,
      customAmount: '',
      enableMultiPathPayment: false,
      maxParts: '2',
      timeoutSeconds: '20',
      feeLimitSat: '10',
      outgoingChanIds: null,
      lastHopPubkey: null,
      common: translations [ 'common' ],
      strings: translations [ 'accounts' ],
      showTransactionStatusModal: false,
      transactionStatus: ''
    };

    componentDidMount(){
      this.props.TransactionsStore.reset()
    }

    componentDidUpdate( prevProps, prevState ) {
      const { TransactionsStore } = this.props
      const {
        payment_route,
        payment_error,
        status,
        error,
        loading
      } = TransactionsStore
      if ( prevProps.TransactionsStore.loading !== loading
        && payment_error || error
        && !prevState.showTransactionStatusModal ) {
        this.setState( {
          showTransactionStatusModal: true,
          transactionStatus: 'error'
        } )
      } else if( prevProps.TransactionsStore.loading !== loading
        &&
        payment_route || status === 'complete' ||
            status === 'SUCCEEDED'&& !prevState.showTransactionStatusModal ){
        if( !this.state.showTransactionStatusModal ){
          this.setState( {
            showTransactionStatusModal: true,
            transactionStatus: 'success'
          } )
        }
      }
    }

    render() {
      const {
        TransactionsStore,
        InvoicesStore,
        UnitsStore,
        ChannelsStore,
        SettingsStore,
        navigation
      } = this.props
      const {
        setCustomAmount,
        customAmount,
        enableMultiPathPayment,
        maxParts,
        timeoutSeconds,
        feeLimitSat,
        outgoingChanIds,
        lastHopPubkey
      } = this.state
      const {
        pay_req,
        paymentRequest,
        getPayReqError,
        loading,
        loadingFeeEstimate,
        successProbability,
        feeEstimate
      } = InvoicesStore
      const {
        loading: loadingTx,
        error,
        error_msg,
        payment_route,
        payment_preimage,
        payment_error,
        status
      } = TransactionsStore
      const { units, changeUnits, getAmount } = UnitsStore
      const requestAmount = pay_req && pay_req.getRequestAmount
      const expiry = pay_req && pay_req.expiry
      const cltv_expiry = pay_req && pay_req.cltv_expiry
      const destination = pay_req && pay_req.destination
      const description = pay_req && pay_req.description
      const payment_hash = pay_req && pay_req.payment_hash
      const timestamp = pay_req && pay_req.timestamp

      const date = new Date( Number( timestamp ) * 1000 ).toString()

      const {  implementation } = SettingsStore
      const theme = 'notdark'
      const { strings, common } = this.state

      const isLnd: boolean = implementation === 'lnd'

      const canPayCustomAmount: boolean =
            isLnd || !requestAmount || requestAmount === 0
      return (
        <View
          style={styles.lightThemeStyle}
        >
          <ModalContainer
            onBackground={()=>
              this.setState( {
                showTransactionStatusModal: false
              } )}
            visible={this.state.showTransactionStatusModal}
            closeBottomSheet={() => {}} >
            <SendConfirmationContent
              title={this.state.transactionStatus === 'error' ? strings.SendUnsuccessful: strings.SentSuccessfully}
              info={this.state.transactionStatus === 'error' ? error_msg|| error: strings.SentSuccessfully}
              infoText={ ' '}
              isFromContact={false}
              okButtonText={strings.ViewAccount}
              cancelButtonText={common.back}
              isCancel={false}
              onPressOk={() => {
                this.props.navigation.goBack()
              }}
              onPressCancel={() => this.setState( {
                showTransactionStatusModal: false
              } )}
              isSuccess={true}
            />
          </ModalContainer>

          <ScrollView showsVerticalScrollIndicator={false}>
            <HeaderTitle
              firstLineTitle={'Pay Invoice'}
              secondLineTitle={''}
              infoTextNormal={''}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />

            {( loading || loadingFeeEstimate ) && (
              <ActivityIndicator size="large" color={Colors.blue}/>
            )}
            {!!getPayReqError && (
              <View style={styles.content}>
                <Text style={ styles.label}>{getPayReqError}</Text>
              </View>
            )}

            {!!pay_req && (
              <View style={styles.content}>

                <View style={[ styles.lineItem, styles.row ]}>
                  <BitcoinIcon/>
                  <View style={{
                    flex: 1,
                    marginHorizontal: 5
                  }}>
                    <Text style={{
                      ...ListStyles.listItemSubtitle,
                    }}>Paying Amount</Text>
                    <View style={[ styles.row, {
                      justifyContent: 'flex-start'
                    } ]}>
                      <TextInput
                        keyboardType="numeric"
                        placeholder={
                          requestAmount
                            ? requestAmount.toString()
                            : '0'
                        }
                        style={{
                          fontSize: RFValue( 22 ),
                          padding: 5,
                          marginVertical: 2,
                          width: wp( '40%' )
                        }}
                        placeholderTextColor={FormStyles.placeholderText.color}
                        value={customAmount}
                        onChangeText={( text: string ) =>
                          this.setState( {
                            customAmount: text
                          } )
                        }
                        numberOfLines={1}
                      />
                      <Text style={{
                        ...ListStyles.listItemSubtitle,
                        fontFamily: Fonts.FiraSansItalic,
                      }}>{' sats'}</Text>
                    </View>
                  </View>
                </View>

                <View style={[ styles.lineItem, styles.row ]}>
                  <LightningHexa/>
                  <View style={{
                    flex: 1,
                    marginHorizontal: 5
                  }}>
                    <Text style={{
                      ...ListStyles.listItemSubtitle,
                    }}>Paying from</Text>
                    <Text style={[ ListStyles.listItemTitleTransaction, {
                      color: Colors.gray,
                    } ]}>
                      Lightning Account
                    </Text>
                    <Text style={{
                      ...ListStyles.listItemSubtitle,
                      fontFamily: Fonts.FiraSansItalic,
                      color: Colors.blue,
                    }}>{`Balance ${this.props.BalanceStore.lightningBalance} sats`}</Text>
                  </View>
                </View>
                <View style={styles.lineItem}>
                  <Text style={{
                    ...ListStyles.listItemSubtitle,
                    marginBottom: 3,
                    textAlign: 'right'
                  }}>{moment( date ).format( 'DD/MM/YY • hh:MMa' )}</Text>
                  <Text style={{
                    ...ListStyles.listItemSubtitle,
                    marginBottom: 3,
                  }}>{description}</Text>
                  <View style={styles.row}>
                    {( !!feeEstimate || feeEstimate === 0 ) && (
                      <View>
                        <Text style={ListStyles.listItemTitleTransaction}>
                      Fee Estimate:
                        </Text>
                        <Text style={{
                          ...ListStyles.listItemSubtitle,
                          marginBottom: 3,
                        }}>{units && getAmount( feeEstimate )}</Text>
                      </View>
                    )}

                    {!!successProbability && (
                      <View>
                        <Text style={ListStyles.listItemTitleTransaction}>
                          Success Probability:
                        </Text>
                        <Text style={{
                          ...ListStyles.listItemSubtitle,
                          marginBottom: 3,
                        }}>{`${Number( successProbability ).toFixed( 2 )}%`}</Text>
                      </View>

                    )}
                  </View>
                </View>

                <View style={styles.row}>
                  {!!expiry && (
                    <View style={styles.lineItem}>
                      <Text style={ListStyles.listItemTitleTransaction}>
                        Expiry:
                      </Text>
                      <Text style={{
                        ...ListStyles.listItemSubtitle,
                        marginBottom: 3,
                      }}>{expiry}</Text>
                    </View>
                  )}

                  {!!cltv_expiry && (
                    <View style={styles.lineItem}>
                      <Text style={ListStyles.listItemTitleTransaction}>
                                        CLTV Expiry:
                      </Text>
                      <Text style={{
                        ...ListStyles.listItemSubtitle,
                        marginBottom: 3,
                      }}>{cltv_expiry}</Text>
                    </View>
                  )}
                </View>


                {!!destination && (
                  <View style={styles.lineItem}>
                    <Text style={ListStyles.listItemTitleTransaction}>
                                    Destination:
                    </Text>
                    <Text style={{
                      ...ListStyles.listItemSubtitle,
                      marginBottom: 3,
                    }}>{destination}</Text>
                  </View>

                )}

                {!!payment_hash && (
                  <View style={styles.lineItem}>
                    <Text style={ListStyles.listItemTitleTransaction}>
                      Payment Hash:
                    </Text>
                    <Text style={{
                      ...ListStyles.listItemSubtitle,
                      marginBottom: 3,
                    }}>{payment_hash}</Text>
                  </View>
                )}

              </View>
            )}

            {/* <View>
              <Text>{RESTUtils.supportsMPP()}</Text>
            </View> */}

            {!!pay_req && (
              <View style={styles.button}>

                <TouchableOpacity
                  style={styles.buttonView}
                  activeOpacity={0.6}
                  disabled={loadingTx}
                  onPress={() => {
                    TransactionsStore.sendPayment(
                      paymentRequest,
                      customAmount,
                      null,
                      enableMultiPathPayment
                        ? maxParts
                        : null,
                      enableMultiPathPayment
                        ? timeoutSeconds
                        : null,
                      enableMultiPathPayment
                        ? feeLimitSat
                        : null,
                      outgoingChanIds,
                      lastHopPubkey
                    )
                  }}
                >
                  <Text style={styles.buttonText}>Pay Invoice</Text>
                </TouchableOpacity>

              </View>
            )}
          </ScrollView>
        </View>
      )
    }
}

const styles = StyleSheet.create( {
  lightThemeStyle: {
    backgroundColor: Colors.backgroundColor,
    padding: 10,
    flex: 1,
  },
  content: {
    padding: 5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    paddingTop: 5
  },
  value: {
    paddingBottom: 5
  },
  labelDark: {
    paddingTop: 5,
    color: 'white'
  },
  valueDark: {
    paddingBottom: 5,
    color: 'white'
  },
  button: {
    paddingTop: 5,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 10
  },
  amount: {
    fontSize: 25,
    fontWeight: 'bold'
  },
  amountDark: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white'
  },
  center: {
    alignItems: 'center',
  },
  textInput: {
    fontSize: 20,
    color: 'black'
  },
  mppForm: {
    paddingLeft: 20,
    paddingBottom: 10
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  lineItem: {
    marginBottom: RFValue( 16 ),
    backgroundColor: 'white',
    padding: 10,
    paddingHorizontal: 10,
    elevation: 4,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },

  buttonView: {
    height: wp( '12%' ),
    width: wp( '40%' ),
    paddingHorizontal: wp( 2 ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    marginHorizontal: wp( 4 ),
    marginVertical: hp( '2%' ),
  },
} )
