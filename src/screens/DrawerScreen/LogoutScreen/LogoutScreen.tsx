import React from "react";
import { StyleSheet, ImageBackground } from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Left,
  Body,
  Text
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";

//TODO: Custome Pages
import { colors, images } from "../../../app/constants/Constants";

export default class LogoutScreen extends React.Component {
  render() {
    return (
      <Container>
        <ImageBackground source={images.appBackgound} style={styles.container}>
          <Header transparent style={{ backgroundColor: colors.appColor }}>
            <Left>
              <Button
                transparent
                onPress={() => this.props.navigation.toggleDrawer()}
              >
                <Icon name="bars" size={25} color="#ffffff" />
              </Button>
            </Left>

            <Body style={{ flex: 0, alignItems: "center" }}>
              <Title>Header</Title>
            </Body>
          </Header>
          <Content>
            <Text>This is Content Section</Text>
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
  }
});
