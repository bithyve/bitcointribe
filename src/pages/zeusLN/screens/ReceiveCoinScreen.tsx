import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import RESTUtils from '../../../utils/ln/RESTUtils'
import Fonts from '../../../../src/common/Fonts.js'
import Colors from '../../../../src/common/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CommonStyles from '../../../common/Styles/Styles'
import Ionicons from 'react-native-vector-icons/Ionicons'
import QR from 'react-native-qrcode-svg'
import CopyThisText from '../../../components/CopyThisText'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper'
import { RFValue } from 'react-native-responsive-fontsize'
import ModalContainer from '../../../components/home/ModalContainer'
import ReceiveAmountContent from '../../../components/home/ReceiveAmountContent'
// import GenerateL2Invoice from "../../../components/home/GenerateL2Invoice";
import { inject, observer } from 'mobx-react'
import { ButtonGroup, Input } from 'react-native-elements'
import QRCode from '../../../components/QRCode'
import BottomInfoBox from '../../../components/BottomInfoBox'
import { translations } from '../../../common/content/LocContext'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FormStyles from '../../../common/Styles/FormStyles'
import Toast from '../../../components/Toast'

@inject( 'InvoicesStore' )
@observer
export default class ReceiveCoinScreen extends Component {
  constructor( props: any ) {
    super( props )
    this.state = {
      selectedIndex: 0,
      size: this.props.navigation.getParam( 'size' ),
      title: this.props.navigation.getParam( 'title' ),
      common: translations [ 'common' ],
      strings: translations [ 'accounts' ],
      amount: '',
      memo: '',
      expiry: '',
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
    this.props.InvoicesStore.createInvoice( memo, amount,  expiry === '' ? '3600': expiry )
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

          />
          <Input
            placeholder={'Enter invoice expiration in seconds'}
            value={this.state.expiry}
            containerStyle={{
            }}
            inputContainerStyle={[ FormStyles.textInputContainer ]}
            inputStyle={FormStyles.inputText}
            placeholderTextColor={FormStyles.placeholderText.color}
            onChangeText={( text: string ) =>
              this.setState( {
                expiry: text.trim(),
              } )
            }
            numberOfLines={1}

          />
          <Input
            placeholder={'Enter memo'}
            value={this.state.memo}
            containerStyle={{
            }}
            inputContainerStyle={[ FormStyles.textInputContainer ]}
            inputStyle={FormStyles.inputText}
            placeholderTextColor={FormStyles.placeholderText.color}
            onChangeText={( text: string ) =>
              this.setState( {
                memo: text.trim(),
              } )
            }
            numberOfLines={1}

          />

          <TouchableOpacity
            style={styles.buttonView}
            activeOpacity={0.6}
            onPress={() => {
              this.createInvoice()
            }}
          >
            <Text style={styles.buttonText}>Create Invoice</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return(
      <View>
<<<<<<< HEAD
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            this.props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
=======
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
>>>>>>> 5da6a1e948b3bedc80eb7f055a9c63d90a52d43d
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
        <ButtonGroup
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          buttons={buttons}
          containerStyle={{
            height: hp( '6%' )
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
<<<<<<< HEAD
        )}
        {selectedIndex === 1 && (
          <View style={styles.containerQrCode}>
            {this.props.InvoicesStore.payment_request ? (
              <QR
                logo={require("../../../../src/assets/images/icons/icon_hexa.png")}
                logoSize={50}
                logoMargin={2}
                logoBackgroundColor="white"
                logoBorderRadius={50}
                value={this.props.InvoicesStore.payment_request}
                size={this.state.size}
              />
            ) : (
              <Text>Loading..</Text>
            )}
            {this.state.title !== "" && (
              <Text style={styles.textQr}>Lightning Address</Text>
            )}
          </View>
        )}
      </View>
    );
=======
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
>>>>>>> 5da6a1e948b3bedc80eb7f055a9c63d90a52d43d
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
