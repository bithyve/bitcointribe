import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
  Clipboard,
  Dimensions
} from "react-native";
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
//import { QRCode } from "react-native-custom-qr-codes";
import QRCode from "react-native-qrcode";
import Toast from "react-native-simple-toast";
import Share from "react-native-share";
import Loader from "react-native-modal-loader";
//TODO: Custome Pages
import { colors, images, localDB } from "../../../../app/constants/Constants";

var dbOpration = require("../../../../app/manager/database/DBOpration");
//TODO: VaultAccount
import jointAccount from "../../../../bitcoin/services/JointAccount";

export default class ReceiveMoneyScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      qrcodedata: "mymoney",
      isLoading: false
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    let page = navigation.getParam("page");
    let data = navigation.getParam("data");
    console.log({ page, data });
    let address: string;
    if (page == "SentAndReceiveScreen") {
      address = data.address;
    } else if (page == "CreateJointAccountScreen") {
      this.createJointAccount();
    } else if (page == "MergeConfirmJointAccountScreen") {
      let dataJson = JSON.parse(data);
      console.log({ dataJson });
      console.log(JSON.stringify(dataJson));
      address = data;
    } else if (page == "SentMoneyScreen") {
      address = data;
    } else if (page == "AccountDetailsScreen") {
      address = data;
    }

    this.setState({
      qrcodedata: address
    });
  }

  async createJointAccount() {
    const { navigation } = this.props;
    let data = navigation.getParam("data");
    let address: string;
    const resultWallet = await dbOpration.readTablesData(
      localDB.tableName.tblWallet
    );
    let mnemonic = resultWallet.temp[0].mnemonic.replace(/,/g, " ");

    const details = {
      creator: data.name,
      walletName: data.walletName
    };
    let res = jointAccount.initiateJointAccount(mnemonic, details);
    this.setState({
      qrcodedata: res
    });
  }

  //TODO: Func Copy they code
  click_CopyAddress = async () => {
    await Clipboard.setString(this.state.qrcodedata);
    Toast.show("Address copyed.!", Toast.SHORT);
  };

  //TODO: func click_SentQrCode
  click_SentQrCode() {
    const { navigation } = this.props;
    let page = navigation.getParam("page");
    var shareOptions;
    if (page == "CreateJointAccountScreen") {
      shareOptions = {
        title: "Address",
        message:
          "https://mobile.cmshuawei.com/jointAccountCreate/MergeConfirmJointAccountScreen/" +
          this.state.qrcodedata,
        url: "\nhttps://bithyve.com/",
        subject: "MyMoney" //  for email
      };
    } else if (page == "MergeConfirmJointAccountScreen") {
      shareOptions = {
        title: "Address",
        message:
          "https://mobile.cmshuawei.com/CreateJointAccountScreen/" +
          this.state.qrcodedata,
        url: "\nhttps://bithyve.com/",
        subject: "MyMoney" //  for email
      };
    } else {
      shareOptions = {
        title: "Address",
        message: this.state.qrcodedata,
        url: "\nhttps://bithyve.com/",
        subject: "MyMoney" //  for email
      };
    }

    Share.open(shareOptions);
  }

  render() {
    return (
      <Container>
        <ImageBackground
          source={images.appBackgound}
          style={styles.backgroundImage}
        >
          <Header transparent>
            <Left>
              <Button
                transparent
                onPress={() => {
                  if (
                    this.props.navigation.getParam("page") ==
                    "MergeConfirmJointAccountScreen"
                  ) {
                    this.props.navigation.navigate("TabbarBottom");
                  } else {
                    this.props.navigation.goBack();
                  }
                }}
              >
                <Icon name="chevron-left" size={25} color="#ffffff" />
              </Button>
            </Left>
            <Body style={{ flex: 0, alignItems: "center" }}>
              <Title
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.titleUserName}
              />
            </Body>
            <Right />
          </Header>
          <Content
            contentContainerStyle={styles.container}
            scrollEnabled={false}
            padder
          >
            <View style={styles.viewShowQRcode}>
              <QRCode
                value={this.state.qrcodedata}
                size={Dimensions.get("screen").width - 70}
                bgColor="black"
                fgColor="white"
              />
              <TouchableOpacity onPress={() => this.click_CopyAddress()}>
                <Text style={styles.txtBarcode} numberOfLines={4} note>
                  {this.state.qrcodedata}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewShareButtonMain}>
              <View style={styles.viewSahreBtn}>
                <Button
                  transparent
                  onPress={() => {
                    this.click_SentQrCode();
                  }}
                >
                  <Icon name="share-square" size={25} color="#ffffff" />
                  <Text style={styles.titleUserName}>Share</Text>
                </Button>
              </View>
            </View>
          </Content>
        </ImageBackground>
        <Loader loading={this.state.isLoading} color={colors.appColor} />
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
  titleUserName: {
    color: "#ffffff"
  },
  viewShowQRcode: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  txtTitle: {
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "bold"
  },
  txtBarcode: {
    marginTop: 40,
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center"
  },
  btnCopy: {
    backgroundColor: colors.appColor
  },
  //share button
  viewShareButtonMain: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center"
  },
  viewSahreBtn: {
    backgroundColor: colors.appColor,
    paddingLeft: 10,
    borderRadius: 10
  }
});
