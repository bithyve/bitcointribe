import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import RESTUtils from '../../../utils/ln/RESTUtils'
import Fonts from '../../../../src/common/Fonts.js'
import Colors from '../../../../src/common/Colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from 'react-native-vector-icons/Ionicons'
import QR from 'react-native-qrcode-svg'
import CopyThisText from '../../../components/CopyThisText';
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper';
import { RFValue } from 'react-native-responsive-fontsize';
import ModalContainer from '../../../components/home/ModalContainer'
import ReceiveAmountContent from '../../../components/home/ReceiveAmountContent'
import GenerateL2Invoice from '../../../components/home/GenerateL2Invoice';
import { inject, observer } from 'mobx-react'

@inject('InvoicesStore')
@observer
export default class ReceiveCoinScreen extends Component {
    constructor(props: any) {
        super(props)
        console.log(props.navigation.getParam('address'), "++()")
        this.state = {
            address: this.props.navigation.getParam('address'),
            size: this.props.navigation.getParam('size'),
            title: this.props.navigation.getParam('title'),
            node: this.props.navigation.getParam('node'),
            showModal: false,
            amount: '',
            hideShow: false,
            showLnModal: false
        }
    }
  
    public fetchInvoice = (expiry: number, memo: string, value: number) => {
        this.props.InvoicesStore.fetchInvoice(this.state.node, expiry, memo, value)
    }

    render() {
        return (
            <View
            style = {{
              flex: 1,
              flexDirection: 'column'
            }}>
          <View
          style={styles.containerQrCode}>
              <QR
              logo={require( '../../../../src/assets/images/icons/icon_hexa.png' )}
              logoSize={50}
              logoMargin={2}
              logoBackgroundColor="white"
              logoBorderRadius={50}
              value={this.props.InvoicesStore.invoice}
              size={this.state.size}
              />
                    {
        this.state.title !== '' && (
          <Text style={styles.textQr}>{this.state.title}</Text>
        )
      }
          </View>
          <CopyThisText
                backgroundColor='white'
                text={this.props.InvoicesStore.invoice}
            />
{/********************************** for on chain invoice *********************************************/}
            <AppBottomSheetTouchableWrapper
            onPress={() => { 
              this.setState({showModal: ! this.state.showModal})
              this.setState({showLnModal: false})
            }}
            style = {styles.selectedView}
            >
              <View style = {styles.text}>
                <Text style = {styles.titleText}>{this.state.amount ? this.state.amount : 'enter amount'}</Text>
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


<ModalContainer onBackground={()=>{
  this.setState( {showModal: false, showLnModal: false})
  }} 
  visible={this.state.showModal} 
  closeBottomSheet={() => {} } 
  >
          <ReceiveAmountContent
        title={'Receive Sats'}
        message={'Receive Sats'}
        onPressConfirm={( amt ) => {
          this.setState({amount: amt, showModal: false, showLnModal: false})
          console.log(this.state.amount, this.state.showModal, "()")
          this.props.InvoicesStore.addSatToInvoice(amt)
        }}
        selectedAmount={this.state.amount}
        onPressBack={() => {
          this.setState({showModal: false, showLnModal: false})
          }
        }
      />
      </ModalContainer>
{/********************************** for on chain invoice *********************************************/}


{/********************************** for off chain invoice *********************************************/}

        <AppBottomSheetTouchableWrapper
            onPress={() => { 
              this.setState({showModal: false})
              this.setState({showLnModal: ! this.state.showLnModal})
            }}
            style = {styles.selectedView}
            >
              <View style = {styles.text}>
                <Text style = {styles.titleText}>{'Receive Via Lightning'}</Text>
              </View>
              <View style={{
            marginLeft: 'auto'
          }}>
            
            <Ionicons
              name="chevron-forward"
              color={'black'}
              size={15}
              style={styles.forwardIcon}
            />
          </View>
            </AppBottomSheetTouchableWrapper>


<ModalContainer onBackground={()=>{
  this.setState( {showModal: false, showLnModal: false})
  }} 
  visible={this.state.showLnModal} 
  closeBottomSheet={() => {} } 
  >

<GenerateL2Invoice
        title={'Receive Sats'}
        message={'Receive Sats'}
        onPressConfirm={( amt, exp, memo ) => {
          this.setState({amount: amt, showModal: false, showLnModal: false})
          console.log(this.state.amount, this.state.showModal, "()", exp, memo)

          this.fetchInvoice(exp, memo, amt)

        }}
        selectedAmount={this.state.amount}
        onPressBack={() => {
          this.setState({showModal: false, showLnModal: false})
          }
        }
      />
      </ModalContainer>

{/********************************** for off chain invoice *********************************************/}


          </View>
        )
    }
}


const styles = StyleSheet.create( {
    containerQrCode: {
      backgroundColor: '#e3e3e3',
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center'
    },
    textQr: {
      color: '#6c6c6c',
      fontSize: 17,
      textAlign: 'center',
      paddingVertical: 7,
    },
text: {
  justifyContent: 'center', marginRight: 10, marginLeft: 10, flex: 1
},
titleText: {
  fontSize: RFValue(12),
  fontFamily: Fonts.FiraSansRegular,
  color: Colors.textColorGrey,
},
selectedView: {
  marginLeft: wp( '5%' ),
  marginRight: wp( '5%' ),
  marginBottom: hp( 4 ),
  marginTop: hp( 2 ),
  flexDirection: 'row',
  alignItems: 'center',
  paddingTop: 15,
  paddingBottom: 20,
  borderBottomColor: Colors.borderColor,
  borderBottomWidth: 1,
},
} )
