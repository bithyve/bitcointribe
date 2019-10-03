import React from "react";
import { StyleSheet, ImageBackground, StatusBar } from "react-native";
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
import { images, colors } from "bithyve/src/app/constants/Constants";

//localization
import { localization } from "bithyve/src/app/manage/Localization/i18n";

export default class CardsScreen extends React.Component {
  render() {
    return (
      <Container>
        <StatusBar backgroundColor={ colors.appColor } barStyle="dark-content" />
        <ImageBackground source={ images.appBackgound } style={ styles.container }>
          <Header transparent>
            <Left>
              <Button
                transparent
                onPress={ () => this.props.navigation.toggleDrawer() }
              >
                <Icon name="bars" size={ 25 } color="#ffffff" />
              </Button>
            </Left>

            <Body style={ { flex: 0, alignItems: "center" } }>
              <Title>{ localization( "appConfig.appName" ) }</Title>
            </Body>
            <Right>
              <Button transparent>
                <Icon name="bell" size={ 15 } color="#ffffff" />
              </Button>
              <Button transparent>
                <Icon name="plus" size={ 25 } color="#ffffff" />
              </Button>
            </Right>
          </Header>
          <Content />
        </ImageBackground>
      </Container>
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
} );
