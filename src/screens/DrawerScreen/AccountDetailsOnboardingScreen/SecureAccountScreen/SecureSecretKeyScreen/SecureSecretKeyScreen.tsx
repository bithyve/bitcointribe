import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ImageBackground,
  Clipboard,
  AsyncStorage,
  ScrollView
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
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
//import { QRCode } from "react-native-custom-qr-codes";
import QRCode from "react-native-qrcode";
import Toast from "react-native-simple-toast";


//TODO: Custome Pages
import { colors, images, msg } from "../../../../../app/constants/Constants";

export default class SecureSecretKeyScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      qrData: "",
      secret: "",
      bhXpub: "",
      data: [],
      mnemonic: null
    };
  }



  componentDidMount() {
    const { navigation } = this.props;
    let data = navigation.getParam("data");

    this.setState({
      data: data,
      mnemonic: navigation.getParam("mnemonic"),
      qrData: data.setupData.qrData,
      secret: data.setupData.secret,
      bhXpub: data.setupData.bhXpub
    });
    this.setAppState(true);
  }

  async setAppState(status: boolean) {
    if (status) {
      try {
        AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(true));
      } catch (error) {
        // Error saving data
      }
    } else {
      try {
        AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(false));
      } catch (error) {
        // Error saving data
      }
    }
  }

  componentWillUnmount() {
    this.setAppState(false);
  }

  //TODO: Func
  click_CopySecretKey = async (text: string) => {
    await Clipboard.setString(text);
    Toast.show("copied.!", Toast.SHORT);
  };

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
            scrollEnabled={true}
            padder
          >

          <View  style={styles.viewSecretKey}>
            <ScrollView contentContainerStyle={{alignItems:'center'}} >
            <QRCode
              value={this.state.qrData}
              size={200}
              bgColor="black"
              fgColor="white"
            />
            <Text style={[styles.txtSecretKeyTitle]}>Secret</Text>
            <TouchableOpacity
              onPress={() => this.click_CopySecretKey(this.state.secret)}
            >
              <Text>{this.state.secret}</Text>
            </TouchableOpacity>
            <Text style={styles.txtStaticMsg} note>
              {msg.secretKeyMsg}
            </Text>
            <Text style={{ textAlign: "center", marginTop: 10 }}>
              Please keep the following details safe with you as they are
              crucial for recovery of the secure account (and we won't be
              storing it).
          </Text>
            <Text
              style={{
                textAlign: "center",
                marginTop: 7,
                fontWeight: "bold",
                textDecorationLine: "underline"
              }}
            >
              Recovery Mnemonic:
            </Text>
            <TouchableOpacity
              onPress={() =>
                this.click_CopySecretKey(this.state.data.recoveryMnemonic)
              }
            >
              <Text style={{ textAlign: "center" }}>
                {this.state.data.recoveryMnemonic}
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                textAlign: "center",
                marginTop: 7,
                fontWeight: "bold",
                textDecorationLine: "underline"
              }}
            >
              BitHyve Xpub:
            </Text>
            <TouchableOpacity
              onPress={() => this.click_CopySecretKey(this.state.bhXpub)}
            >
              <Text style={{ textAlign: "center" }}>{this.state.bhXpub}</Text>
            </TouchableOpacity>
        </ScrollView>
          </View>


            <View style={styles.viewcreateAccountBtn}>
              <Button
                transparent
                style={{
                  backgroundColor: colors.appColor,
                  flexDirection: "row",
                  paddingLeft: 20,
                  paddingRight: 10,
                  borderRadius: 5
                }}
                onPress={() =>
                  this.props.navigation.push("ValidateSecureAccountScreen", {
                    data: this.state.data,
                    mnemonic: this.state.mnemonic
                  })
                }
              >
                <Text style={[styles.txtBtnTitle, styles.txtWhite]}>Next</Text>
                <Icon name="chevron-right" size={25} color="#ffffff" />
              </Button>
            </View>
          </Content>
        </ImageBackground>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  backgroundImage: {
    flex: 1
  },
  txtWhite: {
    color: "#fff"
  },
  viewSecretKey: {
    flex: 10,
    alignItems: "center"
  },
  txtSecretKeyTitle: {
    paddingTop: 5,
    marginBottom: 10,
    fontSize: 22,
    textDecorationLine: "underline"
  },
  txtStaticMsg: {
    paddingTop: 10,
    textAlign: "center"
  },
  //view:createAccountBtn
  viewcreateAccountBtn: {
    flex: 1,
    justifyContent:'center'

  }
});
