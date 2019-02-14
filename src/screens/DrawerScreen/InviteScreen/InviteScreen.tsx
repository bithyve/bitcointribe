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
  Body,
  Text
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";

//TODO: Custome Pages
import { colors, images, localDB } from "../../../app/constants/Constants";

export default class InviteScreen extends React.Component {
  render() {
    return (
      <Container>
        <ImageBackground source={images.appBackgound} style={styles.container}>
          <Header transparent>
            <Left>
              <Button
                transparent
                onPress={() => this.props.navigation.goBack()}
              >
                <Icon name="chevron-left" size={25} color="#ffffff" />
              </Button>
            </Left>

            <Body style={{ flex: 0, alignItems: "center" }}>
              <Title
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.titleUserName}
              >
                Invite
              </Title>
            </Body>
            <Right />
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
  },
  titleUserName: {
    color: "#ffffff"
  }
});
