import React, { Component } from "react";
import { StyleSheet, AsyncStorage } from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Left,
  Right,
  Body
} from "native-base";
//Custome Compontes
import ViewOnBoarding from "../../../app/custcompontes/view/ViewOnBoarding";
import Icon from "react-native-vector-icons/FontAwesome5";
//TODO: Custome object
import { images } from "../../../app/constants/Constants";
export default class AccountDetailsOnboardingScreen extends Component<
  any,
  any
> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      type: null
    };
  }

  //TODO: Page Life Cycle

  componentWillMount() {
    const { navigation } = this.props;
    const type = navigation.getParam("type");

    if (type == "Secure") {
      this.setState({
        data: [
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.secureAccount.img1,
            title: "",
            subtitle:
              "Secure your wallet with state of art the Google Authenticator based 2FA."
          },
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.secureAccount.img2,
            title: "",
            subtitle:
              "Enter/scan the code in your Google Authenticator App and you are ready."
          },
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.secureAccount.img3,
            title: "",
            subtitle:
              "Keep the code, MyMoneyApp pub key and the secondary mnenmonic safe and secure in a separate location."
          }
        ],
        type: type
      });
    } else if (type == "Joint") {
      this.setState({
        data: [
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.jointAccount.img1,
            title: "",
            subtitle:
              "Create a Joint Account in less than a minute with your partner/friend across the globe. Enter your name and name the account to generate a QR Code."
          },
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.jointAccount.img2,
            title: "",
            subtitle:
              "Other party scans the QR code and sends an acknowledgement. As soon as you acknowledge your account is ready for action."
          },
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.jointAccount.img3,
            title: "",   
            subtitle:
              "Any of you can initiate the transaction but needs to be signed by both."
          }
        ],
        type: type
      });
    } else {
      this.setState({
        data: [    
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.vaultAccount.img1,
            title: "",
            subtitle:
              "Save your funds for important occasions by locking them up for a pre-set duration."
          },  
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.vaultAccount.img2,
            title: "",
            subtitle:
              "Your funds are released and ready to use on the pre-set date."
          }  
        ],
        type: type
      });
    }
  }

  async componentDidMount() {
    try {
      AsyncStorage.setItem("flag_BackgoundApp", JSON.stringify(true));
    } catch (error) {
      console.log(error);
    }
  }

  //TODO: func click_Done

  click_Done() {
    if (this.state.type == "Secure") {
      this.props.navigation.push("SecureAccountScreen");
      //this.props.navigation.push("ValidateSecureAccountScreen");
    } else if (this.state.type == "Joint") {
      this.props.navigation.push("CreateJointAccountScreen");
    } else {
      this.props.navigation.push("VaultAccountScreen");
    }
  }

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.container} scrollEnabled={false}>
          <Header
            transparent
            style={{ backgroundColor: "#fff", position: "relative" }}
          >
            <Left>
              <Button transparent onPress={() => this.props.navigation.pop()}>
                <Icon name="chevron-left" size={25} color="#000" />
              </Button>
            </Left>
            <Body style={{ flex: 0, alignItems: "center" }}>
              <Title />
            </Body>
            <Right />
          </Header>

          <ViewOnBoarding
            data={this.state.data}
            click_Done={() => this.click_Done()}
          />
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
