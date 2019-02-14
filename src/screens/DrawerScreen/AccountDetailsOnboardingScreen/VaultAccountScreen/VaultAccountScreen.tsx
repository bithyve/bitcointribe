import React from "react";
import { Image, StyleSheet, View, ImageBackground } from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Left,
  Right,
  Body,
  Text
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import DropdownAlert from "react-native-dropdownalert";
import DatePicker from "react-native-datepicker";
import moment from "moment";
import { TagSelect } from "react-native-tag-select";
import Loader from "react-native-modal-loader";
//Custome Compontes
import SCLAlertOk from "../../../../app/custcompontes/alert/SCLAlertOk";
//TODO: Custome class
import { colors, images, localDB } from "../../../../app/constants/Constants";
var utils = require("../../../../app/constants/Utils");
var dbOpration = require("../../../../app/manager/database/DBOpration");

//TODO: Custome Component
import BackButton from "../../../../app/custcompontes/buttons/BackButton";

//TODO: VaultAccount
import vaultAccount from "../../../../bitcoin/services/VaultAccount";

//TODO:flags
let flag_SelectType: boolean = null;
export default class VaultAccountScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
      date: moment(new Date()).format("DD-MM-YYYY"),
      days: "0",
      periodType: "",
      alertPopupData: [],
      isPeriodTypeDialog: false,
      flag_createBtnstatus: true
    };
  }

  componentWillUnmount() {
    this.setState({
      isLoading: false
    });
  }

  //TODO: func click_createVaultAccount
  async click_createVaultAccount() {
    this.setState({
      isLoading: true
    });
    if (flag_SelectType) {
      let itemsValues = JSON.stringify(this.tag.itemsSelected);
      let parseItemVaues = JSON.parse(itemsValues);
      console.log({ parseItemVaues });
      let days = parseItemVaues[0].days;
      let newDate = this.addDays(new Date(), days);
      let unitDate = utils.getUnixTimeDate(newDate);
      let data = {};
      data.validDate = unitDate;
      data.sec = days * 24 * 60 * 60;
      const resultWallet = await dbOpration.readTablesData(
        localDB.tableName.tblWallet
      );
      let mnemonic = resultWallet.temp[0].mnemonic.replace(/,/g, " ");
      const dateTime = Date.now();
      const fulldate = Math.floor(dateTime / 1000);
      const blocks = parseInt(data.sec / (3600 * 10));
      const res = await vaultAccount.createTLC(mnemonic, null, blocks);
      let data1 = {};
      data1.sec = days * 24 * 60 * 60;
      data1.validDate = unitDate;
      data1.lockTime = res.lockTime;
      data1.privateKey = res.privateKey;
      this.connection_VaultAccount(fulldate, res.address, data1);
    } else {
      let hexDate = utils.getUnixTimeDate(this.state.date);
      const resultWallet = await dbOpration.readTablesData(
        localDB.tableName.tblWallet
      );
      let mnemonic = resultWallet.temp[0].mnemonic.replace(/,/g, " ");
      const dateTime = Date.now();
      const fulldate = Math.floor(dateTime / 1000);
      const blocks = -30000; //parseInt(data.sec / (3600 * 10));
      const res = await vaultAccount.createTLC(mnemonic, null, blocks);
      let data1 = {};
      data1.sec = -30000; //days * 24 * 60 * 60;
      data1.validDate = hexDate; //unitDate;
      data1.lockTime = res.lockTime;
      data1.privateKey = res.privateKey;
      this.connection_VaultAccount(fulldate, res.address, data1);
    }
  }

  //TODO: func add days
  addDays(theDate, days) {
    return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
  }
  //TODO: insert db vault account
  async connection_VaultAccount(fulldate, address, data) {
    const resultCreateAccount = await dbOpration.insertLastBeforeCreateAccount(
      localDB.tableName.tblAccount,
      fulldate,
      address,
      "BTC",
      "Vault",
      "Vault",
      data
    );
    if (resultCreateAccount) {
      this.setState({
        isLoading: false,
        alertPopupData: [
          {
            theme: "success",
            status: true,
            icon: "smile",
            title: "Success",
            subtitle: "Vault account Created.",
            goBackStatus: true
          }
        ]
      });
    }
  }

  render() {
    const data = [
      { id: 1, label: "3 Months (90 days)", days: 90 },
      { id: 2, label: "6 Months (180 days)", days: 180 },
      { id: 3, label: "9 Months (270 days)", days: 270 }
    ];
    return (
      <Container>
        <Content contentContainerStyle={styles.container} scrollEnabled={true}>
          <ImageBackground
            source={images.appBackgound}
            style={styles.backgroundImage}
          >
            <Header transparent>
              <Left>
                <BackButton click_Done={() => this.props.navigation.goBack()} />
              </Left>
              <Body style={{ flex: 0, alignItems: "center" }}>
                <Title />
              </Body>
              <Right />
            </Header>
            <View style={styles.logoSecureAccount}>
              <Image
                style={styles.secureLogo}
                source={images.secureAccount.secureLogo}
              />
              <Text style={styles.txtTitle}>Vault Account</Text>
              <Text style={styles.txtLorem} />
            </View>
            <View style={styles.viewDatePicekr}>
              <DatePicker
                style={{ width: "96%", borderColor: "red" }}
                date={this.state.date}
                mode="date"
                max
                placeholder="select date"
                format="DD-MM-YYYY"
                maxDate={new Date()}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: "absolute",
                    left: 0,
                    top: 4,
                    marginLeft: 0
                  },
                  dateInput: {
                    marginLeft: 36
                  }
                }}
                onDateChange={(date: any) => {
                  flag_SelectType = false;
                  this.setState({
                    flag_createBtnstatus: false,
                    date: date
                  });
                  //this.changeDate(date);
                }}
              />
            </View>

            <View style={styles.viewSelectPeriod}>
              <Text style={{ textAlign: "center", marginBottom: 10 }}>OR</Text>
              <TagSelect
                theme="danger"
                containerStyle={{ marginLeft: 20 }}
                onItemPress={() => {
                  flag_SelectType = true;
                  this.setState({
                    flag_createBtnstatus: false
                  });
                }}
                itemStyle={{
                  height: 50,
                  alignItems: "center",
                  justifyContent: "center"
                }}
                data={data}
                max={1}
                ref={(tag: any) => {
                  this.tag = tag;
                }}
                onMaxError={() => {
                  console.log("Ops", "Max reached");
                }}
              />
            </View>
            <View style={styles.viewFotterBtn}>
              <Button
                full
                disabled={this.state.flag_createBtnstatus}
                onPress={() => this.click_createVaultAccount()}
              >
                <Text>Create</Text>
              </Button>
            </View>
          </ImageBackground>
        </Content>
        <Loader loading={this.state.isLoading} color={colors.appColor} />
        <DropdownAlert ref={ref => (this.dropdown = ref)} />
        <SCLAlertOk
          data={this.state.alertPopupData}
          click_Ok={(status: boolean) => {
            status
              ? this.props.navigation.navigate("TabbarBottom")
              : console.log(status),
              this.setState({
                alertPopupData: [
                  {
                    status: false
                  }
                ]
              });
          }}
        />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1
  },
  //View:logoSecureAccount
  logoSecureAccount: {
    flex: 3,
    alignItems: "center"
  },
  secureLogo: {
    height: 120,
    width: 120
  },
  txtTitle: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 28
  },
  txtLorem: {
    textAlign: "center",
    marginTop: 10
  },
  //view:viewSelectPeriod
  viewSelectPeriod: {
    flex: 2,
    padding: 10,
    alignItems: "center"
  },
  viewDatePicekr: {},
  //view:viewFotterBtn
  viewFotterBtn: {}
});
