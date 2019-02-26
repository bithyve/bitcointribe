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
import ViewOnBoarding from "bithyve/src/app/custcompontes/view/ViewOnBoarding";
import Icon from "react-native-vector-icons/FontAwesome5";
//TODO: Custome object
import { images, msg } from "bithyve/src/app/constants/Constants";
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
            title: msg.accountDetails.secure.title1,
            subtitle: msg.accountDetails.secure.subTitle1
          },
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.secureAccount.img2,
            title: msg.accountDetails.secure.title2,
            subtitle: msg.accountDetails.secure.subTitle2
          },
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.secureAccount.img3,
            title: msg.accountDetails.secure.title3,
            subtitle: msg.accountDetails.secure.subTitle3
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
            title: msg.accountDetails.joint.title1,
            subtitle: msg.accountDetails.joint.subTitle1
          },
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.jointAccount.img2,
            title: msg.accountDetails.joint.title2,
            subtitle: msg.accountDetails.joint.subTitle2
          },
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.jointAccount.img3,
            title: msg.accountDetails.joint.title3,
            subtitle: msg.accountDetails.joint.subTitle3
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
            title: msg.accountDetails.vault.title1,
            subtitle: msg.accountDetails.vault.subTitle1
          },
          {
            backgroundColor: "#fff",
            image: images.accountDetailsOnBoarding.vaultAccount.img2,
            title: msg.accountDetails.vault.title2,
            subtitle: msg.accountDetails.vault.subTitle2
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
