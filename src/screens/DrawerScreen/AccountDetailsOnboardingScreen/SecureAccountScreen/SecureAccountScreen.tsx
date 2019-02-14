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
import Loader from "react-native-modal-loader";

//TODO: Custome class
import { colors, images, localDB } from "../../../../app/constants/Constants";
var dbOpration = require("../../../../app/manager/database/DBOpration");

//TODO: SecureAccount
import secureAccount from "../../../../bitcoin/services/SecureAccount";

export default class SecureAccountScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  //TODO: func click_CreateSecureAccount
  async click_CreateSecureAccount() {
    this.setState({ isLoading: true });
    const resultWallet = await dbOpration.readTablesData(
      localDB.tableName.tblWallet
    );
    console.log({ resultWallet });
    var mnemonic = resultWallet.temp[0].mnemonic.replace(/,/g, " ");
    const secureAccountAssets = await secureAccount.setupSecureAccount(
      mnemonic
    );
    if (secureAccountAssets.statusCode == 200) {
      this.props.navigation.push("SecureSecretKeyScreen", {
        data: secureAccountAssets.data,
        mnemonicKey: mnemonic
      });
    } else {
      this.dropdown.alertWithType(
        "error",
        "OH",
        secureAccountAssets.errorMessage
      );
    }
    this.setState({ isLoading: false });
  }

  //TODO: func stopLoading

  stopLoading(value) {
    this.setState({
      isLoading: value
    });
  }

  render() {
    const { activeSections } = this.state;
    return (
      <Container>
        <Content contentContainerStyle={styles.container} scrollEnabled={false}>
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
                <Title />
              </Body>   
              <Right />
            </Header>

            <View style={styles.logoSecureAccount}>
              <Image
                style={styles.secureLogo}
                source={images.secureAccount.secureLogo}
              />
              <Text style={styles.txtTitle}>Secure Account</Text>
              <Text style={styles.txtNote}>
                
              </Text>
            </View>
            <View style={styles.createAccountBtn}>
              <Button
                transparent
                style={{
                  backgroundColor: colors.appColor,
                  flexDirection: "row",
                  paddingLeft: 20,
                  paddingRight: 10,
                  borderRadius: 5
                }}
                onPress={() => this.click_CreateSecureAccount()}
              >
                <Text style={styles.txtBtnTitle}>Create Account</Text>
                <Icon name="chevron-right" size={25} color="#ffffff" />
              </Button>
            </View>
          </ImageBackground>
        </Content>
        <Loader loading={this.state.isLoading} color={colors.appColor} />
        <DropdownAlert ref={ref => (this.dropdown = ref)} />
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
  logoSecureAccount: {
    flex: 4,
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
  txtNote: {
    padding: 10,
    fontSize: 18,
    marginTop: 20
  },
  //view:createAccountBtn
  createAccountBtn: {
    flex: 2,
    marginTop: 20,
    alignSelf: "center"
  },
  txtBtnTitle: {
    color: colors.white
  }
});
