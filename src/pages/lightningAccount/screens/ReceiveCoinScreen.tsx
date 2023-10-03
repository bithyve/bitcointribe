import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import Fonts from '../../../common/Fonts.js'
import Colors from '../../../common/Colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CopyThisText from '../../../components/CopyThisText'
import { RFValue } from 'react-native-responsive-fontsize'
import { inject, observer } from 'mobx-react'
import { ButtonGroup, Input } from 'react-native-elements'
import QRCode from '../../../components/QRCode'
import BottomInfoBox from '../../../components/BottomInfoBox'
import { translations } from '../../../common/content/LocContext'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FormStyles from '../../../common/Styles/FormStyles'
import Toast from '../../../components/Toast'
import HeaderTitle from '../../../components/HeaderTitle'
import CommonStyles from '../../../common/Styles/Styles'
import LinearGradient from 'react-native-linear-gradient'

@inject( 'InvoicesStore' )
@observer
export default class ReceiveCoinScreen extends Component {
  constructor( props: any ) {
    super( props )
    this.state = {
      selectedIndex: 0,
      size: props.route.params?.size,
      title: props.route.params?.title,
      common: translations [ 'common' ],
      strings: translations [ 'accounts' ],
      amount: '',
      memo: '',
      expiry: 0,
      showInvoice: false,
    }
    this.updateIndex = this.updateIndex.bind( this )
  }

  componentDidMount(): void {
    this.props.InvoicesStore.getNewAddress()
  }

  createInvoice = () => {
    const { amount, memo, expiry } = this.state
    if( amount.trim() === '' ) {
      Toast( 'Please enter amount' )
      return
    }
    this.setState( {
      showInvoice: true
    } )
    this.props.InvoicesStore.createInvoice( memo, amount,  expiry === 1 ? '43200' : expiry === 2 ? '86400': '3600' )
  }

  updateIndex( selectedIndex ) {
    this.setState( {
      selectedIndex
    } )
  }

  renderInvoice = () => {
    if( !this.state.showInvoice ) {
      return (
        <View style={styles.containerForm}>
          <Input
            placeholder={'Enter amount in sats'}
            value={this.state.amount}
            containerStyle={{
            }}
            inputContainerStyle={[ FormStyles.textInputContainer ]}
            inputStyle={FormStyles.inputText}
            placeholderTextColor={FormStyles.placeholderText.color}
            onChangeText={( text: string ) =>
              this.setState( {
                amount: text.trim(),
              } )
            }
            numberOfLines={1}
            keyboardType="number-pad"
          />
          <Text style={{
            fontSize: RFValue( 16 ),
            color: Colors.blue,
            fontFamily: Fonts.Regular,
            marginLeft: 10
          } }>
          Invoice Expiration
          </Text>
          <ButtonGroup
            onPress={( index )=> this.setState( {
              expiry: index
            } )}
            selectedIndex={this.state.expiry}
            buttons={[ '1 hour', '12 hours', '24 hours' ]}
            selectedButtonStyle={{
              backgroundColor: Colors.lightBlue,
              borderRadius: 8,
              borderWidth: 0,
            }}
            textStyle={{
              fontFamily: Fonts.Regular
            }}
            innerBorderStyle={{
              width: 0,
            }}
            containerStyle={{
              height: hp( '6%' ),
              borderWidth: 0,
              marginVertical: 10,
              marginBottom: 20
            }}
          />
          <Input
            placeholder={'Add a note(optional)'}
            value={this.state.memo}
            containerStyle={{
            }}
            inputContainerStyle={[ FormStyles.textInputContainer ]}
            inputStyle={FormStyles.inputText}
            placeholderTextColor={FormStyles.placeholderText.color}
            onChangeText={( text: string ) =>
              this.setState( {
                memo: text,
              } )
            }
            numberOfLines={1}

          />

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              this.createInvoice()
            }}
          >
            <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
              start={{
                x: 0, y: 0
              }} end={{
                x: 1, y: 0
              }}
              locations={[ 0.2, 1 ]}
              style={styles.buttonView}
            >
              <Text style={styles.buttonText}>Create Invoice</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )
    }

    return(
      <View>
        {this.props.InvoicesStore.payment_request ? (
          <View style={styles.center}>
            <QRCode
              size={hp( '40%' )}
              title="Lightning invoice"
              value={this.props.InvoicesStore.payment_request}
            />
            <CopyThisText
              backgroundColor={Colors.white}
              text={this.props.InvoicesStore.payment_request}
            />
          </View>
        ) : (
          <ActivityIndicator style={styles.activityIndicator} size="large"/>
        )}
      </View>
    )
  }

  render() {
    const buttons = [ 'Lightning', 'On Chain', ]
    const { selectedIndex } = this.state

    return (
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        overScrollMode="never"
        bounces={false}>
        <HeaderTitle
          firstLineTitle={'Receive'}
          secondLineTitle={'Generate lightning invoice or bitcoin address'}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />
        <ButtonGroup
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          buttons={buttons}
          selectedButtonStyle={{
            backgroundColor: Colors.blue,
            borderRadius: 8,
            borderWidth: 0,
          }}
          innerBorderStyle={{
            width: 0,
          }}
          textStyle={{
            fontFamily: Fonts.Regular
          }}
          containerStyle={{
            height: hp( '6%' ),
            borderWidth: 0,
          }}
        />
        {selectedIndex === 1 ? (
          <View style={styles.containerCenter}>
            {this.props.InvoicesStore.onChainAddress ? (

              <View style={styles.center}>
                <QRCode
                  size={hp( '40%' )}
                  value={this.props.InvoicesStore.onChainAddress}
                  title="Bitcoin address"
                />
                <CopyThisText
                  backgroundColor={Colors.white}
                  text={this.props.InvoicesStore.onChainAddress}
                />
              </View>

            ) : (
              <ActivityIndicator size="large" style={styles.activityIndicator}/>
            )}

          </View>
        ) :
          <View style={styles.containerCenter}>
            {
              this.renderInvoice()
            }
          </View>
        }
        <View style={{
          marginBottom: hp( '2.5%' )
        }}>
          <BottomInfoBox
            title={this.state.common.note}
            infoText={this.state.strings.Itwouldtake}
          />
        </View>
      </KeyboardAwareScrollView>
    )
  }
}

const styles = StyleSheet.create( {
  container: {
    padding: wp( '2%' )
  },

  containerCenter: {
    justifyContent: 'center'
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  activityIndicator: {
    marginVertical: hp( '25%' )
  },

  Input: {

  },

  containerForm: {
    marginVertical:  hp( '2%' )
  },

  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
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
