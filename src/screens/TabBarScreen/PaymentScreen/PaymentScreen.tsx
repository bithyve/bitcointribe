import React from "react";
import { ImageBackground, StatusBar, StyleSheet } from "react-native";
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
import Icon from "react-native-vector-icons/FontAwesome";
//TODO: Custome Pages
import { colors, images } from "../../../app/constants/Constants";

export default class PaymentScreen extends React.Component {
  constructor(props: any) {
    super(props);
    StatusBar.setBackgroundColor(colors.appColor, true);
    this.state = {};
  }

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.container}>
          <ImageBackground
            source={images.appBackgound}
            style={styles.backgroundImage}
            imageStyle={{
              resizeMode: "cover" // works only here!
            }}
          >
            <Header transparent>
              <Left>
                <Button
                  transparent
                  onPress={() => this.props.navigation.toggleDrawer()}
                >
                  <Icon name="bars" size={25} color="#ffffff" />
                </Button>
              </Left>
              <Body style={{ flex: 0, alignItems: "center" }}>
                <Title adjustsFontSizeToFit={true} numberOfLines={1}>
                  My Money
                </Title>
              </Body>
              <Right />
            </Header>
          </ImageBackground>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    width: "100%"
  }
});
