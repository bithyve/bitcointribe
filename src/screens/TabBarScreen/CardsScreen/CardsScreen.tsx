import React from "react";
import { StyleSheet, ImageBackground } from "react-native";
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
import { images } from "../../../app/constants/Constants";

export default class CardsScreen extends React.Component {
  render() {
    return (
      <Container>
        <ImageBackground source={images.appBackgound} style={styles.container}>
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
              <Title>My Money</Title>
            </Body>
            <Right>
              <Button transparent>
                <Icon name="bell" size={15} color="#ffffff" />
              </Button>
              <Button transparent>
                <Icon name="plus" size={25} color="#ffffff" />
              </Button>
            </Right>
          </Header>
          <Content />
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
