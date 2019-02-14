import React, { Component } from "react";
import { StyleSheet, WebView, ImageBackground } from "react-native";
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
import Icon from "react-native-vector-icons/FontAwesome5";
import Loader from "react-native-modal-loader";
import { colors, images } from "../../../../../app/constants/Constants";
export default class TransactionDetailsWebViewScreen extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: true
    };
  }
  render() {
    const { navigation } = this.props;
    let url = navigation.getParam("url");
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
                onPress={() => this.props.navigation.goBack()}
              >
                <Icon name="chevron-left" size={25} color="#ffffff" />
              </Button>
            </Left>
            <Body style={{ flex: 0, alignItems: "center" }}>
              <Title
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.txtAppTitle}
              >
                Transaction Details
              </Title>
            </Body>
            <Right />
          </Header>
          <Content
            contentContainerStyle={styles.container}
            scrollEnabled={false}
          >
            <WebView
              onLoad={() => this.setState({ isLoading: false })}
              source={{ uri: url }}
            />
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
  txtAppTitle: {
    color: "#fff"
  }
});
