import React from "react";
import {
  Image,
  StyleSheet,
  Dimensions,
  View,
  StatusBar,
  TouchableOpacity,
  ImageBackground
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
  Text,
  Footer
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import GridView from "react-native-super-grid";
import Toast from "react-native-simple-toast";

//TODO: Custome Pages
import { images } from "../../../app/constants/Constants";

export default class VerifyBackupPhraseScreen extends React.Component {
  constructor(props:any) {
    super(props);
    StatusBar.setHidden(false);
    var verifyArray = [[]];
    this.state = {
      numanicValues: [[]],
      verifyNumanic: [[]],
      verifyNumanicValues: [[]],
      visible: false,
      btnDoneBgColor: "gray",
      btnDoneDisbleFlag: true
    };
  }

  //TODO: Page Life Cycle
  componentWillMount() {
    const { navigation } = this.props;
    const secoundGridArray = navigation.getParam("numanicValues");
    this.verifyArray = secoundGridArray;
    var temp = [];
    var len = secoundGridArray.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        var data = secoundGridArray[i];
        var joined = { name: data };
        temp.push(joined);
      }
      temp = this.shuffle(temp);
      this.setState({
        numanicValues: temp
      });
    }
  }

  componentDidMount() {
    this.setState({
      verifyNumanicValues: [],
      verifyNumanic: []
    });
  }

  //TODO: randomise  array show
  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  //TODO: function secound grid click
  click_SecoundGridItem(item) {
    // First Grid add Values
    var temp = [];
    var joined = { name: item };
    temp.push(joined);
    var joinedCat = this.state.verifyNumanicValues.concat(temp);
    this.setState({
      verifyNumanicValues: joinedCat
    });
    //Secound Grid remove values
    var temp1 = [[]];
    temp1 = this.state.numanicValues;
    // var index = this.functiontofindIndexByKeyValue(temp1, "name", item);
    let selectedIndex = temp1.findIndex(
      filterCarObj => filterCarObj["name"] === item
    );
    temp1.splice(selectedIndex, 1);
    this.setState({
      numanicValues: temp1
    });
    this.condition_DoneButtonCheckDiaEna(false);
  }
  //TODO: Function First Grid Click
  click_FirstGridItem(item) {
    // First Grid add Values
    var temp = [];
    var joined = { name: item };
    temp.push(joined);
    var joinedCat = this.state.numanicValues.concat(temp);
    this.setState({
      numanicValues: joinedCat
    });
    //Secound Grid remove values
    var temp1 = [[]];
    temp1 = this.state.verifyNumanicValues;
    let selectedIndex = temp1.findIndex(
      filterCarObj => filterCarObj["name"] === item
    );
    temp1.splice(selectedIndex, 1);
    this.setState({
      verifyNumanicValues: temp1
    });
    this.condition_DoneButtonCheckDiaEna(true);
  }

  condition_DoneButtonCheckDiaEna(flag) {
    if (this.state.numanicValues.length == 0 && flag == false) {
      this.setState({
        btnDoneBgColor: "#F5951D",
        btnDoneDisbleFlag: false
      });
    } else {
      this.setState({
        btnDoneBgColor: "gray",
        btnDoneDisbleFlag: true
      });
    }
  }

  //TODO: funciton done
  click_Done() {
    var temp = [];
    var len = this.verifyArray.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        var data = this.verifyArray[i];
        var joined = { name: data };
        temp.push(joined);
      }
      this.setState({ verifyNumanic: temp }, function() {
        if (
          JSON.stringify(this.state.verifyNumanic) ===
          JSON.stringify(this.state.verifyNumanicValues)
        ) {
          Toast.show("Thanks", Toast.SHORT);
          // const actionToDispatch = StackActions.reset({
          //     index: 0,
          //     key: null,
          //     actions: [NavigationActions.navigate({ routeName: 'TabbarBottom' })],
          // });
          // this.props.navigation.dispatch(actionToDispatch);
          // try {
          //     AsyncStorage.setItem("@loadingPage:key", "Home");
          //     AsyncStorage.setItem("@signedPage:key", "Home");
          // } catch (error) {
          //     // Error saving data
          // }
        } else {
          Toast.show("Invalid order.Try again!", Toast.SHORT);
        }
      });
    }
  }

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
                Verification
              </Title>
            </Body>
            <Right />
          </Header>
          <Content contentContainerStyle={styles.container}>
            <View style={styles.viewTitle}>
              <Image
                style={styles.backupImg}
                resizeMode="contain"
                source={images.verifyBackupPhraseScreen.verifyBackupPhraseLogo}
              />
              <Text style={styles.desc}>
                Tap the words to put them next to each other in the correct
                order.
              </Text>
            </View>
            <View style={styles.viewNumanicValueConfi}>
              <GridView
                itemDimension={100}
                items={this.state.verifyNumanicValues}
                style={styles.gridViewFirst}
                renderItem={item => (
                  <TouchableOpacity
                    onPress={() => this.click_FirstGridItem(item.name)}
                  >
                    <View style={styles.itemContainerSecound}>
                      <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
            <View style={styles.viewNumanicValue}>
              <GridView
                itemDimension={100}
                items={this.state.numanicValues}
                style={styles.gridViewSecound}
                renderItem={item => (
                  <TouchableOpacity
                    onPress={() => this.click_SecoundGridItem(item.name)}
                  >
                    <View style={styles.itemContainerSecound}>
                      <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Content>
          <Footer style={styles.footer}>
            <Button
              style={[
                styles.btnNext,
                { backgroundColor: this.state.btnDoneBgColor }
              ]}
              disabled={this.state.btnDoneDisbleFlag}
              onPress={() => this.click_Done()}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center"
                }}
              >
                DONE
              </Text>
            </Button>
          </Footer>
        </ImageBackground>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  titleUserName: {
    color: "#ffffff"
  },
  viewTitle: {
    flex: 1,
    alignItems: "center",
    marginTop: 20
  },
  backupImg: {
    marginBottom: 10
  },
  desc: {
    textAlign: "center",
    color: "gray"
  },
  //Numanic Values show
  viewNumanicValueConfi: {
    flex: 1,
    backgroundColor: "#ECF0F4",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10
  },
  viewNumanicValue: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10
  },
  secrityChar: {
    fontSize: 20,
    padding: 1
  },
  btnCopy: {
    alignSelf: "center",
    fontWeight: "bold",
    marginTop: 10
  },
  //next button style
  btnNext: {
    width: Dimensions.get("screen").width - 50,
    height: 40,
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: "center"
  },
  //secound grid view
  gridViewSecound: {},
  itemContainerSecound: {
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 5,
    padding: 5,
    alignItems: "center"
  },
  //Fotter
  footer: {
    backgroundColor: "transparent"
  }
});
