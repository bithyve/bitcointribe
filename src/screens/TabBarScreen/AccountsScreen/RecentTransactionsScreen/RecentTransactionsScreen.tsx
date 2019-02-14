import React from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
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
  Text
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome5";
import * as Animatable from "react-native-animatable";
import Accordion from "react-native-collapsible/Accordion";

//TODO: Custome Pages
import { colors, images } from "../../../../app/constants/Constants";
var utils = require("../../../../app/constants/Utils");
import renderIf from "../../../../app/constants/validation/renderIf";

export default class RecentTransactionsScreen extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      activeSections: [],
      recentRrasactionDetials: [],
      collapsed: true,
      transType: ""
    };
  }

  componentWillMount() {
    const { navigation } = this.props;
    let recentTrans = navigation.getParam("transationDetails");
    let sentAndReceivedOn;
    if (recentTrans.transactionType == "Sent") {
      sentAndReceivedOn = "Recipient";
    } else {
      sentAndReceivedOn = "Received On";
    }
    var temp = [
      {
        title: "Hash",
        content: recentTrans.transactionHash
      },
      {
        title: "Date",
        content: utils.getUnixToDateFormat(recentTrans.lastUpdated)
      },
      {
        title: "Amount",
        content: recentTrans.balance / 1e8
      },
      // {
      //   title: sentAndReceivedOn,
      //   content: "pending"
      // },
      {
        title: "Fee",
        content: recentTrans.fees / 1e8
      }
    ];

    this.setState({
      recentRrasactionDetials: temp,
      transType: recentTrans.transactionType
    });
  }

  renderHeader = (section, _, isActive) => {
    return (
      <Animatable.View
        duration={400}
        style={[styles.header, isActive ? styles.active : styles.inactive]}
        transition="backgroundColor"
      >
        <Text style={styles.headerText}>{section.title}</Text>
      </Animatable.View>
    );
  };

  //TODO: func openHashDetails
  async openHashDetails(hashKey) {
    this.props.navigation.push("TransactionDetailsWebViewScreen", {
      url: "https://live.blockcypher.com/btc-testnet/tx/" + hashKey
    });
  }

  renderContent(section, _, isActive) {
    return (
      <Animatable.View
        duration={400}
        style={[styles.content, isActive ? styles.active : styles.inactive]}
        transition="backgroundColor"
      >
        {renderIf(section.title == "Hash")(
          <TouchableOpacity
            key={section.content}
            onPress={() => this.openHashDetails([section.content])}
          >
            <View style={styles.viewHashContent}>
              <Animatable.Text
                style={[styles.content, { flex: 9 }]}
                animation={isActive ? "bounceIn" : undefined}
              >
                {section.content}
              </Animatable.Text>
              <Icon
                style={{ flex: 1, alignSelf: "center" }}
                name="safari"
                size={25}
                color={colors.appColor}
              />
            </View>
          </TouchableOpacity>
        )}
        {renderIf(section.title != "Hash")(
          <Animatable.Text
            style={styles.content}
            animation={isActive ? "bounceIn" : undefined}
          >
            {section.content}
          </Animatable.Text>
        )}
      </Animatable.View>
    );
  }

  render() {
    const { activeSections } = this.state;
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
                style={styles.titleUserName}
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
            <ScrollView>
              <Text style={[styles.title]}>
                Transaction Type : {this.state.transType}
              </Text>
              <Accordion
                activeSections={activeSections}
                sections={this.state.recentRrasactionDetials}
                renderHeader={this.renderHeader}
                renderContent={this.renderContent.bind(this)}
                duration={400}
                collapsed={false}
              />
            </ScrollView>
          </Content>
        </ImageBackground>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(245,252,255,1)"
  },
  backgroundImage: {
    flex: 1,
    backgroundColor: "rgba(245,252,255,1)"
  },
  titleUserName: {
    color: "#ffffff"
  },
  title: {
    textAlign: "center",
    fontSize: 26,
    marginBottom: 20,
    marginTop: 10,
    fontWeight: "bold",
    textDecorationLine: "underline"
  },
  headerText: {
    textAlign: "left",
    paddingLeft: 10,
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#DCECF6"
  },
  content: {
    padding: 10,
    textAlign: "left"
  },
  active: {
    backgroundColor: "rgba(255,255,255,1)"
  },
  inactive: {
    backgroundColor: "rgba(245,252,255,1)",
  },
  //view:viewHashContent
  viewHashContent: {
    flex: 1,
    flexDirection: "row"
  }
});
