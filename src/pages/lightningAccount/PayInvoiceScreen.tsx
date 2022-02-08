import * as React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { inject, observer } from 'mobx-react'
import { Button } from 'react-native-elements'
import HeaderTitle from '../../components/HeaderTitle'
import { RFValue } from 'react-native-responsive-fontsize'
import InvoicesStore from '../../mobxstore/InvoicesStore'
import TransactionsStore from '../../mobxstore/TransactionsStore'
import UnitsStore from '../../mobxstore/UnitsStore'
import ChannelsStore from '../../mobxstore/ChannelsStore'
import SettingsStore from '../../mobxstore/SettingsStore'
import RESTUtils from '../../utils/ln/RESTUtils'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts.js'
import {  Input } from 'react-native-elements'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import BalanceEntryFormGroup from '../Accounts/Send/BalanceEntryFormGroup'
import FormStyles from '../../common/Styles/FormStyles'
import SendConfirmationContent from '../Accounts/SendConfirmationContent'
import { translations } from '../../common/content/LocContext'
import ModalContainer from '../../components/home/ModalContainer'

interface InvoiceProps {
    exitSetup: any;
    navigation: any;
    InvoicesStore: InvoicesStore;
    TransactionsStore: TransactionsStore;
    UnitsStore: UnitsStore;
    ChannelsStore: ChannelsStore;
    SettingsStore: SettingsStore;
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
  'TransactionsStore'
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
      } else {
        // if(
        //   payment_route || status === 'complete' ||
        //    status === 'SUCCEEDED' ){
        //   this.setState( {
        //     showTransactionStatusModal: true,
        //     transactionStatus: 'success'
        //   } )
        // }
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
          style={
            theme === 'dark'
              ? styles.darkThemeStyle
              : styles.lightThemeStyle
          }
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
              info={strings.Transactionsubmitted}
              infoText={ 'onfp'}
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

          <HeaderTitle
            firstLineTitle={'Pay invoice'}
            secondLineTitle={''}
            infoTextNormal={''}
            infoTextBold={''}
            infoTextNormal1={''}
            step={''}
          />

          {( loading || loadingFeeEstimate ) && (
            <ActivityIndicator size="large" color={Colors.blue}/>
          )}

          <ScrollView>
            {!!getPayReqError && (
              <View style={styles.content}>
                <Text
                  style={
                    theme === 'dark'
                      ? styles.labelDark
                      : styles.label
                  }
                >
                  {getPayReqError}
                </Text>
              </View>
            )}

            {!!pay_req && (
              <View style={styles.content}>
                <View style={styles.center}>

                  {setCustomAmount && (
                    <Input
                      keyboardType="numeric"
                      placeholder={
                        requestAmount
                          ? requestAmount.toString()
                          : '0'
                      }
                      inputContainerStyle={[ FormStyles.textInputContainer ]}
                      inputStyle={FormStyles.inputText}
                      placeholderTextColor={FormStyles.placeholderText.color}
                      value={customAmount}
                      onChangeText={( text: string ) =>
                        this.setState( {
                          customAmount: text
                        } )
                      }
                      numberOfLines={1}
                    />
                  )}
                  {!canPayCustomAmount && (
                    <View style={styles.button}>
                      <Button
                        title={
                          setCustomAmount
                            ? 'Pay Default'
                            : 'Pay Custom'
                        }
                        icon={{
                          name: 'edit',
                          size: 25,
                          color:'white'
                        }}
                        onPress={() => {
                          if ( setCustomAmount ) {
                            this.setState( {
                              setCustomAmount: false,
                              customAmount: ''
                            } )
                          } else {
                            this.setState( {
                              setCustomAmount: true
                            } )
                          }
                        }}
                        style={styles.button}
                        titleStyle={{
                          color: 'white'
                        }}
                        buttonStyle={{
                          backgroundColor:'white',
                          borderRadius: 30
                        }}
                      />
                    </View>
                  )}
                </View>

                {( !!feeEstimate || feeEstimate === 0 ) && (
                  <React.Fragment>
                    <TouchableOpacity
                      onPress={() => changeUnits()}
                    >
                      <Text
                        style={
                          theme === 'dark'
                            ? styles.labelDark
                            : styles.label
                        }
                      >
                        Fee Estimate:
                      </Text>
                      <Text
                        style={
                          theme === 'dark'
                            ? styles.valueDark
                            : styles.value
                        }
                      >
                        {units && getAmount( feeEstimate )}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                )}

                {!!successProbability && (
                  <React.Fragment>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.labelDark
                          : styles.label
                      }
                    >
                      Success Probability

                    </Text>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.valueDark
                          : styles.value
                      }
                    >
                      {`${successProbability}%`}
                    </Text>
                  </React.Fragment>
                )}

                {!!description && (
                  <React.Fragment>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.labelDark
                          : styles.label
                      }
                    >
                      Description
                                        :
                    </Text>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.valueDark
                          : styles.value
                      }
                    >
                      {description}
                    </Text>
                  </React.Fragment>
                )}

                {!!timestamp && (
                  <React.Fragment>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.labelDark
                          : styles.label
                      }
                    >
                      Timestamp:
                    </Text>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.valueDark
                          : styles.value
                      }
                    >
                      {date}
                    </Text>
                  </React.Fragment>
                )}

                {!!expiry && (
                  <React.Fragment>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.labelDark
                          : styles.label
                      }
                    >
                      Expiry:
                    </Text>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.valueDark
                          : styles.value
                      }
                    >
                      {expiry}
                    </Text>
                  </React.Fragment>
                )}

                {!!cltv_expiry && (
                  <React.Fragment>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.labelDark
                          : styles.label
                      }
                    >
                      CLTV Expiry:
                    </Text>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.valueDark
                          : styles.value
                      }
                    >
                      {cltv_expiry}
                    </Text>
                  </React.Fragment>
                )}

                {!!destination && (
                  <React.Fragment>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.labelDark
                          : styles.label
                      }
                    >
                      Destination:
                    </Text>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.valueDark
                          : styles.value
                      }
                    >
                      {destination}
                    </Text>
                  </React.Fragment>
                )}

                {!!payment_hash && (
                  <React.Fragment>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.labelDark
                          : styles.label
                      }
                    >
                      Payment Hash:
                    </Text>
                    <Text
                      style={
                        theme === 'dark'
                          ? styles.valueDark
                          : styles.value
                      }
                    >
                      {payment_hash}
                    </Text>
                  </React.Fragment>
                )}

              </View>
            )}

            <View>
              <Text>{RESTUtils.supportsMPP()}</Text>
            </View>


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
    flex: 1,
    backgroundColor: 'white'
  },
  darkThemeStyle: {
    flex: 1,
    backgroundColor: 'black',
    color: 'white'
  },
  content: {
    padding: 5
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
    paddingTop: 15,
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
    paddingTop: 15,
    paddingBottom: 15
  },
  textInput: {
    fontSize: 20,
    color: 'black'
  },
  textInputDark: {
    fontSize: 20,
    color: 'white'
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
