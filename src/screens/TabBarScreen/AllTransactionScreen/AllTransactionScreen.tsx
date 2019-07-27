import React from "react";
import { StyleSheet, ImageBackground, View, FlatList, Text, SafeAreaView, TouchableOpacity } from "react-native";

import Icon from "react-native-vector-icons/FontAwesome";

import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
//TODO: Common Funciton
var utils = require( "HexaWallet/src/app/constants/Utils" );

//TODO: Custome Pages
import { images, colors } from "HexaWallet/src/app/constants/Constants";

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";

//TODO: ModalAllTransaction
import Modal from "HexaWallet/src/app/custcompontes/Model/ModalAllTransactions/ModalAllTransactionDetails.tsx";

import {
  Container,
} from "native-base";
import { SvgIcon } from "@up-shared/components";


//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//TODO: Bitcoin Class
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );


export default class AllTransactionScreen extends React.Component {
  state = {
    modalVisible: false,
    detailsArray: [
      { title: "To Address", value: "8572308235034623" },
      { title: "From Address", value: "234255609325230" },
      { title: "Amount", value: "0.0" },
      { title: "Fees", value: "0.0" },
      { title: "Transaction ID", value: "" },
      { title: "Confirmations", value: "" },
    ],
    selectedTransaction: {
      transactionType: "",
      totalReceived: 0,
      time: "30 April '19 11:00AM",
      NumberofConfirmations: ""
    },
    recentTransactions: [],
    flag_Loading: false
  }

  async getTransaction() {
    this.setState( { flag_Loading: true } );
    let flag_Loading = true;
    let regularAccount = await bitcoinClassState.getRegularClassState();
    var regularAccountTransactions = await regularAccount.getTransactions();
    if ( regularAccountTransactions.status == 200 ) {
      await bitcoinClassState.setRegularClassState( regularAccount );
      regularAccountTransactions = regularAccountTransactions.data;
      this.setState( { recentTransactions: regularAccountTransactions.transactions.transactionDetails } )
      this.setState( { flag_Loading: false } )
    } else {
      alert.simpleOk( "Oops", regularAccountTransactions.err );
    }

  }
  componentWillMount() {
    this.getTransaction();
  }


  setModalVisible( modalVisible ) {
    this.setState( { modalVisible } )
  }
  updateModalData( item ) {
    var detailsArray = [
      { title: "To Address", value: "8572308235034623" },
      { title: "From Address", value: "234255609325230" },
      { title: "Amount", value: item.totalReceived / 1e8 },
      { title: "Fees", value: item.fee / 1e8 },
      { title: "Transaction ID", value: item.txid },
      { title: "Confirmations", value: item.NumberofConfirmations },
    ];
    var selectedTransaction = {
      transactionType: item.transactionType,
      totalReceived: item.totalReceived / 1e8,
      time: "30 April '19 11:00AM",
      NumberofConfirmations: item.NumberofConfirmations
    }
    this.setState( { detailsArray, selectedTransaction } )
  }
  // Recent Transaction Item view
  _renderItem = ( { item, index } ) => {
    return (
      <View style={ { padding: 5 } }>

        <View style={ { flexDirection: "row", alignItems: "center" } }>
          <View>
            <SvgIcon
              name="icon_dailywallet"
              color="#37A0DA"
              size={ 50 }
            />
          </View>

          <View style={ { flex: 1, padding: 5 } }>
            <Text style={ { color: "#151515", fontWeight: "600", fontSize: 14, paddingVertical: 3 } }>{ item.transactionType }</Text>
            <Text style={ { color: "#8B8B8B", fontSize: 12, fontWeight: "600" } }>{ "30 April '19 11:00AM" }</Text>
          </View>

          <View style={ { paddingHorizontal: 10 } }>
            <Icon
              name={ item.transactionType === "Received" ? "long-arrow-down" : "long-arrow-up" }
              color={ item.transactionType === "Received" ? "#51B48A" : "#E64545" }
              size={ 25 }
            />
          </View>
        </View>
        <View style={ { flexDirection: "row", alignItems: "center", padding: 5 } }>
          <View style={ { alignItems: "center", justifyContent: "center" } }>
            <SvgIcon
              name="icon_more"
              color="#E2E2E2"
              size={ 50 }
            />
          </View>
          <TouchableOpacity
            style={ styles.amountView }
            activeOpacity={ 1 }
            onPress={ () => {
              this.updateModalData( item );
              this.setModalVisible( true );
            } }>

            <SvgIcon
              name="icon_bitcoin"
              color="#d0d0d0"
              size={ 30 }
            />
            <View style={ {
              flex: 1, flexDirection: "row", alignItems: 'center', paddingHorizontal: 10
            } }>
              <Text style={ { color: "#2F2F2F", fontSize: 20, fontWeight: "bold" } }>{ item.totalReceived / 1e8 }</Text>
              <Text style={ { color: "#D0D0D0", fontSize: 15, fontWeight: "600", paddingHorizontal: 10 } }>{ item.NumberofConfirmations }</Text>
            </View>

            <SvgIcon
              name="icon_forword"
              color="#C4C4C4"
              size={ 18 }
            />

          </TouchableOpacity>
        </View>
      </View> )
  }


  render() {
    return (
      <Container>
        <SafeAreaView style={ styles.container }>
          <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
            <View>
              <View style={ { flexDirection: "row", padding: 20 } }>
                <Text style={ { color: "#2F2F2F", fontSize: 28, fontWeight: "600", flex: 1 } }>{ "Transactions" }</Text>
                <View style={ styles.filterView }>
                  <Icon
                    name="filter"
                    color="#8B8B8B"
                    size={ 20 }
                  />
                  <Text style={ { color: "#838383", paddingHorizontal: 5, fontSize: 12, fontWeight: "600" } }>{ "Filter Transactions" }</Text>
                </View>
              </View>
              <View>
                <Text style={ styles.subTitleText }>{ "Recent Transactions" }</Text>
              </View>
            </View>
            <FlatList
              style={ { flex: 1, padding: 10 } }
              data={ this.state.recentTransactions }
              renderItem={ this._renderItem }
              keyExtractor={ ( item, index ) => index.toString() }
            />
          </ImageBackground>
          <Modal
            setModalVisible={ this.setModalVisible.bind( this ) }
            modalData={ {
              selectedTransaction: this.state.selectedTransaction,
              detailsArray: this.state.detailsArray,
              modalVisible: this.state.modalVisible,
            }
            }

          />
        </SafeAreaView>
        <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } />
      </Container >
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  amountView: {
    flexDirection: "row", flex: 1, alignItems: "center", padding: 15,
    borderColor: "#EFEFEF",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 20
  },
  filterView: {
    flexDirection: "row",
    padding: 5,
    borderColor: "#D0D0D0",
    borderWidth: 0.5,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    alignItems: "center"
  },
  subTitleText: {
    color: "#B7B7B7",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
    paddingVertical: 10
  }
} );