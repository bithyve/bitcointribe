import React, { Component, ReactElement, useCallback } from 'react'
import { Text, View, FlatList, StyleSheet } from 'react-native'
import { Button } from 'react-native-elements/dist/buttons/Button'
import RESTUtils from '../../../utils/ln/RESTUtils'
import axios from "axios";
import Fonts from '../../../../src/common/Fonts.js'
import Colors from '../../../../src/common/Colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { ScrollView } from 'react-native-gesture-handler'
import Ionicons from 'react-native-vector-icons/Ionicons'
import SendAndReceiveButtonsFooter from '../Accounts/Details/SendAndReceiveButtonsFooter';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { widthPercentageToDP } from 'react-native-responsive-screen'
import useAccountShellFromNavigation from '../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation';
import QR from 'react-native-qrcode-svg'
import CopyThisText from '../../../components/CopyThisText';
import RNFetchBlob from 'rn-fetch-blob'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper';
import { RFValue } from 'react-native-responsive-fontsize';
import ModalContainer from '../../../components/home/ModalContainer'
import ReceiveAmountContent from '../../../components/home/ReceiveAmountContent'
import GenerateL2Invoice from '../../../components/home/GenerateL2Invoice';

export default class ReceiveCoinScreen extends Component {
    constructor(props) {
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

    // nodeLink = 'https://testnet.demo.btcpayserver.org/lnd-rest/btc'
    // macaroon = '0201036c6e6402bb01030a1002c733cd1cb35204eba836d2d5d24f321201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a0570656572731204726561641205777269746500000620cd11cf634d69fc486b46489b31d924fcbb86aedf0387a6f491b7ea916f7fb609'
    public fetchInvoice = async (expiry, memo, value) => {
        let body = {
          memo,
          value,
          expiry
        }
        console.log(this.state.node)
        try {
          await RESTUtils.createInvoice(this.state.node, body).then((resp: any) => {
            console.log(resp.payment_request)
            this.setState({address: resp.payment_request})
          })
        } catch { (err) => {
          console.log(err)
          }
        }
    }


  // showReceiveAmountBottomSheet = useCallback( () => {
  //   return(
  //     <ReceiveAmountContent
  //       title={'Receive Sats'}
  //       message={'Receive Sats'}
  //       onPressConfirm={( amount ) => {
  //         // setAmount( amount )
  //         this.setState({amount: amount})
  //         this.setState({showModal: false})
  //       }}
  //       selectedAmount={'23'}
  //       onPressBack={() => {
  //         this.setState({showModal: false})
  //       }
  //       }
  //     />
  //   )
  // }, [ '23' ] )

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
              value={this.state.address}
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
                text={this.state.address}
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
          this.setState({address: 'bitcoin:' + this.state.address + '?amount=' + amt})
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
      flex: 2,
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
  // fontFamily: Fonts.FiraSansRegular,
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


  // const styles = StyleSheet.create( {
  //   rootContainer: {
  //     flex: 1,
  //     backgroundColor: Colors.backgroundColor1
  //   },
  //   text1: {
  //     marginLeft: wp( '5%' ),
  //     marginRight: wp( '5%' ),
  //     marginBottom: wp( '5%' )
  //   },
  //   forwardIcon: {
  //     marginLeft: wp( '3%' ),
  //     marginRight: wp( '3%' ),
  //     alignSelf: 'center',
  //   },
  //   QRView: {
  //     height: hp( '30%' ),
  //     justifyContent: 'center',
  //     marginLeft: 20,
  //     marginRight: 20,
  //     alignItems: 'center',
  //     marginTop: hp( '3%' )
  //   },
  //   dropDownElement: {
  //     backgroundColor: Colors.white,
  //     flexDirection: 'row',
  //     alignItems: 'center',
  //     paddingTop: wp( '2%' ),
  //     paddingBottom: wp( '2%' ),
  //     paddingLeft: wp( '3%' ),
  //     paddingRight: wp( '3%' ),
  //     width: wp( '90%' ),
  //   },
  //   dropDownView: {
  //     flex: 1,
  //     marginBottom: hp( '4%' ), marginTop: hp( '60%' ),
  //     backgroundColor: Colors.white,
  //     marginLeft: wp( '5%' ),
  //     marginRight: wp( '5%' ),
  //     borderRadius: 10,
  //     borderWidth: 1,
  //     borderColor: Colors.borderColor,
  //   },
  //   titleText: {
  //     fontSize: RFValue( 12 ),
  //     fontFamily: Fonts.FiraSansRegular,
  //     color: Colors.textColorGrey,
  //   },
  //   imageView: {
  //     width: wp( '15%' ), height: wp( '15%' ), backgroundColor: Colors.backgroundColor, borderRadius: wp( '15%' ) / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white,
  //     shadowOffset: {
  //       width: 0,
  //       height: 5,
  //     },
  //     shadowOpacity: 0.7,
  //     shadowColor: Colors.borderColor,
  //     shadowRadius: 5,
  //     elevation: 10
  //   },
  //   accountName: {
  //     color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 16 )
  //   },
  //   balanceText: {
  //     color: Colors.blue, fontFamily: Fonts.FiraSansMediumItalic, fontSize: RFValue( 10 ), marginTop: 5
  //   },
  
  //   selectedView: {
  //     marginLeft: wp( '5%' ),
  //     marginRight: wp( '5%' ),
  //     marginBottom: hp( 4 ),
  //     marginTop: hp( 2 ),
  //     flexDirection: 'row',
  //     alignItems: 'center',
  //     paddingTop: 15,
  //     paddingBottom: 20,
  //     borderBottomColor: Colors.borderColor,
  //     borderBottomWidth: 1,
  //   },
  // } )
  