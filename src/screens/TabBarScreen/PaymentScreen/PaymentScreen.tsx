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
import { colors, images } from "bithyve/src/app/constants/Constants";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";
export default class PaymentScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.container}>
          <StatusBar
            backgroundColor={colors.appColor}
            barStyle="dark-content"
          />
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
                  {localization("appConfig.appName")}
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
