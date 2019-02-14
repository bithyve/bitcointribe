import React from "react";
import { Image, StyleSheet, View, Alert, ImageBackground } from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Left,
  Body,
  Text,
  Card,
  CardItem
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
  
//TODO: Custome Pages
import { colors, images, localDB } from "../../../app/constants/Constants";
import SQLite from "react-native-sqlite-storage";
var db = SQLite.openDatabase(localDB.dbName, "1.0", "MyMoney Database", 200000);

//TODO: Wallets
//var RegularAccount = require("../../../bitcoin/services/wallet");
import RegularAccount from "../../../bitcoin/services/RegularAccount";

export default class SentAndReceiveeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addressKey: "",
      privateKey: "",
      finalBal: "Final Balance",
      totalRec: "Total Recieved"
    };
    this.getLocalDBAddress();
    // loaderHandler.showLoader("Loading");
    setTimeout(() => {
      this.getAddressBal();
    }, 100);
  }

  getLocalDBAddress() {
    db.transaction(tx => {
      tx.executeSql(
        "SELECT * FROM " + localDB.tableName.tblWallet,
        [],
        (tx, results) => {
          // Get rows with Web SQL Database spec compliance.
          var len = results.rows.length;
          var addressValue;
          var privateKeyValue;
          if (len > 0) {
            for (let i = 0; i < len; i++) {
              let row = results.rows.item(i);
              this.addressValues = row.address;
              addressValue = row.address;
              privateKeyValue = row.privateKey;
            }

            console.log(addressValue);

            this.setState({
              addressKey: addressValue,
              privateKey: privateKeyValue
            });
          } else {
            Alert.alert("Address not found");
          }
        }
      );
    });
  }

  async getAddressBal() {
    if (this.state.addressKey != "") {
      const bal = await RegularAccount.getBalance(this.state.addressKey);
      console.log("fin bal" + bal.final_balance);
      this.setState({
        finalBal: "Final Balance: " + bal.final_balance / 1e8,
        totalRec: "Total Recieved: " + bal.total_received / 1e8
      });
      //loaderHandler.hideLoader();
    }
  }

  render() {
    return (
      <Container>
        <ImageBackground source={images.appBackgound} style={styles.container}>
          <Header transparent style={{ backgroundColor: colors.appColor }}>
            <Left>
              <Button
                transparent
                onPress={() => this.props.navigation.goBack()}
              >
                <Icon name="chevron-left" size={25} color="#ffffff" />
              </Button>
            </Left>
            <Body style={{ flex: 0, alignItems: "center" }}>
              <Title>My Money</Title>
            </Body>
          </Header>
          <Content padder>
            <Card style={styles.cardSentandRec}>
              <CardItem>
                <View style={styles.viewAppIcon}>
                  <Image
                    style={styles.imgappIcon}
                    resizeMode="contain"
                    source={images.appIcon}
                  />
                  <View style={styles.viewInline}>
                    <Text style={styles.txtBal}> {this.state.finalBal}</Text>
                    <Text style={styles.txtExcRate}>
                      {" "}
                      {this.state.totalRec}
                    </Text>
                  </View>
                </View>
              </CardItem>
              <CardItem footer>
                <View style={styles.viewButtonSaveRec} />

                <Button
                  style={styles.btnSentAndRec}
                  onPress={() =>
                    this.props.navigation.push("SentMoneyScreen", {
                      address: this.state.addressKey,
                      privateKey: this.state.privateKey
                    })
                  }
                >
                  <Text style={styles.txtButtonTitle}> SEND </Text>
                </Button>
                <Button
                  style={styles.btnSentAndRec}
                  onPress={() => {
                    let jsonData = {};
                    jsonData.address = this.state.addressKey;
                    this.props.navigation.push("ReceiveMoneyScreen", {
                      page: "SentAndReceiveScreen",
                      data: jsonData    
                    });   
                  }}
                >
                  <Text style={styles.txtButtonTitle}> RECEIVE </Text>
                </Button>
              </CardItem>
            </Card>
          </Content>
        </ImageBackground>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },

  viewAppIcon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  imgappIcon: {
    height: 70,
    width: 70,
    borderRadius: 35,
    marginBottom: 10
  },
  viewInline: {
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 10
  },
  txtBal: {
    fontSize: 18
  },
  txtExcRate: {
    fontSize: 14,
    color: "red"
  },
  //Buttons
  viewButtonSaveRec: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  btnSentAndRec: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.appColor
  },
  txtButtonTitle: {}
});
