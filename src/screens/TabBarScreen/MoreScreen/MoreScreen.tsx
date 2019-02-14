import React from "react";
import {
  StyleSheet,
  View,
  ImageBackground,
  TouchableHighlight,
  StatusBar
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
  Text
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import GridView from "react-native-super-grid";

//TODO: Custome Pages
import { colors, images } from "../../../app/constants/Constants";
export default class MoreScreen extends React.Component {
  constructor(props) {
    super(props);
    StatusBar.setBackgroundColor(colors.appColor, true);
    this.state = {
      spinner: false
    };
  }

  //TODO: Page life cycle
  componentDidMount() {
    // loaderHandler.hideLoader();
  }

  //TODO: func openPage
  openPage() {
    // loaderHandler.showLoader("Loading");
    this.props.navigation.push("BackupPhraseScreen");
  }

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
          <Content contentContainerStyle={styles.container}>
            <GridView
              itemDimension={300}
              items={["Show Backup Phrase"]}
              renderItem={item => (
                <TouchableHighlight onPress={() => this.openPage()}>
                  <View style={[styles.itemContainer]}>
                    <Icon
                      name="key"
                      size={20}
                      style={styles.iconStyle}
                      color="#ffffff"
                    />
                    <Text style={styles.txtMenuList}>{item}</Text>
                  </View>
                </TouchableHighlight>
              )}
            />
          </Content>
        </ImageBackground>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  //Grid
  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.appColor,
    borderRadius: 5,
    padding: 10,
    height: 50
  },
  txtMenuList: {
    marginLeft: 15,
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 22
  },
  iconStyle: {
    alignSelf: "center"
  }
});
