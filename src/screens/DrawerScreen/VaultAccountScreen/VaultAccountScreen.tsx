import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  View,
  ImageBackground,
  TextInput
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
import { SkypeIndicator } from "react-native-indicators";
import DropdownAlert from "react-native-dropdownalert";
import { RkCard } from "react-native-ui-kitten";
import DatePicker from "react-native-datepicker";
import moment from "moment";

//TODO: Custome class
import { colors, images } from "../../../app/constants/Constants";
import renderIf from "../../../app/constants/validation/renderIf";

export default class VaultAccountScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      date: moment(new Date()).format("DD-MM-YYYY"),
      days: "0",
      periodType: "",
      isPeriodTypeDialog: false
    };
    this.changeDateAndroid = this.changeDateAndroid.bind(this);
  }

  //TODO: Page Life Cycle
  componentDidMount() {
    this.setState({
      date: moment(new Date()).format("DD-MM-YYYY"),
      days: "0",
      daysText: "Total Days"
    });
  }

  //TODO: func changeDaysValue
  changeDaysValue(val) {
    let newDate = this.addDays(new Date(), val);
    this.setState({
      date: moment(newDate).format("DD-MM-YYYY"),
      days: val
    });
  }

  handleDatePicked = date => {
    let start = moment(this.addDays(date, 1), "DD-MM-YYYY");
    let end = moment(new Date(), "DD-MM-YYYY");
    let diff = Math.round((start - end) / (1000 * 60 * 60 * 24));
    console.log("change date =" + diff);
    this.setState({
      date: moment(date).format("DD-MM-YYYY"),
      days: diff.toString()
    });
  };

  changeDateAndroid(date) {
    let start = moment(date, "DD-MM-YYYY");
    let end = moment(new Date(), "DD-MM-YYYY");
    let diff = Math.round((start - end) / (1000 * 60 * 60 * 24));
    this.setState({
      date: date,
      days: diff.toString()
    });
  }

  addDays(theDate, days) {
    return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
  }

  render() {
    return (
      <Container>
        <Content contentContainerStyle={styles.container} scrollEnabled={true}>
          <ImageBackground
            source={images.appBackgound}
            style={styles.backgroundImage}
          >
            <Header transparent>
              <Left>
                <Button transparent onPress={() => this.props.navigation.pop()}>
                  <Icon name="chevron-left" size={25} color="#ffffff" />
                </Button>
              </Left>
              <Body style={{ flex: 0, alignItems: "center" }}>
                <Title />
              </Body>
              <Right />
            </Header>

            <View style={styles.logoSecureAccount}>
              <Image
                style={styles.secureLogo}
                source={images.secureAccount.secureLogo}
              />
              <Text style={styles.txtTitle}>Vault Account</Text>
              <Text style={styles.txtLorem}>
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s.
              </Text>
            </View>

            <View style={styles.viewSelectPeriod}>
              <RkCard style={styles.rkCard}>
                <View style={styles.viewDays}>
                  <Text style={{ flex: 3, alignSelf: "center" }}>
                    No. Days:
                  </Text>
                  <TextInput
                    name={this.state.days}
                    value={this.state.days}
                    placeholder="Total Days"
                    keyboardType={"numeric"}
                    placeholderTextColor="#000"
                    style={styles.input}
                    onChangeText={val => this.changeDaysValue(val)}
                    onChange={val => this.changeDaysValue(val)}
                  />
                </View>
                <View style={styles.viewDateWise}>
                  <Text style={{ flex: 3, alignSelf: "center" }}>
                    Mutual Date:
                  </Text>
                  {renderIf(Platform.OS == "ios")(
                    <DatePicker
                      date={this.state.date}
                      mode="date"
                      showIcon={false}
                      hideText={true}
                      format="DD-MM-YYYY"
                      minDate={new Date()}
                      onDateChange={date => this.handleDatePicked(date)}
                    />
                  )}
                  {renderIf(Platform.OS == "android")(
                    <DatePicker
                      date={this.state.date}
                      mode="date"
                      placeholder="Select date"
                      format="DD-MM-YYYY"
                      minDate={new Date()}
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      customStyles={{
                        dateIcon: {
                          position: "absolute",
                          left: 0,
                          top: 4,
                          marginLeft: 0
                        },
                        dateInput: {
                          marginLeft: 36,
                          borderLeftWidth: 0,
                          borderTopWidth: 0,
                          borderRightWidth: 0,
                          borderBottomWidth: 1,
                          borderBottomColor: "#000000"
                        }
                        // ... You can check the source to find the other keys.
                      }}
                      onDateChange={date => {
                        this.changeDateAndroid(date);
                      }}
                    />
                  )}
                </View>

                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 3 }} />
                  <View style={{ flex: 8 }}>
                    <Text
                      style={{ alignSelf: "center", textAlign: "center" }}
                      note
                    >
                      Date: {this.state.date} / Days : {this.state.days}
                    </Text>
                  </View>
                </View>
              </RkCard>
            </View>
            <View style={[styles.viewBtnNext]}>
              <Button
                style={[
                  styles.btnSent,
                  { backgroundColor: this.state.sentBtnColor, borderRadius: 5 }
                ]}
                full
                disabled={this.state.sentBtnStatus}
                onPress={() => alert("working")}
              >
                <Text> NEXT </Text>
              </Button>
            </View>
          </ImageBackground>
        </Content>
        {renderIf(this.state.isLoading)(
          <View style={styles.loading}>
            <SkypeIndicator color={colors.appColor} />
          </View>
        )}
        <DropdownAlert ref={ref => (this.dropdown = ref)} />
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
  viewContent: {
    flex: 1
  },
  //View:logoSecureAccount
  logoSecureAccount: {
    flex: 2.6,
    alignItems: "center"
  },
  secureLogo: {
    height: 120,
    width: 120
  },
  txtTitle: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 28
  },
  txtLorem: {
    textAlign: "center",
    marginTop: 10
  },
  //view:viewSelectPeriod
  viewSelectPeriod: {
    flex: 2.4,
    padding: 10
  },
  viewDays: {
    flexDirection: "row",
    marginBottom: 10
  },
  //input:days
  input: {
    flex: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    color: "#000"
  },
  //view:datewise
  viewDateWise: {
    flexDirection: "row",
    marginBottom: 5
  },
  //card:rkCard
  rkCard: {
    padding: 10
  },
  //view:viewBtnNext
  viewBtnNext: {
    flex: 0.3,
    padding: 20
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center"
  }
});
