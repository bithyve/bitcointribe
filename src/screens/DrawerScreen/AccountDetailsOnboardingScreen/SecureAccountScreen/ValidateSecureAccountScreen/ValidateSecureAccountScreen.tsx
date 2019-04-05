import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  AsyncStorage
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
  Text,
  Input
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import Loader from "react-native-modal-loader";

//TODO: Custome Pages
import {
  colors,
  images,
  localDB,
  errorMessage,
  msg
} from "bithyve/src/app/constants/Constants";
var dbOpration = require("bithyve/src/app/manager/database/DBOpration");
const { width } = Dimensions.get("screen");

//Custome Compontes
import SCLAlertOk from "bithyve/src/app/custcompontes/alert/SCLAlertOk";

//TODO: Bitcoin Files
//import RegularAccount from "bithyve/src/bitcoin/services/RegularAccount";
//import secureAccount from "bithyve/src/bitcoin/services/SecureAccount";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";
let arr_PopupMsg = localization("ValidateSecureAccountScreen.popupMsg");
export default class ValidateSecureAccountScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      tokenKey: "",
      validBtnBgColor: "gray",
      validBtnStaus: true,
      data: [],
      mnemonic: null,
      alertPopupData: [],
      isLoading: false
    };
  }

  // //TODO: Page Life Cycle
  // componentWillMount() {
  //   const { navigation } = this.props;
  //   let data = navigation.getParam("data");
  //   console.log({ data });
  //   this.setState({
  //     data: data,
  //     mnemonic: navigation.getParam("mnemonic")
  //   });
  // }
  //
  // //TODO: func validation
  // validation(val: any) {
  //   if (val.length == 6) {
  //     this.setState({
  //       tokenKey: val,
  //       validBtnBgColor: colors.appColor,
  //       validBtnStaus: false
  //     });
  //   } else {
  //     this.setState({
  //       tokenKey: val,
  //       validBtnBgColor: "gray",
  //       validBtnStaus: true
  //     });
  //   }
  // }
  //
  // //TODO: func click_Validation
  // async click_Validation() {
  //   this.setState({
  //     isLoading: true
  //   });
  //   try {
  //     const dateTime = Date.now();
  //     const fulldate = Math.floor(dateTime / 1000);
  //     const res = await secureAccount.validateSecureAccountSetup(
  //       this.state.tokenKey,
  //       this.state.data.setupData.secret,
  //       this.state.data.walletID
  //     );
  //     if (res.statusCode == 200) {
  //       try {
  //         AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(false));
  //       } catch (error) {
  //         console.log(error);
  //       }
  //       if (res.data.setupSuccessful) {
  //         this.connection_SaveSecureAccount(
  //           fulldate,
  //           this.state.data.multiSig.address,
  //           this.state.data
  //         );
  //       } else {
  //         let arr_failed = arr_PopupMsg[0].failed;
  //         this.setState({
  //           alertPopupData: [
  //             {
  //               theme: "danger",
  //               status: true,
  //               icon: "frown",
  //               title: arr_failed.title,
  //               subtitle: arr_failed.subTitle,
  //               goBackStatus: false
  //             }
  //           ]
  //         });
  //       }
  //     } else {
  //       let arr_failedInvalidToken = arr_PopupMsg[0].failedInvalidToken;
  //       this.setState({
  //         alertPopupData: [
  //           {
  //             theme: "danger",
  //             status: true,
  //             icon: "frown",
  //             title: arr_failedInvalidToken.title,
  //             subtitle: arr_failedInvalidToken.subTitle,
  //             goBackStatus: false
  //           }
  //         ]
  //       });
  //     }
  //     this.setState({
  //       isLoading: false
  //     });
  //     console.log({ res });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  //
  // async connection_SaveSecureAccount(fulldate, address, sercureData) {
  //   const resultCreateAccount = await dbOpration.insertLastBeforeCreateAccount(
  //     localDB.tableName.tblAccount,
  //     fulldate,
  //     address,
  //     "BTC",
  //     "Secure",
  //     "Secure",
  //     sercureData
  //   );
  //   if (resultCreateAccount) {
  //     let arr_success = arr_PopupMsg[0].success;
  //     this.setState({
  //       isLoading: false,
  //       alertPopupData: [
  //         {
  //           theme: "success",
  //           status: true,
  //           icon: "smile",
  //           title: arr_success.title,
  //           subtitle: arr_success.subTitle,
  //           goBackStatus: true
  //         }
  //       ]
  //     });
  //   }
  // }

  render() {
    const { activeSections } = this.state;
    return (
      <Container>
        <ImageBackground
          source={images.appBackgound}
          style={styles.backgroundImage}
        >
          <Header transparent>
            <Left>
              <Button transparent onPress={() => this.props.navigation.pop()}>
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
            <View style={styles.logoSecureAccount}>
              <Image
                style={styles.secureLogo}
                source={images.secureAccount.validationKey}
              />
              <Text style={styles.txtTitle}>
                {localization("ValidateSecureAccountScreen.title")}
              </Text>
              <Input
                name={this.state.tokenKey}
                value={this.state.tokenKey}
                placeholder={localization(
                  "ValidateSecureAccountScreen.txtInputPlaceholder"
                )}
                keyboardType={"numeric"}
                placeholderTextColor={Platform.OS == "ios" ? "#fff" : "#000"}
                style={styles.input}
                onChangeText={val => this.validation(val)}
                onChange={val => this.validation(val)}
              />
            </View>
            <View style={styles.viewValidBtn}>
              <Button
                style={[
                  styles.btnSent,
                  { backgroundColor: this.state.validBtnBgColor }
                ]}
                full
                disabled={this.state.validBtnStaus}
                onPress={() => this.click_Validation()}
              >
                <Text>
                  {" "}
                  {localization(
                    "ValidateSecureAccountScreen.btnValidation"
                  )}{" "}
                </Text>
              </Button>
            </View>
          </Content>
        </ImageBackground>
        <Loader loading={this.state.isLoading} color={colors.appColor} />
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
  backgroundImage: {
    flex: 1
  },
  logoSecureAccount: {
    flex: 2,
    alignItems: "center"
  },
  input: {
    marginTop: 10,
    width: width / 1.1,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    color: Platform.OS == "ios" ? "#fff" : "#000"
  },
  secureLogo: {
    height: 120,
    width: 120
  },
  txtTitle: {
    fontWeight: "bold",
    color: "#000000",
    fontSize: 24
  },
  //view:createAccountBtn
  viewValidBtn: {
    flex: 3,
    marginTop: 20
  }
});
