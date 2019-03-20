import React from "react";
import { StyleSheet, View, Text, StatusBar, Image } from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import Icon from "react-native-vector-icons/Ionicons";
import CreateTables from "bithyve/src/app/manager/database/CreateTables";
import PushController from "bithyve/src/app/manager/Notification/PushController";
//Custome Compontes
import ViewOnBoarding from "bithyve/src/app/custcompontes/view/ViewOnBoarding";
import OnBoarding from "bithyve/src/app/custcompontes/OnBoarding/OnBoarding";
//Json Files
import onBoardingData from "bithyve/src/assets/jsonfiles/onBoardingScreen/onBoardingScreen.json";
//TODO: Custome object
import { colors, images, msg } from "bithyve/src/app/constants/Constants";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";

export default class OnBoardingScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentWillMount() {
    this.setState({
      data: localization("OnBoardingScreen.onBoarding")
    });
  }

  //TODO: func click_Done
  click_Done() {
    console.log("click");
    const resetAction = StackActions.reset({
      index: 0, // <-- currect active route from actions array
      key: null,
      actions: [
        NavigationActions.navigate({ routeName: "PasscodeConfirmScreen" })
      ]
    });
    this.props.navigation.dispatch(resetAction);
  }

  render() {
    const data = [
      {
        backgroundColor: this.state.data[0].backgroundColor,
        image: images.onBoardingScreen.onB1,
        title: this.state.data[0].title,
        subtitle: this.state.data[0].subtitle
      },
      {
        backgroundColor: this.state.data[1].backgroundColor,
        image: images.onBoardingScreen.onB2,
        title: this.state.data[1].title,
        subtitle: this.state.data[2].subtitle
      },
      {
        backgroundColor: this.state.data[2].backgroundColor,
        image: images.onBoardingScreen.onB3,
        title: this.state.data[2].title,
        subtitle: this.state.data[2].subtitle
      }
    ];
    return (
      <View style={styles.container}>
        <OnBoarding click_GetStarted={() => this.click_Done()}>
          {/* First screen */}
          <View style={[styles.slide]}>
            <Image
              style={{ width: 240, height: 240 }}
              resizeMode="contain"
              source={data[0].image}
            />
            <Text style={styles.header}>{data[0].title}</Text>
            <Text style={styles.text}>{data[0].subtitle}</Text>
          </View>
          {/* Second screen */}
          <View style={[styles.slide]}>
            <Image
              style={{ width: 240, height: 240 }}
              resizeMode="contain"
              source={data[1].image}
            />
            <Text style={styles.header}>{data[1].title}</Text>
            <Text style={styles.text}>{data[1].subtitle}</Text>
          </View>
          {/* Third screen */}
          <View style={[styles.slide]}>
            <Image
              style={{ width: 240, height: 240 }}
              resizeMode="contain"
              source={data[2].image}
            />
            <Text style={styles.header}>{data[2].title}</Text>
            <Text style={styles.text}>{data[2].subtitle}</Text>
          </View>
        </OnBoarding>

        <CreateTables />
        <PushController />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  slide: {
    flex: 1, // Take up all screen
    justifyContent: "center", // Center vertically
    alignItems: "center" // Center horizontally
  },
  // Header styles
  header: {
    color: "#000000",
    fontFamily: "Avenir",
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center"
  },
  // Text below header
  text: {
    color: "#000000",
    fontFamily: "Avenir",
    fontSize: 18,
    marginHorizontal: 40,
    textAlign: "center"
  }
});
